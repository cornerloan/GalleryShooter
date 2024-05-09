class Menu extends Phaser.Scene {
    constructor() {
        super("menu");
        this.my = { sprite: {} };
        
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlasXML("spritePack", "sheet.png", "sheet.xml");

        this.load.image("mouse", "cursor.png");
        this.load.image("button", "buttonGreen.png");
    }

    create() {
        let my = this.my;
        my.sprite.button = this.add.sprite(game.config.width / 2, game.config.height / 2, "spritePack", "buttonGreen.png");
        this.buttonText = this.add.text((game.config.width / 2), (game.config.height / 2), "Play Game");
        this.buttonText.setOrigin(0.5);
        this.buttonText.setColor("#000000");

        this.titleText = this.add.text(game.config.width/2, game.config.height/4, "SpaceVex", {
            fontSize: '100px'
        });
        this.titleText.setColor("#30d41e");
        this.titleText.setOrigin(0.5);

        my.sprite.mouse = this.add.sprite(0, 0, "spritePack", "cursor.png");
    }

    update() {
        let my = this.my;
        this.mouseControl();
        this.buttonControl();

    }

    buttonControl() {

    }


    mouseControl() {
        let my = this.my;
        var pointer = this.input.activePointer;
        my.sprite.mouse.x = pointer.x;
        my.sprite.mouse.y = pointer.y;

        if (pointer.isDown) {
            my.sprite.mouse.setScale(0.9);
        }
        else {
            my.sprite.mouse.setScale(1);
        }

        if(pointer.isDown){
            if(this.collides(my.sprite.mouse, my.sprite.button)){
                let data = [];
                //live data
                data[0] = 3;
                //score data
                data[1] = 0;
                //speed data
                data[2] = 1.0;
                //round number data
                data[3] = 1;
                this.scene.start("shooter", data);
            }
        }
        

    }

    //returns true if object1 touches object2
    collides(object1, object2) {
        let my = this.my;
        if (Math.abs(object1.x - object2.x) > (object1.displayWidth / 2 + object2.displayWidth / 2)) return false;
        if (Math.abs(object1.y - object2.y) > (object1.displayHeight / 2 + object2.displayHeight / 2)) return false;
        return true;
    }

}