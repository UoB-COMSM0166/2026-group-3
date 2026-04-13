export class MenuData {
  constructor() {
    this.recipes = [
      {
        id: "rotten_burger",
        name: "ZOMBURGER",
        requirements: {
          "Zombie Mince": 2
        },
        cookTime: 4,
        rewardCoins: 18,
        stationType: "oven"
      },
      {
        id: "toxic_stew",
        name: "ZOMMEN",
        requirements: {
          "Zombie Mince": 1,
          "Zombie Belly": 1
        },
        cookTime: 6,
        rewardCoins: 30,
        stationType: "pot"
      },
      {
        id: "bone_bbq",
        name: "ZOMBBQ",
        requirements: {
          "Zombie Mince": 1,
          "Prime Bone": 1
        },
        cookTime: 7,
        rewardCoins: 38,
        stationType: "grill"
      },
      {
        id: "mutant_soup",
        name: "DFD",
        requirements: {
          "Zombie Belly": 1,
          "Zombie Juice": 1
        },
        cookTime: 8,
        rewardCoins: 45,
        stationType: "prep"
      },
      {
        id: "ultimate_feast",
        name: "ZOMBBER",
        requirements: {
          "Zombie Mince": 2,
          "Zombie Belly": 1,
          "Prime Bone": 1,
          "Zombie Drumstick": 1
        },
        cookTime: 12,
        rewardCoins: 100,
        stationType: "special"
      }
    ];
  }

  listRecipes() {
    return this.recipes;
  }

  getRecipe(id) {
    return this.recipes.find(recipe => recipe.id === id) ?? null;
  }
}
