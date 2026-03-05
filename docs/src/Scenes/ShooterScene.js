import { Scene } from "../Core/Scene.js";
import { PlayerDayEntity } from "../Entities/PlayerDayEntity.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Menu } from "../UIElements/Menu.js";
import { Vector2 } from "../Utility/Vector2.js";
import { ZombieManager } from "../Entities/ZombieManager.js";
import { WelcomeScene } from "./WelcomeScene.js";

export class ShooterScene extends Scene {
    constructor(game) {
        super(game);
        this.isGameOver = false;

        //Player block 
        let Player = new PlayerDayEntity(game);
        this.addEntity(Player);

        this.zombieManager = new ZombieManager(game, this);
        this.addEntity(this.zombieManager);

        //Labels & Menus
        let label = new Label(game, `Day ${this.game.model.phase}`, new Vector2(80, 30), new Vector2("Right", "Top"));
        this.addUIElement(label);

        let menu = new Menu(game, new Vector2(350,150), new Vector2("Centre","Centre"));
        menu.isVisible = false;
        menu.id = "menu";
        this.addUIElement(menu);

        let menuButton = new Button(game, "Menu", new Vector2(110, 30), new Vector2("Left", "Top"));
        menuButton.onClick = function() {

            let startScene = new WelcomeScene(this.game);
            this.game.model.scene = startScene;

        };
        this.addUIElement(menuButton);
        
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
        }

        super.draw(); //call the base draw function
                      //e.g draws all the entities + ui
        
    }

    update(events){
        super.update(events);
        if (this.zombieManager.waveStrength == 0){
            if (this.getEntities("Zombie").length == 0){
                this.roundWon();
            }
        }
    }


    gameOver(){
        this.isGameOver = true;

        //Restart Button
        this.restartBtn = new Button(this.game, "Restart Game", new Vector2(160, 50), new Vector2("Centre", "Centre"));
        this.restartBtn.offset.y = 90;
        this.restartBtn.onClick = () => {
            if (typeof loop === 'function') loop(); 
                this.game.model.scene = new ShooterScene(this.game);
            };
        this.addUIElement(this.restartBtn);

        //Game Over Label
        this.gameOverLabel = new Label(this.game, "Game Over", new Vector2(350, 120), new Vector2("Centre", "Centre"));
        this.gameOverLabel.style.fillColor = color(0,0,0,0);
        this.gameOverLabel.style.outline = color(0,0,0,0);
        this.gameOverLabel.style.textColor = color(255,0,0);
        this.gameOverLabel.style.textSize = 60;
        this.gameOverLabel.offset.y = -70;

        this.addUIElement(this.gameOverLabel);
    }

    roundWon(){
        console.log("You won!");
        this.contiueBtn = new Button(this.game, "Continue", new Vector2(160, 50), new Vector2("Centre", "Centre"));
        this.contiueBtn.offset.y = 90;
        this.contiueBtn.onClick = () => {
            if (typeof loop === 'function') loop(); 
                this.game.model.scene = new ShooterScene(this.game);
            };
        this.addUIElement(this.contiueBtn);

        //You Won Label
        this.youWonLabel = new Label(this.game, "You Beat The Wave!", new Vector2(450, 150), new Vector2("Centre", "Centre"));
        this.youWonLabel.style.fillColor = color(0,0,0,0);
        this.youWonLabel.style.outline = color(0,0,0,0);
        this.youWonLabel.style.textColor = color(255,0,0);
        this.youWonLabel.style.textSize = 40;
        this.youWonLabel.offset.y = -70;

        this.addUIElement(this.youWonLabel);
    }




}