

export class WeaponManager {
    constructor(game){
        this.game = game;
        this.weapons = [];

        let pistol = {
            name : "Pistol",
            fireRate : 1,
            damage : 1,
            speed : 1,
            price : 0
        }

        let rifle = {
            name : "Rifle",
            fireRate : 0.6,
            damage : 4,
            speed : 3,
            price : 50
        }

        let machineGun = {
            name : "Machine Gun",
            fireRate : 5,
            damage : 1,
            speed : 1.5,
            price : 150
        }

        let bigGun = {
            name : "The Big Gun",
            fireRate : 5,
            damage : 5,
            speed : 2,
            price : 1000
        }

        this.weapons.push(pistol);
        this.weapons.push(rifle);
        this.weapons.push(machineGun);
        this.weapons.push(bigGun);
    }

    getWeapon(name){
        for (let weapon of this.weapons){
            if (weapon.name==name){
                return weapon;
            }
        }
    }


}