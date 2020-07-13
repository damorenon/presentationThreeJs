let scene, camera, renderer, controls;
let atom1;
let ADD = 0.08,
  theta = 0,
  factor = 8;

const CreateAtom = function ({ x = 0, y = 0, z = 0, nucleusColor = 0xff0000 }) {
  let geometry = new THREE.SphereGeometry(3, 20, 20);
  let material = new THREE.MeshPhongMaterial({
    color: nucleusColor,
    shininess: 100,
    side: THREE.DoubleSide,
  });
  this.nucleus = new THREE.Mesh(geometry, material);
  this.nucleus.position.set(x, y, z);

  geometry = new THREE.SphereGeometry(0.2, 20, 20);
  material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  this.sphere1 = new THREE.Mesh(geometry, material);

  geometry = new THREE.SphereGeometry(0.2, 20, 20);
  material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  this.sphere2 = new THREE.Mesh(geometry, material);

  geometry = new THREE.SphereGeometry(0.2, 20, 20);
  material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  this.sphere3 = new THREE.Mesh(geometry, material);

  geometry = new THREE.SphereGeometry(0.2, 20, 20);
  material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  this.sphere4 = new THREE.Mesh(geometry, material);

  this.nucleus.add(this.sphere1);
  this.nucleus.add(this.sphere2);
  this.nucleus.add(this.sphere3);
  this.nucleus.add(this.sphere4);

  this.light = new THREE.PointLight(0xffffff, 2, 20, 2);
  this.light2 = new THREE.PointLight(0xffffff, 2, 20, 2);
  this.light3 = new THREE.PointLight(0xffffff, 2, 20, 2);
  this.light4 = new THREE.PointLight(0xffffff, 2, 20, 2);
  this.nucleus.add(this.light);
  this.nucleus.add(this.light2);
  this.nucleus.add(this.light3);
  this.nucleus.add(this.light4);

  this.animateAtom = (theta) => {
    this.light.position.x = factor * Math.sin(theta + 180);
    this.light.position.z = factor * Math.cos(theta + 180);
    this.sphere1.position.x = this.light.position.x;
    this.sphere1.position.z = this.light.position.z;

    this.light2.position.y = -factor * Math.sin(theta);
    this.light2.position.z = -factor * Math.cos(theta);
    this.sphere2.position.y = this.light2.position.y;
    this.sphere2.position.z = this.light2.position.z;

    this.light3.position.y = factor * Math.sin(theta + 90);
    this.light3.position.x = factor * Math.sin(theta + 90);
    this.light3.position.z = factor * Math.cos(theta + 90);
    this.sphere3.position.x = this.light3.position.x;
    this.sphere3.position.y = this.light3.position.y;
    this.sphere3.position.z = this.light3.position.z;

    this.light4.position.y = factor * Math.sin(theta);
    this.light4.position.x = -factor * Math.sin(theta);
    this.light4.position.z = factor * Math.cos(theta);
    this.sphere4.position.x = this.light4.position.x;
    this.sphere4.position.y = this.light4.position.y;
    this.sphere4.position.z = this.light4.position.z;
  };

  scene.add(this.nucleus);
  return this;
};

const atomsPos = [
  { x: 0, y: 0 },

  { x: 35, y: 30, nucleusColor: 0x00ff00 },
  { x: -30, y: -30, nucleusColor: 0x0000ff },
  { x: -40, y: 40, nucleusColor: 0xffff00 },
  { x: -50, y: 10, nucleusColor: 0xffff00 },
  { x: -70, y: -35, nucleusColor: 0x00ff00 },
  { x: 50, y: -40 },
  { x: 60, y: 5, nucleusColor: 0x0000ff },
];
const atoms = [];

// set up the environment -
// initiallize scene, camera, objects and renderer
let init = function () {
  // create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // create an locate the camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  camera.position.z = 16;

  atomsPos.forEach((atom) => atoms.push(new CreateAtom(atom)));

  // create the renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  mainLoop();
};

let pause = true;

// main animation loop - calls 50-40 times per second.
let mainLoop = function () {
  requestAnimationFrame(mainLoop);
  renderer.render(scene, camera);
  if (pause) return;
  atoms.forEach((atom) => atom.animateAtom(theta));
  theta += ADD;
  if (camera.position.z < 60) camera.position.z += ADD / 8;
};

let playSound = function () {
  // create an AudioListener and add it to the camera
  listener = new THREE.AudioListener();
  camera.add(listener);
  // create a global audio source
  sound = new THREE.Audio(listener);
  audioLoader = new THREE.AudioLoader();
  audioLoader.load("./atom.mp3", function (buffer) {
    //sound.autoplay = true;
    sound.setBuffer(buffer);
    sound.setVolume(0.5);
    sound.play();
  });
};

let playingSound = false;
document.addEventListener("keydown", function (event) {
  var code = event.keyCode;
  if (code == 32) {
    pause = !pause;
    if (!playingSound) {
      playingSound = true;
      playSound();
    }
  } // space
});

///////////////////////////////////////////////
init();
