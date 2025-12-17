// Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Globale Variablen
let background;
let player;
let cursors;
let wasd;
let spaceKey;
let obstacles;
let collectibles;
let icicleTimer;
let owlTimer;
let collectibleTimer;
let isPaused = false;

// Spielkonstanten
const BACKGROUND_SCROLL_SPEED = 3;
const PLAYER_SPEED = 300;
const PLAYER_X_POSITION = 100;
const ICICLE_FALL_SPEED = 200;
const OWL_SPEED = 250;
const ICICLE_SPAWN_DELAY = 2000; // ms zwischen Eiszapfen
const OWL_SPAWN_DELAY = 3000; // ms zwischen Eulen
const COLLECTIBLE_SPAWN_DELAY = 2500; // ms zwischen Collectibles

function preload() {
    // Lade den Hintergrund
    this.load.image('background', 'assets/Background.png');
    
    // Lade Santa Sprites
    this.load.image('santa_neutral', 'assets/Santa_neutral.png');
    this.load.image('santa_up', 'assets/Santa_up.png');
    this.load.image('santa_down', 'assets/Santa_down.png');
    
    // Lade Hindernisse
    this.load.image('icicle', 'assets/obstacles/Eiszapfen.png');
    this.load.image('owl', 'assets/obstacles/Owl.png');
    
    // Lade Collectibles
    this.load.image('candy', 'assets/collectibles/Candy.png');
    this.load.image('gift', 'assets/collectibles/Gift.png');
    this.load.image('star', 'assets/collectibles/Star.png');
}

function create() {
    // Hintergrund als TileSprite für endloses Scrolling (Parallax-Effekt)
    background = this.add.tileSprite(
        config.width / 2,
        config.height / 2,
        config.width,
        config.height,
        'background'
    );
    
    // Erstelle den Spieler als Santa Sprite
    player = this.add.sprite(
        PLAYER_X_POSITION,
        config.height / 2,
        'santa_neutral'
    );
    
    // Skaliere Santa kleiner
    player.setScale(0.5);
    
    // Aktiviere Arcade Physics für den Spieler
    this.physics.add.existing(player);
    
    // Spieler darf den Bildschirmrand nicht verlassen
    player.body.setCollideWorldBounds(true);
    
    // Erstelle Tastatur-Input für Pfeiltasten
    cursors = this.input.keyboard.createCursorKeys();
    
    // Erstelle Tastatur-Input für WASD
    wasd = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    
    // Leertaste für Pause
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', togglePause, this);
    
    // Erstelle Gruppen für Hindernisse
    obstacles = this.physics.add.group();
    
    // Erstelle Gruppe für Collectibles
    collectibles = this.physics.add.group();
    
    // Timer für Eiszapfen-Spawning
    icicleTimer = this.time.addEvent({
        delay: ICICLE_SPAWN_DELAY,
        callback: spawnIcicle,
        callbackScope: this,
        loop: true
    });
    
    // Timer für Eulen-Spawning
    owlTimer = this.time.addEvent({
        delay: OWL_SPAWN_DELAY,
        callback: spawnOwl,
        callbackScope: this,
        loop: true
    });
    
    // Timer für Collectible-Spawning
    collectibleTimer = this.time.addEvent({
        delay: COLLECTIBLE_SPAWN_DELAY,
        callback: spawnCollectible,
        callbackScope: this,
        loop: true
    });
    
    // Kollisionserkennung zwischen Spieler und Hindernissen
    this.physics.add.overlap(player, obstacles, hitObstacle, null, this);
    
    // Kollisionserkennung zwischen Spieler und Collectibles
    this.physics.add.overlap(player, collectibles, collectItem, null, this);
}

function spawnIcicle() {
    // Zufällige X-Position am oberen Bildrand
    const x = Phaser.Math.Between(200, config.width - 100);
    const icicle = obstacles.create(x, -50, 'icicle');
    
    // Skaliere Eiszapfen
    icicle.setScale(0.3);
    
    // Setze Geschwindigkeit nach unten
    icicle.setVelocityY(ICICLE_FALL_SPEED);
    
    // Markiere als Eiszapfen-Typ
    icicle.obstacleType = 'icicle';
}

function spawnOwl() {
    // Zufällige Y-Position, von rechts kommend
    const y = Phaser.Math.Between(100, config.height - 100);
    const owl = obstacles.create(config.width + 50, y, 'owl');
    
    // Skaliere Eule
    owl.setScale(0.4);
    
    // Setze Geschwindigkeit nach links
    owl.setVelocityX(-OWL_SPEED);
    
    // Markiere als Eulen-Typ
    owl.obstacleType = 'owl';
}

function spawnCollectible() {
    // Zufällige Y-Position am rechten Bildrand
    const y = Phaser.Math.Between(100, config.height - 100);
    
    // Wähle zufällig ein Collectible-Typ
    const types = ['candy', 'gift', 'star'];
    const type = Phaser.Math.RND.pick(types);
    
    const collectible = collectibles.create(config.width + 50, y, type);
    
    // Skaliere Collectible
    collectible.setScale(0.3);
    
    // Setze Geschwindigkeit nach links (gleich wie Hintergrund-Scroll)
    collectible.setVelocityX(-BACKGROUND_SCROLL_SPEED * 60);
    
    // Markiere Typ
    collectible.collectibleType = type;
}

function hitObstacle(player, obstacle) {
    // Hier kommt später die Game-Over Logik
    console.log('Kollision mit:', obstacle.obstacleType);
    obstacle.destroy();
}

function collectItem(player, collectible) {
    // Hier kommt später die Score-Logik
    console.log('Gesammelt:', collectible.collectibleType);
    collectible.destroy();
}

function togglePause() {
    isPaused = !isPaused;
    
    if (isPaused) {
        // Pausiere Physics
        game.scene.scenes[0].physics.pause();
        
        // Stoppe alle Timer
        icicleTimer.paused = true;
        owlTimer.paused = true;
        collectibleTimer.paused = true;
    } else {
        // Setze Physics fort
        game.scene.scenes[0].physics.resume();
        
        // Starte Timer wieder
        icicleTimer.paused = false;
        owlTimer.paused = false;
        collectibleTimer.paused = false;
    }
}

function update() {
    // Wenn pausiert, nichts tun
    if (isPaused) {
        return;
    }
    
    // Hintergrund kontinuierlich nach links bewegen (Parallax-Effekt für endlosen Flug)
    background.tilePositionX += BACKGROUND_SCROLL_SPEED;
    
    // Setze Velocity auf 0, wenn keine Taste gedrückt wird
    player.body.setVelocity(0, 0);
    
    // Variable für vertikale Bewegung
    let movingUp = false;
    let movingDown = false;
    
    // Vertikale Bewegung (Hoch/Runter) - volle Geschwindigkeit
    if (cursors.up.isDown || wasd.up.isDown) {
        player.body.setVelocityY(-PLAYER_SPEED);
        movingUp = true;
    } else if (cursors.down.isDown || wasd.down.isDown) {
        player.body.setVelocityY(PLAYER_SPEED);
        movingDown = true;
    }
    
    // Horizontale Bewegung (Links/Rechts) - begrenzt, da Hintergrund das Tempo vorgibt
    if (cursors.left.isDown || wasd.left.isDown) {
        player.body.setVelocityX(-PLAYER_SPEED * 0.5);
    } else if (cursors.right.isDown || wasd.right.isDown) {
        player.body.setVelocityX(PLAYER_SPEED * 0.5);
    }
    
    // Ändere Sprite basierend auf vertikaler Bewegung
    if (movingUp) {
        player.setTexture('santa_up');
    } else if (movingDown) {
        player.setTexture('santa_down');
    } else {
        player.setTexture('santa_neutral');
    }
    
    // Entferne Hindernisse die aus dem Bildschirm sind
    obstacles.children.entries.forEach(obstacle => {
        if (obstacle.obstacleType === 'icicle' && obstacle.y > config.height + 100) {
            obstacle.destroy();
        }
        if (obstacle.obstacleType === 'owl' && obstacle.x < -100) {
            obstacle.destroy();
        }
    });
    
    // Entferne Collectibles die aus dem Bildschirm sind
    collectibles.children.entries.forEach(collectible => {
        if (collectible.x < -100) {
            collectible.destroy();
        }
    });
}
