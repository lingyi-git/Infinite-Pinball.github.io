// 获取 canvas 和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏设置
let balls = [];
let hitCount = 0;
let ballSpeed = 5;
let isPaused = false;
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = 0;

let center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let radius = Math.min(window.innerWidth, window.innerHeight) / 2;  // 圆形半径为屏幕最小尺寸的一半
const ballRadius = 3;  // 小球半径为3

// 设置 canvas 尺寸
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 更新 canvas 尺寸时，重新计算圆的中心和半径
function updateCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    radius = Math.min(window.innerWidth, window.innerHeight) / 2;  // 更新圆的半径
}

// 创建小球
function createBall() {
    let ball = {
        pos: {
            x: Math.random() * (center.x + radius - ballRadius * 2) + center.x - radius + ballRadius,
            y: Math.random() * (center.y + radius - ballRadius * 2) + center.y - radius + ballRadius
        },
        vel: {
            x: Math.random() * ballSpeed * 2 - ballSpeed,
            y: Math.random() * ballSpeed * 2 - ballSpeed
        },
        path: [],
        hitWall: false
    };

    // 如果小球初始位置不在圆内，则重新生成
    if (Math.sqrt(Math.pow(ball.pos.x - center.x, 2) + Math.pow(ball.pos.y - center.y, 2)) + ballRadius <= radius) {
        return ball;
    }
    return createBall();
}

// 更新所有小球的位置
function updateBalls() {
    balls.forEach(ball => {
        if (!isPaused) {
            ball.pos.x += ball.vel.x;
            ball.pos.y += ball.vel.y;

            // 碰到圆的边界反弹
            if (Math.sqrt(Math.pow(ball.pos.x - center.x, 2) + Math.pow(ball.pos.y - center.y, 2)) + ballRadius > radius) {
                reflectBall(ball);
                if (!ball.hitWall) {
                    hitCount++;
                    balls.push(createBall()); // 新小球
                    ball.hitWall = true;
                }
            } else {
                ball.hitWall = false;
            }
        }

        ball.path.push({ ...ball.pos });
        if (ball.path.length > 50) ball.path.shift(); // 限制轨迹长度
    });
}

// 处理碰撞反射
function reflectBall(ball) {
    const distX = ball.pos.x - center.x;
    const distY = ball.pos.y - center.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    const normalX = distX / distance;
    const normalY = distY / distance;
    const velocityDotNormal = ball.vel.x * normalX + ball.vel.y * normalY;

    ball.vel.x -= 2 * velocityDotNormal * normalX;
    ball.vel.y -= 2 * velocityDotNormal * normalY;

    const overlap = (distance + ballRadius) - radius;
    ball.pos.x -= normalX * overlap;
    ball.pos.y -= normalY * overlap;
}

// 绘制所有元素
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.pos.x, ball.pos.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        ball.path.forEach((point, index) => {
            if (index < ball.path.length - 1) {
                ctx.beginPath();
                ctx.moveTo(ball.path[index].x, ball.path[index].y);
                ctx.lineTo(ball.path[index + 1].x, ball.path[index + 1].y);
                ctx.stroke();
            }
        });
    });

    document.getElementById('hitCount').textContent = hitCount;
    document.getElementById('fps').textContent = fps;

    // 绘制页脚文本，左下角
    ctx.font = '20px Arial';
    const text = 'Produced by Lingye';
    ctx.fillText(text, 10, canvas.height - 10);  // 左下角显示文本
}

// 游戏主循环
function gameLoop() {
    frameCount++;
    if (Date.now() - lastFpsUpdate > 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = Date.now();
    }

    updateBalls();
    draw();
    requestAnimationFrame(gameLoop); // 持续调用
}

// 按钮事件处理
document.getElementById('pauseButton').addEventListener('click', () => {
    isPaused = !isPaused;
});

document.getElementById('resetButton').addEventListener('click', () => {
    balls = [createBall()];
    hitCount = 0;
});

document.getElementById('increaseSpeedButton').addEventListener('click', () => {
    ballSpeed++;
    balls.forEach(ball => {
        ball.vel.x = Math.random() * ballSpeed * 2 - ballSpeed;
        ball.vel.y = Math.random() * ballSpeed * 2 - ballSpeed;
    });
});

document.getElementById('decreaseSpeedButton').addEventListener('click', () => {
    if (ballSpeed > 1) {
        ballSpeed--;
        balls.forEach(ball => {
            ball.vel.x = Math.random() * ballSpeed * 2 - ballSpeed;
            ball.vel.y = Math.random() * ballSpeed * 2 - ballSpeed;
        });
    }
});

// 初始化并启动游戏
balls.push(createBall());
gameLoop();

// 监听窗口大小变化
window.addEventListener('resize', updateCanvasSize);
