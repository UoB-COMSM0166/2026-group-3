import { Scene } from "../Core/Scene.js";
import { PlayerDayEntity } from "../Entities/PlayerDayEntity.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Menu } from "../UIElements/Menu.js";
import { Vector2 } from "../Utility/Vector2.js";
import { ZombieManager } from "../Entities/ZombieManager.js";
import { WelcomeScene } from "./WelcomeScene.js";
import { KitchenScene_MVP } from "./KitchenScene_MVP.js";
import { WeaponManager } from "../Core/WeaponManager.js";
import { Fence } from "../Entities/Fence.js";
import { TurretManager } from "../Entities/TurretManager.js";
import { GameState } from "../Core/GameState.js";

export class ShooterScene extends Scene {
    constructor(game) {
        super(game);
        this.isGameOver = false;
        this.isRoundWon = false;

        this.rows = [1, 2.5, 4, 5.5, 7];

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


        //Labels & Menus
        let dayLabel = new Label(game, `Day ${this.game.model.gameState.phase}`, new Vector2(50, 60), new Vector2("Right", "Top"));
        this.addUIElement(dayLabel);


        let menuButton = new Button(game, "Menu", new Vector2(110, 50), new Vector2("Left", "Top"));
        menuButton.expandToFit.x = true;
        menuButton.onClick = () => {
            game.model.gameState = new GameState(game)
            let startScene = new WelcomeScene(game);
            game.model.scene = startScene;
        };
        this.addUIElement(menuButton);

        let startButton = new Button(game, "Start Wave", new Vector2(250, 60), new Vector2("Centre", "Top"));
        startButton.style.fillColor = color(220,60,60);
        startButton.style.textColor = color(0,0,0);
        startButton.style.textSize = 30;
        startButton.id = "Start Button";
        startButton.onClick = function() {
            if (!this.game.model.scene.zombieManager.loaded) {return;}
            this.game.model.scene.zombieManager.waveStarted = true;
            this.isVisible = false;
        };
        this.addUIElement(startButton);


        let fenceHealth = new Label(game, "Health: 100%", new Vector2(200, 30), new Vector2("Centre", "Bottom"));
        fenceHealth.id = "FenceLabel";

        this.addUIElement(fenceHealth);

        //Inventory Labels

        let drops = game.model.drops;
        for (let i=0; i < drops.length; i++){
            let dropLabel = new Label(game, "", new Vector2(30, 30), new Vector2("Right", "Top"));
            dropLabel.offset.x = - 50 -i*30;
            dropLabel.image = drops[i];
            this.addUIElement(dropLabel);

            let dropCount = new Label(game, "0", new Vector2(30, 30), new Vector2("Right", "Top"));
            dropCount.offset.x = - 50 -i*30;
            dropCount.offset.y = 30;
            dropCount.drop = drops[i];

            dropCount.update = function(events) {
                this.label = this.game.model.gameState.inventory.get(this.drop);
            }

            this.addUIElement(dropCount);
        }   
        
        // Shop Menu
        let shopButton = new Button(game, "Shop", new Vector2(110, 50), new Vector2("Left", "Top"));
        shopButton.anchor.x = menuButton;
        shopButton.expandToFit.x = true;
        shopButton.onClick = function() {
            let shop = this.game.model.scene.getUIElement("shop");
            shop.isVisible = !shop.isVisible;

        };
        this.addUIElement(shopButton);

        let shop = new Menu(game, new Vector2(370,210), new Vector2("Centre","Centre"));
        shop.style.fillColor = color(100);
        shop.isVisible = false;
        shop.id = "shop";
        shop.offset.y = -200;
        this.addUIElement(shop);


        //Shop Setup
        let shopWeapons = ["Rifle", "Machine Gun", "The Big Gun"];
        
        for (let i=0; i<shopWeapons.length; i++){
            let weapon = this.weaponManager.getWeapon(shopWeapons[i])
            
            let weaponLabel = new Label(game, weapon.name, new Vector2(200, 30), new Vector2("Left", "Top"));
            weaponLabel.offset.x = 20;
            weaponLabel.offset.y = 30+40*i;
            weaponLabel.parent = shop;
            shop.elements.push(weaponLabel);

            let weaponPrice = new Label(game, weapon.price, new Vector2(70, 30), new Vector2("Left", "Top"));
            weaponPrice.offset.x = 220;
            weaponPrice.offset.y = 30+40*i;
            weaponPrice.parent = shop;
            shop.elements.push(weaponPrice);
            
            let weaponBuyButton = new Button(game, "BUY", new Vector2(50, 30), new Vector2("Left", "Top"));
            weaponBuyButton.offset.x = 290;
            weaponBuyButton.offset.y = 30+40*i;
            weaponBuyButton.parent = shop;
            weaponBuyButton.weapon = weapon;

            weaponBuyButton.onClick = async function() {

                if (this.game.model.gameState.coins >= weapon.price){
                    this.game.model.gameState.coins -= weapon.price
                    this.game.model.scene.getEntity("player").weapon = this.weapon;
                    this.game.model.gameState.playerWeapon = this.weapon.name;
                    this.game.model.scene.getUIElement("shop").isVisible = false;
                    await this.game.soundManager.playSFX("buy");
                } else {
                    console.log("You can't afford "+this.weapon.name);
                }
            };

            shop.elements.push(weaponBuyButton);
        }
        let weaponClose = new Button(game, "X", new Vector2(30, 30), new Vector2("Right", "Top"));
        weaponClose.parent = shop; 
        weaponClose.onClick = function() {
            this.game.model.scene.getUIElement("shop").isVisible = false;
        };

        shop.elements.push(weaponClose);

        //Turret Purchase Button Options
        let turretLabel = new Label(game, "Turret", new Vector2(200, 30), new Vector2("Left", "Top"));
        turretLabel.offset.x = 20;
        turretLabel.offset.y = 150;
        turretLabel.parent = shop;
        shop.elements.push(turretLabel);

        let turretPrice = new Label(game, this.turretManager.turretPrice, new Vector2(70, 30), new Vector2("Left", "Top"));
        turretPrice.offset.x = 220;
        turretPrice.offset.y = 150;
        turretPrice.parent = shop;
        shop.elements.push(turretPrice);

        let turretBuyButton = new Button(game, "BUY", new Vector2(50, 30), new Vector2("Left", "Top"));
        turretBuyButton.offset.x = 290;
        turretBuyButton.offset.y = 150;
        turretBuyButton.parent = shop;
        turretBuyButton.weapon = weapon;
        turretBuyButton.onClick = async function() {
            if (this.game.model.gameState.coins >= this.game.model.scene.turretManager.turretPrice){
                this.game.model.scene.getUIElement("shop").isVisible = false;
                this.game.model.scene.turretManager.buyingTurret = true;
                await this.game.soundManager.playSFX("buy");
            } else {
                console.log("You can't afford Turret");
            }
        };

        shop.elements.push(turretBuyButton);


        //Money Label
        this.moneyLabel = new Label(game, "Coins 0", new Vector2(130, 50), new Vector2("Left", "Top"));
        this.moneyLabel.anchor.x = shopButton
        this.moneyLabel.expandToFit.x = true;
        this.addUIElement(this.moneyLabel);
        
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
        this.moneyLabel.label = "Coins "+this.game.model.gameState.coins;
        
        if (this.zombieManager.zombies.length == 0 && !this.isRoundWon){
            if (this.getEntities("Zombie").length == 0){
                this.roundWon();
            }
        }
    }


    async gameOver(){
        this.isGameOver = true;
        this.getUIElement("shop").isVisible = false;

        //Restart Button
        this.restartBtn = new Button(this.game, "Restart Game", new Vector2(160, 50), new Vector2("Centre", "Centre"));
        this.restartBtn.offset.y = 90;
        this.restartBtn.onClick = () => {
            this.game.model.gameState = new GameState(this.game)
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

        //Lose Sound
        await this.game.soundManager.playSFX("lose");

        this.addUIElement(this.gameOverLabel);
    }

    async roundWon(){
        this.isRoundWon = true;
        this.getUIElement("shop").isVisible = false;

        //Continue Button
        this.contiueBtn = new Button(this.game, "Continue", new Vector2(160, 50), new Vector2("Centre", "Centre"));
        this.contiueBtn.offset.y = 90;
        this.contiueBtn.onClick = () => {

            //Temporary Fucntion for continue button
            this.game.model.gameState.phase++;
            this.game.model.scene = new KitchenScene_MVP(this.game);

        };

        this.addUIElement(this.contiueBtn);

        //You Won Label
        this.youWonLabel = new Label(this.game, "You Beat The Wave!", new Vector2(450, 150), new Vector2("Centre", "Centre"));
        this.youWonLabel.style.fillColor = color(0,0,0,0);
        this.youWonLabel.style.outline = color(0,0,0,0);
        this.youWonLabel.style.textColor = color(255,0,0);
        this.youWonLabel.style.textSize = 40;
        this.youWonLabel.offset.y = -70;

        //Win sound 
        await this.game.soundManager.playSFX("win");


        this.addUIElement(this.youWonLabel);
    }




}