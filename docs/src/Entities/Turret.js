import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";
import { Bullet } from "./Bullet.js";



export class Turret extends Entity{
    constructor(game, pos, ghost = false){
        let size = new Vector2(1.25, 1.25);
        super(game, pos, size);
        this.ghost = ghost;
        this.id = "Turret";
        this.cooldown = Math.floor(random(0, 100));
        this.sprite = "Turret";

    }


    async update(events){
        if (this.game.model.scene.zombieManager.waveStarted){
            if (this.cooldown==0){
                let bullet = new Bullet(this.game, new Vector2(this.pos.x + this.size.x, this.pos.y + this.size.y/2 - 0.2), 3, 1);
                this.game.model.scene.entities.push(bullet);
                this.cooldown = 100;
        
                // Shoot sound
                await this.game.soundManager.playSFX("shoot");
            } else{
               this.cooldown--; 
            }
        }
    }

    draw(){
        let rel_pos = this.game.view.localToScreen(this.pos)
        let rel_size = this.game.view.localToScreen(this.size)
        let sprite = this.game.assetManager.getImage(this.sprite);
        
        if (this.ghost){
            tint(255,255,255,128);
            image(sprite, rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
            tint(255);
        } else {
            image(sprite, rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
        }
        
    }



}




