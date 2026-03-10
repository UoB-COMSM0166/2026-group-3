import { ZombieEntity } from "../ZombieEntity.js";

export class SlobZombie extends ZombieEntity {
    constructor(game, pos){
        super(game, pos);

        this.sprite = "SlobZombieWalking";
        this.image = this.game.assetManager.getImage(this.sprite);
        this.damageImage=this.image;

        this.speed = 0.02;
        this.health = Math.floor(random(3,20));;
        this.damage = 2;

    }
}