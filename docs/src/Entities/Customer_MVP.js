import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class Customer_MVP extends Entity {
  constructor(game, pos, order) {
    super(game, pos, new Vector2(0.8, 0.8));

    this.order = order;
    this.state = "WAITING";

    // In the current kitchen flow, the global kitchen timer controls failure.
    // This timer is only used for on-screen display.
    const difficulty = this.game.model.difficulty || "normal";

    if (difficulty === "easy") {
      this.waitTimer = 20;
    } else if (difficulty === "hard") {
      this.waitTimer = 8;
    } else {
      this.waitTimer = 15;
    }

    this.leaveTimer = 2;
    this.isVisible = true;
  }

  _getDisplayName(recipeId) {
    const displayNameMap = {
      toxic_stew: "ZOMMEN",
      bone_bbq: "ZOMBBQ",
      rotten_burger: "ZOMBURGER",
      mutant_soup: "DFD",
      ultimate_feast: "ZOMBBER",
    };

    return displayNameMap[recipeId] || recipeId;
  }

  update(events) {
    const deltaSeconds = deltaTime / 1000;

    // Customer no longer times out by itself.
    // KitchenScene_MVP handles the real failure condition.
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
    if (this.state !== "WAITING") return false;

    this.state = "SERVED";
    this.leaveTimer = 2;
    return true;
  }

  reset(order = null, x = 12.2, y = 6.8) {
    this.order = order;
    this.state = "WAITING";
    this.leaveTimer = 2;
    this.isVisible = true;
    this.pos.x = x;
    this.pos.y = y;
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
        this._getDisplayName(this.order.recipeId),
        relPos.x + relSize.x / 2,
        relPos.y - 5
      );
    }

    if (this.state === "WAITING") {
      fill(0);
      noStroke();
      textSize(10);
      textAlign(CENTER, TOP);
      text(
        Math.ceil(Math.max(0, this.waitTimer)),
        relPos.x + relSize.x / 2,
        relPos.y + relSize.y + 2
      );
    }
  }
}
