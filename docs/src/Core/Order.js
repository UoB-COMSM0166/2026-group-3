export class Order {
  constructor(recipeId, rewardCoins) {
    this.recipeId = recipeId;
    this.rewardCoins = rewardCoins;
    this.status = "OFFERED"; // OFFERED | ACCEPTED | COMPLETED
  }

  accept() {
    this.status = "ACCEPTED";
  }

  complete() {
    this.status = "COMPLETED";
  }
}