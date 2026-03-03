import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class Customer_MVP extends Entity {
  constructor(game, pos, order) {
    super(game, pos, new Vector2(0.8, 0.8));
    this.order = order;
    this.served = false;
  }

  draw() {
    if (this.served) return;

    const relPos = this.game.view.localToScreen(this.pos);
    const relSize = this.game.view.localToScreen(this.size);

    stroke(0);
    fill(220, 120, 120);
    rect(relPos.x, relPos.y, relSize.x, relSize.y);
  }
}