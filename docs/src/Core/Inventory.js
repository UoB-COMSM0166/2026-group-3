export class Inventory {
  constructor(initial = {}) {
    this.items = { ...initial };
  }

  get(type) {
    return this.items[type] ?? 0;
  }

  add(type, amount = 1) {
    if (amount <= 0) return;
    this.items[type] = this.get(type) + amount;
  }

  has(requirements) {
    for (const [type, need] of Object.entries(requirements)) {
      if (this.get(type) < need) return false;
    }
    return true;
  }

  consume(requirements) {
    if (!this.has(requirements)) return false;
    for (const [type, need] of Object.entries(requirements)) {
      this.items[type] = this.get(type) - need;
    }
    return true;
  }
}