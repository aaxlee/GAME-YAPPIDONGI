import { player } from './player.js';
import { menu, settingsButton, closeSettings, settingsMenu } from './constants.js';


window.addEventListener("keyup", function (e) {
  let key = e.key.toLowerCase();
  switch (key) {
    case "arrowright":
      player.direction.right = false;
      break;
    case "arrowleft":
      player.direction.left = false;
      break;
    case "arrowup":
      player.direction.up = false;
      break;
    case "arrowdown":
      player.direction.down = false;
      break;
    case "f":
      player.parry.using = false;
      break;
  }
});

window.addEventListener("keydown", function (e) {
  let key = e.key.toLowerCase();
  switch (key) {
    case "arrowright":
      player.direction.left = false;
      player.direction.right = true;
      break;
    case "arrowleft":
      player.direction.right = false;
      player.direction.left = true;
      break;
    case "arrowup":
      player.direction.down = false;
      player.direction.up = true;
      break;
    case "arrowdown":
      player.direction.up = false;
      player.direction.down = true;
      break;
    case "q":
      player.dash.using = true;
      break;
    case "f":
      player.parry.using = true;
      break;
  }
});

settingsButton.addEventListener('click', function () {
    settingsMenu.style.display = 'block';
    menu.style.display = 'none';
});

closeSettings.addEventListener('click', function () {
    settingsMenu.style.display = 'none';
    menu.style.display = 'flex';
});
