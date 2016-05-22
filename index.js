var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.tilemap('level1', 'Tile/bittymon.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('grass', 'Tile/grass.png');
    game.load.image('bush', 'Tile/Green_Wig_Bush.gif');
    game.load.image('house', 'Tile/house.png');
    game.load.image('tree', 'Tile/tree.png');
    game.load.image('water', 'Tile/WaterTile.png');
}


var player, platforms, cursors, map, backgroundLayer, blockedLayer
function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    map = game.add.tilemap('level1');
    map.addTilesetImage('Grass', 'grass');
    map.addTilesetImage('Tree', 'tree');
    map.addTilesetImage('House', 'house');
    map.addTilesetImage('Bush', 'bush');
    map.addTilesetImage('Water', 'water');
    backgroundLayer = map.createLayer('Tile Layer 1');
    blockedLayer = map.createLayer('Tile Layer 2');
    //backgroundLayer.resizeWorld();
    //game.add.sprite(0, 0, 'sky');

    // The player and its settings
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'dude');
    //the camera will follow the player in the world
    game.camera.follow(player);

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    //player.body.bounce.y = 0.2;
    //player.body.gravity.y = 300;
    //player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    player.animations.add('up', [5], 10, true);
    player.animations.add('down', [5], 10, true);

    cursors = game.input.keyboard.createCursorKeys();

}

function update() {
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else if (cursors.up.isDown)
    {
        //  Move to the right
        player.body.velocity.y = -150;

        player.animations.play('up');
    }
    else if (cursors.down.isDown)
    {
        //  Move to the right
        player.body.velocity.y = 150;

        player.animations.play('down');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
    
}

