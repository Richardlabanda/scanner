const video = document.getElementById('video');
const result = document.getElementById('result');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');

const registerSection = document.getElementById('registerSection');
const registerNameInput = document.getElementById('registerName');
const registerBtn = document.getElementById('registerBtn');

const signInSection = document.getElementById('signInSection');
const userNameSpan = document.getElementById('userName');
const signInBtn = document.getElementById('signInBtn');

let latestDescriptor = null;
let savedFaces = loadSavedFaces();
let currentRecognizedName = null;

registerBtn.onclick = saveCurrentFace;

signInBtn.onclick = () => {
  window.location.href = 'welcome.html';
};

function loadSavedFaces() {
  const data = localStorage.getItem("faces");
  return data ? JSON.parse(data) : {};
}

function saveCurrentFace() {
  const name = registerNameInput.value.trim();
  if (!name) {
    alert("Please enter your name to register.");
    return;
  }
  if (!latestDescriptor) {
    alert("No face detected to save. Please position your face in front of the camera.");
    return;
  }
  savedFaces[name] = Array.from(latestDescriptor);
  localStorage.setItem("faces", JSON.stringify(savedFaces));
  alert(`Face registered for "${name}". You can now sign in.`);
  registerNameInput.value = '';
  hideRegisterShowSignIn(name);
}

function hideRegisterShowSignIn(name) {
  registerSection.style.display = 'none';
  signInSection.style.display = 'block';
  userNameSpan.textContent = name;
  currentRecognizedName = name;
}

function showRegisterHideSignIn() {
  registerSection.style.display = 'block';
  signInSection.style.display = 'none';
  currentRecognizedName = null;
}

async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models/tiny_face_detector'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models/face_landmark_68'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models/face_recognition'),
  ]);
  result.textContent = 'Models loaded. Starting camera...';
  startVideo();
}

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      result.textContent = 'Camera started. Position your face.';
    })
    .catch(err => {
      result.textContent = 'Camera error: ' + err;
    });
}

video.addEventListener('play', () => {
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(overlay, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptors();

    const resized = faceapi.resizeResults(detections, displaySize);

    ctx.clearRect(0, 0, overlay.width, overlay.height);
    faceapi.draw.drawDetections(overlay, resized);
    faceapi.draw.drawFaceLandmarks(overlay, resized);

    if (resized.length > 0) {
      latestDescriptor = resized[0].descriptor;

      let recognized = false;
      for (let name in savedFaces) {
        const storedDescriptor = new Float32Array(savedFaces[name]);
        const distance = faceapi.euclideanDistance(latestDescriptor, storedDescriptor);
        if (distance < 0.6) {
          result.textContent = `Face recognized: ${name}`;
          if (currentRecognizedName !== name) {
            hideRegisterShowSignIn(name);
          }
          recognized = true;
          break;
        }
      }
      if (!recognized) {
        result.textContent = 'Face not recognized';
        showRegisterHideSignIn();
      }
    } else {
      result.textContent = 'No face detected';
      latestDescriptor = null;
      showRegisterHideSignIn();
    }
  }, 800);
});

loadModels();
