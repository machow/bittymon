var game = new Phaser.Game(600, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    // tileset
    game.load.tilemap('level1', 'Tile/bittymon.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('bittymon_tileset', 'Tile/bittymon_tileset.png');
}


var player, platforms, cursors, map, backgroundLayer, blockedLayer, bushLayer
function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    map = game.add.tilemap('level1');
    map.addTilesetImage('tiles', 'bittymon_tileset');

    backgroundLayer = map.createLayer('BackgroundLayer');
    blockedLayer = map.createLayer('BlockedLayer');
    bushLayer = map.createLayer('BushLayer');

    map.setCollisionByExclusion([0], true, blockedLayer);
    backgroundLayer.resizeWorld();

    // create Bushes
    game.bushes = Bushes(map, bushLayer);

    // The player and its settings
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'dude');
    player.anchor.set(.5);
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
    game.physics.arcade.collide(player, blockedLayer);
    var isBitty = game.bushes.checkForBittymon(player.position.x, player.position.y);
    if (isBitty) console.log('whoa! combat!');

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


function Bushes(map, layer){
    var self = {
        prevTile: null,
        probability: null,
        map: map,
        layer: layer,
        checkForBittymon
    }
    return self

    function checkForBittymon(x, y){
        var tile = this.map.getTileWorldXY(x, y, undefined, undefined, this.layer);
        if (this.prevTile === null && tile !== null) 
            this.prevTile = tile;
        // if tile is prevTile don't check
        else if (tile === null || this.prevTile !== null &&
                                  tile.x == this.prevTile.x && 
                                  tile.y == this.prevTile.y)
            return false;

        if (!this.probability) this.probability = tile.layer.properties.Probability;
        this.prevTile = tile;

        return Math.random() < this.probability;
    }
}
