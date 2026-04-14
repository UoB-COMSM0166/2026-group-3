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

    async takeDamage(damage){
        this.health -= damage;

        // Damage Sound
        await this.game.soundManager.playSFX("damage");
        if (this.health<=0) {

            //Temp Code to add Money on Death
            //this.game.model.gameState.coins+=Math.floor(random(3, 8));

            let zombieManager = this.game.model.scene.zombieManager

            zombieManager.waveStrength -= this.strength / 2;
            this.game.model.gameState.phaseProgress = 1- (zombieManager.waveStrength / zombieManager.totalStrength)

            for (let drop of this.drops){
                this.game.model.gameState.inventory.add(drop);
            }


            this.game.model.scene.removeEntity(this);
            return;
        }
        this.damageTimer = 10;


    }
}
