import { ZombieEntity } from "../ZombieEntity.js";

export class SprinterZombie extends ZombieEntity {
    constructor(game, pos){
        super(game, pos);

        this.sprite = "SprinterZombieWalking";
        this.image = this.game.assetManager.getImage(this.sprite);

        this.speed = 0.03;
        this.health = Math.floor(random(2,8));;
        this.damage = 1;

    }
}