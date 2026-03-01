// src/Scenes/KitchenScene.js
import { PlayerChef } from "../Entities/PlayerChef.js";
import { Customer } from "../Entities/Customer.js";
import { KitchenStation } from "../Entities/KitchenStation.js";
import { Counter } from "../Entities/Counter.js";

/**
 * KitchenScene
 * - Places all entities
 * - Runs update/draw loop
 * - Bridges interactions to Part A logic (gameLogic)
 */
export class KitchenScene {
  /**
   * @param {object} gameLogic - Part A logic facade (inventory/menu/order/coins)
   * Must implement:
   * - cookAtStation(stationType) -> { ok:boolean, dishName?:string, reason?:string }
   * - serveAtCounter() -> { ok:boolean, coinsGained?:number, reason?:string }
   * - getCoins() -> number
   * - getHeldDishName() -> string|null
   */
  constructor(gameLogic) {
    this.gameLogic = gameLogic;

    // Entities
    this.player = new PlayerChef(120, 220, gameLogic);

    // Place 2–3 stations with different types
    this.stations = [
      new KitchenStation(260, 140, "grill"),
      new KitchenStation(420, 260, "stew"),
      new KitchenStation(260, 330, "salad"),
    ];

    this.counter = new Counter(560, 180);

    // One simple waiting customer at the counter
    this.customers = [
      new Customer(this.counter.x + 40, this.counter.y + 10),
    ];

    // Simple UI message system
    this.toast = "";
    this.toastTimer = 0;
  }

  showToast(msg, seconds = 1.2) {
    this.toast = msg;
    this.toastTimer = seconds;
  }

  update(dt) {
    // Update player movement
    this.player.update(dt);

    // Update customer (simple idle)
    for (const c of this.customers) c.update(dt);

    // Decrease toast timer
    if (this.toastTimer > 0) this.toastTimer -= dt;
    if (this.toastTimer <= 0) this.toast = "";

    // Handle interactions (E key) with stations/counter
    if (this.player.consumeInteractPressed()) {
      // Priority: if near counter, serve
      if (this.player.isNear(this.counter)) {
        const res = this.gameLogic.serveAtCounter?.();
        if (res?.ok) {
          this.showToast(`Served! +${res.coinsGained ?? 0} coins`);
          // Customer leaves after successful serve
          this.customers = this.customers.filter((c) => !c.isWaiting);
        } else {
          this.showToast(res?.reason ?? "Nothing to serve.");
        }
        return;
      }

      // Otherwise: near any station => cook
      const station = this.player.findNearestStation(this.stations);
      if (station) {
        const res = this.gameLogic.cookAtStation?.(station.stationType);
        if (res?.ok) {
          this.showToast(`Cooked: ${res.dishName ?? "dish"}`);
        } else {
          this.showToast(res?.reason ?? "Cannot cook.");
        }
        return;
      }

      this.showToast("Nothing to interact with.");
    }
  }

  draw(p) {
    // Background / room
    p.background(245);
    p.noStroke();

    // Floor
    p.fill(235);
    p.rect(60, 80, 560, 320, 12);

    // Draw stations
    for (const s of this.stations) s.draw(p);

    // Draw counter
    this.counter.draw(p);

    // Draw customers
    for (const c of this.customers) c.draw(p);

    // Draw player
    this.player.draw(p);

    // HUD
    p.fill(30);
    p.textSize(14);
    const coins = this.gameLogic.getCoins?.() ?? 0;
    const held = this.gameLogic.getHeldDishName?.() ?? null;
    p.text(`Coins: ${coins}`, 70, 60);
    p.text(`Held: ${held ?? "-"}`, 170, 60);
    p.text(`Move: WASD/Arrows  Interact: E`, 320, 60);

    // Toast
    if (this.toast) {
      p.fill(0, 140);
      p.rect(70, 410, 520, 30, 8);
      p.fill(255);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(this.toast, 85, 425);
      p.textAlign(p.LEFT, p.BASELINE);
    }
  }
}
