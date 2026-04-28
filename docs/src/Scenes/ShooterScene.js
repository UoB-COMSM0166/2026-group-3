import { Scene } from "../Core/Scene.js";
import { PlayerDayEntity } from "../Entities/PlayerDayEntity.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Menu } from "../UIElements/Menu.js";
import { Vector2 } from "../Utility/Vector2.js";
import { ZombieManager } from "../Entities/ZombieManager.js";
import { WelcomeScene } from "./WelcomeScene.js";
import { KitchenScene } from "./KitchenScene.js";
import { WeaponManager } from "../Core/WeaponManager.js";
import { Fence } from "../Entities/Fence.js";
import { TurretManager } from "../Entities/TurretManager.js";
import { GameState } from "../Core/GameState.js";
import {UIBar} from "../UIElements/UIBar.js"
import { ShopMenu } from "../UIElements/ShopMenu.js";

export class ShooterScene extends Scene {
    constructor(game) {
        super(game);
        this.isGameOver = false;
        this.isRoundWon = false;
        this.game.model.gameState.time = "Night"
        this.game.model.gameState.phaseProgress = 0;

        this.background = "Shooter Background";

        this.rows = [2, 3, 4, 5, 6];

        this.weaponManager = new WeaponManager(game);
        let weapon = this.weaponManager.getWeapon(game.model.gameState.playerWeapon);

        //Player block 
        let Player = new PlayerDayEntity(game, weapon);
        Player.id = "player";
        this.addEntity(Player);

        let fence = new Fence(game);
        this.addEntity(fence);


        this.zombieManager = new ZombieManager(game, this);
        this.addEntity(this.zombieManager);

        this.turretManager = new TurretManager(game, this);
        this.addEntity(this.turretManager);


        this.uiBar = new UIBar(game, this);
        this.addUIElement(this.uiBar);


        let startButton = new Button(game, "Start Wave", new Vector2(250, 60), new Vector2("Centre", "Bottom"));
        startButton.expandToFit = new Vector2(true, true)
        startButton.textSizeOverride = true;
        startButton.style.textSize = 40;
        startButton.id = "Start Button";
        startButton.onClick = function() {
            if (!this.game.model.scene.zombieManager.loaded) {return;}
            this.isVisible = false;
            this.game.model.scene.startWave();
        };
        this.addUIElement(startButton);


        let fenceHealth = new Label(game, "Health: 100%", new Vector2(200, 30), new Vector2("Centre", "Bottom"));
        fenceHealth.id = "FenceLabel";
        fenceHealth.isVisible = false;
        // Keep this as a state holder; health is rendered as a custom progress bar.
        fenceHealth.style.fillColor = color(0, 0, 0, 0);
        fenceHealth.style.outline = color(0, 0, 0, 0);
        fenceHealth.style.textColor = color(0, 0, 0, 0);

        this.addUIElement(fenceHealth);

        let shop = new ShopMenu(game, this);
        if (this.game.model.gameState.phase == 1){
            shop.isVisible = false;
        }
        
        shop.offset.y = 100;
        shop.offset.x = 100;
        this.addUIElement(shop);

    }

    startWave(){
        this.zombieManager.waveStarted = true;
        this.getUIElement("FenceLabel").isVisible = true;
        this.getUIElement("shop").isVisible = false;
        this.uiBar.shopButton.active = false;
    }

    draw () {

        const background = this.game.assetManager.getImage(this.background);
        image(
            background,
            0,
            this.uiBar.size.y,
            this.game.view.size.x,
            this.game.view.size.y - this.uiBar.size.y
        );

        super.draw();
        this._drawFenceHealthBar();

        if (this.isGameOver) {
            //Draw a dark overlay to make it dramatic lmao :3
            stroke(0);
            fill(0, 0, 0, 150); //Semi-transparent black
            rect(0, 0, width, height);   
            this.gameOverLabel.draw();    
            this.restartBtn.draw();
        }
    }

    _drawFenceHealthBar() {
        const fenceLabel = this.getUIElement("FenceLabel");
        if (!fenceLabel || !fenceLabel.isVisible) return;

        const fence = this.getEntity("Fence");
        if (!fence || !fence.maxHealth) return;

        const healthRatio = constrain(fence.health / fence.maxHealth, 0, 1);
        const healthPercent = Math.round(healthRatio * 100);

        const barW = 320;
        const barH = 26;
        const barX = width / 2 - barW / 2;
        const barY = height - barH - 18;

        push();
        // Frame
        fill(20, 20, 20, 205);
        stroke(240, 230, 190, 230);
        strokeWeight(1.3);
        rect(barX, barY, barW, barH, 8);

        // Track
        const pad = 4;
        const trackX = barX + pad;
        const trackY = barY + pad;
        const trackW = barW - pad * 2;
        const trackH = barH - pad * 2;
        noStroke();
        fill(80, 35, 35, 180);
        rect(trackX, trackY, trackW, trackH, 6);

        // Fill
        fill(76, 178, 84, 230);
        rect(trackX, trackY, trackW * healthRatio, trackH, 6);

        // Defense icon (shield)
        const iconCx = barX + 22;
        const iconCy = barY + barH / 2 - 1;
        noStroke();
        fill(232, 222, 185);
        beginShape();
        vertex(iconCx - 7, iconCy - 6);
        vertex(iconCx + 7, iconCy - 6);
        vertex(iconCx + 6, iconCy + 2);
        vertex(iconCx, iconCy + 8);
        vertex(iconCx - 6, iconCy + 2);
        endShape(CLOSE);
        fill(120, 98, 55);
        rect(iconCx - 1, iconCy - 4, 2, 9, 1);

        // Label
        fill(255, 245, 220);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(14);
        text(`${healthPercent}%`, barX + barW / 2 + 6, barY + barH / 2 + 0.5);
        pop();
    }

    update(events){
        if (!this.game.model.scene.zombieManager.waveStarted){
            if (this.game.model.scene.zombieManager.loaded){
                this.getUIElement("Start Button").label = "Start Wave";
            } else {
                this.getUIElement("Start Button").label = "Loading...";
            }
        }

        //Stop Updating Entities after wave over
        if (events.some(e => e.key === "Enter")) {
            let menu = this.uielements.find(el => el.id === "menu");
            if (menu) {
                menu.isVisible = !menu.isVisible;
                console.log("Set visibility to:", menu.isVisible); // add this
            }
        }


        if (!this.isRoundWon && !this.isGameOver){
            super.update(events);
        } else {
            for (let uielement of this.uielements){
                uielement.update(events);
            }
        } 
        if (this.zombieManager.zombies.length == 0 && !this.isRoundWon){
            if (this.getEntities("Zombie").length == 0){
                this.roundWon();
            }
        }
    }


    async gameOver(){
        this.isGameOver = true;

        let phaseText = this.uiBar.dayLabel.label; 
        let parts = phaseText.split(" ");        
        let phaseNumber = parseInt(parts[1]);     
        let phaseTime = parts[0];
        let survivedText;
    
        if(phaseNumber == "1"){

       survivedText = "You Survived " + "1 " + phaseTime;
        
    }

     else {

     survivedText = "You Survived " + phaseNumber + " " + phaseTime + "s";
    
    }


        //Restart Button
        this.restartBtn = new Button(this.game, "Restart Game", new Vector2(160, 50), new Vector2("Centre", "Centre"));
        this.restartBtn.offset.y = 90;
        this.restartBtn.onClick = () => {
            this.game.model.gameState = new GameState(this.game)
            this.game.model.scene = new ShooterScene(this.game);
        };
        this.addUIElement(this.restartBtn);

        //Game Over Label
        this.gameOverLabel = new Label(this.game, survivedText , new Vector2(350, 120), new Vector2("Centre", "Centre"));
        this.gameOverLabel.style.fillColor = color(0,0,0,0);
        this.gameOverLabel.style.outline = color(0,0,0,0);
        this.gameOverLabel.style.textColor = color(255,0,0);
        this.gameOverLabel.style.textSize = 100;
        this.gameOverLabel.offset.y = -70;

        //Lose Sound
        await this.game.soundManager.playSFX("lose");

        this.addUIElement(this.gameOverLabel);
    }

    async roundWon(){
        this.isRoundWon = true;
        this.getUIElement("shop").isVisible = false;

        //Win sound 
        await this.game.soundManager.playSFX("win");

        console.log("[Shooter] → Kitchen");

        //continue to kitchen(CORE FUNCTIONALITY)
        this.game.model.scene = new KitchenScene(this.game);
    }


}
