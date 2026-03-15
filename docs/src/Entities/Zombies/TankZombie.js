import { ZombieEntity } from "../ZombieEntity.js";

export class TankZombie extends ZombieEntity {
    constructor(game, pos){
        super(game, pos);

        this.sprite = "TankZombieWalking";
        this.image = this.game.assetManager.getImage(this.sprite);
        this.damageImage=this.image;

        this.speed = 0.01;
        this.health = Math.floor(random(10,20));
        this.damage = 3;
        this.drops = ["Prime Bone","Zombie Belly"];

    }
}