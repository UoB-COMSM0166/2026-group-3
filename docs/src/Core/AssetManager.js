
export class AssetManager {
    constructor(game){
        this.isLoaded = false;
        this.promises = []
        this.images = {};
        this.fonts = {};
        this.game = game;
    }

    async preload(){

        //Add all image loads here:

        this.loadImage("ChefShooting","./assets/chefshooting.gif");
        this.loadImage("Chef Cooking","./assets/chefcooking.gif");
        this.loadImage("Chef Walking","./assets/chefwalking.gif");
        this.loadImage("Turret", "./assets/turret.gif");
        this.loadImage("Shooter Background", "./assets/shooterbg.png");
        this.loadImage("Fence 1", "./assets/fence1.png");
        this.loadImage("Fence 2", "./assets/fence2.png");
        this.loadImage("Fence 3", "./assets/fence3png.png");

        //Zombie Sprites
        this.loadImage("BasicZombieWalking","./assets/zombiewalking.gif");
        this.loadImage("TankZombieWalking","./assets/tankwalking.gif");
        this.loadImage("SlobZombieWalking","./assets/slobwalking.gif");
        this.loadImage("SprinterZombieWalking","./assets/sprinter.gif");
        this.loadImage("BasicZombieDamage","./assets/damage1.png");

        //Drop Sprites
        this.loadImage("Prime Bone","./assets/drops/primeBone.png");
        this.loadImage("Zombie Belly","./assets/drops/zombieBelly.png");
        this.loadImage("Zombie Drumstick","./assets/drops/zombieDrumstick.png");
        this.loadImage("Zombie Juice","./assets/drops/zombieJuice.png");
        this.loadImage("Zombie Mince","./assets/drops/zombieMince.png");

        //Kitchen Scene Assets
        this.loadImage("Kitchen Background","./assets/kitchen/background.png")
        this.loadImage("BBQ","./assets/kitchen/bbq.png")
        this.loadImage("Burger","./assets/kitchen/burgerstation.png")
        this.loadImage("Fried","./assets/kitchen/fried.png")
        this.loadImage("Keg","./assets/kitchen/keg.png")
        this.loadImage("Ramen","./assets/kitchen/ramenpot.png")
        this.loadImage("Counter","./assets/kitchen/counter.png")

        //UI Assets
        this.loadImage("Menu Button","./assets/UI/menu.png")
        this.loadImage("Cross Button","./assets/UI/cross.png")


        //Fonts
        this.loadFont("PixelBit","./assets/fonts/PixelBit-Free.ttf");
        this.loadFont("PixelMix","./assets/fonts/pixelmix.ttf");



        // for testing loading:

        // for (let i=0; i<1000; i++){
        //     this.loadImage("testSprites","./assets/test_image.png");
        // }

        await Promise.all(this.promises);
        this.isLoaded = true;

        this.game.finishedLoading();
    }

    //Can be called to load an image individually
    //Be aware of async stuff
    async loadImage(name,path){
        this.promises.push(loadImage(path).then(value => this.images[name] = value));
    }

    async loadFont(name,path){
        this.promises.push(loadFont(path).then(value => this.fonts[name] = value));
    }

    getImage(name){
        return this.images[name];
    }

    getFont(name){
        return this.fonts[name];
    }
}