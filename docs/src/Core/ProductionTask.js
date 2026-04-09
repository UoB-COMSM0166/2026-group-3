export class ProductionTask {
  constructor(id, recipe, difficulty = "normal") {
    this.id = id;
    this.recipeId = recipe.id;
    this.stationType = recipe.stationType;

    let multiplier = 1;

    if (difficulty === "easy") {
      multiplier = 0.8;
    } else if (difficulty === "hard") {
      multiplier = 1.5;
    }

    this.totalTime = recipe.cookTime * multiplier;
    this.remainingTime = this.totalTime;
    this.status = "PENDING";
  }

  start() {
    if (this.status !== "PENDING") return false;
    this.status = "COOKING";
    return true;
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

  reset() {
    this.remainingTime = this.totalTime;
    this.status = "PENDING";
  }
}
