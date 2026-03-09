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
        if (this.game.model.difficulty === "easy")   this.spawnInterval = 150;
        if (this.game.model.difficulty === "medium")  this.spawnInterval = 100;
        if (this.game.model.difficulty === "hard")    this.spawnInterval = 60;

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
                const diff = this.game.model.difficulty;

                if (diff === "easy") {
                   
                    zombie = new BasicZombie(this.game, startPos);
                    this.waveStrength -= 1;

                } else if (diff === "medium") {
                    
                    if (this.waveStrength > 12 && random(0, 3) <= 1) {
                        zombie = new SlobZombie(this.game, startPos);
                        this.waveStrength = Math.max(0, this.waveStrength - 5);
                   } else if (random(0, 3) <= 1) {
                        zombie = new SprinterZombie(this.game, startPos);
                        this.waveStrength = Math.max(0, this.waveStrength - 5);
                    } else {
                        zombie = new BasicZombie(this.game, startPos);
                        this.waveStrength -= 1;
                    }

                } else if (diff === "hard") {
                   
                    if (this.waveStrength > 20 && random(0, 4) <= 1) {
                        zombie = new TankZombie(this.game, startPos);
                        this.waveStrength = Math.max(0, this.waveStrength - 10);
                    } else if (this.waveStrength > 12 && random(0, 3) <= 1) {
                        zombie = new SlobZombie(this.game, startPos);
                        this.waveStrength = Math.max(0, this.waveStrength - 5);
                    } else if (this.waveStrength > 6 && random(0, 2) <= 1) {
                        zombie = new SprinterZombie(this.game, startPos);
                        this.waveStrength = Math.max(0, this.waveStrength - 5);
                    } else {
                        zombie = new SprinterZombie(this.game, startPos);
                        this.waveStrength = Math.max(0, this.waveStrength - 5);
                    }
               }
                this.scene.addEntity(zombie);
                this.zombiesSpawned++;
            }
        }
    }
}