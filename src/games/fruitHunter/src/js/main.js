// This is where stuff in our game will happen:
const scene = new THREE.Scene();
// This is what sees the stuff:
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 10, 10000);
const cameraYInitPosition = 100;
const cameraZInitPosition = 600;
camera.position.z = cameraZInitPosition;
camera.position.y = cameraYInitPosition;

// This will draw what the camera sees onto the screen:
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.backgroundColor = "#87CEEB";

// ******** START CODING ON THE NEXT LINE ********
let gameOver = false;

function createGroud() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000),
    new THREE.MeshBasicMaterial({ color: 0x7cfc00 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -180;
  scene.add(ground);
}
createGroud();

function createMountain(x) {
  const mountain = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 7000, 3000, 6),
    new THREE.MeshBasicMaterial({ color: 0x479357 })
  );
  mountain.position.x = x;
  mountain.position.z = -8000;
  return mountain;
}

function addMountains() {
  const mountain0 = createMountain(-8000);
  const mountain1 = createMountain(-4000);
  const mountain2 = createMountain(2000);
  const mountain3 = createMountain(7000);
  scene.add(mountain0);
  scene.add(mountain1);
  scene.add(mountain2);
  scene.add(mountain3);
}
addMountains();

function addSun() {
  const surface = new THREE.MeshBasicMaterial({ color: 0xffd700 }); //gold
  const star = new THREE.SphereGeometry(200, 200, 21);
  const sun = new THREE.Mesh(star, surface);
  sun.position.set(2000, 5000, -8000);
  scene.add(sun);
}
addSun();

let countdown = 60;
function resetScoreBoard(scoreboard) {
  scoreboard.countdown(countdown);
  scoreboard.message("");
  scoreboard.hideHelp();
  scoreboard.score(0);
}
let scoreboard = new Scoreboard();
scoreboard.help(
  " Arrow keys to move. " +
    " Space bar to jump for fruit. " +
    " R to restar" +
    " Watch for shaking trees with fruit." +
    " Get near the tree and jump before the fruit is gone!"
);

//Holder for camera pointing to the avatar
const marker = new THREE.Object3D();
scene.add(marker);

// --- Making an avatar ---
const cover = new THREE.MeshNormalMaterial();
const body = new THREE.SphereGeometry(100);
const avatar = new THREE.Mesh(body, cover);
marker.add(avatar);
//hands
const right_hand = addExtremity(-140);
const left_hand = addExtremity(140);
//feet
const right_foot = addExtremity(70, -120);
const left_foot = addExtremity(-70, -120);

function addExtremity(x, y = 0) {
  const extremity = new THREE.Mesh(new THREE.SphereGeometry(50), cover);
  extremity.position.set(x, y, 0);
  avatar.add(extremity);
  return extremity;
}

//adding Camera
marker.add(camera);

// ----------- Making bad birds -----
const badBird = new THREE.Mesh(new THREE.SphereGeometry(50), cover);
scene.add(badBird);

let stealFruitTimeout = null;
function stealFruit() {
  clearTimeout(stealFruitTimeout);
  if (gameOver) return;
  const treasureThree = trees[treeWithTreasure];
  if (treasureThree && treasureThree.availableFruits > 0) {
    --treasureThree.availableFruits;
    animateFruit(badBird, badBirdfruit);
  }
  stealFruitTimeout = setTimeout(stealFruit, 2000);
}

function moveBadBird(from, to) {
  new TWEEN.Tween({ x: from.x, z: from.z })
    .to({ x: to.x, z: to.z }, 2500)
    .onUpdate(function () {
      badBird.position.x = this.x;
      badBird.position.z = this.z;
    })
    .onComplete(function () {
      stealFruit();
    })
    .start();
}

// ----------- Making trees ------------
let treeWithTreasure;
let treeBoundaries = [];
const treesPositions = [
  { x: 500 },
  { x: -500 },
  { x: 500, z: -1000 },
  { x: -500, z: -1000 },
];
let trees = [];
treesPositions.forEach((tp) => {
  trees.push(makeTreeAt(tp.x, tp.z));
});

function makeTreeAt(x, z = 0) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(50, 50, 200),
    new THREE.MeshBasicMaterial({ color: 0xa0522d })
  );
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(160),
    new THREE.MeshBasicMaterial({ color: 0x228b22 })
  );
  top.position.y = 200;
  trunk.add(top);
  const boundary = new THREE.Mesh(
    new THREE.CircleGeometry(300),
    new THREE.MeshNormalMaterial()
  );
  boundary.position.y = -100;
  boundary.rotation.x = -Math.PI / 2;
  trunk.add(boundary);
  treeBoundaries.push(boundary);
  trunk.position.set(x, -75, z);
  scene.add(trunk);
  top.availableFruits = 30;
  return top;
}

const treeFruitsPositions = [
  { x: -125, y: 80, z: 55 },
  { x: -55, y: 80, z: 130 },
  { x: 55, y: 80, z: 130 },
  { x: 125, y: 80, z: 55 },
  { x: -160, y: 0, z: 0 },
  { x: -110, y: 0, z: 120 },
  { x: 0, y: 0, z: 160 },
  { x: 110, y: 0, z: 120 },
  { x: 160, y: 0, z: 0 },
  { x: -125, y: -80, z: 55 },
  { x: -55, y: -80, z: 130 },
  { x: 55, y: -80, z: 130 },
  { x: 125, y: -80, z: 55 },
];
const treeFruits = [];
treeFruitsPositions.forEach((_) => treeFruits.push(makeTreeFruit()));

function makeTreeFruit() {
  const fruit = new THREE.Mesh(
    new THREE.SphereGeometry(10),
    new THREE.MeshBasicMaterial({ color: 0xff0800 })
  );
  return fruit;
}

function getTreeWithTreasure() {
  const treesWithFruitsIndices = trees.reduce(
    (arrayOfIndices, currentTree, index) => {
      if (currentTree.availableFruits) arrayOfIndices.push(index);
      return arrayOfIndices;
    },
    []
  );
  shuffle(treesWithFruitsIndices);
  return treesWithFruitsIndices[0];
}

let treesWithFruitsIndices;
let shakeTreeTimeout = null;
function shakeTree() {
  clearTimeout(shakeTreeTimeout);
  if (treeWithTreasure && trees[treeWithTreasure])
    treeFruits.forEach((tf) => trees[treeWithTreasure].remove(tf));
  if (gameOver) return;
  treeWithTreasure = getTreeWithTreasure();
  new TWEEN.Tween({ x: 0 })
    .to({ x: 2 * Math.PI }, 200)
    .repeat(10)
    .onStart(function () {
      clearTimeout(stealFruitTimeout);
      moveBadBird(badBird.position, trees[treeWithTreasure].parent.position);
    })
    .onUpdate(function () {
      trees[treeWithTreasure].position.x = 75 * Math.sin(this.x);
    })
    .onComplete(function () {
      treeFruitsPositions.forEach((tf, index) => {
        treeFruits[index].position.set(tf.x, tf.y, tf.z);
        trees[treeWithTreasure].add(treeFruits[index]);
      });
    })
    .start();
  shakeTreeTimeout = setTimeout(shakeTree, 10 * 1000);
}

let is_moving_right, is_moving_left, is_moving_forward, is_moving_back;

// Now, show what the camera sees on the screen:
const clock = new THREE.Clock(true);
function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  walk();
  turn();
  renderer.render(scene, camera);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
// --------------- Obstacles ----------------
const obstaclesProps = [
  { x: -500, z: -350 },
  { x: 500, z: -350 },
  { x: 0, z: 100, rotation: Math.PI / 2 },
  { x: 0, z: -800, rotation: Math.PI / 2 },
];
let obstacles = [];

let obstacleTimeout = null;
function addObstacles(index) {
  clearTimeout(obstacleTimeout);
  if (gameOver) return;
  if (index < obstaclesProps.length) {
    const obstacle = obstaclesProps[index];
    obstacleTimeout = setTimeout((_) => {
      obstacles.push(createObstacle(obstacle.x, obstacle.z, obstacle.rotation));
      addObstacles(index + 1);
    }, 10 * 1000);
  }
}

function createObstacle(x, z, rotation) {
  const shape = new THREE.CubeGeometry(700, 80, 25);
  const cover = new THREE.MeshBasicMaterial({ color: 0xb76f20 });
  obstacle = new THREE.Mesh(shape, cover);
  obstacle.position.set(x, -75, z);
  if (rotation) obstacle.rotation.y = rotation;
  scene.add(obstacle);
  return obstacle;
}

let avatarfruit = makeTreeFruit();
let badBirdfruit = makeTreeFruit();

function reset() {
  TWEEN.removeAll();
  resetScoreBoard(scoreboard);
  marker.position.set(0, 0, 0);
  badBird.remove(badBirdfruit);
  badBird.position.set(0, 250, 0);
  obstacles.forEach((obstacle) => scene.remove(obstacle));
  obstacles = [];
  shuffle(obstaclesProps);
  trees.forEach((treeTop) => (treeTop.position.x = 0));
  gameOver = false;
  shakeTree();
  addObstacles(0);
  animate();
}
reset();

scoreboard.onTimeExpired(() => {
  scoreboard.message("Game Over!");
  gameOver = true;
  clearTimeout(stealFruitTimeout);
});

function walk() {
  if (!isWalking()) return;
  const position = Math.sin(clock.getElapsedTime() * 5) * 50;
  right_hand.position.z = position;
  left_hand.position.z = -position;
  right_foot.position.z = position;
  left_foot.position.z = -position;
}

function turn() {
  //that angles, the amount of rotation, use radians instead of degrees
  let direction = 0;
  if (is_moving_forward) direction = Math.PI; // =180°
  if (is_moving_back) direction = 0;
  if (is_moving_right) direction = Math.PI / 2; // =90°
  if (is_moving_left) direction = -Math.PI / 2;
  spinAvatar(direction);
}

function spinAvatar(direction) {
  new TWEEN.Tween({ y: avatar.rotation.y })
    .to({ y: direction }, 100)
    .onUpdate(function () {
      avatar.rotation.y = this.y;
    })
    .start();
}

const tubeGeometry = new THREE.CylinderGeometry(100, 100, 500, 32);
const coneGeometry = new THREE.CylinderGeometry(200, 100, 50, 32);
const tubeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  opacity: 0.5,
  transparent: true,
});
const coneMaterial1 = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  opacity: 0.5,
  transparent: true,
});
const coneMaterial2 = new THREE.MeshBasicMaterial({
  color: 0xff6600,
  opacity: 0.5,
  transparent: true,
});
const coneMaterial3 = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  opacity: 0.5,
  transparent: true,
});

const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
const cone1 = new THREE.Mesh(coneGeometry, coneMaterial1);
const cone2 = new THREE.Mesh(coneGeometry, coneMaterial2);
const cone3 = new THREE.Mesh(coneGeometry, coneMaterial3);

const planeGeometry = new THREE.CubeGeometry(25, 700, 5);
const plane1 = new THREE.Mesh(planeGeometry, tubeMaterial);
plane1.position.z = 300;
plane1.rotation.x = Math.PI / 4;
const plane2 = new THREE.Mesh(planeGeometry, tubeMaterial);
plane2.position.z = -300;
plane2.rotation.x = -Math.PI / 4;
const plane3 = new THREE.Mesh(planeGeometry, tubeMaterial);
plane3.position.x = 300;
plane3.rotation.z = -Math.PI / 4;
const plane4 = new THREE.Mesh(planeGeometry, tubeMaterial);
plane4.position.x = -300;
plane4.rotation.z = Math.PI / 4;

const plane5 = new THREE.Mesh(planeGeometry, tubeMaterial);
plane5.position.z = 300;
plane5.position.y = 300;
plane5.rotation.x = Math.PI / 4;
const plane6 = new THREE.Mesh(planeGeometry, tubeMaterial);
plane6.position.z = -300;
plane6.position.y = 300;
plane6.rotation.x = -Math.PI / 4;
const plane7 = new THREE.Mesh(planeGeometry, tubeMaterial);
plane7.position.x = 300;
plane7.position.y = 300;
plane7.rotation.z = -Math.PI / 4;
const plane8 = new THREE.Mesh(planeGeometry, tubeMaterial);
plane8.position.x = -300;
plane8.position.y = 300;
plane8.rotation.z = Math.PI / 4;

let powerTimeout = null;
function releasePower() {
  new TWEEN.Tween({ theta: 0, coneY: -100 })
    .to({ theta: 2 * Math.PI, coneY: 100 }, 5000)
    .onUpdate(function () {
      camera.lookAt(avatar.position);
      camera.position.x = 500 * Math.sin(this.theta);
      camera.position.y = 10;
      camera.position.z = 500 * Math.cos(this.theta);

      cone1.position.y = this.coneY;
      cone2.position.y = this.coneY - 30;
      cone3.position.y = this.coneY - 60;
    })
    .onStart(function () {
      avatar.add(tube);
      cone1.position.set(10, -100, 0);
      avatar.add(cone1);
      cone2.position.set(10, -100, 0);
      avatar.add(cone2);
      cone3.position.set(10, -100, 0);
      avatar.add(cone3);

      avatar.add(plane1);
      avatar.add(plane2);
      avatar.add(plane3);
      avatar.add(plane4);
      avatar.add(plane5);
      avatar.add(plane6);
      avatar.add(plane7);
      avatar.add(plane8);
    })
    .onComplete(function () {
      camera.position.x = avatar.position.x;
      camera.position.y = cameraYInitPosition;
      camera.position.z = avatar.position.z + cameraZInitPosition;
      avatar.remove(tube);
      avatar.remove(cone1);
      avatar.remove(cone2);
      avatar.remove(cone3);

      avatar.remove(plane1);
      avatar.remove(plane2);
      avatar.remove(plane3);
      avatar.remove(plane4);
      avatar.remove(plane5);
      avatar.remove(plane6);
      avatar.remove(plane7);
      avatar.remove(plane8);

      step = 60;
      clearTimeout(powerTimeout);
      powerTimeout = setTimeout(function () {
        step = 15;
      }, 15000);
    })
    .start();
}

function isWalking() {
  return (
    is_moving_right || is_moving_left || is_moving_forward || is_moving_back
  );
}

let step = 15;
document.addEventListener("keydown", function (event) {
  switch (event.keyCode) {
    case 32:
      jump();
      break;
    case 37:
      marker.position.x -= step; // left
      is_moving_left = true;
      break;
    case 38:
      marker.position.z -= step; // up
      is_moving_forward = true;
      break;
    case 39:
      marker.position.x += step; // right
      is_moving_right = true;
      break;
    case 40:
      marker.position.z += step; // down
      is_moving_back = true;
      break;
    case 67: //c
      if (scoreboard.getScore() > 0 && scoreboard.getScore() % 50 === 0) {
        releasePower();
      }
      break;
    case 82:
      reset(); // R
      break;
  }
  if (detectCollisions()) {
    if (is_moving_left) marker.position.x += step;
    if (is_moving_right) marker.position.x -= step;
    if (is_moving_forward) marker.position.z += step;
    if (is_moving_back) marker.position.z -= step;
  }
});

document.addEventListener("keyup", function (event) {
  switch (event.keyCode) {
    case 37:
      is_moving_left = false;
      break;
    case 38:
      is_moving_forward = false;
      break;
    case 39:
      is_moving_right = false;
      break;
    case 40:
      is_moving_back = false;
      break;
  }
});

function detectCollisions() {
  const vector = new THREE.Vector3(0, -1, 0);
  const ray = new THREE.Ray(marker.position, vector);
  return (
    !!ray.intersectObjects(treeBoundaries).length ||
    !!ray.intersectObjects(obstacles).length
  );
}

function jump() {
  checkForTreasure();
  animateJump();
}

function checkForTreasure() {
  if (treeWithTreasure == undefined) return;
  const treasureThree = trees[treeWithTreasure],
    p1 = treasureThree.parent.position,
    p2 = marker.position;
  const distance = Math.sqrt(
    (p1.x - p2.x) * (p1.x - p2.x) + (p1.z - p2.z) * (p1.z - p2.z)
  );
  if (distance < 500 && treasureThree.availableFruits > 0) {
    --treasureThree.availableFruits;
    scorePoints();
  }
}

function scorePoints() {
  if (gameOver) return;
  scoreboard.addPoints(10);
  animateFruit(marker, avatarfruit);
}

function animateFruit(object, fruit) {
  object.add(fruit);
  new TWEEN.Tween({ height: 150, spin: 0 })
    .to({ height: 250, spin: 4 }, 500)
    .onUpdate(function () {
      fruit.position.y = this.height;
      fruit.rotation.y = this.spin;
    })
    .onComplete(function () {
      object.remove(fruit);
    })
    .start();
}

function animateJump() {
  new TWEEN.Tween({ jump: 0 })
    .to({ jump: Math.PI }, 500)
    .onUpdate(function () {
      marker.position.y = 200 * Math.sin(this.jump);
    })
    .start();
}
