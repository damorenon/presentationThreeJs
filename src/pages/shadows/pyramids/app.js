let scene, camera, renderer, light, plane;
let ADD = 0.004,
  theta = 0;

let createPyramid = function (x, y, z, width, height) {
  // image courtesy of By ​Japanese Wikipedia user Miya.m, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=281620
  let texture = new THREE.TextureLoader().load(
    "https://upload.wikimedia.org/wikipedia/commons/3/3b/Tuff_ohyaishi02.jpg"
  );
  let geometry = new THREE.CylinderGeometry(0, width, height, 4);
  let material = new THREE.MeshLambertMaterial({ map: texture });
  let p = new THREE.Mesh(geometry, material);
  p.position.set(x, y, z);
  p.castShadow = true;
  p.receiveShadow = true;
  return p;
};

let createGeometry = function () {
  // Create the plane
  // Image courtousy to By Ji-Elle - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=9429566
  let texture = new THREE.TextureLoader().load(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Adrar_sands.JPG/1280px-Adrar_sands.JPG"
  );
  let material = new THREE.MeshLambertMaterial({ map: texture });
  let geometry = new THREE.BoxGeometry(1000, 1, 1000);
  plane = new THREE.Mesh(geometry, material);
  plane.position.y = -1;
  plane.receiveShadow = true;

  scene.add(plane);

  scene.add(createPyramid(0, 0, 0, 20, 25));
  scene.add(createPyramid(10, 0, -20, 30, 40));
  scene.add(createPyramid(30, 0, -30, 25, 35));
  scene.add(createPyramid(-15, 0, -15, 10, 10));
};

// set up the environment -
// initiallize scene, camera, objects and renderer
let init = function () {
  // create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // create an locate the camera

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  camera.position.set(0, 10, 40);

  light = new THREE.DirectionalLight(0xffffff, 1);
  light.castShadow = true;
  light.shadow = new THREE.LightShadow(
    new THREE.PerspectiveCamera(50, 1, 10, 2500)
  );
  light.shadow.bias = 0.0001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 1024;
  light.position.set(10, 20, 0);

  scene.add(light);

  createGeometry();

  // create the renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  document.body.appendChild(renderer.domElement);
};

let playSound = function () {
  // create an AudioListener and add it to the camera
  listener = new THREE.AudioListener();
  camera.add(listener);
  // create a global audio source
  sound = new THREE.Audio(listener);
  audioLoader = new THREE.AudioLoader();
  audioLoader.load("./egypt.mp3", function (buffer) {
    //sound.autoplay = true;
    sound.setBuffer(buffer);
    sound.setVolume(0.5);
    sound.play();
  });
};

let pause = true;
let playingSound = false;
// main animation loop - calls 50-60 times per second.
let mainLoop = function () {
  requestAnimationFrame(mainLoop);
  renderer.render(scene, camera);
  if (pause) return;
  light.position.x = 20 * Math.sin(theta);
  light.position.y = 20 * Math.cos(theta);
  theta += ADD;
};

document.addEventListener("keydown", function (event) {
  var code = event.keyCode;
  if (code == 32) {
    // space
    pause = !pause;
    if (!playingSound) {
      playingSound = true;
      playSound();
    }
  }
});

///////////////////////////////////////////////
init();
mainLoop();
