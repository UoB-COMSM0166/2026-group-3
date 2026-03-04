import {Entity} from "../Core/Entity.js";
import {Vector2} from "../Utility/Vector2.js";
import { TankZombie } from "./Zombies/TankZombie.js";
import { BasicZombie } from "./Zombies/BasicZombie.js";
import { SprinterZombie } from "./Zombies/SprinterZombie.js";
import { SlobZombie } from "./Zombies/SlobZombie.js";


export class ZombieManager extends Entity{
    constructor(game, scene){
        super();
        this.scene = scene;
        this.game = game;
        this.spawnTimer = 0;
        this.spawnInterval = 120;
        this.zombiesSpawned = 0;

        this.totalStrength = this.calculateWaveStrength(this.game.model.phase, this.game.model.difficulty);
        this.waveStrength = this.totalStrength;

    }

    calculateWaveStrength(phase, difficulty){
        let waveStrengths = [12, 20, 32, 48, 68, 92];


        if (difficulty == "easy") return waveStrengths[phase-1]*0.75;
        if (difficulty == "hard") return waveStrengths[phase-1]*1.5;

        return waveStrengths[phase-1];
    }


    update(events){
        if (this.scene.isGameOver) return; // Stop logic if dead
        
        const boundary = this.game.gridSize.x / 6;

        let lines = [1, 2.5, 4, 5.5, 7];

        
        //Spawning Logic
        if (this.waveStrength > 0) {
            this.spawnTimer--;
            if (this.spawnTimer <= 0) {
                this.spawnTimer = this.spawnInterval;
                let lineIndex = Math.floor(random(0, 5));
                let yPos = lines[lineIndex % lines.length];
                let startPos = new Vector2(this.game.gridSize.x, yPos);
                let zombie;
                if (this.waveStrength > 20 && random(0,4)<=1){
                    zombie = new TankZombie(this.game, startPos);
                    this.waveStrength -= 10;
                } else if (this.waveStrength > 12 && random(0,3)<=1){
                    zombie = new SlobZombie(this.game, startPos);
                    this.waveStrength -= 5;
                } else if (this.waveStrength > 12 && random(0,2)<=1){
                    zombie = new SprinterZombie(this.game, startPos);
                    this.waveStrength -= 5;
                } else {
                    zombie = new BasicZombie(this.game, startPos);
                    this.waveStrength -= 1;
                }
                this.scene.entities.push(zombie);
                this.zombiesSpawned++;
            }
        }
    }
}