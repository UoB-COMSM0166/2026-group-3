import { Inventory } from "./Inventory.js";

export class GameState {
  constructor() {
    this.inventory = new Inventory({
      zombie_meat: 3,
      toxic_slime: 1,
      bone_fragments: 1,
      spice_powder: 2,
      mutant_core: 0,
    });
    this.coins = 0;
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