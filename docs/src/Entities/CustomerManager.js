import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";
import { Order } from "../Core/Order.js";
import { Customer_MVP } from "./Customer_MVP.js";

/**
 * Owns the kitchen order queue, customer spawning, movement, and "current order" tracking.
 * Expects the host scene to expose { game, entities, menu } and a kitchenTimer during production.
 */
export class CustomerManager extends Entity {
  constructor(game, scene) {
    super(game);
    this.scene = scene;

    this.orderQueue = [];
    this.currentOrder = null;
    this.customers = [];
    this.maxCustomersOnScreen = 3;
    this.customerSpawnTimer = 1.2;
    this.customerSpawnIntervalMin = 3.2;
    this.customerSpawnIntervalMax = 5.8;
    this.totalOrdersToServe = 0;
    this.servedOrdersCount = 0;
    this.nextCustomerId = 1;

    this.customerTargetSlots = [
      new Vector2(5.8, 2.3),
      new Vector2(5.8, 4.5),
      new Vector2(5.8, 6.7),
    ];
    this.customerSpawnX = 14.2;
    this.customerLeaveX = 15.4;
    this.customerMoveSpeed = 4.7;
  }

  _queueFromTaskList(taskList) {
    const queue = [];
    const tasks = taskList.getTasks();

    for (const [recipeId, quantity] of Object.entries(tasks)) {
      for (let i = 0; i < quantity; i++) {
        queue.push(recipeId);
      }
    }

    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    return queue;
  }

  beginProductionFromTaskList(taskList, kitchenTimer) {
    this.removeAllCustomersFromScene();
    this.orderQueue = this._queueFromTaskList(taskList);
    this.totalOrdersToServe = this.orderQueue.length;
    this.servedOrdersCount = 0;
    this.customerSpawnTimer = 0.4;
    this.currentOrder = null;
    this.spawnRandomIfPossible(kitchenTimer);
  }

  getRandomSpawnInterval() {
    return random(this.customerSpawnIntervalMin, this.customerSpawnIntervalMax);
  }

  getAvailableCustomerSlotIndex() {
    const occupied = new Set();

    for (const customer of this.customers) {
      if (customer.isVisible && typeof customer._slotIndex === "number") {
        occupied.add(customer._slotIndex);
      }
    }

    const available = [];
    for (let i = 0; i < this.customerTargetSlots.length; i++) {
      if (!occupied.has(i)) available.push(i);
    }

    if (available.length === 0) return -1;
    return random(available);
  }

  /**
   * @param {number} kitchenTimer
   * @returns {boolean}
   */
  spawnRandomIfPossible(kitchenTimer) {
    if (this.orderQueue.length === 0) return false;

    const visibleCount = this.customers.filter(c => c.isVisible).length;
    if (visibleCount >= this.maxCustomersOnScreen) return false;

    const slotIndex = this.getAvailableCustomerSlotIndex();
    if (slotIndex === -1) return false;

    const queuePickIndex = Math.floor(Math.random() * this.orderQueue.length);
    const [recipeId] = this.orderQueue.splice(queuePickIndex, 1);
    const recipe = this.scene.menu.getRecipe(recipeId);
    if (!recipe) return false;

    const targetPos = this.customerTargetSlots[slotIndex];

    const customer = new Customer_MVP(
      this.game,
      new Vector2(this.customerSpawnX, targetPos.y),
      null
    );

    customer.isVisible = true;
    customer.order = new Order(recipe.id, recipe.rewardCoins);
    customer.waitTimer = kitchenTimer;

    customer._slotIndex = slotIndex;
    customer._targetPos = new Vector2(targetPos.x, targetPos.y);
    customer._phase = "ENTERING";
    customer._customerId = this.nextCustomerId++;
    customer.state = "ENTERING";

    this.customers.push(customer);
    this.scene.entities.push(customer);

    this.customerSpawnTimer = this.getRandomSpawnInterval();

    console.log("[Kitchen] Spawned customer:", customer._customerId, recipe.id);
    return true;
  }

  updateSpawning(kitchenTimer) {
    if (this.orderQueue.length === 0) return;

    if (this.customers.filter(c => c.isVisible).length >= this.maxCustomersOnScreen) {
      return;
    }

    this.customerSpawnTimer -= deltaTime / 1000;
    if (this.customerSpawnTimer <= 0) {
      this.spawnRandomIfPossible(kitchenTimer);
    }
  }

  updateMovement() {
    const dt = deltaTime / 1000;

    for (const customer of this.customers) {
      if (!customer.isVisible) continue;

      if (customer._phase === "ENTERING") {
        customer.pos.x -= this.customerMoveSpeed * dt;
        customer.pos.y = customer._targetPos.y;

        if (customer.pos.x <= customer._targetPos.x) {
          customer.pos.x = customer._targetPos.x;
          customer._phase = "WAITING";
          customer.state = "WAITING";
        }
      } else if (customer._phase === "LEAVING") {
        customer.pos.x += this.customerMoveSpeed * dt;

        if (customer.pos.x >= this.customerLeaveX) {
          customer.isVisible = false;
          customer.order = null;
        }
      }
    }

    const stillVisible = [];
    for (const customer of this.customers) {
      if (customer.isVisible) {
        stillVisible.push(customer);
      } else {
        const idx = this.scene.entities.indexOf(customer);
        if (idx !== -1) this.scene.entities.splice(idx, 1);
      }
    }
    this.customers = stillVisible;
  }

  getVisibleWaitingCustomers() {
    return this.customers
      .filter(c => c.isVisible && c.order && c._phase === "WAITING")
      .sort((a, b) => a._customerId - b._customerId);
  }

  refreshCurrentOrder() {
    const waitingCustomers = this.getVisibleWaitingCustomers();
    this.currentOrder = waitingCustomers.length > 0 ? waitingCustomers[0].order : null;
  }

  findMatchingCustomerForHeldDish(recipeId) {
    const waitingCustomers = this.getVisibleWaitingCustomers();
    return waitingCustomers.find(c => c.order.recipeId === recipeId) || null;
  }

  /**
   * Keeps on-screen order timers in sync with the global kitchen clock.
   * @param {number} kitchenTimer
   */
  syncWaitTimersToKitchen(kitchenTimer) {
    for (const customer of this.customers) {
      if (customer.isVisible && customer.order && customer._phase === "WAITING") {
        customer.waitTimer = kitchenTimer;
      }
    }
  }

  isProductionRoundComplete() {
    const visibleCustomers = this.customers.filter(c => c.isVisible);
    return (
      this.servedOrdersCount >= this.totalOrdersToServe &&
      this.orderQueue.length === 0 &&
      visibleCustomers.length === 0
    );
  }

  recordServedOrder() {
    this.servedOrdersCount += 1;
  }

  removeAllCustomersFromScene() {
    for (const customer of this.customers) {
      const idx = this.scene.entities.indexOf(customer);
      if (idx !== -1) this.scene.entities.splice(idx, 1);
    }
    this.customers = [];
  }

  /**
   * Full teardown when leaving the kitchen (e.g. return to shooter).
   */
  clearForSceneExit() {
    for (const customer of this.customers) {
      const idx = this.scene.entities.indexOf(customer);
      if (idx !== -1) this.scene.entities.splice(idx, 1);
    }
    this.customers = [];
    this.currentOrder = null;
    this.orderQueue = [];
  }
}
