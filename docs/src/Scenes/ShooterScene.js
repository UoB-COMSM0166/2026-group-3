import { Scene } from "../Core/Scene.js";
import { PlayerDayEntity } from "../Entities/PlayerDayEntity.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Menu } from "../UIElements/Menu.js";
import { Vector2 } from "../Utility/Vector2.js";
import { ZombieManager } from "../Entities/ZombieManager.js";

export class ShooterScene extends Scene {
    constructor(game) {
        super(game);
        this.isGameOver = false;

        //Player block 
        let testEntity = new PlayerDayEntity(game);
        this.entities.push(testEntity);

        //Restart Button (i hid it initially)
        this.restartBtn = new Button(game, "Restart Game", new Vector2(160, 50), new Vector2("Centre", "Centre"));
        this.restartBtn.offset.y = 90;
        this.restartBtn.isVisible = false; 
        this.restartBtn.onClick = () => {
            if (typeof loop === 'function') loop(); 
            game.model.scene = new ShooterScene(game);
        };
        this.uielements.push(this.restartBtn);

        

        this.zombieManager = new ZombieManager(game, this);
        this.entities.push(this.zombieManager);

        //Labels & Menus
        let label = new Label(game, "Day", new Vector2(50, 30), new Vector2("Right", "Top"));
        this.uielements.push(label);

        let menu = new Menu(game, new Vector2(350,150), new Vector2("Centre","Centre"));
        menu.isVisible = false;
        menu.id = "menu";
        this.uielements.push(menu);

        let menuButton = new Button(game, "Menu", new Vector2(110, 30), new Vector2("Left", "Top"));
        menuButton.onClick = function() {
            for (let ui of this.game.model.scene.uielements) {
                if (ui.id == "menu") ui.isVisible = true;
            }
        };
        this.uielements.push(menuButton);

        this.waveLabel = new Label(game, "Wave: 0/6", new Vector2(160, 30), new Vector2("Centre", "Top"));
        this.uielements.push(this.waveLabel);
        
        
        this.gameOverLabel = new Label(game, "Game Over", new Vector2(350, 120), new Vector2("Centre", "Centre"));
        this.gameOverLabel.style.fillColor = color(0,0,0,0);
        this.gameOverLabel.style.outline = color(0,0,0,0);
        this.gameOverLabel.style.textColor = color(255,0,0);
        this.gameOverLabel.style.textSize = 60;
        this.gameOverLabel.offset.y = -70;
        this.gameOverLabel.isVisible = false;

        this.uielements.push(this.gameOverLabel);
        
        // Menu Internal Elements
        let menuLabel = new Label(game, "Super Menu", new Vector2(100, 70), new Vector2("Left", "Top"));
        menuLabel.parent = menu;
        menu.elements.push(menuLabel);

        let menuClose = new Button(game, "Close", new Vector2(110, 30), new Vector2("Right", "Top"));
        menuClose.parent = menu;
        menuClose.onClick = function() { this.parent.isVisible = false; }
        menu.elements.push(menuClose);
    }

    draw () {

        // Visualize allowed area (left 1/6th of grid)
        fill(100, 100, 255, 50); // semi-transparent blue
        noStroke();
        let rectWidth = this.game.view.localToScreen(new Vector2(4, 0)).x;
        let rectHeight = this.game.view.localToScreen(new Vector2(0, this.game.gridSize.y)).y;
        rect(0, 0, rectWidth, rectHeight);


        let top = new Vector2(4,0);
        let bottom = new Vector2(4,9);

        let relTop = this.game.view.localToScreen(top);
        let relBottom = this.game.view.localToScreen(bottom);
        
        //Red Boundary Line(bro would not appear idky)
        stroke(255, 0, 0);
        line(relTop.x, relTop.y, relBottom.x, relBottom.y);

        if (this.isGameOver) {
            //Draw a dark overlay to make it dramatic lmao :3
            fill(0, 0, 0, 150); //Semi-transparent black
            rect(0, 0, width, height);

            //the "GAME OVER" text 
            this.gameOverLabel.isVisible = true;
        }

        super.draw(); //call the base draw function
                      //e.g draws all the entities + ui
        
    }

    update(events){
        super.update(events);
        this.waveLabel.label = `Wave 1: ${this.zombieManager.zombiesSpawned}/${this.zombieManager.maxZombies}`;
    }


    gameOver(){
        this.isGameOver = true;
        this.restartBtn.isVisible = true;
    }


}