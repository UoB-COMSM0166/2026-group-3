import { ItemEntity } from "./ItemEntity.js";
import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class ZombieEntity extends Entity {
    constructor(game, pos){
        let size = new Vector2(1.5, 1.5); 
        super(game, pos, size);

        this.isVisible = true;
        this.id = "Zombie";
        this.attackCooldown = 0;
    }

    update(events){
        if (this.game.model.scene.isGameOver){
            this.image.pause();
            return;
        } else {
            this.image.play();
        }
        if (!this.isVisible) return;

        const boundary = 4;
        if (this.pos.x <= boundary) {
            if (this.attackCooldown <= 0){
                let fence = this.game.model.scene.getEntity("Fence");
                fence.takeDamage(this.damage);
                this.attackCooldown = 60;
            } else {
                this.attackCooldown -= 1;
            }
        } else {
            this.pos.x -= this.speed;
        }
    }

    preload(){}

    draw(){
        if (!this.isVisible) return;

        let rel_pos = this.game.view.localToScreen(this.pos);
        let rel_size = this.game.view.localToScreen(this.size);
        
        if (this.damageTimer>0){
            tint(255,0,0,196);
            image(this.image, rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
            tint(255);
            
            this.damageTimer-=1;
        } else{
            image(this.image, rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
        }

        if (this.game.debug) {
            fill(0,0,0,0);
            stroke(0);
            rect(rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
        }
    }

 async takeDamage(damage) {
    if (this.isDead || this.health <= 0) return;
    this.health -= damage;
    this.damageTimer = 10;

    this.game.soundManager.playSFX("damage").catch(() => {});

    if (this.health <= 0) {
        this.isDead = true;
        
        console.log(`Zombie Died. Type: ${this.constructor.name}, Drops:`, this.drops);

        if (this.drops && this.drops.length > 0) {
            for (let dropName of this.drops) {
                // Add to inventory (updates the counter)
                this.game.model.gameState.inventory.add(dropName);
                
                // Create visual ItemEntity on the ground
                let item = new ItemEntity(this.game, new Vector2(this.pos.x, this.pos.y), dropName);
                this.game.model.scene.addEntity(item);
            }
        }

        this.game.model.scene.removeEntity(this);
        
        let zm = this.game.model.scene.zombieManager;
        if (zm && zm.zombies) {
            zm.zombies = zm.zombies.filter(z => z !== this);
        }
    }
}
}
