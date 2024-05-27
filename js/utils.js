export function collision(x1, y1, size1, x2, y2, size2) {
  return x1 + size1 >= x2 && x1 <= x2 + size2 && y1 + size1 >= y2 && y1 <= y2 + size2;
}

export function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function findDistance(player, enemy) {
  return Math.abs(Math.sqrt((player.x - enemy.x)**2 + (player.y - enemy.y)**2));
}

export function generateCoordinate(max) {
  return Math.floor(Math.random() * max);
}
