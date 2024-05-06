class Shooter extends Phaser.Scene {
    constructor() {
        super("shooter");
        this.my = { sprite: {} };

        this.bodyX = 50;
        this.bodyY = 300;

        this.shotX = this.bodyX + 10;
        this.shotY = 350;

        this.wKey = null;
        this.sKey = null;
        this.spaceKey = null;

        this.canShoot = false;

        this.timer = 0;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlasXML("spritePack", "sheet.png", "sheet.xml");

        //load player, player life icon, and player's shot
        this.load.image("player", "playerShip1_green.png");
        this.load.image("playerShot", "laserGreen04.png");
        this.load.image("playerLife", "playerLife1_green.png");

        //load enemies and enemy's shot
        this.load.image("enemy", "enemyRed1.png");
        this.load.image("enemyShoot", "enemyRed3.png");
        this.load.image("enemyFast", "enemyRed5.png");
        this.load.image("enemyShot", "laserRed03.png");


    }

    create() {
        let my = this.my;
        //const Bodies = Phaser.Physics.Matter.Matter.Bodies;

        my.sprite.body = this.add.sprite(this.bodyX, this.bodyY, "spritePack", "playerShip1_green.png");
        my.sprite.body.rotation = (3.14) / 2;
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.shots = [];
        this.basicEnemy = [];
        this.shootEnemy = [];
        this.fastEnemy = [];

        this.enemyLocations = [750, 125, 750, 250, 750, 375, 750, 500, 650, 166, 650, 300, 650, 433, 550, 225, 550, 375];

        for (let i = 0; i < 9; i++) {
            let rand = Phaser.Math.Between(1, 5);

            let posY = this.enemyLocations.pop();
            let posX = this.enemyLocations.pop();

            //basic enemies are 3x as likely
            if (rand <= 3) {
                my.sprite.enemy = this.add.sprite(posX, posY, "spritePack", "enemyRed1.png");
                my.sprite.enemy.rotation = (3.14) / 2;
                this.basicEnemy.push(my.sprite.enemy);
            }
            if (rand == 4) {
                my.sprite.enemy = this.add.sprite(posX, posY, "spritePack", "enemyRed3.png");
                my.sprite.enemy.rotation = (3.14) / 2;
                this.shootEnemy.push(my.sprite.enemy);
            }
            if (rand == 5) {
                my.sprite.enemy = this.add.sprite(posX, posY, "spritePack", "enemyRed5.png");
                my.sprite.enemy.rotation = (3.14) / 2;
                this.fastEnemy.push(my.sprite.enemy);
            }
        }
    }

    update() {
        let my = this.my;

        this.timer++;
        if (this.timer >= 90) {
            this.canShoot = true;
            this.timer = 0;
        }

        if (this.wKey.isDown && my.sprite.body.y > 50) {
            my.sprite.body.y -= 5;
            my.sprite.bodyY = my.sprite.body.y;
        }
        if (this.sKey.isDown && my.sprite.body.y < 550) {
            my.sprite.body.y += 5;
            my.sprite.bodyY = my.sprite.body.y;
        }


        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
            this.shotX = this.bodyX;
            this.shotY = my.sprite.bodyY;

            my.sprite.shot = this.add.sprite(this.shotX, this.shotY, "spritePack", "laserGreen04.png");
            my.sprite.shot.rotation = (3.14) / 2;
            this.shots.push(my.sprite.shot);
            this.canShoot = false;
        }

        this.shots.forEach((shot) => {
            //move shot and delete if off screen
            shot.x += 10;
            if(shot.x > 1000) shot.destroy();
            let index = 0;
            
            this.basicEnemy.forEach((enemy) => {
                if(this.collides(shot, enemy)) console.log("HIT");
                //this.basicEnemy.splice(index, 1);
                //enemy.visible = false;
                //index--;

                //index++;
            });
            
        });



    }

    collides(object1, object2){
        if(Math.abs(object1.x - object2.x) > (object1.displayWidth/2 + object2.displayWidth/2)) return false;
        if(Math.abs(object1.y - object2.y) > (object1.displayHeight/2 + object2.displayHeight/2)) return false;
        return true;
    }
}