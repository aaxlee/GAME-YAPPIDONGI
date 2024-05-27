import { ctx, WIDTH, HEIGHT, size, spriteSheet } from './constants.js';
import { collision, getAngle, generateCoordinate } from './utils.js';

// Animation Constants
export const FRAME_WIDTH = 1000 / 10;
export const FRAME_HEIGHT = 1000 / 11;
export const NUM_FRAMES = 4;
export var currentFrame = 0;
export var frameCount = 0;
export const FRAME_SPEED = 5;

export class Bot {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.speed = 1;
    this.size = size;
    this.attackCooldown = 0;
    this.projectiles = [];
    this.direction = { up: false, down: false, left: false, right: false };
    this.burst = { cooldown: 0, iterations: 0, active: false };
    this.circleAttack = { cooldown: 0 };
    this.teleportAttack = { used: false, target: { x: 0, y: 0 }, cooldown: 12, iterations: 0 };
  }

  draw() {
    ctx.drawImage(spriteSheet, currentFrame * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT, this.x - FRAME_WIDTH/2.5, this.y - FRAME_WIDTH/2.5, FRAME_WIDTH, FRAME_HEIGHT);
    frameCount++;
    if (frameCount >= FRAME_SPEED) {
      frameCount = 0;
      currentFrame = (currentFrame + 1) % NUM_FRAMES;
    }
  }

  follow(player, speed) {
    if (!collision(this.x, this.y, this.size, player.x, player.y, player.width)) {
      let angle = getAngle(this.x, this.y, player.x, player.y);
      let x = Math.cos(angle);
      let y = Math.sin(angle);
      this.x += x * speed;
      this.y += y * speed;
    }
  }

  clearProjectiles() {
    this.projectiles = [];
  }
}

export let enemy = new Bot();
enemy.x = generateCoordinate(WIDTH - enemy.size);
enemy.y = generateCoordinate(HEIGHT - enemy.size);