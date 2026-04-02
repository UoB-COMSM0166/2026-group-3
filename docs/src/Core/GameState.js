import { Inventory } from "./Inventory.js";

export class GameState {
  constructor(game) {
    this.game = game
    this.inventory = new Inventory([]);
    this.coins = 0;
    this.playerWeapon = "Pistol";
    this.phase = 1;  // 1 phase = 1 day + 1 night. 
    this.turrets = [];
  }

  addCoins(amount) {
    if (amount <= 0) return;
    this.coins += amount;
  }

  spendCoins(amount) {
    if (amount <= 0) return true;
    if (this.coins < amount) return false;
    this.coins -= amount;
    return true;
  }
}