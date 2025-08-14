import { AUTO, Game } from 'phaser';
import envObjects from './objects';

const StartGame = (parent) => {
    // var currentWidth = 800;
    var currentWidth = window.innerWidth;
    // var currentHeight = 600;
    var currentHeight = window.innerHeight;
    var config = {
        type: AUTO,
        width: currentWidth,
        height: currentHeight,
        parent: parent,
        backgroundColor: '#565656',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        // scale: {
        //     mode: Phaser.Scale.FIT,
        //     autoCenter: Phaser.Scale.CENTER_BOTH
        // },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };


    function preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('bench', 'assets/bench.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    var player, ground;
    function create() {
        var camera = this.cameras.main;
        for (let index = 0; index < envObjects.length; index++) {
            const elem = envObjects[index];

            var sprite = this.add.sprite(elem.x, elem.y, elem.id);

            sprite.displayHeight = 48; // Sets the display width to 200 pixels
            sprite.scaleX = sprite.scaleY; // Adjusts the height to maintain aspect ratio

            this.add.text(elem.x - sprite.displayWidth / 2, 500 - 76, elem.name ?? elem.id, { fontSize: '20px', fill: '#000' });

            sprite.y = 500 - 24;

            console.log(`Display: ${sprite.displayWidth}\nactual: ${sprite.width}`)
        }
        player = this.physics.add.sprite(0, 500 - 24, 'dude');
        ground = this.add.tileSprite(-100, 500, currentWidth, 64, 'sky');

        this.physics.add.existing(ground);

        ground.setOrigin(0, 0);
        ground.body.immovable = true;
        ground.body.allowGravity = false;
        ground.body.setFriction(0, 0);

        player.setBounce(0.2);

        camera.startFollow(player);
        camera.setFollowOffset(-currentWidth / 2 + 100, 200);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.physics.add.collider(player, ground);
    }
    var cursors;
    function update() {
        cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            ground.body.setVelocityX(-160);
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(160);
            ground.body.setVelocityX(160);
            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);
            ground.body.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-130);
        }
    }
    return new Game({ ...config }, parent);
}

export default StartGame;
