import { ZombieEntity } from "../ZombieEntity.js";

export class BasicZombie extends ZombieEntity {
    constructor(game, pos){
        super(game, pos);

        this.sprite = "BasicZombieWalking";
        this.damageSprite = "BasicZombieDamage";
        this.image = this.game.assetManager.getImage(this.sprite);
        this.damageImage = this.game.assetManager.getImage(this.damageSprite);

        this.speed = 0.015;
        this.health = Math.floor(random(3,7));
        this.damage = 1;

    }
}