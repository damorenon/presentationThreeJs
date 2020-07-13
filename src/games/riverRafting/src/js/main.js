// Physics settings
//Tell the physics library where it can find additional help to detect collisions.
Physijs.scripts.ammo = "./ammo.js";
//Set up a worker to perform all of the physics calculations
Physijs.scripts.worker = "./vendor/physijs_worker.js";

// This is where stuff in our game will happen:
var scene = new Physijs.Scene({ fixedTimeStep: 2 / 60 });
scene.setGravity(new THREE.Vector3(0, -20, 0));

// This is what sees the stuff:
var width = window.innerWidth,
  height = window.innerHeight,
  aspect_ratio = width / height;
var camera = new THREE.PerspectiveCamera(75, aspect_ratio, 1, 10000);
// var camera = new THREE.OrthographicCamera(
//   -width/2, width/2, height/2, -height/2, 1, 10000
// );

camera.position.set(250, 250, 250);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

// This will draw what the camera sees onto the screen:
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.backgroundColor = "#ffffff";

// ******** START CODING ON THE NEXT LINE ********

addSunlight(scene);
var scoreboard = addScoreboard();
var river = addRiver(scene);
var raft = addRaft(scene);
var game_items = [];
var paused;
startGame(raft, river, scoreboard);

function addSunlight(scene) {
  var sunlight = new THREE.DirectionalLight();
  sunlight.intensity = 0.5;
  sunlight.castShadow = true;
  sunlight.position.set(250, 250, 250);
  sunlight.shadowCameraNear = 250;
  sunlight.shadowCameraFar = 600;
  sunlight.shadowCameraLeft = -200;
  sunlight.shadowCameraRight = 200;
  sunlight.shadowCameraTop = 200;
  sunlight.shadowCameraBottom = -200;
  sunlight.shadowMapWidth = 4096;
  sunlight.shadowMapHeight = 4096;
  scene.add(sunlight);
}

function addScoreboard() {
  var scoreboard = new Scoreboard();
  scoreboard.score(0);
  scoreboard.timer();
  scoreboard.help(
    "left / right arrow keys to turn. " + "space bar to move forward."
  );
  return scoreboard;
}

function addRiver(scene) {
  var ground = makeGround(500);
  addWater(ground, 500);
  addLid(ground, 500);
  scene.add(ground);
  return ground;
}

function makeGround(size) {
  var faces = 100;
  var shape = new THREE.PlaneGeometry(size, size, faces, faces);
  var river_points = digRiver(shape, faces + 1);
  var cover = Physijs.createMaterial(
    new THREE.MeshPhongMaterial({
      emissive: new THREE.Color(0x339933), // a little green
      specular: new THREE.Color(0x333333), // dark gray / not shiny
    }),
    1, // high friction (hard to move across)
    0.1 // not very bouncy
  );
  var ground = new Physijs.HeightfieldMesh(shape, cover, 0);
  ground.rotation.set(-Math.PI / 2, 0.2, Math.PI / 2);
  ground.receiveShadow = true;
  ground.castShadow = true;
  ground.river_points = river_points;
  return ground;
}

function digRiver(shape, size) {
  var center_points = [];
  for (var row = 0; row < size; row++) {
    var center = Math.sin((4 * Math.PI * row) / size);
    center = center * 0.1 * size;
    center = Math.floor(center + size / 2);
    center = row * size + center;
    for (var distance = 0; distance < 12; distance++) {
      shape.vertices[center + distance].z = -5 * (12 - distance);
      shape.vertices[center - distance].z = -5 * (12 - distance);
    }
    center_points.push(shape.vertices[center]);
  }
  shape.computeFaceNormals();
  shape.computeVertexNormals();
  return center_points;
}

function addWater(ground, size) {
  var water = new Physijs.ConvexMesh(
    new THREE.CubeGeometry(1.4 * size, 1.4 * size, 10),
    Physijs.createMaterial(
      new THREE.MeshBasicMaterial({ color: 0x0000bb }),
      0, // No friction (slippery as ice)
      0.01 // Not very bouncy at all
    ),
    0 // Never move
  );
  water.position.z = -20;
  water.receiveShadow = true;
  ground.add(water);
}

function addLid(ground, size) {
  var lid = new Physijs.ConvexMesh(
    new THREE.CubeGeometry(size, size, 1),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  ground.add(lid);
}

function addRaft(scene) {
  var mesh = new Physijs.ConvexMesh(
    new THREE.TorusGeometry(2, 0.5, 8, 20),
    Physijs.createMaterial(
      new THREE.MeshPhongMaterial({
        emissive: 0xcc2222,
        specular: 0xeeeeee,
      }),
      0.1,
      0.01
    )
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.castShadow = true;
  scene.add(mesh);
  mesh.setAngularFactor(new THREE.Vector3(0, 0, 0));
  var rudder = new THREE.Mesh(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  rudder.position.set(3, 0, 0);
  mesh.add(rudder);
  return mesh;
}

function startGame(raft, river, scoreboard) {
  var start = river.river_points[100];
  raft.__dirtyPosition = true;
  raft.position.set(start.y, start.z + 100, 0);
  raft.setLinearVelocity(new THREE.Vector3());
  scoreboard.resetTimer();
  scoreboard.score(0);
  updateCamera();
  camera.lookAt(new THREE.Vector3(start.y, 0, 0));
  resetItems(river, scoreboard);
  paused = false;
}

function updateCamera() {
  camera.position.set(
    raft.position.x + 75,
    raft.position.y + 40,
    raft.position.z
  );
}

function resetItems(ground, scoreboard) {
  removeItems();
  addItems(ground, scoreboard);
}

function removeItems() {
  game_items.forEach(function (item) {
    scene.remove(item);
  });
  game_items = [];
}

function addItems(ground, scoreboard) {
  var points = ground.river_points;
  var random20 = Math.floor(20 + 10 * Math.random()),
    fruit20 = addFruitPowerUp(points[random20], ground, scoreboard);
  game_items.push(fruit20);
  var random70 = Math.floor(70 + 10 * Math.random()),
    fruit70 = addFruitPowerUp(points[random70], ground, scoreboard);
  game_items.push(fruit70);
}

function addFruitPowerUp(location, ground, scoreboard) {
  var mesh = new Physijs.ConvexMesh(
    new THREE.SphereGeometry(10, 25),
    new THREE.MeshPhongMaterial({ emissive: 0xbbcc00 }),
    0
  );
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.addEventListener("collision", function () {
    var list_index = game_items.indexOf(mesh);
    game_items.splice(list_index, 1);
    scene.remove(mesh);
    scoreboard.addPoints(200);
    scoreboard.message("Yum!");
    setTimeout(function () {
      scoreboard.clearMessage();
    }, 2.5 * 1000);
  });
  ground.updateMatrixWorld();
  var p = new THREE.Vector3(location.x, location.y, -20);
  ground.localToWorld(p);
  mesh.position.copy(p);
  scene.add(mesh);
  return mesh;
}

// Animate motion in the game
function animate() {
  requestAnimationFrame(animate);
  if (paused) return;
  updateCamera();
  renderer.render(scene, camera);
}
animate();

// Run physics
function gameStep() {
  // Update physics 60 times a second so that motion is smooth
  setTimeout(gameStep, 1000 / 60);
  if (paused) return;
  checkForGameOver();
  scene.simulate();
}
gameStep();

var next_x;
function updateScore() {
  if (!next_x) next_x = raft.position.x + 25;
  if (raft.position.x > next_x) {
    scoreboard.addPoints(10);
    next_x = next_x + 25;
  }
}

function checkForGameOver() {
  if (raft.position.x < 250) return;
  paused = true;
  scoreboard.stopTimer();
  scoreboard.message("You made it!");
  if (scoreboard.getTime() < 30) scoreboard.addPoints(100);
  if (scoreboard.getTime() < 25) scoreboard.addPoints(200);
  if (scoreboard.getTime() < 20) scoreboard.addPoints(500);
}

document.addEventListener("keydown", function (event) {
  var code = event.keyCode;
  if (code == 32) pushRaft(); // space
  if (code == 37) rotateRaft(-1); // left
  if (code == 39) rotateRaft(1); // right
  if (code == 82) startGame(raft, river, scoreboard); // R
});

function pushRaft() {
  var angle = raft.rotation.z;
  raft.applyCentralForce(
    new THREE.Vector3(500 * Math.cos(angle), 0, -500 * Math.sin(angle))
  );
}

function rotateRaft(direction) {
  raft.__dirtyRotation = true;
  raft.rotation.z = raft.rotation.z + (direction * Math.PI) / 10;
}
