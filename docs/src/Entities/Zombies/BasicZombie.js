import { ZombieEntity } from "../ZombieEntity.js";

export class BasicZombie extends ZombieEntity {
    constructor(game, pos){
        super(game, pos);

        this.sprite = "BasicZombieWalking";
        this.image = this.game.assetManager.getImage(this.sprite);

        this.speed = 0.015;
        this.health = Math.floor(random(3,7));
        this.damage = 1;

    }
}