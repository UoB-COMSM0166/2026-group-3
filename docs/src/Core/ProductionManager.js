import { ProductionTask } from "./ProductionTask.js";

export class ProductionManager {
  constructor(game = null) {
    this.game = game;
    this.tasks = [];
    this.nextTaskId = 1;
  }

  clear() {
    this.tasks = [];
    this.nextTaskId = 1;
  }

  createFromTaskList(taskList, menu) {
    this.clear();

    const tasks = taskList.getTasks();
    const difficulty = this.game?.model?.difficulty || "normal";

    for (const [recipeId, quantity] of Object.entries(tasks)) {
      if (quantity <= 0) continue;

      const recipe = menu.getRecipe(recipeId);
      if (!recipe) continue;

      for (let i = 0; i < quantity; i++) {
        const task = new ProductionTask(
          `task_${this.nextTaskId}`,
          recipe,
          difficulty
        );

        this.tasks.push(task);
        this.nextTaskId++;
      }
    }
  }

  getTasks() {
    return this.tasks;
  }

  getPendingTasks() {
    return this.tasks.filter(task => task.status === "PENDING");
  }

  getCookingTasks() {
    return this.tasks.filter(task => task.status === "COOKING");
  }

  getDoneTasks() {
    return this.tasks.filter(task => task.status === "DONE");
  }

  getCollectedTasks() {
    return this.tasks.filter(task => task.status === "COLLECTED");
  }

  updateAll(deltaTime = 1) {
    for (const task of this.tasks) {
      task.update(deltaTime);
    }
  }

  allTasksFinished() {
    return this.tasks.length > 0 && this.tasks.every(task => task.isFinished());
  }

  allTasksCollected() {
    return this.tasks.length > 0 && this.tasks.every(task => task.status === "COLLECTED");
  }

  removeCollectedTaskByRecipeId(recipeId) {
    const index = this.tasks.findIndex(
      task => task.recipeId === recipeId && task.status === "COLLECTED"
    );

    if (index !== -1) {
      this.tasks.splice(index, 1);
      return true;
    }

    return false;
  }
}
