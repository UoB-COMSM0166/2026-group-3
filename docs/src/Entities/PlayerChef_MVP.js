import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class PlayerChef_MVP extends Entity {
  static keysDown = {};
  static inputInitialized = false;

  static initInput() {
    if (PlayerChef_MVP.inputInitialized) return;
    PlayerChef_MVP.inputInitialized = true;

    window.addEventListener("keydown", (e) => {
      PlayerChef_MVP.keysDown[e.code] = true;

      if (
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "KeyW" ||
        e.code === "KeyA" ||
        e.code === "KeyS" ||
        e.code === "KeyD" ||
        e.code === "Space"
      ) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      PlayerChef_MVP.keysDown[e.code] = false;

      if (
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "KeyW" ||
        e.code === "KeyA" ||
        e.code === "KeyS" ||
        e.code === "KeyD" ||
        e.code === "Space"
      ) {
        e.preventDefault();
      }
    });
  }

  constructor(game) {
    super(game, new Vector2(15, 8), new Vector2(0.7, 0.7));
    this.speed = 0.1;
    this.heldDish = null;

    PlayerChef_MVP.initInput();
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

  isInteractHeld() {
    return !!PlayerChef_MVP.keysDown["Space"];
  }

  update(events) {
    let dx = 0;
    let dy = 0;

    const left =
      PlayerChef_MVP.keysDown["ArrowLeft"] ||
      PlayerChef_MVP.keysDown["KeyA"];

    const right =
      PlayerChef_MVP.keysDown["ArrowRight"] ||
      PlayerChef_MVP.keysDown["KeyD"];

    const up =
      PlayerChef_MVP.keysDown["ArrowUp"] ||
      PlayerChef_MVP.keysDown["KeyW"];

    const down =
      PlayerChef_MVP.keysDown["ArrowDown"] ||
      PlayerChef_MVP.keysDown["KeyS"];

    if (left) dx -= 1;
    if (right) dx += 1;
    if (up) dy -= 1;
    if (down) dy += 1;

    this.pos.x += dx * this.speed;
    this.pos.y += dy * this.speed;

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
