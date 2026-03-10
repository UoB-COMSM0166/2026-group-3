import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class Customer_MVP extends Entity {
  constructor(game, pos, order) {
    super(game, pos, new Vector2(0.8, 0.8));

    // Current order assigned to this customer
    this.order = order;

    // Possible states: WAITING, SERVED, LEAVING
    this.state = "WAITING";

    // Time (in seconds) before the customer leaves if not served
    this.waitTimer = 15;

    // Controls how long the customer remains after being served
    this.leaveTimer = 2;
  }

  update(events) {
    const deltaSeconds = deltaTime / 1000;

    if (this.state === "WAITING") {
      this.waitTimer -= deltaSeconds;

      if (this.waitTimer <= 0) {
        console.log("[Customer] Timed out. Leaving unhappy.");
        this.state = "LEAVING";
      }
    }

    if (this.state === "SERVED") {
      this.leaveTimer -= deltaSeconds;

      if (this.leaveTimer <= 0) {
        console.log("[Customer] Served and leaving.");
        this.state = "LEAVING";
      }
    }

    if (this.state === "LEAVING") {
      this.pos.x += 0.02;

      if (this.pos.x > this.game.gridSize.x + 1) {
        this.isVisible = false;
      }
    }
  }

  markServed() {
    if (this.state === "WAITING") {
      this.state = "SERVED";
    }
  }

  draw() {
    if (!this.isVisible) return;

    const relPos = this.game.view.localToScreen(this.pos);
    const relSize = this.game.view.localToScreen(this.size);

    stroke(0);

    if (this.state === "WAITING") {
      fill(220, 120, 120);
    } else if (this.state === "SERVED") {
      fill(120, 220, 120);
    } else {
      fill(150);
    }

    rect(relPos.x, relPos.y, relSize.x, relSize.y);

    if (this.order && this.state === "WAITING") {
      fill(0);
      noStroke();
      textSize(10);
      textAlign(CENTER, BOTTOM);
      text(
        this.order.recipeId,
        relPos.x + relSize.x / 2,
        relPos.y - 5
      );
    }
  }
}
