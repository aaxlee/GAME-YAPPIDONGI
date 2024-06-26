const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const menu = document.getElementById("start-menu");
const canvasContainer = document.getElementById("canvas-container");
const healthbar = document.getElementById("healthbar");
const difficulty = document.getElementById("difficulty");
const WIDTH = 900;
const HEIGHT = 450;
const size = 15; // player and enemy hitboxes are size * size
const movespeed = 2;
const damage = 10; // amount of dmg a projectile does
let lostHealth = 0;
let healthbarContainer = document.querySelector(".healthbar-container");
let enemyCooldown = 100;

const spriteSheet = new Image();
spriteSheet.src = './sprites/Character_sheet.png';


const FRAME_WIDTH = 1000 / 10;
const FRAME_HEIGHT = 1000 / 11;
const NUM_FRAMES = 4;
let currentFrame = 0;
let frameCount = 0;
const FRAME_SPEED = 5;

class Player {
  constructor() {
    this.health = 900;
    this.hit = false;
    this.x = WIDTH / 2;
    this.y = HEIGHT / 2;
    this.width = size;
    this.height = size;
    this.direction = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.immunityFrames = {
      active: false
    }
    this.dash = {
      using: false,
      distance: 5,
      iterations: 0,
      cooldown: 2
    };
    this.parry = {
      using: false,
      cooldown: 5,
      iterations: 0,
      hitbox : {
        size: size * 2,
        x: 0,
        y: 0
      }
    };
  }
  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  resetDirections() {
    this.direction.right = false;
    this.direction.left = false;
    this.direction.up = false;
    this.direction.down = false;
  }
}

class Bot {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.speed = 1;
    this.size = size;
    this.attackCooldown = 0;
    this.projectiles = [];
    this.direction = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.burst = {
      cooldown: 0,
      iterations: 0,
      active: false
    };
    this.circleAttack = {
      cooldown: 0
    };
    this.teleportAttack = {
      used: false,
      target : {
        x: 0,
        y: 0
      },
      cooldown: 12,
      iterations: 0
    };
  }
  draw() {
    ctx.drawImage(
      spriteSheet,
      currentFrame * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT,
      this.x - FRAME_WIDTH/2.5, this.y - FRAME_WIDTH/2.5, FRAME_WIDTH, FRAME_HEIGHT
    );
    frameCount++;
    if (frameCount >= FRAME_SPEED) {
      frameCount = 0;
      currentFrame = (currentFrame + 1) % NUM_FRAMES;
    }
  }
  follow(player, speed) {
    if (!collision(this.x, this.y, this,size, player.x, player.y, player.width)) {
      let angle = getAngle(this.x, this.y, player.x, player.y)
      let x = Math.cos(angle);
      let y = Math.sin(angle);
      this.x += x * speed;
      this.y += y * speed;
    } else if (collision(this.x, this.y, this,size, player.x, player.y, player.width)) {
      return;
    }
  }
  clearProjectiles() {
    this.projectiles = [];
  }
}

class Projectile {
  constructor(x, y, type, size, speed, angle) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = size;
    this.speed = speed;
    this.angle = angle;
  }
}

function collision(x1, y1, size1, x2, y2, size2) {
  if (x1 + size1 >= x2 &&    // 1 right edge past 2 left
  x1 <= x2 + size2 &&    // 1 left edge past 2 right
  y1 + size1 >= y2 &&    // 1 top edge past 2 bottom
  y1 <= y2 + size2) {    // 1 bottom edge past 2 top
    return true;
} else {
  return false;
}
}

function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function findDistance(player, enemy) {
  return Math.abs(Math.sqrt((player.x - enemy.x)**2 + (player.y - enemy.y)**2));
}

function generateCoordinate(max) {
  return Math.floor(Math.random() * max);
}

function handleMovement() {
  if (player.direction.right) {
    player.x += movespeed;
  }
  if (player.direction.left) {
    player.x -= movespeed;
  }
  if (player.direction.up) {
    player.y -= movespeed;
  }
  if (player.direction.down) {
    player.y += movespeed;
  }
}

function handleBorder() {
  if (player.x + size >= WIDTH && player.y + size >= HEIGHT) { // bottom right corner
    player.x = WIDTH - size;
    player.y = HEIGHT - size;
  }
  if (player.x + size >= WIDTH) { // right
    player.x = WIDTH - size;
  }
  if (player.x <= 0 && player.y <= 0) { // top left corner
    player.x = 0;
    player.y = 0;
  }
  if (player.y <= 0) { // top
    player.y = 0;
  }
  if (player.x <= 0 && player.y >= HEIGHT - size) { // bottom left
    player.x = 0;
    player.y = HEIGHT - size;
  }
  if (player.x <= 0) { // left
    player.x = 0;
  }
  if (player.x + size >= WIDTH && player.y <= 0) { // top right
    player.x = WIDTH - size;
    player.y = 0;
  }
  if (player.y >= HEIGHT - size) { // bottom
    player.y = HEIGHT - size;
  }
}

function handleDash() {
  if (player.dash.using) {
    player.immunityFrames.active = true;
    if (player.dash.iterations < 10) {
      if (player.direction.right) {
        player.x += player.dash.distance;
      }
      if (player.direction.left) {
        player.x -= player.dash.distance;
      }
      if (player.direction.up) {
        player.y -= player.dash.distance;
      }
      if (player.direction.down) {
        player.y += player.dash.distance;
      }
      player.dash.iterations++;
    } else {
      player.dash.using = false;
      player.dash.iterations = 0;
      player.immunityFrames.active = false;
    }
  }
}

function handleParry() {
  if (player.parry.using) {

    player.parry.hitbox.x = player.x - player.parry.hitbox.size / 4;
    player.parry.hitbox.y = player.y - player.parry.hitbox.size / 4;

    // weird numbers to make place the image correctly don't ask
    ctx.drawImage(shield, player.parry.hitbox.x - player.parry.hitbox.size / 2.25, player.parry.hitbox.y - player.parry.hitbox.size / 2.25, 
    2*player.parry.hitbox.size, 2*player.parry.hitbox.size);
  }
}

function createSingleAttack() {
  let projectile = new Projectile(0, 0, 0, 10, 8, -1)

  projectile.x = enemy.x;
  projectile.y = enemy.y + enemy.size / 2;
  projectile.angle = getAngle(projectile.x, projectile.y, player.x, player.y)

  enemy.projectiles.push(projectile);
}

function createCircleAttack() {
  for (let degrees = 0; degrees <= 360; degrees += 15) {
    let projectile = new Projectile(enemy.x, enemy.y, 1, 10, 3, degrees);
    enemy.projectiles.push(projectile);
  }
}

function drawAttacks() {
  enemy.projectiles.forEach(projectile => {
    if (projectile.type == 1) { // type 1 = circle attack thing
      // mess around with trig functions :)))
      projectile.x += Math.cos(projectile.angle) * projectile.speed;
      projectile.y += Math.sin(projectile.angle) * projectile.speed;
    } else {
      projectile.x += Math.cos(projectile.angle) * projectile.speed;
      projectile.y += Math.sin(projectile.angle) * projectile.speed;
    }
    ctx.drawImage(projectileImage, projectile.x, projectile.y, 2*projectile.size, 2*projectile.size);
  })
}

function handleProjectiles() {
  for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
    let projectile = enemy.projectiles[i];
    if (projectile.x < 0 || projectile.x > WIDTH || projectile.y < 0 || projectile.y > HEIGHT) {
      enemy.projectiles.splice(i, 1);
    }
  }
}

function handleEnemyTeleportAttack() {
  if (enemy.teleportAttack.used) {
    if (enemy.teleportAttack.iterations < 1) {
      enemy.x = generateCoordinate(WIDTH);
      enemy.y = generateCoordinate(HEIGHT);
      enemy.teleportAttack.target.x = player.x;
      enemy.teleportAttack.target.y = player.y;
      enemy.teleportAttack.iterations++;
    } else if (enemy.teleportAttack.iterations >= 1 && enemy.teleportAttack.iterations <= 30) {
      let target = {
        x: enemy.teleportAttack.target.x,
        y: enemy.teleportAttack.target.y
      };
      // if the follow up-attack reaches the target early end the attack
      if (collision(enemy.x, enemy.y, enemy.size, target.x, target.y, size)) {
        enemy.teleportAttack.used = false;
        enemy.teleportAttack.iterations = 0;
      } else {  // else continue as normal
        enemy.follow(target, enemy.speed * 5);
        enemy.teleportAttack.iterations++
      }
    } else if (enemy.teleportAttack.iterations >= 30) {
      enemy.teleportAttack.used = false;
      enemy.teleportAttack.iterations = 0;
    }
  }
}

function handleHits() {
  // hit by projectile
  for (let i = 0; i < enemy.projectiles.length; i++) {
    let projectile = enemy.projectiles[i];
    if (player.parry.using) {
      if (collision(player.parry.hitbox.x, player.parry.hitbox.y, player.parry.hitbox.size,
        projectile.x, projectile.y, projectile.size)) {
          // test different ways of handling the deflection of projectile
          // enemy.projectiles.splice(i, 1);
          // projectile.angle += 180
          projectile.angle = getAngle(player.x, player.y, enemy.x, enemy.y);
        }
    } else if (collision(projectile.x, projectile.y, projectile.size, player.x, player.y, player.width)) {
      player.hit = true;
      enemy.projectiles.splice(i, 1);
    }
  }
  // hit by enemy
  if (collision(enemy.x, enemy.y, enemy.size, player.x, player.y, player.width)) {
    player.hit = true;
  }
}

function drawObjects() {
  player.draw();
  enemy.draw();
}

let player = new Player();
let enemy = new Bot();
enemy.x = generateCoordinate(WIDTH - enemy.size);
enemy.y = generateCoordinate(HEIGHT - enemy.size);

let shield = new Image();
shield.src = './sprites/shield.png';
let projectileImage = document.createElement("img");
// too lazy to make the gif animated
projectileImage.src = './sprites/fireball.gif';

window.addEventListener("keyup", function (e) {
  let key = e.key;
  // turn key to lowercase so it works if user has capslock
  if (key.length === 1) { // only if the length is 1, otherwise arrowkeys wont get registered
    key = key.toLowerCase();
  }
  switch (key) {
    case "ArrowRight":
      player.direction.right = false;
      break;
    case "ArrowLeft":
      player.direction.left = false;
      break;
    case "ArrowUp":
      player.direction.up = false;
      break;
    case "ArrowDown":
      player.direction.down = false;
      break;
    case "f":
      player.parry.using = false;
      break;
  }
});

window.addEventListener("keydown", function (e) {
  let key = e.key;
    // turn key to lowercase so it works if user has capslock
  if (key.length === 1) { // only if the length is 1, otherwise arrowkeys wont get registered
    key = key.toLowerCase();
  }
  switch (key) {
    case "ArrowRight":
      player.direction.left = false;
      player.direction.right = true;
      break;
    case "ArrowLeft":
      player.direction.right = false;
      player.direction.left = true;
      break;
    case "ArrowUp":
      player.direction.down = false;
      player.direction.up = true;
      break;
    case "ArrowDown":
      player.direction.up = false;
      player.direction.down = true;
      break;
    case "w":
      createSingleAttack();
      break;
    case "e":
      createCircleAttack();
      break;
    // enemy's attacks, (for testing)
    case "c":
      enemy.teleportAttack.used = true;
      break;
    case "q":
      player.dash.using = true;
      break;
    case "f":
      player.parry.using = true;
      break;
  }
});

let lastTimestamp = 0;
let maxFPS = 75;
let timestep = 1000 / maxFPS

function animate(timestamp) {
  if (timestamp - lastTimestamp < timestep) {
    requestAnimationFrame(animate);
    return;
  }
  lastTimestamp = timestamp;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (enemy.circleAttack.cooldown == enemyCooldown) {
    let num = Math.floor(Math.random() * 4);
    if (num == 3) {
      enemy.teleportAttack.used = true;
    }
    createCircleAttack();
    enemy.circleAttack.cooldown = 0;
  }
  enemy.circleAttack.cooldown++;

  if (enemy.burst.active) {
    // create one projectile for the burst each frame until there are "enemyCooldown" amount of burst projectiles
    if (enemy.burst.iterations <= enemyCooldown) {
      createSingleAttack();
      enemy.burst.iterations++;
    } else {
      enemy.burst.iterations = 0;
      enemy.burst.active = false;
    }
  }

  if (enemy.burst.cooldown == 2 * enemyCooldown) {
    enemy.burst.active = true;
    enemy.burst.cooldown = 0;
  }
  enemy.burst.cooldown++;

  drawObjects();

  handleMovement();
  handleBorder();
  handleDash();
  handleParry();
  drawAttacks();
  handleEnemyTeleportAttack();

  if (!player.immunityFrames.active) {
    handleHits();
  }
  handleProjectiles();
  if (player.hit && !player.parry.using) {
    lostHealth += damage;
    player.health -= damage;
    healthbar.style.width = 900 - lostHealth + "px";
    player.hit = false;
  }

  if (!enemy.teleportAttack.used) {
    enemy.follow(player, enemy.speed);
  }

  if (player.health <= 0) {
    cancelAnimationFrame(animate);
    alert("Game Over! Your health reached 0.");
    canvasContainer.style.display = "none";
    menu.style.display = "flex";
    healthbarContainer.style.display = "none";
    return;
  }

  requestAnimationFrame(animate);
}

document.getElementById("settingsButton").addEventListener("click", function () {
  document.querySelector(".settings-menu").style.display = "block";
});

document.getElementById("closeSettings").addEventListener("click", function () {
  document.querySelector(".settings-menu").style.display = "none";
});

startButton.addEventListener("click", function () {
  menu.style.display = "none";
  canvasContainer.style.display = "block";
  healthbarContainer.style.display = "flex";

  // reset stuff for when you play again
  enemy.clearProjectiles();
  enemy.x = generateCoordinate(WIDTH - enemy.size);
  enemy.y = generateCoordinate(HEIGHT - enemy.size);
  enemy.circleAttack.cooldown = 0;
  enemy.burst.cooldown = 0;
  lostHealth = 0;
  player.health = 900;
  healthbar.style.width = 900 + "px";

  switch (difficulty.value) {
    case "Easy":
      enemyCooldown = 100;
      break;
    case "Medium":
      enemyCooldown = 70
      break;
    case "Hard":
      enemyCooldown = 45;
      break;
  }

  animate();
});
