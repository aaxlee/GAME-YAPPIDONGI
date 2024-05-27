import { ctx, WIDTH, HEIGHT, size } from './constants.js';

export class Player {
  constructor() {
    this.health = 900;
    this.hit = false;
    this.x = WIDTH / 2;
    this.y = HEIGHT / 2;
    this.width = size;
    this.height = size;
    this.direction = { up: false, down: false, left: false, right: false };
    this.immunityFrames = { active: false };
    this.dash = { using: false, distance: 5, iterations: 0, cooldown: 2 };
    this.parry = { using: false, cooldown: 5, iterations: 0, hitbox: { size: size * 2, x: 0, y: 0 } };
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

export let player = new Player();