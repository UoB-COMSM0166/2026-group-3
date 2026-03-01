// src/Entities/PlayerChef.js
export class PlayerChef {
  constructor(x, y, gameLogic) {
    this.x = x;
    this.y = y;
    this.r = 16; // collision radius
    this.speed = 160; // px/sec
    this.gameLogic = gameLogic;

    this._interactPressed = false; // edge-trigger
    this._interactLatch = false;   // to avoid repeats while key held
  }

  update(dt) {
    // Movement: WASD + Arrow keys
    let vx = 0;
    let vy = 0;

    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) vx -= 1;   // A
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) vx += 1;  // D
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) vy -= 1;     // W
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) vy += 1;   // S

    // Normalize diagonal
    const mag = Math.hypot(vx, vy);
    if (mag > 0) {
      vx /= mag;
      vy /= mag;
    }

    this.x += vx * this.speed * dt;
    this.y += vy * this.speed * dt;

    // Clamp inside room area (match scene floor rect)
    this.x = constrain(this.x, 80, 600);
    this.y = constrain(this.y, 100, 380);

    // Interact key (E = 69)
    const eDown = keyIsDown(69);
    if (eDown && !this._interactLatch) {
      this._interactPressed = true;
      this._interactLatch = true;
    }
    if (!eDown) this._interactLatch = false;
  }

  consumeInteractPressed() {
    const v = this._interactPressed;
    this._interactPressed = false;
    return v;
  }

  isNear(entity, dist = 42) {
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    return Math.hypot(dx, dy) <= dist;
  }

  findNearestStation(stations, dist = 48) {
    let best = null;
    let bestD = Infinity;
    for (const s of stations) {
      const d = Math.hypot(this.x - s.x, this.y - s.y);
      if (d <= dist && d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  draw(p) {
    // Chef (simple)
    p.push();
    p.translate(this.x, this.y);
    p.noStroke();
    p.fill(60, 120, 220);
    p.circle(0, 0, this.r * 2);
    // Hat
    p.fill(250);
    p.rect(-10, -26, 20, 10, 3);
    p.pop();
  }
}
