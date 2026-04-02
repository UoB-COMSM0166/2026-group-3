export class MenuData {
  constructor() {
    this.recipes = [
      {
        id: "zomburger",
        name: "Zomburger",
        requirements: { "Zombie Mince": 2},
        rewardCoins: 20,
      },
      {
        id: "fried_zombie_leg",
        name: "Fried Zombie Leg",
        requirements: { "Zombie Drumstick": 4 },
        rewardCoins: 35,
      },
      {
        id: "zombie_ramen",
        name: "Zombie Ramen",
        requirements: { "Zombie Belly": 2, "Zombie Juice": 1 },
        rewardCoins: 40,
      },
      {
        id: "zombeer",
        name: "Zombeer",
        requirements: { "Zombie Juice": 3 },
        rewardCoins: 45,
      },
      {
        id: "zombbq",
        name: "ZomBBQ",
        requirements: { "Prime Bone": 1, "Zombie Drumstick": 2, "Zombie Belly": 1, "Zombie Juice": 2 },
        rewardCoins: 100,
      },
    ];
  }

  listRecipes() {
    return this.recipes;
  }

  getRecipe(id) {
    return this.recipes.find(r => r.id === id) ?? null;
  }
}