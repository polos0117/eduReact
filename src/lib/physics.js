// 할 일 더미의 물리: 원(공)만 있는 2D 세계. 중력, 바닥, 좌우 벽(천장 없음), 공끼리 충돌.
// 1/60초 고정 걸음 · 무작위 없음 — 같은 입력이면 같은 결과.

export const DT = 1 / 60;
const ITERATIONS = 8;        // 한 걸음에 충돌을 몇 번 풀까 — 4번이면 20개 더미가 1px 넘게 눌린다
const WALL_BOUNCE = 0.25;
const BALL_BOUNCE = 0.2;
const FLOOR_FRICTION = 0.92; // 바닥에 닿을 때마다 가로 속도에 곱한다 (구르다 멈추게)
const SETTLE_SPEED = 60;     // 바닥에 이보다 느리게 닿으면 튀지 않는다 (px/s)
// 한 걸음에 이보다 덜 움직인 공은 멈춘다(= 12px/s). 속도가 아니라 실제 이동으로 본다 —
// 깊이 쌓인 더미에선 중력과 충돌 보정이 매 걸음 상쇄돼 위치는 그대로인데 속도 값만 남는다
const SLEEP_DIST = 0.2;
const QUIET_STEPS = 30;      // 이만큼 연달아 모두 멈춰야 "쉼" — 던진 공이 꼭대기에서 잠깐 0 이 되는 것과 구분

export function createWorld({ width, height, gravity = 1800 }) {
    return { width, height, gravity, balls: [], quiet: 0 };
}

export function addBall(world, { id, x, y, r, vx = 0, vy = 0 }) {
    const ball = { id, x, y, r, vx, vy, m: r * r, held: false };
    world.balls.push(ball);
    world.quiet = 0;
    return ball;
}

export function removeBall(world, id) {
    world.balls = world.balls.filter(b => b.id !== id);
    world.quiet = 0;
}

// 잡고 있는 공은 무게가 무한대 — 밀리지 않고 남을 민다
const invMass = (b) => (b.held ? 0 : 1 / b.m);

function collideBalls(balls) {
    // ponytail: O(n²), 150개까지 충분. 넘치면 격자로 나눠 검사
    for (let i = 0; i < balls.length; i++) {
        for (let k = i + 1; k < balls.length; k++) {
            const a = balls[i];
            const b = balls[k];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const min = a.r + b.r;
            const d2 = dx * dx + dy * dy;
            if (d2 >= min * min) continue;
            const wa = invMass(a);
            const wb = invMass(b);
            if (wa + wb === 0) continue;
            const dist = Math.sqrt(d2);
            const nx = dist > 0 ? dx / dist : 0;
            const ny = dist > 0 ? dy / dist : 1; // 정확히 겹치면 b 를 아래로
            // 겹친 만큼 무게 비율로 떼어 놓는다
            const push = (min - dist) / (wa + wb);
            a.x -= nx * push * wa; a.y -= ny * push * wa;
            b.x += nx * push * wb; b.y += ny * push * wb;
            // 다가오는 방향 속도에만 충격량
            const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (vn >= 0) continue;
            const impulse = (-(1 + BALL_BOUNCE) * vn) / (wa + wb);
            a.vx -= impulse * nx * wa; a.vy -= impulse * ny * wa;
            b.vx += impulse * nx * wb; b.vy += impulse * ny * wb;
        }
    }
}

function collideWalls(world) {
    for (const b of world.balls) {
        if (b.held) continue;
        if (b.x < b.r) { b.x = b.r; if (b.vx < 0) b.vx = -b.vx * WALL_BOUNCE; }
        else if (b.x > world.width - b.r) { b.x = world.width - b.r; if (b.vx > 0) b.vx = -b.vx * WALL_BOUNCE; }
        if (b.y > world.height - b.r) {
            b.y = world.height - b.r;
            if (b.vy > 0) b.vy = b.vy < SETTLE_SPEED ? 0 : -b.vy * WALL_BOUNCE;
            b.vx *= FLOOR_FRICTION;
        }
    }
}

// 반암시적 오일러: 속도 먼저, 위치 나중
export function step(world) {
    const before = world.balls.map(b => [b.x, b.y]);
    for (const b of world.balls) {
        if (b.held) continue;
        b.vy += world.gravity * DT;
        b.x += b.vx * DT;
        b.y += b.vy * DT;
    }
    for (let k = 0; k < ITERATIONS; k++) {
        collideBalls(world.balls);
        collideWalls(world);
    }
    let moving = false;
    world.balls.forEach((b, i) => {
        if (b.held) { moving = true; return; }
        if (Math.hypot(b.x - before[i][0], b.y - before[i][1]) < SLEEP_DIST) { b.vx = 0; b.vy = 0; } else moving = true;
    });
    world.quiet = moving ? 0 : world.quiet + 1;
}

export const isResting = (world) => world.quiet >= QUIET_STEPS;

export function resize(world, width, height) {
    world.width = width;
    world.height = height;
    for (const b of world.balls) {
        b.x = Math.min(Math.max(b.x, b.r), Math.max(b.r, width - b.r));
        b.y = Math.min(b.y, height - b.r);
    }
    world.quiet = 0;
}
