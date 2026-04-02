import {Entity} from "../Core/Entity.js";
import {Vector2} from "../Utility/Vector2.js";
import { TankZombie } from "./Zombies/TankZombie.js";
import { BasicZombie } from "./Zombies/BasicZombie.js";
import { SprinterZombie } from "./Zombies/SprinterZombie.js";
import { SlobZombie } from "./Zombies/SlobZombie.js";


export class ZombieManager extends Entity{
    constructor(game, scene){
        super(game);
        this.scene = scene;
        this.game = game;
        this.spawnTimer = 0;
        this.zombiesSpawned = 0;
        this.waveStarted = false;
        this.loaded = false;

        if (this.game.model.difficulty == "hard"){
            this.difficultyMod = 1.25;
        } else if (this.game.model.difficulty == "easy"){
            this.difficultyMod = 0.75;
        } else {
            this.difficultyMod = 1;
        }

        this.totalStrength = this.calculateWaveStrength(this.game.model.gameState.phase);
        this.waveStrength = this.totalStrength;
        this.spawnInterval = 3000/(this.difficultyMod*(this.waveStrength+20));

        this.zombies = [];
        this.preloadWave(this.waveStrength);

    }

    calculateWaveStrength(phase){
        let waveStrengths = [8, 12, 20, 32, 48, 68, 92];

        if (phase>7){
            return this.difficultyMod*25*(phase-3);
        } else {
            return this.difficultyMod*waveStrengths[phase-1];
        }
    }


    async preloadWave(waveStrength){
        let promises = [];

        let lines = this.scene.rows;

        while (waveStrength > 0){
            
            let lineIndex = Math.floor(random(0, 5));
            let yPos = lines[lineIndex % lines.length];
            let startPos = new Vector2(this.game.gridSize.x, yPos);
            let zombie;
            
            const phase = this.game.model.phase;
            const spawnMult = 1/(this.difficultyMod**2)
            
            if (waveStrength > 10 
                && phase >= 3 
                && random(0, 6 * spawnMult)<=1){

                //Spawn Tank
                zombie = new TankZombie(this.game, startPos);
                waveStrength = Math.max(0, waveStrength - 10);
            } else if (waveStrength > 5 
                && phase >= 2 
                && random(0, 5 * spawnMult)<=1){

                //Spawn Slob
                zombie = new SlobZombie(this.game, startPos);
                waveStrength = Math.max(0, waveStrength - 5);
            } else if (waveStrength > 5 
                && phase >= 2 
                && random(0, 4 * spawnMult)<=1){

                //Spawn Sprinter
                zombie = new SprinterZombie(this.game, startPos);
                waveStrength = Math.max(0, waveStrength - 5);
            } else {
                //Spawn Basic
                zombie = new BasicZombie(this.game, startPos);
                waveStrength = Math.max(0, waveStrength - 1);
            }
            promises.push(zombie.preload());
            this.zombies.push(zombie);
        }

        await Promise.all(promises);
        this.shuffleZombies(this.zombies);

        this.loaded = true;
        console.log("Zombies Loaded");

    }


    shuffleZombies(zombies){
        for (let i=0; i<zombies.length-1; i++){
            let r = Math.floor(random(i,zombies.length));
            let temp = zombies[i];
            zombies[i] = zombies[r];
            zombies[r] = temp;
        }
    }



    update(events){
        if (!this.waveStarted) return;
        
        //Spawning Logic
        if (this.zombies.length > 0) {
            this.spawnTimer--;
            if (this.spawnTimer <= 0) {
                this.spawnTimer = this.spawnInterval;
                let zombie = this.zombies.pop();
                zombie.isVisible = true;
                this.scene.addEntity(zombie);
                this.zombiesSpawned++;
            }
        }
    }
}