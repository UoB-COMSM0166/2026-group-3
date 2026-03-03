export class MenuData {
  constructor() {
    this.recipes = [
      {
        id: "rotten_burger",
        name: "Rotten Burger",
        requirements: { zombie_meat: 2, spice_powder: 1 },
        rewardCoins: 20,
      },
      {
        id: "toxic_stew",
        name: "Toxic Stew",
        requirements: { zombie_meat: 1, toxic_slime: 1, spice_powder: 1 },
        rewardCoins: 35,
      },
      {
        id: "bone_bbq",
        name: "Bone BBQ",
        requirements: { zombie_meat: 1, bone_fragments: 2 },
        rewardCoins: 40,
      },
      {
        id: "mutant_soup",
        name: "Mutant Soup",
        requirements: { toxic_slime: 2, spice_powder: 1 },
        rewardCoins: 45,
      },
      {
        id: "ultimate_feast",
        name: "Ultimate Zombie Feast",
        requirements: {
          zombie_meat: 2,
          toxic_slime: 1,
          bone_fragments: 1,
          mutant_core: 1,
        },
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