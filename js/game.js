import { ctx, WIDTH, HEIGHT, movespeed, size, shield, projectileImage } from './constants.js';
import { player } from './player.js';
import { enemy } from './bot.js';
import { Projectile } from './projectile.js';
import { collision, getAngle, generateCoordinate } from './utils.js';

export function handleMovement() {
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

export function handleBorder() {
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

export function handleDash() {
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

export function handleParry() {
  if (player.parry.using) {

    player.parry.hitbox.x = player.x - player.parry.hitbox.size / 4;
    player.parry.hitbox.y = player.y - player.parry.hitbox.size / 4;

    // weird numbers to make place the image correctly don't ask
    ctx.drawImage(shield, player.parry.hitbox.x - player.parry.hitbox.size / 2.25, player.parry.hitbox.y - player.parry.hitbox.size / 2.25, 
    2*player.parry.hitbox.size, 2*player.parry.hitbox.size);
  }
}

export function createSingleAttack() {
  let projectile = new Projectile(0, 0, 0, 10, 8, -1)

  projectile.x = enemy.x;
  projectile.y = enemy.y + enemy.size / 2;
  projectile.angle = getAngle(projectile.x, projectile.y, player.x, player.y)

  enemy.projectiles.push(projectile);
}

export function createCircleAttack() {
  for (let degrees = 0; degrees <= 360; degrees += 15) {
    let projectile = new Projectile(enemy.x, enemy.y, 1, 10, 3, degrees);
    enemy.projectiles.push(projectile);
  }
}

export function drawAttacks() {
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

export function handleProjectiles() {
  for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
    let projectile = enemy.projectiles[i];
    if (projectile.x < 0 || projectile.x > WIDTH || projectile.y < 0 || projectile.y > HEIGHT) {
      enemy.projectiles.splice(i, 1);
    }
  }
}

export function handleEnemyTeleportAttack() {
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

export function handleHits() {
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

export function drawObjects() {
  player.draw();
  enemy.draw();
}