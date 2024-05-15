let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let lostHealth = 0;
let healthbar = document.getElementById("healthbar");

const WIDTH = 900;
const HEIGHT = 450;

const size = 10;
const movespeed = 2;

class Player {
  constructor() {
    this.health = 100;
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
      success: false,
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
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.stroke();
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
    this.projectile = {
      cooldown: 0
    };
    this.attack1 = {
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
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.stroke();
  }
  follow(player, speed) {
    if (!collision(this.x, this.y, this,size, player.x, player.y, player.width)) {
      let angle = Math.atan2(player.y - this.y, player.x - this.x);
      let x = Math.cos(angle);
      let y = Math.sin(angle);
      this.x += x * speed;
      this.y += y * speed;
    } else if (collision(this.x, this.y, this,size, player.x, player.y, player.width)) {
      return;
    }
  }
  resetAttacks() {
    this.projectile.used = false;
    this.attack1.used = false;
    this.teleportAttack.used = false;
  }
}

class Projectile {
  constructor(x, y, direction, size, speed, angle) {
    this.x = x;
    this.y = y;
    this.direction = direction
    this.size = size;
    this.speed = speed;
    this.angle = angle;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function collision(x1, y1, size1, x2, y2, size2) {
  if (x1 <= x2 + size2 && x1 + size1 >= x2 &&
    y1 <= y2 + size2 && y1 + size1 >= y2) {
    return true;
  } else {
    return false;
  }
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
    if (player.parry.iterations <= 10) {
      // check player's direction to determine parry hitbox coordinates
      if (player.direction.right) {
        player.parry.hitbox.x = player.x + player.parry.hitbox.size;
        player.parry.hitbox.y = player.y - (player.height / 2);
      } else if (player.direction.left) {
        player.parry.hitbox.x = player.x - player.width - player.parry.hitbox.size;
        player.parry.hitbox.y = player.y - (player.height / 2);
      } else if (player.direction.up) {
        player.parry.hitbox.x = player.x - (player.width / 2);
        player.parry.hitbox.y = player.y - player.height - player.parry.hitbox.size;
      } else if (player.direction.down) {
        player.parry.hitbox.x = player.x - (player.width / 2);
        player.parry.hitbox.y = player.y + player.parry.hitbox.size;
      }

      player.parry.iterations++;
      
      ctx.beginPath();
      ctx.fillRect(player.parry.hitbox.x, player.parry.hitbox.y, player.parry.hitbox.size, player.parry.hitbox.size);
      ctx.stroke();
    } else {
      player.parry.using = false;
      player.parry.iterations = 0;
    }
  }
}

function createSingleAttack() {
  let projectile = new Projectile(0, 0, 1, 5, 12, -1)

  projectile.x = enemy.x;
  projectile.y = enemy.y
  if (player.x < projectile.x) {
    projectile.direction = -1;
  } else if (player.x > projectile.x) {
    projectile.direction = 1;
  }
  enemy.projectiles.push(projectile);
}

function createCircleAttack() {
  for (let degrees = 0; degrees <= 360; degrees += 15) {
    let projectile = new Projectile(enemy.x, enemy.y, 2, 5, 3, degrees);
    enemy.projectiles.push(projectile);
  }
}

function drawAttacks() {
  
    enemy.projectiles.forEach(projectile => {
      if (projectile.angle != -1) {
        projectile.x += Math.cos(projectile.angle) * projectile.speed;
        projectile.y += Math.sin(projectile.angle) * projectile.speed;
        ctx.beginPath();
        ctx.fillRect(projectile.x, projectile.y, projectile.size, projectile.size);
        ctx.stroke();
      } else if (projectile.angle == -1) {
        projectile.x += projectile.speed * projectile.direction;
        ctx.beginPath();
        ctx.fillRect(projectile.x, projectile.y, 5, 5);
        ctx.stroke();
      }
    })
  }

function handleProjectiles() {
  for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
    let projectile = enemy.projectiles[i];
    if (projectile.x < 0 || projectile.x > WIDTH || projectile.y < 0 || projectile.y > HEIGHT) {
      console.log("delete");
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
  // single attack
  for (let index = 0; index < enemy.projectile.array.length; index++) {
    let projectile = enemy.projectile.array[index];
    if (collision(projectile.x, projectile.y, projectile.size, player.x, player.y, player.width)) {
      player.hit = true;
    }
  }
  // circle attack
  enemy.attack1.array.forEach(attack => {
    attack.forEach(projectile => {
      if (collision(projectile.x, projectile.y, projectile.size, player.x, player.y, player.width)) {
        player.hit = true;
      }
    })
  })
  // teleport attack
  if (collision(player.x, player.y, player.width, enemy.x, enemy.y, enemy.size)) {
    player.hit = true;
  }
}

function handleHitsNew() {
  // hit by projectile
  for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
    let projectile = enemy.projectiles[i];
    if (collision(projectile.x, projectile.y, projectile.size, player.x, player.y, player.width)) {
      player.hit = true;
      enemy.projectiles.splice(i, 1);
    }
  }
  // hit by enemy
  if (collision(enemy.x, enemy.y, enemy.size, player.x, player.y, player.width)) {
    player.hit = true;
  }
}

function randomizeEnemyAttack() {
  enemy.resetAttacks();
  let num = Math.floor(Math.random() * 3)
  switch(num) {
    case 0:
      enemy.projectile.used = true;
      createSingleAttack();
      break;
    case 1:
      enemy.attack1.used = true;
      createCircleAttack();
      break;
    case 2:
      enemy.teleportAttack.used = true;
      break;
  }
}

function drawObjects() {
  player.draw();
  enemy.draw();
}

// creating player and enemy attacks
let player = new Player;
let enemy = new Bot;
enemy.x = generateCoordinate(WIDTH - enemy.size);
enemy.y = generateCoordinate(HEIGHT - enemy.size);

window.addEventListener("keyup", function(e) {
  switch (e.key) {
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
})

window.addEventListener("keydown", function(e) {
  switch (e.key) {
    case "ArrowRight":
      player.resetDirections();
      player.direction.right = true;
      break;
    case "ArrowLeft":
      player.resetDirections();
      player.direction.left = true;
      break;
    case "ArrowUp":
      player.resetDirections();
      player.direction.up = true;
      break;
    case "ArrowDown":
      player.resetDirections();
      player.direction.down = true;
      break;
    case "w":
      createSingleAttack();
      break;
    case "e":
      createCircleAttack();
      break;
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
const FPS = 60;
const timestep = 1000 / FPS;

function animate(timestamp) {
  if (timestamp - lastTimestamp < timestep) {
    requestAnimationFrame(animate);
    return;
  }
  lastTimestamp = timestep;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // if (enemy.attackCooldown == 100) {
  //   randomizeEnemyAttack();
  //   console.log(enemy.projectile.used);
  //   console.log(enemy.attack1.used);
  //   console.log(enemy.teleportAttack.used);
  //   enemy.attackCooldown = 0;
  // }
  // enemy.attackCooldown++;

  if (enemy.attack1.cooldown == 100) {
    createCircleAttack();
    enemy.attack1.cooldown = 0;
  }
  enemy.attack1.cooldown++;

  handleMovement();
  handleBorder();
  handleDash();
  handleParry();
  drawAttacks();
  handleEnemyTeleportAttack();

  console.log(enemy.attack1.used);

  if (!player.immunityFrames.active) {
    handleHitsNew();
  }
  handleProjectiles();
  if (player.hit) {
    lostHealth += 30;
    healthbar.style.width = 900 - lostHealth + "px";
    player.hit = false;
  }

  if (!enemy.teleportAttack.used) {
    enemy.follow(player, enemy.speed);
  }

  drawObjects();

  requestAnimationFrame(animate);
}

animate();