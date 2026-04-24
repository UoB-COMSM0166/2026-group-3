

export class WeaponManager {
    constructor(game){
        this.game = game;
        this.weapons = [];

        let pistol = {
            name : "Pistol",
            fireRate : 1,
            damage : 1,
            speed : 1,
            price : 0,
            shots : 1,
            accuracy : 80
        }

        let rifle = {
            name : "Rifle",
            fireRate : 0.5,
            damage : 4,
            speed : 2.5,
            price : 80,
            shots : 1,
            accuracy : 100
        }

        let shotgun = {
            name : "Shotgun",
            fireRate : 0.4,
            damage : 2,
            speed : 2,
            price : 250,
            shots : 5,
            accuracy : 60
        }

        let machineGun = {
            name : "Machine Gun",
            fireRate : 3,
            damage : 2,
            speed : 1.5,
            price : 500,
            shots : 1,
            accuracy : 50
        }

        let bigGun = {
            name : "The Big Gun",
            fireRate : 2,
            damage : 5,
            speed : 2,
            price : 1000,
            shots : 3,
            accuracy : 80
        }

        this.weapons.push(pistol);
        this.weapons.push(rifle);
        this.weapons.push(shotgun);
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