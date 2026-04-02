import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";
import { Bullet } from "./Bullet.js";



export class Turret extends Entity{
    constructor(game, pos, ghost = false){
        let size = new Vector2(1, 1);
        super(game, pos, size);
        this.ghost = ghost;
        this.id = "Turret";
        this.cooldown = Math.floor(random(0, 100));

    }


    async update(events){
        if (this.game.model.scene.zombieManager.waveStarted){
            if (this.cooldown==0){
                let bullet = new Bullet(this.game, new Vector2(this.pos.x + this.size.x, this.pos.y + this.size.y/2), 1, 1);
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
        let p1 = new Vector2(this.pos.x, this.pos.y);
        let p2 = new Vector2(this.pos.x, this.pos.y + this.size.y);
        let p3 = new Vector2(this.pos.x + this.size.x, this.pos.y + this.size.y/2);

        let relP1 = this.game.view.localToScreen(p1);
        let relP2 = this.game.view.localToScreen(p2);
        let relP3 = this.game.view.localToScreen(p3);
        if (this.ghost){
            fill(0,200,0,128);
        } else {
            fill(0,200,0,255);
        }
        
        stroke(0);

        triangle(relP1.x, relP1.y, relP2.x, relP2.y, relP3.x, relP3.y);

    }



}




