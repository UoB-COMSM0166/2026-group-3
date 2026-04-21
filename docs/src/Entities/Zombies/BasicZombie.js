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

}