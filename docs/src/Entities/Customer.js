import { AssetManager } from "../Core/AssetManager.js";
import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class Customer extends Entity {
  constructor(game, pos, order) {
    super(game, pos, new Vector2(1.5, 1.5));

    this.order = order;
    this.state = "WAITING";

    this.idleImage = "Customer Idle";
    this.walkingImage = "Customer Walking";

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
    // KitchenScene handles the real failure condition.
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
    const isLeaving = this.state === "LEAVING" || this._phase === "LEAVING";
    const isStanding = !isLeaving && (this.state === "WAITING" || this.state === "SERVED");
    const customerSprite = isStanding
      ? this.game.assetManager.getImage("Customer Standing")
      : this.game.assetManager.getImage("Customer Walking");

    if (customerSprite && customerSprite.width > 0) {
      if (isLeaving) {
        push();
        translate(relPos.x + relSize.x, relPos.y);
        scale(-1, 1);
        image(customerSprite, 0, 0, relSize.x, relSize.y);
        pop();
      } else {
        image(customerSprite, relPos.x, relPos.y, relSize.x, relSize.y);
      }
    } else {
      stroke(0);
      if (this.state === "WAITING") {
        fill(220, 120, 120);
      } else if (this.state === "SERVED") {
        fill(120, 220, 120);
      } else {
        fill(150);
      }
      rect(relPos.x, relPos.y, relSize.x, relSize.y);
    }

  }
}
