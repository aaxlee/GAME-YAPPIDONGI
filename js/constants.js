export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");
export const startButton = document.getElementById("startButton");
export const menu = document.getElementById("start-menu");
export const canvasContainer = document.getElementById("canvas-container");
export const healthbar = document.getElementById("healthbar");
export const difficulty = document.getElementById("difficulty");
export const healthbarContainer = document.querySelector(".healthbar-container");
export const settingsButton = document.getElementById("settingsButton");
export const settingsMenu = document.querySelector(".settings-menu");
export const closeSettings = document.getElementById("closeSettings");
export const sound = document.getElementById("sound");
export const music = document.getElementById("music");

// Game Constants
export const WIDTH = 900;
export const HEIGHT = 450;
export const size = 15; // player and enemy hitboxes are size * size
export const movespeed = 2;
export const damage = 10; // amount of dmg a projectile does
export let enemyCooldown = 100;

// Sprite Sheets
export const spriteSheet = new Image();
spriteSheet.src = './sprites/Character_sheet.png';

export const shield = new Image();
shield.src = './sprites/shield.png';

export const projectileImage = new Image();
projectileImage.src = './sprites/fireball.gif';
