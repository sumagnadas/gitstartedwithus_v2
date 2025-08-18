import { AUTO, Game } from 'phaser';
import envObjects from './objects';

const StartGame = (parent) => {
    var currentWidth = window.innerWidth;
    var currentHeight = window.innerHeight;

    var groundLevel = currentHeight / 2, playerOffsetY = currentHeight / 5, playerOffsetX;
    var posPresets = { 'top': { y: 0 }, 'middle': { y: (currentHeight - groundLevel) / 2 }, 'bottom': { y: groundLevel } }

    var config = {
        type: AUTO,
        width: currentWidth,
        height: currentHeight,
        parent: parent,
        backgroundColor: '#00a8ff',
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
        input: {
            activePointers: 2,
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
        this.load.image('clouds', 'assets/clouds.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    var player, ground, ground, velocity = 160, lastSprite, clouds, isRight = false, isLeft = false;
    function create() {
        playerOffsetX = (this.sys.game.device.input.touch) ? currentWidth / 4 : currentWidth / 10;
        var camera = this.cameras.main;
        var spriteGroup = this.physics.add.group();
        clouds = this.add.tileSprite(-playerOffsetX, -300, currentWidth, currentHeight, 'clouds');
        clouds.scaleX = clouds.scaleY;
        ground = this.physics.add.group();
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
        player = this.physics.add.sprite(0, groundLevel - 24, 'dude');
        this.physics.add.existing(clouds);
        clouds.body.immovable = true;
        clouds.body.allowGravity = false;
        player.setCollideWorldBounds();
        this.physics.world.setBounds(-playerOffsetX, 0, lastSprite.x + lastSprite.displayWidth + 50 + playerOffsetX);

        var ground_top = this.add.tileSprite(-playerOffsetX, groundLevel, currentWidth, 64, 'ground_top');
        var ground_bottom = this.add.tileSprite(-playerOffsetX, groundLevel + 64, currentWidth, currentHeight / 2 - playerOffsetY, 'ground_bottom');
        clouds.setOrigin(0, 0);
        ground.add(ground_top);
        ground.add(ground_bottom);

        ground.children.entries.forEach((elem) => {
            elem.setOrigin(0, 0);
            elem.body.immovable = true;
            elem.body.allowGravity = false;
        });

        player.setBounce(0.2);

        camera.startFollow(player);
        camera.setFollowOffset(-currentWidth / 2 + playerOffsetX, playerOffsetY);

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
        player.anims.play('turn');
        if (this.sys.game.device.input.touch) {
            var leftButton = this.add.rectangle(0, 0, playerOffsetX, currentHeight, 0xFF0000, 0);
            leftButton.setOrigin(0, 0);
            leftButton.setScrollFactor(0, 0);
            leftButton.setInteractive();
            leftButton.on('pointerdown', () => { isLeft = true; })
            leftButton.on('pointerup', () => { isLeft = false; })
            leftButton.on('pointerout', () => { isLeft = false; })

            var rightButton = this.add.rectangle(currentWidth - playerOffsetX, 0, playerOffsetX, currentHeight, 0xFF0000, 0);
            rightButton.setOrigin(0, 0);
            rightButton.setScrollFactor(0, 0);
            rightButton.setInteractive();
            rightButton.on('pointerdown', () => { isRight = true; })
            rightButton.on('pointerup', () => { isRight = false; })
            rightButton.on('pointerout', () => { isRight = false; })

            var midArea = this.add.rectangle(playerOffsetX, currentHeight / 3, currentWidth - 200, currentHeight / 2, 0xFF0000, 0);
            midArea.setOrigin(0, 0)
            midArea.setScrollFactor(0, 0);
            midArea.setInteractive();
            var jumpX, jumpY;
            midArea.on('pointerdown', (p, x, y) => { jumpX = x; jumpY = y; });
            midArea.on('pointermove', (p, x, y) => {
                if (player.body.touching.down) {
                    if ((y - jumpY) <= -48 * 2) {
                        player.setVelocityY(-230);
                    }
                };
            });
        }
    }
    function update() {
        clouds.tilePositionX += 2;
        if (!this.sys.game.device.input.touch) {
            var cursors = this.input.keyboard.createCursorKeys();
            isLeft = cursors.left.isDown;
            isRight = cursors.right.isDown;
            if (cursors.up.isDown && player.body.touching.down) {
                player.setVelocityY(-230);
            }
        }

        if (isLeft) {
            player.setVelocityX(-velocity);
            player.anims.play('left', true);
        }
        else if (isRight) {
            clouds.tilePositionX += player.x - playerOffsetX - clouds.x;
            player.setVelocityX(velocity);
            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
        clouds.x = player.x - playerOffsetX;
        ground.children.entries.forEach((elem) => { elem.tilePositionX += player.x - playerOffsetX - elem.x; elem.x = player.x - playerOffsetX; });
    }
    return new Game({ ...config }, parent);
}

export default StartGame;
