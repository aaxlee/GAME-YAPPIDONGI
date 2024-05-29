import { canvas, ctx, WIDTH, HEIGHT, startButton, menu, canvasContainer, healthbar, difficulty, healthbarContainer, damage } from './constants.js';
import { handleMovement, handleBorder, handleDash, handleParry, createSingleAttack, createCircleAttack, handleHits, 
  handleProjectiles, drawObjects, drawAttacks, handleEnemyTeleportAttack } from './game.js';
import { player } from './player.js';
import { enemy } from './bot.js';
import { generateCoordinate } from './utils.js';
import './events.js';

let lostHealth = 0;
let enemyCooldown = 100;

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

  handleEnemyTeleportAttack();

  if (enemy.burst.active) {
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
