import { AUTO, Game } from 'phaser';

const StartGame = (parent) => {
    var year = 2025, envObjects, object_schema;
    var currentWidth = window.innerWidth;
    var currentHeight = window.innerHeight;
    var playerHeight = 40;

    var groundLevel = currentHeight / 2, playerOffsetY = currentHeight / 5, playerOffsetX;
    var posPresets = { 'top': { y: 0 }, 'middle': { y: (currentHeight - groundLevel) / 2 }, 'bottom': { y: groundLevel } }
    var htPresets = { 'large': playerHeight * 10, 'medium': playerHeight * 2, 'regular': playerHeight };

    var config = {
        type: AUTO,
        width: currentWidth,
        height: currentHeight,
        parent: parent,
        backgroundColor: '#00a8ff',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 700 },
                debug: false
            }
        },
        audio: {
            noAudio: true,
        },
        input: {
            activePointers: 2,
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    function preload() {
        const modules = import.meta.glob("./objects/**/*.js");
        var object_schema_promis = modules["./objects/" + year + "/object_schema.js"]();
        object_schema_promis.then((data) => { object_schema = data.default; Object.keys(object_schema).map((id) => { this.load.image(id, `${year}/${object_schema[id].filename ?? `${id}.png`}`) }) })
        var env_objects_promise = modules[`./objects/${year}/objects.js`]();
        env_objects_promise.then((data) => { envObjects = data.default; });

        this.load.setPath(`assets`);
        this.load.image('sky', 'sky.png');
        this.load.image('ground_top', 'ground_top.png');
        this.load.image('ground_bottom', 'ground_bottom.png');
        this.load.image('clouds', 'clouds.png');

        this.load.spritesheet('pikachu_jump',
            'pikachu_jump.png',
            { frameWidth: 38, frameHeight: 56 }
        );
        this.load.spritesheet('pikachu_walk',
            'pikachu_walk.png',
            { frameWidth: 44, frameHeight: playerHeight }
        );
        this.load.spritesheet('pikachu_run',
            'pikachu_run.png',
            { frameWidth: 77, frameHeight: playerHeight }
        );
    }

    var player, ground, ground, velocity = 160, lastSprite, clouds, isRight = false, isLeft = false;
    function create() {
        playerOffsetX = (this.sys.game.device.input.touch) ? currentWidth / 4 : currentWidth / 10;
        var camera = this.cameras.main;
        var spriteGroup = this.physics.add.group();
        clouds = this.add.tileSprite(-playerOffsetX, -currentHeight / 3, currentWidth, currentHeight, 'clouds');
        clouds.scaleX = clouds.scaleY;
        ground = this.physics.add.group();
        envObjects.sort((a, b) => (a.name > b.name)).map((elem) => {
            var sprite = this.add.sprite(0, 0, elem.id);
            var height = object_schema[elem.id].height ?? 'regular';

            sprite.displayHeight = htPresets[height]; // Sets the display width to 200 pixels
            sprite.scaleX = sprite.scaleY; // Adjusts the height to maintain aspect ratio

            var prevElemOffset = lastSprite ? lastSprite.x + lastSprite.displayWidth : 10;

            sprite.y = posPresets[object_schema[elem.id].y_pos ?? 'bottom'].y - sprite.displayHeight;
            sprite.x = prevElemOffset + 30;

            var text = this.add.text(sprite.x + 4, sprite.y - (height != "large" ? 3 * sprite.displayHeight / 4 : sprite.displayHeight / 10), elem.name ?? elem.id, { fontSize: height == 'small' ? '10px' : '20px', fill: elem.color ?? '#000', align: 'center', wordWrap: { width: sprite.displayWidth, useAdvancedWrap: true } });
            text.wrapped = false;
            text.setWordWrapCallback((txt, elem) => {
                if (elem.width + 20 > sprite.displayWidth) {
                    var words = txt.split(" ");
                    if (!text.wrapped) {
                        elem.y -= sprite.displayHeight / 2 * (words.length - 1);
                        text.wrapped = true;
                    }
                    return words;
                } return txt;
            })
            text.setInteractive();
            if (elem.githubId) {
                text.on('pointerdown', () => { open(`https://www.github.com/${elem.githubId}`) })
                text.on('pointermove', () => {
                    text.setFontStyle('bold');
                    document.body.style.cursor = 'pointer';
                })
                text.on('pointerout', () => { text.setFontStyle('normal'); document.body.style.cursor = 'auto'; })
            }
            lastSprite = sprite;
            sprite.setOrigin(0, 0);
            if (((object_schema[elem.id].z_pos ?? elem.z_pos) ?? "player") == "player" && height != "large") {
                spriteGroup.add(sprite);
                sprite.body.immovable = true;
                sprite.body.allowGravity = false;
            }
        });
        player = this.physics.add.sprite(0, groundLevel - playerHeight / 2, 'pikachu_walk');
        this.physics.add.existing(clouds);
        clouds.body.immovable = true;
        clouds.body.allowGravity = false;
        player.setCollideWorldBounds();
        this.physics.world.setBounds(-playerOffsetX, -400, lastSprite.x + lastSprite.displayWidth + 50 + playerOffsetX, currentHeight + 300);

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
            frames: this.anims.generateFrameNumbers('pikachu_run', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'pikachu_walk', frame: 0 }],
            frameRate: 20
        });
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'pikachu_jump', frame: 0 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('pikachu_run', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.physics.add.collider(player, spriteGroup);
        this.physics.add.collider(player, ground);
        player.anims.play('idle');
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
            var jumpY;
            midArea.on('pointerdown', (p, x, y) => { jumpY = y; });
            midArea.on('pointermove', (p, x, y) => {
                if (player.body.touching.down) {
                    if ((y - jumpY) <= -playerHeight * 2) {
                        player.setVelocityY(-370);
                        player.anims.play('jump', true);
                        player.body.setSize(38);

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
                player.setVelocityY(-370);
                player.anims.play('jump', true);
                player.body.setSize(38);

            }
        }

        if (isLeft) {
            player.flipX = true;
            player.setVelocityX(-velocity);
            player.anims.play('left', true);
            player.body.setSize(77);
        }
        else if (isRight) {
            player.flipX = false;
            clouds.tilePositionX += player.x - playerOffsetX - clouds.x;
            player.setVelocityX(velocity);
            player.anims.play('right', true);
            player.body.setSize(77);
        }
        else {
            player.setVelocityX(0);
            if (player.anims.currentAnim.key != "jump") {
                player.body.setSize(44);
                player.anims.play('idle');
            }
            else {
                if (player.body.velocity.y > 200) {
                    player.body.setSize(44);
                    player.anims.play('idle');
                }
            }
        }
        clouds.x = player.x - playerOffsetX;
        ground.children.entries.forEach((elem) => { elem.tilePositionX += player.x - playerOffsetX - elem.x; elem.x = player.x - playerOffsetX; });
    }
    return new Game({ ...config }, parent);
}

export default StartGame;
