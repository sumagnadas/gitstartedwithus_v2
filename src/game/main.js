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

    var player, ground, ground, velocity = 160, lastSprite;
    function create() {
        var camera = this.cameras.main;
        var spriteGroup = this.physics.add.group();
        ground = this.physics.add.group();
        player = this.physics.add.sprite(0, groundLevel - 24, 'dude');
        for (let index = 0; index < envObjects.length; index++) {
            const elem = envObjects[index];
            var sprite = this.add.sprite(0, 0, elem.id);

            sprite.displayHeight = 48; // Sets the display width to 200 pixels
            sprite.scaleX = sprite.scaleY; // Adjusts the height to maintain aspect ratio

            var prevElemOffset = lastSprite ? lastSprite.x + lastSprite.displayWidth : 10;

            sprite.y = posPresets[elem.height].y - 48;
            sprite.x = prevElemOffset + 20;

            var text = this.add.text(sprite.x + 4, sprite.y - 24 - 3, elem.name ?? elem.id, { fontSize: '20px', fill: '#000', align: 'center', wordWrap: { width: sprite.displayWidth, useAdvancedWrap: true } });
            text.setWordWrapCallback((txt, elem) => { if (elem.width + 10 < sprite.displayWidth) { elem.y -= 24; return txt.split(" "); } return txt; })

            lastSprite = sprite;
            spriteGroup.add(sprite);

            sprite.setOrigin(0, 0);
            sprite.body.immovable = true;
            sprite.body.allowGravity = false;
        }
        player.setCollideWorldBounds();
        this.physics.world.setBounds(-100, 0, lastSprite.x + lastSprite.displayWidth + 50 + 100);

        var ground_top = this.add.tileSprite(-100, groundLevel, currentWidth, 64, 'ground_top');
        var ground_bottom = this.add.tileSprite(-100, groundLevel + 64, currentWidth, currentWidth / 2 - playerOffsetY, 'ground_bottom');

        ground.add(ground_top);
        ground.add(ground_bottom);

        ground.children.entries.forEach((elem) => {
            elem.setOrigin(0, 0);
            elem.body.immovable = true;
            elem.body.allowGravity = false;
        });

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
        this.physics.add.collider(player, spriteGroup);
        this.physics.add.collider(player, ground);
    }
    var cursors;
    function update() {
        cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            player.setVelocityX(-velocity);
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(velocity);
            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-230);
        }
        ground.children.entries.forEach((elem) => { elem.tilePositionX += player.x - 100 - elem.x; elem.x = player.x - 100; });
    }
    return new Game({ ...config }, parent);
}

export default StartGame;
