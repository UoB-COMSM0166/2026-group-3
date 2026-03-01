// src/Entities/KitchenStation.js
export class KitchenStation {
  constructor(x, y, stationType) {
    this.x = x;
    this.y = y;
    this.stationType = stationType; // e.g. "grill" | "stew" | "salad"
    this.w = 70;
    this.h = 40;
  }

  draw(p) {
    p.push();
    p.translate(this.x, this.y);

    // Station body
    p.stroke(40);
    p.fill(255);
    p.rect(-this.w / 2, -this.h / 2, this.w, this.h, 8);

    // Label
    p.noStroke();
    p.fill(30);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text(this.stationType.toUpperCase(), 0, 0);
    p.pop();
  }
}
