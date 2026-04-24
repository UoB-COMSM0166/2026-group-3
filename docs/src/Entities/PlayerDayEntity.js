//Test Entity
import {Entity} from "../Core/Entity.js";
import {Vector2} from "../Utility/Vector2.js";
import { Bullet } from "./Bullet.js";

export class PlayerDayEntity extends Entity{
    constructor(game, weapon){
        let pos = new Vector2(2, 4);
        let size = new Vector2(1.5, 1.5);
        super(game, pos, size);
        this.speed = 0.05;
        this.color = color(0, 0, 0);
        this.isVisible = true;
        this.sprite = "ChefShooting";
        this.shootCooldown = 0;
        this.weapon = weapon

        this.moving = false;
    }

    draw(){
        if (!this.isVisible) { return; }
        fill(this.color); 
        stroke(0);
        let rel_pos = this.game.view.localToScreen(this.pos);
        let rel_size = this.game.view.localToScreen(this.size);
        let sprite = this.game.assetManager.getImage(this.sprite);

        if (this.moving){
            sprite.play();
        } else {
            sprite.pause();
        }

        image(sprite, rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
        
        if (this.game.debug) {
            fill(0,0,0,0);
            stroke(0);
            rect(rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
        }
    }
    update(events){
        if (!this.isVisible || this.game.model.scene.isGameOver) { return; }

        const up = keyIsDown(UP_ARROW) || keyIsDown('w') || keyIsDown('W');
        const down = keyIsDown(DOWN_ARROW) || keyIsDown('s') || keyIsDown('S');

        if (up) {
            this.pos.y -= this.speed;
        }
        if (down) {
            this.pos.y += this.speed;
        }

        this.moving = (up || down);
        
        this.pos.y = constrain(this.pos.y, 2, 6.5);  

        this.shootCooldown -= 1;

        if (keyIsDown('Space') && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = 20 / this.weapon.fireRate
        }
        if (this.shootCooldown < 0){
            this.shootCooldown = 0;
        }

    }

    async shoot(){
        for (let i=0; i< this.weapon.shots; i++){
            let spread = (100-this.weapon.accuracy) * random(-0.01, 0.01);
            let bullet = new Bullet(this.game, new Vector2(this.pos.x + this.size.x - 0.3, this.pos.y + this.size.y/2 + spread), this.weapon.damage, this.weapon.speed);
            this.game.model.scene.entities.push(bullet);
        }
        

        // Shoot sound
        await this.game.soundManager.playSFX("shoot");
    }


}