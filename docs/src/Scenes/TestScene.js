import { Scene } from "../Core/Scene.js";
import { TestEntity } from "../Entities/TestEntity.js";
import { ZombieEntity } from "../Entities/ZombieEntity.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Menu } from "../UIElements/Menu.js";
import { Vector2 } from "../Utility/Vector2.js";

export class TestScene extends Scene {
    constructor(game) {
        super(game);
        this.isGameOver = false;

        //Player block 
        let testEntity = new TestEntity(game);
        this.entities.push(testEntity);

        //Restart Button (i hid it initially)
        let restartBtn = new Button(game, "Restart Game", new Vector2(160, 50), new Vector2("Centre", "Centre"));
        restartBtn.offset.y = 90;
        restartBtn.isVisible = false; 
        restartBtn.onClick = () => {
            if (typeof loop === 'function') loop(); 
            game.model.scene = new TestScene(game);
        };
        this.uielements.push(restartBtn);

        //Zombie Manager (Wave 1)
        let lines = [1, 4, 7];
        let lineIndex = 0;
        let zombieManager = {
            spawnTimer: 0,
            spawnInterval: 120, 
            zombiesSpawned: 0,
            maxZombies: 6,
            update: (events) => {
                if (this.isGameOver) return; // Stop logic if dead

                const boundary = game.gridSize.x / 6;

                //Spawning Logic
                if (zombieManager.zombiesSpawned < zombieManager.maxZombies) {
                    zombieManager.spawnTimer--;
                    if (zombieManager.spawnTimer <= 0) {
                        zombieManager.spawnTimer = zombieManager.spawnInterval;
                        let yPos = lines[lineIndex % lines.length];
                        lineIndex++;
                        let startPos = new Vector2(game.gridSize.x, yPos);
                        let zombie = new ZombieEntity(game, startPos);
                        this.entities.push(zombie);
                        zombieManager.zombiesSpawned++;
                    }
                }

                //Boundary and Player Constraint Logic
                for (let entity of this.entities) {
                    if (entity.isZombie && entity.isVisible) {
                        if (entity.pos.x <= boundary) {
                            this.isGameOver = true;
                            restartBtn.isVisible = true; 
                            //Stop all movement
                            for (let e of this.entities) if (e.speed) e.speed = 0;
                        }
                    }
                    if (entity instanceof TestEntity) {
                        entity.pos.x = Math.max(0, Math.min(entity.pos.x, boundary - entity.size.x));
                    }
                }
            },
            draw: () => {
                const boundary = game.gridSize.x / 6;
                let screenBoundary = boundary * game.view.scale;
                
                //Red Boundary Line(bro would not appear idky)
                stroke(255, 0, 0);
                strokeWeight(2);
                line(screenBoundary, 0, screenBoundary, height);
                
                // UI Text
                fill(255);
                noStroke();
                textSize(16);
                textAlign(LEFT);
                text(`Wave 1: ${zombieManager.zombiesSpawned}/6`, 10, 20);

                if (this.isGameOver) {
                //Draw a dark overlay to make it dramatic lmao :3
                fill(0, 0, 0, 150); //Semi-transparent black
                rect(0, 0, width, height);

                //the "GAME OVER" text 
                fill(255, 0, 0);
                textSize(60);
                textAlign(CENTER, CENTER);
                text("GAME OVER", width / 2, height / 2 - 80); 
                }
            }
        };
        this.entities.push(zombieManager);

        //Randomize Button
        let randomizeBtn = new Button(game, "Randomize Block!", new Vector2(110, 30), new Vector2("Right", "Top"));
        randomizeBtn.offset.x = -110;
        randomizeBtn.onClick = function() {
            const b = this.game.gridSize.x / 6;
            for (let entity of this.game.model.scene.entities) {
                if (entity instanceof TestEntity) {
                    entity.pos.x = Math.random() * (b - entity.size.x);
                    entity.pos.y = Math.random() * (this.game.gridSize.y - entity.size.y);
                }
            }
        };
        this.uielements.push(randomizeBtn);

        //Labels & Menus
        let label = new Label(game, "Defense Line", new Vector2(110, 30), new Vector2("Right", "Top"));
        this.uielements.push(label);

        let menu = new Menu(game, new Vector2(350, 150), new Vector2("Centre", "Centre"));
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
        
        // Menu Internal Elements
        let menuLabel = new Label(game, "Super Menu", new Vector2(100, 70), new Vector2("Left", "Top"));
        menuLabel.parent = menu;
        menu.elements.push(menuLabel);

        let menuClose = new Button(game, "Close", new Vector2(110, 30), new Vector2("Right", "Top"));
        menuClose.parent = menu;
        menuClose.onClick = function() { this.parent.isVisible = false; }
        menu.elements.push(menuClose);
    }
}