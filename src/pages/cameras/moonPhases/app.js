// This is where stuff in our game will happen:
var scene = new THREE.Scene();

// This is what sees the stuff:
var aspect_ratio = window.innerWidth / window.innerHeight;
var above_cam = new THREE.PerspectiveCamera(75, aspect_ratio, 1, 1e6);
above_cam.position.z = 700;
scene.add(above_cam);

var earth_to_moon_cam = new THREE.PerspectiveCamera(75, aspect_ratio, 1, 1e6);
scene.add(earth_to_moon_cam);

var camera = above_cam;

// This will draw what the camera sees onto the screen:
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ******** START CODING ON THE NEXT LINE ********
document.body.style.backgroundColor = "black";

var surface = new THREE.MeshPhongMaterial({ ambient: 0xffd700 }); //gold
var star = new THREE.SphereGeometry(50, 28, 21);
var sun = new THREE.Mesh(star, surface);
scene.add(sun);

var ambient = new THREE.AmbientLight(0xffffff); //white
scene.add(ambient);

var sunlight = new THREE.PointLight(0xffffff, 5, 1000);
sun.add(sunlight);

var surface = new THREE.MeshPhongMaterial({
  ambient: 0x1a1a1a,
  color: 0x0000cd,
}); //Black, Blue
var planet = new THREE.SphereGeometry(20, 20, 15);
var earth = new THREE.Mesh(planet, surface);
earth.position.set(250, 0, 0);
scene.add(earth);

var earth_orbit = new THREE.Object3D();
sun.add(earth_orbit);
earth_orbit.add(earth);

var surface = new THREE.MeshPhongMaterial({
  ambient: 0x1a1a1a,
  color: 0xffffff,
});
var planet = new THREE.SphereGeometry(15, 30, 25);
var moon = new THREE.Mesh(planet, surface);
moon.position.set(0, 100, 0);
scene.add(moon);

var moon_orbit = new THREE.Object3D();
earth.add(moon_orbit);
moon_orbit.add(moon);
moon_orbit.add(earth_to_moon_cam);
earth_to_moon_cam.rotation.set(Math.PI / 2, 0, 0);

var stars = new THREE.Geometry();
while (stars.vertices.length < 1e4) {
  var lat = Math.PI * Math.random() - Math.PI / 2;
  var lon = 2 * Math.PI * Math.random();
  stars.vertices.push(
    new THREE.Vector3(
      1e5 * Math.cos(lon) * Math.cos(lat),
      1e5 * Math.sin(lon) * Math.cos(lat),
      1e5 * Math.sin(lat)
    )
  );
}
var star_stuff = new THREE.ParticleBasicMaterial({ size: 500 });
var star_system = new THREE.ParticleSystem(stars, star_stuff);
scene.add(star_system);

var time = 0,
  speed = 1,
  pause = true;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (pause) return;
  time = time + speed;
  var e_angle = time * 0.001;
  earth.position.set(250 * Math.cos(e_angle), 250 * Math.sin(e_angle), 0);
  var m_angle = time * 0.02;
  moon_orbit.rotation.set(0, 0, m_angle);
}
animate();

let playSound = function () {
  // create an AudioListener and add it to the camera
  listener = new THREE.AudioListener();
  camera.add(listener);
  // create a global audio source
  sound = new THREE.Audio(listener);
  audioLoader = new THREE.AudioLoader();
  audioLoader.load("../space.mp3", function (buffer) {
    //sound.autoplay = true;
    sound.setBuffer(buffer);
    sound.setVolume(0.5);
    sound.play();
  });
};

let playingSound = false;

document.addEventListener("keydown", function (event) {
  var code = event.keyCode;
  if (code == 67) changeCamera(); // C
  if (code == 32) {
    pause = !pause;
    if (!playingSound) {
      playingSound = true;
      playSound();
    }
  } // space
  if (code == 49) speed = 0.2; // 1
  if (code == 50) speed = 0.5; // 2
  if (code == 51) speed = 1; // 3
  if (code == 52) speed = 2; // 4
  if (code == 52) speed = 5; // 4
});

function changeCamera() {
  if (camera == above_cam) camera = earth_to_moon_cam;
  else camera = above_cam;
}
