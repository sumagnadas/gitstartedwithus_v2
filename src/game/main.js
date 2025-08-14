import { AUTO, Game } from 'phaser';
import envObjects from './objects';

const StartGame = (parent) => {
    var groundLevel = 500, playerOffsetY = 100;
    var posPresets = { 'top': { y: 100 }, 'middle': { y: 250 }, 'bottom': { y: groundLevel } }
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
        audio: {
            noAudio: true,
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
        this.load.image('ground_top', 'assets/ground_top.png');
        this.load.image('ground_bottom', 'assets/ground_bottom.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('bench', 'assets/bench.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    var player, ground_top, ground_bottom, sprites = [];
    function create() {
        var camera = this.cameras.main;
        for (let index = 0; index < envObjects.length; index++) {
            const elem = envObjects[index];

            var sprite = this.add.sprite(0, 0, elem.id);
            sprite.displayHeight = 48; // Sets the display width to 200 pixels
            sprite.scaleX = sprite.scaleY; // Adjusts the height to maintain aspect ratio
            var prevElemOffset = (sprites.length) ? (sprites[sprites.length - 1].x + sprites[sprites.length - 1].displayWidth) : 10;

            sprite.y = posPresets[elem.height].y - 48;
            sprite.x = prevElemOffset + 10;

            this.add.text(sprite.x, sprite.y - 24, elem.name ?? elem.id, { fontSize: '20px', fill: '#000' });

            sprite.setOrigin(0, 0);
            sprites.push(sprite)

            console.log(`Display: ${sprite.displayWidth}\nactual: ${sprite.width}`)
        }
        player = this.physics.add.sprite(0, groundLevel - 24, 'dude');
        ground_top = this.add.tileSprite(-100, groundLevel, currentWidth, 64, 'ground_top');
        ground_bottom = this.add.tileSprite(-100, groundLevel + 64, currentWidth, currentWidth / 2 - playerOffsetY, 'ground_bottom');

        this.physics.add.existing(ground_top);
        this.physics.add.existing(ground_bottom);

        ground_top.setOrigin(0, 0);
        ground_top.body.immovable = true;
        ground_top.body.allowGravity = false;
        ground_top.body.setFriction(0, 0);

        ground_bottom.setOrigin(0, 0);
        ground_bottom.body.immovable = true;
        ground_bottom.body.allowGravity = false;
        ground_bottom.body.setFriction(0, 0);

        player.setBounce(0.2);

        camera.startFollow(player);
        camera.setFollowOffset(-currentWidth / 2 + 100, playerOffsetY);

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
        this.physics.add.collider(player, ground_top);
    }
    var cursors;
    function update() {
        cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            ground_top.body.setVelocityX(-160);
            ground_bottom.body.setVelocityX(-160);
            ground_top.tilePositionX -= 2.7;
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(160);
            ground_top.body.setVelocityX(160);
            ground_top.tilePositionX += 2.7;
            ground_bottom.body.setVelocityX(160);
            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);
            ground_top.body.setVelocityX(0);
            ground_bottom.body.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-130);
        }
    }
    return new Game({ ...config }, parent);
}

export default StartGame;
