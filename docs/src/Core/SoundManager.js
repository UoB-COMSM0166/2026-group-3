export class SoundManager {
    constructor(game) {
        this.sounds = {};
        this.game = game;
    }

    preload() {
    
        this.sounds["shoot"] = loadSound("./assets/sounds/laserBullet.mp3");
        this.sounds["win"] = loadSound("./assets/sounds/levelWin.mp3");
        this.sounds["lose"] = loadSound("./assets/sounds/gameOver.mp3");
        this.sounds["buy"] = loadSound("./assets/sounds/buyItem.mp3");
        this.sounds["damage"] = loadSound("./assets/sounds/zombieHit.mp3");
        this.sounds["intro"] = loadSound("./assets/sounds/introMusic.mp3");
    }

    // retrieve sound by name
    getSFX(name) {
        return this.sounds[name];
    }

    // async sound, resolve promise
    async playSFX(name) {
    let sfxPromise = this.getSFX(name);
    const sfx = await sfxPromise;
    userStartAudio();
    sfx.play();
}



}



