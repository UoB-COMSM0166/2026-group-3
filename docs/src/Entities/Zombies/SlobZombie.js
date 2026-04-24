import { ZombieEntity } from "../ZombieEntity.js";

export class SlobZombie extends ZombieEntity {
    constructor(game, pos){
        super(game, pos);

        this.id = "Zombie"; // Ensure ID is set for the Scene to find it
        this.sprite = "SlobZombieWalking";
        
        // Use the Asset Manager
        this.image = this.game.assetManager.getImage(this.sprite);
        this.damageImage = this.game.assetManager.getImage("BasicZombieDamage");

        this.speed = 0.02;
        // Random health between 3 and 20
        this.health = Math.floor(random(3, 20)); 
        this.damage = 2;
        
        // MATCHES ASSET MANAGER EXACTLY
        this.drops = ["Zombie Juice"]; 
        this.strength = 4;
    }

    // You don't need a manual preload here if the AssetManager handles it!
    // Removing the manual loadImage prevents double-loading bugs.
    preload(){} 
}