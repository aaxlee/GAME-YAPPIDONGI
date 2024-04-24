let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const WIDTH = 900;
const HEIGHT = 600;

const size = 10;
const movespeed = 3;

class Player {
  constructor() {
    this.health = 100;
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
    this.direction = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    this.projectile = {
      used: false,
      isAlive: false,
      cooldown: 12,
      iterations: 0
    };
    this.attack1 = {
      used: false,
      isAlive: false,
      cooldown: 12,
      iterations: 0
    };
    this.teleportAttack = {
      used: false,
      cooldown: 12,
      iterations: 0
    };
  }
  draw() {
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.stroke();
  }
  moveTo(player, speed) {
    if (this.x != player.x && this.y != player.y) {
      let angle = Math.atan2(player.y - this.y, player.x - this.x);
      let x = Math.cos(angle);
      let y = Math.sin(angle);
      this.x += x * speed;
      this.y += y * speed;
    }
  }
}

class Projectile {
  constructor(x, y, dx, size, speed, angle) {
    this.x = x;
    this.y = y;
    this.dx = dx
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

// creating player and enemy attacks
let player = new Player;
let enemy = new Bot;
enemy.x = generateCoordinate(WIDTH - enemy.size);
enemy.y = generateCoordinate(HEIGHT - enemy.size);

let projectileIndex = 0;
let projectileArray = [];
let projectile = new Projectile(0, 0, 1, 5, 12, -1);  // -1 angle is placeholder

let circleAttackArray = [];
let circleAttackIndex = 0;
let circleAttack = [];

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
      enemy.projectile.used = true;

      let projectile = new Projectile(0, 0, 1, 5, 12, -1)
      projectileArray.push(projectile);

      let currentProjectileAttack = projectileArray[projectileIndex];
      currentProjectileAttack.x = enemy.x; //+ size/2;
      currentProjectileAttack.y = enemy.y + (enemy.size / 2);
      if (player.x < currentProjectileAttack.x) {
        currentProjectileAttack.dx = -1;
      } else if (player.x > currentProjectileAttack.x) {
        currentProjectileAttack.dx = 1;
      }
      projectileIndex++;
      break;
    case "e":
      enemy.attack1.used = true;

      let circleAttack = [];
      for (let i = 0; i <= 360; i += 15) {
        circleAttack.push(new Projectile(0, 0, 2, 5, 3, i));
      }
      circleAttackArray.push(circleAttack);

      let currentCircleAttack = circleAttackArray[circleAttackIndex]
      currentCircleAttack.forEach(projectile => {
        projectile.x = enemy.x;
        projectile.y = enemy.y;
      })
      circleAttackIndex++;
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
  // change direction
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
  // border
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

  // dash
  if (player.dash.using) {
    player.immunityFrames.active = true;
    if (player.dash.iterations < 17) {
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

  // parry
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
      
      if (collision(player.parry.hitbox.x, player.parry.hitbox.y, 
        player.parry.hitbox.size, projectile.x, projectile.y, projectile.size)) {
          console.log("parry");
      }
      ctx.beginPath();
      ctx.fillRect(player.parry.hitbox.x, player.parry.hitbox.y, player.parry.hitbox.size, player.parry.hitbox.size);
      ctx.stroke();
    } else {
      player.parry.using = false;
      player.parry.iterations = 0;
    }
  }

  // attack
  if (enemy.projectile.used) {
    projectileArray.forEach(projectile => {
      projectile.x += projectile.speed * projectile.dx;

      ctx.beginPath();
      ctx.fillRect(projectile.x, projectile.y, 5, 5);
      ctx.stroke();
    })
  }

  if (enemy.attack1.used) {
    circleAttackArray.forEach(attack => {
      attack.forEach(projectile => {
        ctx.beginPath();
        ctx.fillRect(projectile.x, projectile.y , projectile.size, projectile.size);
        ctx.stroke();
        projectile.x += Math.cos(projectile.angle) * projectile.speed;
        projectile.y += Math.sin(projectile.angle) * projectile.speed;
      })
    })
  }

  if (enemy.teleportAttack.used) {
    if (enemy.teleportAttack.iterations <= 1) {
      enemy.x = generateCoordinate(WIDTH);
      enemy.y = generateCoordinate(HEIGHT);
      enemy.teleportAttack.iterations++;
    } else if (enemy.teleportAttack.iterations >= 1 && enemy.teleportAttack.iterations <= 30) {
      enemy.moveTo(player, enemy.speed * 10);
      enemy.teleportAttack.iterations++
    } else if (enemy.teleportAttack.iterations >= 30) {
      console.log("hello");
      enemy.teleportAttack.used = false;
      enemy.teleportAttack.iterations = 0;
    }
  }

  // if player got hit
  

  if (!enemy.teleportAttack.used) {
    enemy.moveTo(player, enemy.speed);
  }

  // draw player
  player.draw();
  
  // draw enemy
  enemy.draw();
  requestAnimationFrame(animate);
}

animate();