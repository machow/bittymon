function GameMap(game){
    console.log('game starting');
}

GameMap.prototype = {
    level: null,
    init,
    preload,
    create,
    update
}

var player, platforms, cursors, map, backgroundLayer, blockedLayer, bushLayer, transitions

function init(level) {
    this.level = level;
}

function preload() {
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    // tileset
    for (entry of ['bittymon', 'interior']){
        let mapJson = `Tile/${entry}.json`;
        game.load.tilemap(entry, mapJson, null, Phaser.Tilemap.TILED_JSON);

    }
    game.load.image('transition', 'Tile/transition.png');
    game.load.image('bittymon_tileset', 'Tile/bittymon_tileset.png');
    // TODO need to rename tile file
    game.load.image('indoor_tileset', 'Tile/indoor_tileset.png');
}

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    map = game.add.tilemap(this.level.map);
    // TODO pull tileset name out of JSON?
    map.addTilesetImage('bittymon_tileset');
    map.addTilesetImage('indoor_tileset');

    backgroundLayer = map.createLayer('BackgroundLayer');
    blockedLayer = map.createLayer('BlockedLayer');
    bushLayer = map.createLayer('BushLayer');

    // create transition points
    transitions = game.add.group();
    transitions.enableBody = true;
    // TODO rename Transition to transition or v.v.
    map.createFromObjects('TransitionLayer', 'transition', 'transition', 0, true, false, transitions);

    map.setCollisionByExclusion([0], true, blockedLayer);
    backgroundLayer.resizeWorld();

    // create Bushes
    game.bushes = Bushes(map, bushLayer);

    // The player and its settings
    player = game.add.sprite(this.level.enterX, this.level.enterY, 'dude');
    player.anchor.set(.5);
    player.scale.setTo(.5, .5);
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
    game.physics.arcade.overlap(player, transitions, transitionOverlap);
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

    if (cursors.down.shiftKey){
        let {x,y} = player.position;
        console.log(map.getTileWorldXY(x, y, undefined, undefined, transitionObject));
    }
    
}

function transitionOverlap(sprite, transition){
    console.log('yo, transition time');
    console.log(transition);
    game.state.start("GameMap", true, false, {
        map: 'interior',
        enterX: 300,
        enterY: 300
    })

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

var game = new Phaser.Game(600, 600, Phaser.AUTO, 'game');

defaultLevel = {
        map: 'bittymon',
        enterX: 300,
        enterY: 300
};

game.state.add("GameMap", GameMap);
game.state.start("GameMap", true, false, defaultLevel);
