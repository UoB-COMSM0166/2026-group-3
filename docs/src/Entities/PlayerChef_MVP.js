import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class PlayerChef_MVP extends Entity {
  constructor(game) {
    super(game, new Vector2(15, 8), new Vector2(0.7, 0.7));
    this.speed = 0.1;
    this.heldDish = null; // recipeId string
  }

  isNear(target, padding = 0.2) {
    const aMinX = this.pos.x - padding;
    const aMaxX = this.pos.x + this.size.x + padding;
    const aMinY = this.pos.y - padding;
    const aMaxY = this.pos.y + this.size.y + padding;

    const bMinX = target.pos.x;
    const bMaxX = target.pos.x + target.size.x;
    const bMinY = target.pos.y;
    const bMaxY = target.pos.y + target.size.y;

    const overlapX = aMinX <= bMaxX && aMaxX >= bMinX;
    const overlapY = aMinY <= bMaxY && aMaxY >= bMinY;
    return overlapX && overlapY;
  }

  update(events) {
    if (keyIsDown(LEFT_ARROW)) this.pos.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.pos.x += this.speed;
    if (keyIsDown(UP_ARROW)) this.pos.y -= this.speed;
    if (keyIsDown(DOWN_ARROW)) this.pos.y += this.speed;

    const maxX = this.game.gridSize.x - this.size.x;
    const maxY = this.game.gridSize.y - this.size.y;

    this.pos.x = Math.max(0, Math.min(this.pos.x, maxX));
    this.pos.y = Math.max(0, Math.min(this.pos.y, maxY));
  }

  draw() {
    const relPos = this.game.view.localToScreen(this.pos);
    const relSize = this.game.view.localToScreen(this.size);

    stroke(0);
    fill(240, 200, 80);
    rect(relPos.x, relPos.y, relSize.x, relSize.y);
  }
}
