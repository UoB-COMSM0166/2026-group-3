import { ZombieEntity } from "../ZombieEntity.js";
import { ItemEntity } from "../ItemEntity.js"; 
import { Vector2 } from "../../Utility/Vector2.js";

export class SprinterZombie extends ZombieEntity {
    constructor(game, pos){
        super(game, pos);

        this.sprite = "SprinterZombieWalking";
        this.image = this.game.assetManager.getImage(this.sprite);
        this.damageImage = this.image;

        this.speed = 0.03;
        this.health = Math.floor(random(2,8));
        this.damage = 1;
        this.drops = ["Zombie Drumstick"];
        this.strength = 5;
    }

    preload(){
        let promise = loadImage("./assets/sprinter.gif").then(image => this.image = image);
        return promise;
    }

    async takeDamage(damage) {
        await super.takeDamage(damage);

        if (this.health <= 0) {
            let drop = new ItemEntity(this.game, new Vector2(this.pos.x, this.pos.y), this.drops[0]);
            this.game.model.scene.addEntity(drop);
        }
    }
}