self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("face-scanner-cache").then(cache =>
      cache.addAll([
        "/",
        "/index.html",
        "/welcome.html",
        "/css/style.css",
        "/js/script.js",
        "/manifest.json",
        "/models/tiny_face_detector_model-weights_manifest.json",
        "/models/tiny_face_detector_model-shard1",
        "/models/face_recognition/face_recognition_model-weights_manifest.json",
        "/models/face_recognition/face_recognition_model-shard1",
        "/models/face_recognition/face_recognition_model-shard2",
        "/models/face_landmark_68/face_landmark_68_model-shard1",
        "/models/face_landmark_68/face_landmark_68_model-weights_manifest.json",        
        "/icons/icon-192.png",
        "/icons/icon-512.png",





      ])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
