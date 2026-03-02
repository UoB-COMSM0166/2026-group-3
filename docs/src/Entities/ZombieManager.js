import {Entity} from "../Core/Entity.js";
import {Vector2} from "../Utility/Vector2.js";
import { ZombieEntity } from "./ZombieEntity.js";

export class ZombieManager extends Entity{
    constructor(game, scene){
        super();
        this.scene = scene;
        this.game = game;
        this.spawnTimer = 0;
        this.spawnInterval = 120;
        this.zombiesSpawned = 0;
        this.maxZombies = 10;
    }

    update(events){
        if (this.scene.isGameOver) return; // Stop logic if dead
        
        const boundary = this.game.gridSize.x / 6;

        //Zombie Manager (Wave 1)
        let lines = [1, 3, 5, 7];
        
        //Spawning Logic
        if (this.zombiesSpawned < this.maxZombies) {
            this.spawnTimer--;
            if (this.spawnTimer <= 0) {
                this.spawnTimer = this.spawnInterval;
                let lineIndex = Math.floor(random(0, 4));
                let yPos = lines[lineIndex % lines.length];
                let startPos = new Vector2(this.game.gridSize.x, yPos);
                let zombie = new ZombieEntity(this.game, startPos);
                this.scene.entities.push(zombie);
                this.zombiesSpawned++;
            }
        }
    }
}