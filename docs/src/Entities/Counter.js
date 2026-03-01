// src/Entities/Counter.js
export class Counter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 90;
    this.h = 50;
  }

  draw(p) {
    p.push();
    p.translate(this.x, this.y);
    p.stroke(40);
    p.fill(255, 240, 200);
    p.rect(-this.w / 2, -this.h / 2, this.w, this.h, 10);

    p.noStroke();
    p.fill(30);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text("COUNTER", 0, 0);
    p.pop();
  }
}
