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
        this.hit = false;
        this.timer = 0;
        this.moveTimer = 0;
        
        this.basicEnemy = [];
        this.shootEnemy = [];
        this.fastEnemy = [];

        this.enemyShootTimer = 0;
        this.regShots = [];
        this.fastShots = [];

        this.numLives = 3;
        this.gameOver = false;

        this.scoreNum = 0;
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
        this.load.image("coins", "things_gold.png");


        //load the audio
        this.load.audio('shot', 'laserSmall_000.ogg');
        this.load.audio('fastShot', 'laserSmall_002.ogg');
        //this.load.audio('temp3', 'laserSmall_003.ogg');
        this.load.audio('explosion', 'explosionCrunch_000.ogg');

    }

    create() {
        let my = this.my;
        this.init_game();
    }

    update() {
        let my = this.my;

        //create a timer for when the player can shoot
        this.timer++;
        if (this.timer >= 120) {
            this.canShoot = true;
            this.timer = 0;
        }

        this.playerMovement();
        this.playerShoot();
        this.playerLives();

        this.enemyMovement();

        this.coinMovement();
        this.scoreUI();

        this.enemyShootAttack();
    }







    //updates the player lives graphic
    playerLives() {
        let my = this.my;
        let count = 0;
        //add code here later for when the player runs out of lives
        if (this.gameOver) {

        }

        this.lives.forEach((life) => {
            if ((count + 1) <= this.numLives) {
                life.visible = true;
            }
            else {
                life.visible = false;
            }
            count++;
        });
    }

    scoreUI() {
        //this.text.setText("Supplies: ");
        this.scoreText.text = "Supplies:" + this.scoreNum;
    }

    //has the code for player movement
    playerMovement() {
        let my = this.my;
        if (this.wKey.isDown && my.sprite.body.y > 50) {
            my.sprite.body.y -= 5;
            my.sprite.bodyY = my.sprite.body.y;
        }
        if (this.sKey.isDown && my.sprite.body.y < 550) {
            my.sprite.body.y += 5;
            my.sprite.bodyY = my.sprite.body.y;
        }
    }

    //has the code for the player shooting, and hitting enemies
    playerShoot() {
        let my = this.my;
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
            this.shotX = this.bodyX;
            this.shotY = my.sprite.bodyY;

            my.sprite.shot = this.add.sprite(this.shotX, this.shotY, "spritePack", "laserGreen04.png");
            my.sprite.shot.rotation = (3.14) / 2;
            this.shots.push(my.sprite.shot);
            this.canShoot = false;
            this.sound.play('shot');
        }

        this.shots.forEach((shot) => {
            //move shot and delete if off screen
            shot.x += 10;
            if (shot.x > 1000) shot.destroy();

            let index = 0;
            this.basicEnemy.forEach((enemy) => {
                if (this.collides(shot, enemy)) {
                    this.basicEnemy.splice(index, 1);
                    my.sprite.coin = this.add.sprite(enemy.x, enemy.y, "spritePack", "things_gold.png");
                    this.coins.push(my.sprite.coin);
                    enemy.x = -2000;
                    enemy.destroy();
                    shot.x = 1000;
                    index--;
                    this.sound.play('explosion');
                }
                index++;
            });
            index = 0;
            this.fastEnemy.forEach((enemy) => {
                if (this.collides(shot, enemy)) {
                    this.fastEnemy.splice(index, 1);
                    my.sprite.coin = this.add.sprite(enemy.x, enemy.y, "spritePack", "things_gold.png");
                    this.coins.push(my.sprite.coin);
                    enemy.x = -2000;
                    enemy.destroy();
                    shot.x = 1000;
                    index--;
                    this.sound.play('explosion');
                }
                index++;
            });
            index = 0;
            this.shootEnemy.forEach((enemy) => {
                if (this.collides(shot, enemy)) {
                    this.shootEnemy.splice(index, 1);
                    my.sprite.coin = this.add.sprite(enemy.x, enemy.y, "spritePack", "things_gold.png");
                    this.coins.push(my.sprite.coin);
                    enemy.x = -2000;
                    enemy.destroy();
                    shot.x = 1000;
                    index--;
                    this.sound.play('explosion');
                }
                index++;
            });

        });
    }

    //makes enemies move up and down
    enemyMovement() {
        let my = this.my;
        let moveDir;
        if (this.moveTimer >= 120) moveDir = -1;
        else moveDir = 1;
        this.moveTimer++;
        if (this.moveTimer >= 240) this.moveTimer = 0;

        this.basicEnemy.forEach((enemy) => {
            enemy.y += (0.75 * moveDir);
        });
        this.shootEnemy.forEach((enemy) => {
            enemy.y += (0.75 * moveDir);
        });
        this.fastEnemy.forEach((enemy) => {
            enemy.y += (0.75 * moveDir);
        });
    }

    //makes enemies attack by moving towards the player
    enemyMoveAttack() {
        let my = this.my;
        //unshift adds to beginning of array. make sure to remove the point after though
        //get a random ship from the fleet of enemies
        let max = this.basicEnemy.length + this.fastEnemy.length + this.shootEnemy.length;
        let rand = Phaser.Math.Between(0, max);

        //basic enemy moves
        if (rand < this.basicEnemy.length) {

        }
        else if (rand < this.fastEnemy.length) {
            //update rand to be in the index for fast enemies
            rand = rand - this.basicEnemy.length;
        }
        else if (rand < this.shootEnemy.length) {
            //update rand to be in the index for shoot enemies
            rand = rand - this.basicEnemy.length - this.fastEnemy.length;
        }
    }

    //makes enemies attack by shooting at the player
    enemyShootAttack() {
        let my = this.my;

        this.enemyShootTimer++;
        //unshift adds to beginning of array. make sure to remove the point after though

        let max = this.basicEnemy.length + this.fastEnemy.length + this.shootEnemy.length;
        console.log(this.basicEnemy.length, this.fastEnemy.length, this.shootEnemy.length)
        if (this.enemyShootTimer >= 60 && max > 0) {

            //get a random ship from the fleet of enemies

            let rand = Phaser.Math.Between(0, max-1);
            let shotposX;
            let shotposY;
            let isfast = false;
            //console.log(max, rand);

            if (rand < this.basicEnemy.length) {
                shotposX = this.basicEnemy[rand].x;
                shotposY = this.basicEnemy[rand].y;
                this.sound.play('shot');
            }
            else if (rand < this.fastEnemy.length + this.basicEnemy.length) {
                //update rand to be in the index for fast enemies
                rand = rand - this.basicEnemy.length;
                shotposX = this.fastEnemy[rand].x;
                shotposY = this.fastEnemy[rand].y;
                this.sound.play('shot');
            }
            else if (rand < this.shootEnemy.length + this.fastEnemy.length + this.basicEnemy.length) {
                //update rand to be in the index for shoot enemies
                rand = rand - this.basicEnemy.length - this.fastEnemy.length;
                shotposX = this.shootEnemy[rand].x;
                shotposY = this.shootEnemy[rand].y;
                isfast = true;
                this.sound.play('fastShot');
            }

            my.sprite.enemyShot = this.add.sprite(shotposX, shotposY, "spritePack", "laserRed03.png");
            my.sprite.enemyShot.rotation = (3.14) / 2;
            if (isfast) {
                this.fastShots.push(my.sprite.enemyShot);
            }
            else {
                this.regShots.push(my.sprite.enemyShot);
            }




            this.enemyShootTimer = 0;
        }

        this.regShots.forEach((shot) => {
            shot.x -= 10;
            let index = 0;
            if (shot.x < -100) shot.destroy();

            if (this.collides(shot, my.sprite.body)) {
                this.regShots.splice(index, 1);
                this.numLives--;
                shot.x = -1000;
                index--;
            }
            index++;
        });
        this.fastShots.forEach((shot) => {
            shot.x -= 20;
            let index = 0;
            if (shot.x < -100) shot.destroy();

            if (this.collides(shot, my.sprite.body)) {
                this.regShots.splice(index, 1);
                this.numLives--;
                shot.x = -1000;
                index--;
            }
            index++;
        });
    }

    coinMovement() {
        let my = this.my;
        //console.log("coinmove");
        let index = 0;
        this.coins.forEach((coin) => {
            //move shot and delete if off screen
            coin.x -= 2;
            if (coin.x <= -100) {
                this.coins.splice(index, 1);
                coin.destroy();
                index--;
            }
            if (this.collides(coin, my.sprite.body)) {
                this.coins.splice(index, 1);
                coin.x = -100;
                coin.destroy();
                this.scoreNum += 5;
                index--;
            }
            index++;

        });

    }

    //returns true if object1 touches object2
    collides(object1, object2) {
        if (Math.abs(object1.x - object2.x) > (object1.displayWidth / 2 + object2.displayWidth / 2)) return false;
        if (Math.abs(object1.y - object2.y) > (object1.displayHeight / 2 + object2.displayHeight / 2)) return false;
        return true;
    }

    //the code to setup the game and initialize all the variables
    init_game() {
        let my = this.my;
        my.sprite.body = this.add.sprite(this.bodyX, this.bodyY, "spritePack", "playerShip1_green.png");
        my.sprite.body.rotation = (3.14) / 2;

        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.shots = [];
        this.enemyShots = [];



        this.paths = [];
        this.points1 = [
            633, 324,
            515, 393,
            383, 369,
            360, 304,
            388, 225,
            464, 199,
            525, 227,
            539, 277,
            530, 322,
            476, 362,
            410, 392,
            317, 399,
            206, 391,
            84, 386
        ];
        this.curve1 = new Phaser.Curves.Spline(this.points1);
        this.paths.push(this.curve1);
        //create lives
        this.lives = [];
        let liveX = 30;
        let liveY = 580;
        for (let i = 0; i < 3; i++) {
            my.sprite.life = this.add.sprite(liveX, liveY, "spritePack", "playerLife1_green.png");
            this.lives.push(my.sprite.life);
            liveX += 50;
        }


        //create enemies
        this.enemyLocations = [
            750, 65,
            750, 190,
            750, 315,
            750, 440,
            650, 106,
            650, 240,
            650, 373,
            550, 165,
            550, 315
        ];
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

        this.coins = [];

        this.scoreText = this.add.text(16, 16, "Score: ");
    }
}