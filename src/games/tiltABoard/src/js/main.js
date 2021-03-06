// Physics settings
//Tell the physics library where it can find additional help to detect collisions.
Physijs.scripts.ammo = "./ammo.js";
//Set up a worker to perform all of the physics calculations
Physijs.scripts.worker = "./vendor/physijs_worker.js";

// This is where stuff in our game will happen:
var scene = new Physijs.Scene({ fixedTimeStep: 2 / 60 }); //Create a physics-enabled Physijs.scene
scene.setGravity(new THREE.Vector3(0, -50, 0)); //Enable gravity
// This is what sees the stuff:
var aspect_ratio = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(75, aspect_ratio, 1, 10000);
camera.position.set(0, 100, 200);
camera.rotation.x = -Math.PI / 8;
scene.add(camera);
// This will draw what the camera sees onto the screen:
var renderer = new THREE.WebGLRenderer();
renderer.shadowMapEnabled = true; //Enable shadows in the renderer for added realism.
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ******** START CODING ON THE NEXT LINE ********
addLights();
var ball = addBall();
var board = addBoard();
addControls();
addGoal();
addBackground();
animate();
gameStep();

function addLights() {
  //We’re using three kinds of lights here:
  //1. An ambient light is a light that is everywhere, it won’t cast
  //shadows or make things shine, but will bring out colors in things.
  scene.add(new THREE.AmbientLight(0x999999));
  //2. A point light is like a light bulb, we place it above and behind
  //the center of the scene so that it can shine down on the game platform
  var back_light = new THREE.PointLight(0xffffff);
  back_light.position.set(50, 50, -100);
  scene.add(back_light);
  //3. A spot light is just what it sounds like, we use it to shine a light from the side and to cast a shadow
  var spot_light = new THREE.SpotLight(0xffffff);
  spot_light.position.set(-250, 250, 250);
  spot_light.castShadow = true;
  scene.add(spot_light);
}

function addBall() {
  var ball = new Physijs.SphereMesh(
    new THREE.SphereGeometry(10, 25, 21),
    new THREE.MeshPhongMaterial({
      color: 0x333333,
      shininess: 100.0,
      ambient: 0xff0000,
      emissive: 0x111111,
      specular: 0xbbbbbb,
    })
  );
  ball.castShadow = true;
  scene.add(ball);
  resetBall(ball);
  return ball;
}

function resetBall(ball) {
  //__dirtyPosition: is our way of telling the game physics, "Look, I know this is wrong, but I know what
  //I’m doing and I need the following position to change right away"
  ball.__dirtyPosition = true;
  ball.position.set(-33, 50, -65);
  ball.setLinearVelocity(0, 0, 0);
  ball.setAngularVelocity(0, 0, 0);
}

function addBoard() {
  //-- beam
  var material = new THREE.MeshPhongMaterial({
    color: 0x333333,
    shininess: 40,
    ambient: 0xffd700,
    emissive: 0x111111,
    specular: 0xeeeeee,
  });
  //The 0 tells the physics library that gravity doesn’t apply to this object (or anything added to it).
  //Without the zero, our game board would fall right off the screen!
  var beam = new Physijs.BoxMesh(
    new THREE.CubeGeometry(50, 2, 200),
    material,
    0
  );
  beam.position.set(-37, 0, 0);
  beam.receiveShadow = true;
  //-- beam2
  var beam2 = new Physijs.BoxMesh(new THREE.CubeGeometry(50, 2, 200), material);
  beam2.position.set(75, 0, 0);
  beam2.receiveShadow = true;
  beam.add(beam2);
  //-- beam3
  var beam3 = new Physijs.BoxMesh(new THREE.CubeGeometry(200, 2, 50), material);
  beam3.position.set(40, 0, -40);
  beam3.receiveShadow = true;
  beam.add(beam3);
  //-- beam4
  var beam4 = new Physijs.BoxMesh(new THREE.CubeGeometry(200, 2, 50), material);
  beam4.position.set(40, 0, 40);
  beam4.receiveShadow = true;
  beam.add(beam4);
  beam.rotation.set(0.1, 0, 0);
  //adding beam to scene
  scene.add(beam);
  return beam;
}

function addControls() {
  document.addEventListener("keydown", function (event) {
    var code = event.keyCode;
    if (code == 37) left();
    if (code == 39) right();
    if (code == 38) up();
    if (code == 40) down();
  });
}

function left() {
  tilt("z", 0.02);
}
function right() {
  tilt("z", -0.02);
}
function up() {
  tilt("x", -0.02);
}
function down() {
  tilt("x", 0.02);
}

function tilt(dir, amount) {
  board.__dirtyRotation = true;
  board.rotation[dir] = board.rotation[dir] + amount;
}

function addGoal() {
  var light = new THREE.Mesh(
    new THREE.CylinderGeometry(20, 20, 1000),
    new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.15,
      shininess: 0,
      ambient: 0xffffff,
      emissive: 0xffffff,
    })
  );
  scene.add(light);
  var score = new Physijs.ConvexMesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshNormalMaterial({ wireframe: true })
  );
  score.position.y = -50;
  score.rotation.x = -Math.PI / 2;
  scene.add(score);
  score.addEventListener("collision", function () {
    flashGoalLight(light);
    resetBall(ball);
  });
}

function flashGoalLight(light, remaining) {
  if (typeof remaining == "undefined") remaining = 9;
  if (light.material.opacity == 0.4) {
    light.material.ambient.setRGB(1, 1, 1);
    light.material.emissive.setRGB(1, 1, 1);
    light.material.color.setRGB(1, 1, 1);
    light.material.opacity = 0.15;
  } else {
    light.material.ambient.setRGB(1, 0, 0);
    light.material.emissive.setRGB(1, 0, 0);
    light.material.color.setRGB(1, 0, 0);
    light.material.opacity = 0.4;
  }
  if (remaining > 0) {
    setTimeout(function () {
      flashGoalLight(light, remaining - 1);
    }, 500);
  }
}

function addBackground() {
  document.body.style.backgroundColor = "black";
  var stars = new THREE.Geometry();
  while (stars.vertices.length < 1000) {
    var lat = Math.PI * Math.random() - Math.PI / 2;
    var lon = 2 * Math.PI * Math.random();
    stars.vertices.push(
      new THREE.Vector3(
        1000 * Math.cos(lon) * Math.cos(lat),
        1000 * Math.sin(lon) * Math.cos(lat),
        1000 * Math.sin(lat)
      )
    );
  }
  var star_stuff = new THREE.ParticleBasicMaterial({ size: 5 });
  var star_system = new THREE.ParticleSystem(stars, star_stuff);
  scene.add(star_system);
}

function gameStep() {
  if (ball.position.y < -100) resetBall(ball);
  setTimeout(gameStep, 1000 / 60);
}

// Now, show what the camera sees on the screen:
function animate() {
  requestAnimationFrame(animate);
  scene.simulate(); // run physics
  renderer.render(scene, camera);
}
