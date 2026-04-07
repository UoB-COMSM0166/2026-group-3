export class ProductionTask {
  constructor(id, recipe) {
    this.id = id;
    this.recipeId = recipe.id;
    this.stationType = recipe.stationType;

    this.totalTime = recipe.cookTime;
    this.remainingTime = recipe.cookTime;

    this.status = "PENDING";
  }

  start() {
    if (this.status !== "PENDING") return;
    this.status = "COOKING";
  }

  update(deltaTime = 1) {
    if (this.status !== "COOKING") return;

    this.remainingTime -= deltaTime;

    if (this.remainingTime <= 0) {
      this.remainingTime = 0;
      this.status = "DONE";
    }
  }

  collect() {
    if (this.status !== "DONE") return false;
    this.status = "COLLECTED";
    return true;
  }

  isFinished() {
    return this.status === "DONE" || this.status === "COLLECTED";
  }
}