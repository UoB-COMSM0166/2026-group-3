
export class AssetManager {
    constructor(game){
        this.isLoaded = false;
        this.loadError = null;
        this.promises = []
        this.images = {};
        this.fonts = {};
        this.game = game;
    }

    async preload(){

        //Add all image loads here:

        //Welcome Scene
        this.loadImage("Welcome Scene Background", "./assets/MainMenuBackground.png");
        
        //Shooter Scene
        this.loadImage("ChefShooting","./assets/chefshooting.gif");
        this.loadImage("Chef Cooking","./assets/chefcooking.gif");
        this.loadImage("Chef Walking","./assets/chefwalking.gif");
        this.loadImage("Chef Hold","./assets/chefhold.gif");
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
        this.loadImage("Dish ZOMBURGER", "./assets/dishes/zomburger.png");
        this.loadImage("Dish DFD", "./assets/dishes/firedDrumstick.png");
        this.loadImage("Dish ZOMMEN", "./assets/dishes/ramen.png");
        this.loadImage("Dish ZOMBBQ", "./assets/dishes/bbq.png");
        this.loadImage("Dish ZOMBEER", "./assets/dishes/beer.png");

        //Kitchen Scene Assets
        this.loadImage("Kitchen Background","./assets/kitchen/background.png")
        this.loadImage("BBQ","./assets/kitchen/bbq.png")
        this.loadImage("Burger","./assets/kitchen/burgerstation.png")
        this.loadImage("Fried","./assets/kitchen/fried.png")
        this.loadImage("Keg","./assets/kitchen/keg.png")
        this.loadImage("Ramen","./assets/kitchen/ramenpot.png")
        this.loadImage("Counter","./assets/kitchen/counter.png")
        this.loadImage("Customer Walking","./assets/cuswalking.gif")
        this.loadImage("Customer Standing","./assets/cusstand.png")

        //Customer Sprites
        this.loadImage("Customer Walking","./assets/cuswalking.gif")
        this.loadImage("Customer Idle","./assets/csit.png")



        //UI Assets
        this.loadImage("Menu Button","./assets/UI/menu.png")
        this.loadImage("Cross Button","./assets/UI/cross.png")
        this.loadImage("UI Button Corner", "./assets/UI/button/corner.png")
        this.loadImage("UI Button Middle", "./assets/UI/button/middle.png")
        this.loadImage("UI Dent Corners", "./assets/UI/dent/corners.png")
        this.loadImage("UI Dent Middle", "./assets/UI/dent/middle.png")
        this.loadImage("UI Coin", "./assets/UI/coin.png")
        this.loadImage("UI Bubble", "./assets/UI/bubble.png")
        this.loadImage("UI Minus", "./assets/UI/minus.png")
        this.loadImage("UI Plus", "./assets/UI/plus.png")
        this.loadImage("UI Tick", "./assets/UI/tick.png")
        this.loadImage("UI Board Corner", "./assets/UI/board/corner.png")
        this.loadImage("UI Board Vertical Edge", "./assets/UI/board/verticaledge.png")
        this.loadImage("UI Board Horizontal Edge", "./assets/UI/board/horizontaledge.png")
        this.loadImage("UI Board Middle", "./assets/UI/board/middle.png")
        this.loadImage("UI Paper Corner", "./assets/UI/paper/corner.png")
        this.loadImage("UI Paper Vertical Edge", "./assets/UI/paper/verticaledge.png")
        this.loadImage("UI Paper Horizontal Edge", "./assets/UI/paper/horizontaledge.png")
        this.loadImage("UI Paper Middle", "./assets/UI/paper/middle.png")


        //Fonts
        this.loadFont("PixelBit","./assets/fonts/PixelBit-Free.ttf");
        this.loadFont("PixelMix","./assets/fonts/pixelmix.ttf");



        // for testing loading:

        // for (let i=0; i<1000; i++){
        //     this.loadImage("testSprites","./assets/test_image.png");
        // }

        try {
            await Promise.all(this.promises);
        } catch (e) {
            console.error("[AssetManager] Preload failed — one or more files could not be loaded.", e);
            this.loadError =
                "Could not load game files. Use a local server with the docs folder as the site root, " +
                "run git pull so all assets exist, then check the browser console and Network tab for 404 errors.";
            return;
        }
        this.isLoaded = true;

        this.game.finishedLoading();
    }

    //Can be called to load an image individually
    //Be aware of async stuff
    async loadImage(name,path){
        this.promises.push(
            loadImage(path)
                .then((value) => {
                    this.images[name] = value;
                })
                .catch((err) => {
                    console.error(`[AssetManager] loadImage failed: ${path} (key: ${name})`, err);
                    throw new Error(`loadImage: ${path}`);
                })
        );
    }

    async loadFont(name,path){
        this.promises.push(
            loadFont(path)
                .then((value) => {
                    this.fonts[name] = value;
                })
                .catch((err) => {
                    console.error(`[AssetManager] loadFont failed: ${path} (key: ${name})`, err);
                    throw new Error(`loadFont: ${path}`);
                })
        );
    }

    getImage(name){
        return this.images[name];
    }

    getFont(name){
        return this.fonts[name];
    }
}