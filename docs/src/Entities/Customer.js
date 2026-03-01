// src/Entities/Customer.js
export class Customer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isWaiting = true; // when served -> false
  }

  update(dt) {
    // No complex AI for Part B (idle)
    // Could add small bobbing animation later
  }

  draw(p) {
    if (!this.isWaiting) return;
    p.push();
    p.translate(this.x, this.y);
    p.noStroke();
    p.fill(80, 200, 120);
    p.circle(0, 0, 22);
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(10);
    p.text(":-)", 0, 1);
    p.pop();
  }
}
