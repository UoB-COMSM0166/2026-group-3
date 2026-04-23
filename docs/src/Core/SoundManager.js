export class SoundManager {
    constructor(game) {
        this.sounds = {};
        this.musicVol = 1; 
        this.sfxVol = 1;  
        this.game = game;
    }

    preload() {
    
        this.sounds["shoot"] = loadSound("./assets/sounds/laserBullet.mp3");
        this.sounds["win"] = loadSound("./assets/sounds/levelWin.mp3");
        this.sounds["lose"] = loadSound("./assets/sounds/gameOver.mp3");
        this.sounds["buy"] = loadSound("./assets/sounds/buyItem.mp3");
        this.sounds["damage"] = loadSound("./assets/sounds/zombieHit.mp3");
        this.sounds["intro"] = loadSound("./assets/sounds/introMusic.mp3");
        this.sounds["kitchenDing"] = loadSound("./assets/sounds/dingkitchen.mp3");
        this.sounds["woodButton"] = loadSound("./assets/sounds/woodButton.mp3");
    }

    // Retrieve sound by name
    getSFX(name) {
        return this.sounds[name];
    }

    // Retrieve music by name
    getMusic(name) {
        return this.sounds[name];
    }

    // Sound Effects
    async playSFX(name) {
        let sfxPromise = this.getSFX(name);
        const sfx = await sfxPromise;
        userStartAudio();
        sfx.amp(this.sfxVol);
        sfx.play();
    }
    
    // Play music, loop, set vol
    async playMusic(name){
        let musicPromise = this.getMusic(name);
        const music = await musicPromise;
        this.gameMusic = music;
        music.loop();
        music.amp(this.musicVol);   
        music.play();
}
    

}



