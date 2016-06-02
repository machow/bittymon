// TODO Browserify
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

var player, platforms, cursors, map, backgroundLayer, blockedLayer, bushLayer, transitions, text, textBox

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
    game.load.image('indoor_tileset', 'Tile/indoor_tileset.png');
    game.load.image('text_tileset', 'assets/text_tileset.png');
    game.load.tilemap('text_box', 'Tile/text_box.json', null, Phaser.Tilemap.TILED_JSON);
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

    //  Our two animations, walking left and right.
    player.body.collideWorldBounds = true;
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    player.animations.add('up', [5], 10, true);
    player.animations.add('down', [5], 10, true);

    // Text ---------

    text_box = game.add.tilemap('text_box');
    text_box.addTilesetImage('text_tileset');
    textBox = text_box.createLayer('textBox');
    textBox.position.y = 340; // TODO where to get this value from?
    textBox.fixedToCamera = true;
    textBox.scrollFactorX = 0;
    textBox.scrollFactorY = 0;

    words = "Bulbasaur Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ivysaur Lorem ipsum dolor sit amet, consectetur adipiscing elit. Venusaur Lorem ipsum dolor sit amet, consectetur adipiscing elit. Charmander Lorem ipsum dolor sit amet, consectetur adipiscing elit. Charmeleon Lorem ipsum dolor sit amet, consectetur adipiscing elit. Charizard Lorem ipsum dolor sit amet, consectetur adipiscing elit. Squirtle Lorem ipsum dolor sit amet."
    style = {wordWrapWidth: 550, wordWrap: true}
    dialogue = Dialogue(words, [{words: "<<no>>"}, {words: "<<okay>>"}], 100, style);


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

function Dialogue(words, options, maxChar=30, style={}, nextOnClick=true){
    var self = {
        words,
        maxChar,
        text: null,
        options: null,
        start: 0,
        next,
        prev
    };
    initialize();
    return self;

    function initialize(){
        self.text = game.add.text(25, 368, self.words.slice(self.start, self.maxChar), style);
        self.text.inputEnabled = true;
        self.text.fixedToCamera = true;
        if (nextOnClick) self.text.events.onInputUp.add(function(){ next.bind(self)()}, self);

        // create option text
        var optX = 25,
            optY = self.text.bottom;

        self.options = options.map((v) => {
            let choice = game.add.text(optX, optY, v.words);
            choice.inputEnabled = true;
            choice.fixedToCamera = true;
            choice.events.onInputUp.add(() => console.log(`selected ${v.words}`), self);
            optX += choice.width + 25;
            console.log(choice.text.width)
            console.log(optX);
            return choice;
        })
    };

    function next(){
        var nChar = this.words.length;
        this.start = Math.min(nChar, this.start + this.maxChar);
        console.log(`start is now ${this.start}, nChar is ${nChar}, maxChar is ${this.maxChar}`);
        this.text.text = this.words.slice(this.start, this.start + this.maxChar);
    }

    function prev(){
        this.start = Math.max(0, this.start - this.maxChar);
        this.text.text = this.words.slice(this.start, this.maxChar);
    }

    function setInputEvents(textObj, events){
        textObj.inputEnabled = true;
        textObj.input.enableDrag();
        for (let k of Object.keys(events))
            textObj.events[k].add(events[k], this)
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
