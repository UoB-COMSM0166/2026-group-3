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
        this.zombiesSpawned = 0;

        if (this.game.model.difficulty == "hard"){
            this.difficultyMod = 1.25;
        } else if (this.game.model.difficulty == "easy"){
            this.difficultyMod = 0.75;
        } else {
            this.difficultyMod = 1;
        }

        this.totalStrength = this.calculateWaveStrength(this.game.model.phase);
        this.waveStrength = this.totalStrength;
        this.spawnInterval = 3000/(this.difficultyMod*(this.waveStrength+20));

    }

    calculateWaveStrength(phase){
        let waveStrengths = [8, 12, 20, 32, 48, 68, 92];

        if (phase>7){
            return this.difficultyMod*25*(phase-3);
        } else {
            return this.difficultyMod*waveStrengths[phase-1];
        }
    }


    update(events){
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
                if (this.waveStrength > 30 && random(0,6)<=1){
                    zombie = new TankZombie(this.game, startPos);
                    this.waveStrength -= 10;
                } else if (this.waveStrength > 20 && random(0,5)<=1){
                    zombie = new SlobZombie(this.game, startPos);
                    this.waveStrength -= 5;
                } else if (this.waveStrength > 20 && random(0,4)<=1){
                    zombie = new SprinterZombie(this.game, startPos);
                    this.waveStrength -= 5;
                } else {
                    zombie = new BasicZombie(this.game, startPos);
                    this.waveStrength -= 1;
                }
                this.scene.addEntity(zombie);
                this.zombiesSpawned++;
            }
        }
    }
}