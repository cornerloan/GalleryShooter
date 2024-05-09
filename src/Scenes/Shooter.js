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
        this.enemyMoveTimer = 0;
        this.asteroids = [];

        this.numLives;
        this.playing = true;

        this.speed;
        this.levelNum;

        this.scoreNum;
        this.canUpgrade = true;
        this.upgradeCount = 0;

        this.roundStartTimer = 0;
        this.roundEndTimer = 0;
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

        this.load.image("button", "buttonGreen.png");
        this.load.image("mouse", "cursor.png");

        this.load.image("ast1", "meteorGrey_small1.png");
        this.load.image("ast2", "meteorGrey_small2.png");
        this.load.image("ast5", "meteorBrown_small1.png");
        this.load.image("ast6", "meteorBrown_small2.png");
        this.load.image("ast3", "meteorGrey_tiny1.png");
        this.load.image("ast4", "meteorGrey_tiny2.png");
        this.load.image("ast7", "meteorBrown_tiny1.png");
        this.load.image("ast8", "meteorBrown_tiny2.png");
    }

    create(data) {
        let my = this.my;

        this.numLives = data[0];
        this.scoreNum = data[1];
        this.speed = data[2];
        this.levelNum = data[3];

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

        let enemyCount = this.basicEnemy.length + this.fastEnemy.length + this.shootEnemy.length;

        if (this.roundStart()) {
            if (this.numLives > 0) {
                if (enemyCount == 0) {
                    this.roundOver();
                }
                this.playerMovement();
                this.playerShoot();
                this.playerLives();
                this.enemyMovement();
                this.coinMovement();
                this.scoreUI();
                this.enemyMoveAttack();
                this.enemyShootAttack();
                this.upgrade();
                this.scrollingBackground();
            }
            else {
                this.gameOver();
            }
        }
    }


    scrollingBackground(){
        let my = this.my;
        this.backgroundCount++;
        if(this.backgroundCount >= 5){
            let dot = this.add.text(game.config.width + 10, Phaser.Math.Between(0, game.config.height));
            dot.text = ".";
            

            this.backgroundArt.push(dot);
            this.backgroundCount = 0;
        }

        let index = 0;
        //console.log(this.backgroundArt.length);
        this.backgroundArt.forEach((dot) => {
            dot.x -= 3;
            if(dot.x < -20){
                this.backgroundArt.splice(index, 1);
                index--;
            }
            index++;
        });
    }


    upgrade() {
        let my = this.my;

        if (this.lifeText.visible || this.speedText.visible) {
            this.upgradeCount++;
        }

        if (this.upgradeCount >= 120) {
            this.lifeText.visible = false;
            this.speedText.visible = false;
            this.upgradeCount = 0;
        }


        if (this.canUpgrade && this.scoreNum % 25 == 0 && this.scoreNum != 0) {
            if (this.numLives < 3) {
                this.lifeText.visible = true;
                this.numLives++;
            }
            else {
                this.speedText.visible = true;
                this.speed += 0.1;
            }
            this.canUpgrade = false;
        }
    }

    //updates the player lives graphic
    playerLives() {
        let my = this.my;
        let count = 0;
        //add code here later for when the player runs out of lives
        if (this.numLives == 0) {
            this.gameOver();
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

    roundStart() {
        this.roundText.visible = true;
        this.roundStartTimer++;
        if (this.roundStartTimer >= 300) {
            this.roundText.visible = false;
            return true;
        }
        return false;
    }

    roundOver() {
        let my = this.my;

        this.roundEndTimer++;

        if (this.roundEndTimer >= 420) {
            this.levelNum++;
            let data = [];
            data[0] = this.numLives;
            data[1] = this.scoreNum;
            data[2] = this.speed;
            data[3] = this.levelNum;
            this.scene.start("shooter", data);
        }
    }

    gameOver() {
        let my = this.my;
        this.sound.play('explosion');
        my.sprite.button.visible = true;
        this.buttonText.visible = true;

        this.gameOverText.visible = true;

        my.sprite.cursorSprite.visible = true;
        var pointer = this.input.activePointer;
        my.sprite.cursorSprite.x = pointer.x;
        my.sprite.cursorSprite.y = pointer.y;

        if (pointer.isDown) {
            my.sprite.cursorSprite.setScale(0.9);
        }
        else {
            my.sprite.cursorSprite.setScale(1);
        }

        if (pointer.isDown) {
            if (this.collides(my.sprite.cursorSprite, my.sprite.button)) {
                this.scene.start("menu");
            }
        }
    }

    scoreUI() {
        //this.text.setText("Supplies: ");
        this.scoreText.text = "Supplies:" + this.scoreNum;
    }

    //has the code for player movement
    playerMovement() {
        let my = this.my;
        if (this.wKey.isDown && my.sprite.body.y > 50) {
            my.sprite.body.y -= 5 * this.speed;
            my.sprite.bodyY = my.sprite.body.y;
        }
        if (this.sKey.isDown && my.sprite.body.y < 550) {
            my.sprite.body.y += 5 * this.speed;
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
        this.sinCount += 0.1;
        this.enemyMoveTimer++;
        if (this.enemyMoveTimer >= 180) {
            let rand = Phaser.Math.Between(0, 7);
            if (this.asteroids[rand].x > -100) this.enemyMoveAttack();
            else {
                this.asteroids[rand].x = game.config.width + 50;
                this.enemyMoveTimer = 0;
            }
        }

        this.asteroids.forEach((ast) => {
            if (ast.x > -100) {
                ast.x -= 3;
                ast.y += Math.sin(this.sinCount) * 3;
            }

            if (this.collides(ast, my.sprite.body)) {
                this.numLives--;
                ast.x = -100;
            }
        });
    }

    //makes enemies attack by shooting at the player
    enemyShootAttack() {
        let my = this.my;

        this.enemyShootTimer++;
        //unshift adds to beginning of array. make sure to remove the point after though

        let max = this.basicEnemy.length + this.fastEnemy.length + this.shootEnemy.length;
        if (this.enemyShootTimer >= 60 && max > 0) {

            //get a random ship from the fleet of enemies

            let rand = Phaser.Math.Between(0, max - 1);
            let shotposX;
            let shotposY;
            let isfast = false;

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
                this.canUpgrade = true;
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
        for (let i = 1; i < 4; i++) {
            my.sprite.life = this.add.sprite(liveX, liveY, "spritePack", "playerLife1_green.png");
            if (this.numLives < i) my.sprite.life.visible = false;
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

        this.scoreText = this.add.text(16, 16);
        this.scoreText.text = "Supplies:" + this.scoreNum;

        my.sprite.button = this.add.sprite(game.config.width / 2, game.config.height / 1.3, "spritePack", "buttonGreen.png");
        my.sprite.button.visible = false;
        this.buttonText = this.add.text((game.config.width / 2), (game.config.height / 1.3), "Main Menu");
        this.buttonText.setOrigin(0.5);
        this.buttonText.setColor("#000000");
        this.buttonText.visible = false;

        this.gameOverText = this.add.text(game.config.width / 2, game.config.height / 4, "Game Over", {
            fontSize: '100px'
        });
        this.gameOverText.setColor("#30d41e");
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.visible = false;

        this.lifeText = this.add.text(game.config.width / 2, game.config.height / 4, "+1 Life");
        this.lifeText.setOrigin(0.5);
        this.lifeText.setColor("#ffffff");
        this.lifeText.visible = false;

        this.speedText = this.add.text(game.config.width / 2, game.config.height / 4, "+10% Speed");
        this.speedText.setOrigin(0.5);
        this.speedText.setColor("#ffffff");
        this.speedText.visible = false;

        this.roundText = this.add.text(game.config.width / 2, game.config.height / 4);
        this.roundText.text = "Level:" + this.levelNum;
        this.roundText.setOrigin(0.5);
        this.roundText.setColor("#ffffff");
        this.roundText.visible = false;


        my.sprite.cursorSprite = this.add.sprite(0, 0, "spritePack", "cursor.png");
        my.sprite.cursorSprite.visible = false;

        this.roundStartTimer = 0;
        this.roundEndTimer = 0;

        this.asteroids = [];
        for (let i = 0; i < 8; i++) {
            let name = "meteor";
            if (i < 2 || (i > 3 && i <= 5)) name += "Grey";
            else name += "Brown";

            if (i < 4) name += "_small";
            else name += "_tiny";

            if (i % 2 == 0) name += "1.png";
            else name += "2.png";

            my.sprite.ast = this.add.sprite(-100, 70 * (i + 1), "spritePack", name);
            this.asteroids.push(my.sprite.ast);

        }

        this.sinCount = 0.1;

        this.backgroundCount = 0;
        this.backgroundArt = [];
    }
}