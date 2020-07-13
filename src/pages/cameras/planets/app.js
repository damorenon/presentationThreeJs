// This is where stuff in our game will happen:
var scene = new THREE.Scene();
// This is what sees the stuff:
var aspect_ratio = window.innerWidth / window.innerHeight;
var above_cam = new THREE.PerspectiveCamera(75, aspect_ratio, 1, 1e6);
above_cam.position.z = 800;
scene.add(above_cam);
var earth_cam = new THREE.PerspectiveCamera(75, aspect_ratio, 1, 1e6);
scene.add(earth_cam);
var camera = above_cam;
// This will draw what the camera sees onto the screen:
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// ******** START CODING ON THE NEXT LINE ********
document.body.style.backgroundColor = "black";
var surface = new THREE.MeshPhongMaterial({ ambient: 0xffd700 });
var star = new THREE.SphereGeometry(50, 28, 21);
var sun = new THREE.Mesh(star, surface);
scene.add(sun);
var ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);
var sunlight = new THREE.PointLight(0xffffff, 5, 1000);
sun.add(sunlight);
var surface = new THREE.MeshPhongMaterial({
  ambient: 0x1a1a1a,
  color: 0x0000cd,
});
var planet = new THREE.SphereGeometry(20, 20, 15);
var earth = new THREE.Mesh(planet, surface);
earth.position.set(250, 0, 0);
scene.add(earth);
var surface = new THREE.MeshPhongMaterial({
  ambient: 0x1a1a1a,
  color: 0xb22222,
});
var planet = new THREE.SphereGeometry(20, 20, 15);
var mars = new THREE.Mesh(planet, surface);
mars.position.set(500, 0, 0);
scene.add(mars);
clock = new THREE.Clock();

let pause = true;

function animate() {
  requestAnimationFrame(animate);
  // Now, show what the camera sees on the screen:
  renderer.render(scene, camera);
  if (pause) return;
  var time = clock.getElapsedTime();
  var e_angle = time * 0.8;
  earth.position.set(250 * Math.cos(e_angle), 250 * Math.sin(e_angle), 0);
  var m_angle = time * 0.5;
  mars.position.set(500 * Math.cos(m_angle), 500 * Math.sin(m_angle), 0);
  var y_diff = mars.position.y - earth.position.y,
    x_diff = mars.position.x - earth.position.x,
    angle = Math.atan2(x_diff, y_diff);
  earth_cam.rotation.set(Math.PI / 2, -angle, 0);
  earth_cam.position.set(earth.position.x, earth.position.y, 22);
}
animate();
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
  if (code == 65) {
    // A
    camera = above_cam;
  }
  if (code == 69) {
    // E
    camera = earth_cam;
  }
  if (code == 32) {
    if (!playingSound) {
      playingSound = true;
      playSound();
    }
    pause = !pause;
  } // space
});
