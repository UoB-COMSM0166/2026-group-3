export class MenuData {
  constructor() {
    this.recipes = [
      {
        id: "rotten_burger",
        name: "Rotten Burger",
        requirements: {
          zombie_meat: 2
        },
        cookTime: 4,
        rewardCoins: 20,
        stationType: "grill"
      },
      {
        id: "toxic_stew",
        name: "Toxic Stew",
        requirements: {
          zombie_meat: 1,
          toxic_slime: 1,
          spice_powder: 1
        },
        cookTime: 6,
        rewardCoins: 35,
        stationType: "pot"
      },
      {
        id: "bone_bbq",
        name: "Bone BBQ",
        requirements: {
          zombie_meat: 1,
          bone_fragments: 2
        },
        cookTime: 7,
        rewardCoins: 40,
        stationType: "oven"
      },
      {
        id: "mutant_soup",
        name: "Mutant Soup",
        requirements: {
          toxic_slime: 2,
          spice_powder: 1
        },
        cookTime: 8,
        rewardCoins: 45,
        stationType: "prep"
      },
      {
        id: "ultimate_feast",
        name: "Ultimate Zombie Feast",
        requirements: {
          zombie_meat: 2,
          toxic_slime: 1,
          bone_fragments: 1,
          mutant_core: 1
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
