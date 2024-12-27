let sprites = {
    player1: {
        idle: {
            img: null,
            width: 180,
            height: 403,
            frames: 1,
            scale: 0.4
        },
        walk: {
            img: null,
            width: 214.5,
            height: 408,
            frames: 2,
            scale: 0.4
        },
        jump: {
            img: null,
            width: 368,
            height: 439,
            frames: 6,
            scale: 0.4
        }
    },
    player2: {
        idle: {
            img: null,
            width: 45,
            height: 80,
            frames: 1,
            scale: 1.5
        },
        walk: {
            img: null,
            width: 74,
            height: 80,
            frames: 3,
            scale: 1.5
        },
        jump: {
            img: null,
            width: 90.7,
            height: 78,
            frames: 4,
            scale: 1.5
        }
    }
};

let bullets = [];  // 存儲子彈
let ground = 500;  // 地面高度
const gravity = 5.0;  // 增加重力
const jumpPower = -45;  // 增加初始跳躍力度，但保持相似的跳躍高度

let player1State = {
    x: 200,
    y: ground,
    currentAction: 'idle',
    currentFrame: 0,
    direction: 1,
    hp: 100,  // 添加血量
    canShoot: true,  // 射擊冷卻控制
    lastShootTime: 0,  // 上次射擊時間
    velocityY: 0,    // 垂直速度
    isJumping: false // 跳躍狀態
};

let player2State = {
    x: 600,
    y: ground,
    currentAction: 'idle',
    currentFrame: 0,
    direction: 1,
    hp: 100,  // 添加血量
    canShoot: true,  // 射擊冷卻控制
    lastShootTime: 0,  // 上次射擊時間
    velocityY: 0,    // 垂直速度
    isJumping: false // 跳躍狀態
};

let backgroundImg = null;
let uiImages = {};  // 移除 frame 和 tutorial

function preload() {
    // 載入背景圖片
    backgroundImg = loadImage('Backgrounds.png');

    // 載入所有精靈圖片
    sprites.player1.idle.img = loadImage('idle.png');
    sprites.player1.walk.img = loadImage('walk.png');
    sprites.player1.jump.img = loadImage('jump.png');

    sprites.player2.idle.img = loadImage('idle1.png');
    sprites.player2.walk.img = loadImage('walk1.png');
    sprites.player2.jump.img = loadImage('jump1.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(12);
    
    // 更詳細的偵錯資料
    console.log('Sprites object:', sprites);
    console.log('Canvas size:', windowWidth, windowHeight);
    console.log('Player 1 state:', player1State);
    console.log('Player 2 state:', player2State);
}

function draw() {
    background(220);
    
    // 繪製場景
    drawScene();
    
    // 更新和繪製子彈
    updateBullets();
    // 更新和繪製命中粒子
    updateHitParticles();
    
    // 更新玩家跳躍
    updatePlayerJump(player1State);
    updatePlayerJump(player2State);
    
    // 繪製玩家
    drawPlayer('player1', player1State);
    drawPlayer('player2', player2State);
    
    // 繪製UI元素
    drawHealthBars();
    drawCooldownIndicators();
    
    // 繪製標題
    drawTitle();
    
    // 檢查射擊冷卻
    checkShootCooldown();
    
    // 更新玩家幀
    updatePlayerFrame(player1State);
    updatePlayerFrame(player2State);
    
    // 處理玩家移動
    handlePlayerMovement();
}

function drawPlayer(playerType, playerState) {
    let currentSprite = sprites[playerType][playerState.currentAction];
    let sx = playerState.currentFrame * currentSprite.width;
    let sy = 0;
    
    push();
    translate(playerState.x, playerState.y);
    scale(playerState.direction * currentSprite.scale, currentSprite.scale);
    
    image(currentSprite.img,
        -currentSprite.width/2, -currentSprite.height/2,
        currentSprite.width, currentSprite.height,
        sx, sy,
        currentSprite.width, currentSprite.height);
    pop();
}

function updatePlayerFrame(playerState) {
    let currentSprite;
    if (playerState === player1State) {
        currentSprite = sprites.player1[playerState.currentAction];
    } else {
        currentSprite = sprites.player2[playerState.currentAction];
    }
    playerState.currentFrame = (playerState.currentFrame + 1) % currentSprite.frames;
}

function handlePlayerMovement() {
    const moveSpeed = 5;
    
    // 玩家1控制 (WASD)
    if (!keyIsDown(65) && !keyIsDown(68) && !player1State.isJumping) {
        player1State.currentAction = 'idle';
    }
    
    if (keyIsDown(65)) { // A鍵
        player1State.x -= moveSpeed;
        if (!player1State.isJumping) player1State.currentAction = 'walk';
        player1State.direction = -1;
    }
    if (keyIsDown(68)) { // D鍵
        player1State.x += moveSpeed;
        if (!player1State.isJumping) player1State.currentAction = 'walk';
        player1State.direction = 1;
    }
    if (keyIsDown(87) && !player1State.isJumping) { // W鍵
        player1State.velocityY = jumpPower;
        player1State.isJumping = true;
        player1State.currentAction = 'jump';
    }
    
    // 玩家2控制 (方向鍵)
    if (!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW) && !player2State.isJumping) {
        player2State.currentAction = 'idle';
    }
    
    if (keyIsDown(LEFT_ARROW)) {
        player2State.x -= moveSpeed;
        if (!player2State.isJumping) player2State.currentAction = 'walk';
        player2State.direction = -1;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        player2State.x += moveSpeed;
        if (!player2State.isJumping) player2State.currentAction = 'walk';
        player2State.direction = 1;
    }
    if (keyIsDown(UP_ARROW) && !player2State.isJumping) {
        player2State.velocityY = jumpPower;
        player2State.isJumping = true;
        player2State.currentAction = 'jump';
    }
}

function keyReleased() {
    // 當放開按鍵時，回到閒置狀態
    if (key === 'a' || key === 'd' || key === 'w' || 
        key === 'A' || key === 'D' || key === 'W') {
        player1State.currentAction = 'idle';
    }
    
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === UP_ARROW) {
        player2State.currentAction = 'idle';
    }
}

// 添加新的場景繪製函數
function drawScene() {
    // 繪製背景圖片
    image(backgroundImg, 0, 0, width, height);
    
    // 繪製地面
    fill(34, 139, 34);
    rect(0, ground, width, height - ground);
    
    // 繪製平台
    fill(139, 69, 19);
    rect(300, ground - 100, 200, 20);
}

// 修改子彈創建函數
function createBullet(x, y, direction, owner) {
    return {
        x: x,
        y: y - 20,
        direction: direction,
        speed: 15,  // 稍微提高速度
        owner: owner,
        size: 12,
        color: owner === 'player1' ? color(255, 165, 0) : color(0, 191, 255),  // 不同玩家不同顏色
        trail: []  // 儲存軌跡點
    };
}

// 修改子彈更新和繪製函數
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.x += bullet.speed * bullet.direction;
        
        // 更新軌跡
        bullet.trail.push({x: bullet.x, y: bullet.y});
        if (bullet.trail.length > 5) {  // 保持最近的5個點
            bullet.trail.shift();
        }
        
        // 繪製軌跡
        for (let j = 0; j < bullet.trail.length; j++) {
            let alpha = map(j, 0, bullet.trail.length, 50, 255);
            let size = map(j, 0, bullet.trail.length, bullet.size * 0.5, bullet.size);
            
            // 發光效果
            noStroke();
            fill(red(bullet.color), green(bullet.color), blue(bullet.color), alpha * 0.3);
            ellipse(bullet.trail[j].x, bullet.trail[j].y, size * 1.5);
            
            // 主要軌跡
            fill(red(bullet.color), green(bullet.color), blue(bullet.color), alpha);
            ellipse(bullet.trail[j].x, bullet.trail[j].y, size);
        }
        
        // 繪製子彈本體
        // 發光效果
        noStroke();
        fill(255, 255, 255, 150);
        ellipse(bullet.x, bullet.y, bullet.size * 1.5);
        
        // 主要子彈
        fill(bullet.color);
        ellipse(bullet.x, bullet.y, bullet.size);
        
        // 檢查子彈碰撞
        checkBulletCollision(bullet, i);
        
        // 移除超出畫面的子彈
        if (bullet.x < 0 || bullet.x > width) {
            bullets.splice(i, 1);
        }
    }
}

// 修改碰撞檢測函數，添加命中特效
function checkBulletCollision(bullet, bulletIndex) {
    let target = bullet.owner === 'player1' ? player2State : player1State;
    let hitboxSize = 50;
    
    if (Math.abs(bullet.x - target.x) < hitboxSize && 
        Math.abs(bullet.y - target.y) < hitboxSize) {
        
        // 命中特效
        for (let i = 0; i < 8; i++) {
            let angle = random(TWO_PI);
            let speed = random(2, 5);
            let particle = {
                x: bullet.x,
                y: bullet.y,
                vx: cos(angle) * speed,
                vy: sin(angle) * speed,
                life: 255,
                color: bullet.color
            };
            hitParticles.push(particle);
        }
        
        target.hp -= 10;
        bullets.splice(bulletIndex, 1);
        
        if (target.hp <= 0) {
            gameOver(bullet.owner);
        }
    }
}

// 添加命中粒子數組和更新函數
let hitParticles = [];

function updateHitParticles() {
    for (let i = hitParticles.length - 1; i >= 0; i--) {
        let p = hitParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 10;
        
        if (p.life > 0) {
            noStroke();
            fill(red(p.color), green(p.color), blue(p.color), p.life);
            ellipse(p.x, p.y, 5);
        } else {
            hitParticles.splice(i, 1);
        }
    }
}

// 添加血條繪製函數
function drawHealthBars() {
    // 玩家1血條
    drawHealthBar(50, 30, player1State.hp, 'Player 1');
    // 玩家2血條
    drawHealthBar(width - 250, 30, player2State.hp, 'Player 2');
    
    // 繪製操作說明
    drawControls();
}

function drawHealthBar(x, y, hp, label) {
    const barWidth = 200;
    const barHeight = 20;
    
    // 血條外框
    stroke(0);
    strokeWeight(2);
    fill(100);
    rect(x - 2, y - 2, barWidth + 4, barHeight + 4, 5);
    
    // 血條背景
    noStroke();
    fill(255, 0, 0);
    rect(x, y, barWidth, barHeight, 3);
    
    // 當前血量
    fill(0, 255, 0);
    rect(x, y, barWidth * (hp / 100), barHeight, 3);
    
    // 血條文字
    fill(255);
    stroke(0);
    strokeWeight(2);
    textSize(16);
    text(`${label}: ${hp}`, x, y - 5);
    
    // 重設繪圖樣式
    noStroke();
}

// 新增操作說明繪製函數
function drawControls() {
    const padding = 20;
    const boxHeight = 120;
    
    // 繪製半透明背景
    fill(0, 0, 0, 127);
    rect(padding, height - boxHeight - padding, 300, boxHeight, 10);
    rect(width - 320 - padding, height - boxHeight - padding, 300, boxHeight, 10);
    
    // 繪製文字說明
    fill(255);
    textSize(16);
    textAlign(LEFT);
    
    // 玩家1控制說明
    text('Player 1 Controls:', padding + 10, height - boxHeight - padding + 25);
    text('W - Jump', padding + 20, height - boxHeight - padding + 50);
    text('A/D - Move Left/Right', padding + 20, height - boxHeight - padding + 75);
    text('SPACE - Shoot', padding + 20, height - boxHeight - padding + 100);
    
    // 玩家2控制說明
    text('Player 2 Controls:', width - 310 - padding, height - boxHeight - padding + 25);
    text('↑ - Jump', width - 300 - padding, height - boxHeight - padding + 50);
    text('←/→ - Move Left/Right', width - 300 - padding, height - boxHeight - padding + 75);
    text('ENTER - Shoot', width - 300 - padding, height - boxHeight - padding + 100);
}

// 在draw函數中添加射擊冷卻指示器
function drawCooldownIndicators() {
    // 玩家1射擊冷卻指示
    if (!player1State.canShoot) {
        fill(255, 0, 0, 127);
        ellipse(50, 70, 20, 20);
    }
    
    // 玩家2射擊冷卻指示
    if (!player2State.canShoot) {
        fill(255, 0, 0, 127);
        ellipse(width - 250, 70, 20, 20);
    }
}

// 修改按鍵處理，添加射擊功能
function keyPressed() {
    // 玩家1射擊 (空白鍵)
    if (key === ' ' && player1State.canShoot) {
        bullets.push(createBullet(
            player1State.x + (50 * player1State.direction),
            player1State.y,
            player1State.direction,
            'player1'
        ));
        player1State.canShoot = false;
        player1State.lastShootTime = millis();
    }
    
    // 玩家2射擊 (Enter鍵)
    if (keyCode === ENTER && player2State.canShoot) {
        bullets.push(createBullet(
            player2State.x + (50 * player2State.direction),
            player2State.y,
            player2State.direction,
            'player2'
        ));
        player2State.canShoot = false;
        player2State.lastShootTime = millis();
    }
}

// 在draw函數中添加射擊冷卻檢查
function checkShootCooldown() {
    const cooldownTime = 500;  // 0.5秒冷卻時間
    
    if (!player1State.canShoot && millis() - player1State.lastShootTime > cooldownTime) {
        player1State.canShoot = true;
    }
    
    if (!player2State.canShoot && millis() - player2State.lastShootTime > cooldownTime) {
        player2State.canShoot = true;
    }
}

// 添加遊戲結束處理
function gameOver(winner) {
    noLoop();
    textSize(64);
    textAlign(CENTER, CENTER);
    fill(0);
    text(`${winner} Wins!`, width/2, height/2);
}

// 添加標題繪製函數
function drawTitle() {
    textSize(32);
    textAlign(CENTER);
    textStyle(BOLD);
    
    // 半透明背景
    fill(0, 0, 0, 100);
    noStroke();
    rect(0, 20, width, 50);
    
    // 文字
    fill(255);
    stroke(0);
    strokeWeight(2);
    text('淡江教育科技', width/2, 55);
    
    // 重設樣式
    noStroke();
    textAlign(LEFT);
}

// 添加跳躍更新函數
function updatePlayerJump(playerState) {
    if (playerState.isJumping) {
        playerState.velocityY += gravity;
        playerState.y += playerState.velocityY;
        
        // 著地檢測
        if (playerState.y >= ground) {
            playerState.y = ground;
            playerState.velocityY = 0;
            playerState.isJumping = false;
            playerState.currentAction = 'idle';
        }
    }
}

