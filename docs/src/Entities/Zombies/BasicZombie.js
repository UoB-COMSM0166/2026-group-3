import { ZombieEntity } from "../ZombieEntity.js";
import { ItemEntity } from "../ItemEntity.js"; // Import the new Item class
import { Vector2 } from "../../Utility/Vector2.js";

export class BasicZombie extends ZombieEntity {
    constructor(game, pos){
        super(game, pos);

        this.sprite = "BasicZombieWalking";
        this.damageSprite = "BasicZombieDamage";
        this.damageImage = this.game.assetManager.getImage(this.damageSprite);

        this.speed = 0.015;
        this.health = Math.floor(random(3,7));
        this.damage = 1;
        this.drops = ["Zombie Mince"];
        this.strength = 1;
    }

    preload(){
        let promise = loadImage("./assets/zombiewalking.gif").then(image => this.image = image);
        return promise;
    }

    async takeDamage(damage) {
        // Call the original damage logic from ZombieEntity
        await super.takeDamage(damage);

        // If the zombie just died, spawn the item
        if (this.health <= 0) {
            let drop = new ItemEntity(this.game, new Vector2(this.pos.x, this.pos.y), this.drops[0]);
            this.game.model.scene.addEntity(drop);
        }
    }
}