import { describe, expect, it } from 'vitest';
import { addBall, createWorld, isResting, removeBall, resize, step } from './physics';

const run = (world, n) => { for (let i = 0; i < n; i++) step(world); };
const settle = (world, max = 3000) => { let i = 0; while (!isResting(world) && i < max) { step(world); i++; } return i; };

describe('physics', () => {
    it('공 하나가 떨어져 바닥에 닿아 멈춘다', () => {
        const world = createWorld({ width: 300, height: 400 });
        addBall(world, { id: 1, x: 150, y: 0, r: 20 });
        expect(settle(world)).toBeLessThan(3000);
        expect(world.balls[0].y).toBeCloseTo(380, 0);
    });

    it('좌우 벽 밖으로 나가지 않는다', () => {
        const world = createWorld({ width: 300, height: 400 });
        addBall(world, { id: 1, x: 280, y: 300, r: 20, vx: 3000 });
        addBall(world, { id: 2, x: 20, y: 300, r: 20, vx: -3000 });
        for (let i = 0; i < 200; i++) {
            step(world);
            for (const b of world.balls) {
                expect(b.x).toBeGreaterThanOrEqual(b.r - 1e-9);
                expect(b.x).toBeLessThanOrEqual(300 - b.r + 1e-9);
            }
        }
    });

    it('여러 공을 쌓으면 멈추고, 어떤 두 공도 1px 넘게 겹치지 않는다', () => {
        const world = createWorld({ width: 200, height: 400 });
        for (let i = 0; i < 20; i++) addBall(world, { id: i, x: 30 + ((i * 37) % 140), y: -i * 45, r: i % 3 === 0 ? 24 : 16 });
        expect(settle(world)).toBeLessThan(3000);
        const { balls } = world;
        for (let i = 0; i < balls.length; i++) {
            expect(balls[i].y).toBeLessThanOrEqual(400 - balls[i].r + 1e-6);
            for (let j = i + 1; j < balls.length; j++) {
                const d = Math.hypot(balls[i].x - balls[j].x, balls[i].y - balls[j].y);
                expect(d).toBeGreaterThan(balls[i].r + balls[j].r - 1);
            }
        }
    });

    it('무거운 공이 가벼운 공을 밀어낸다', () => {
        const world = createWorld({ width: 2000, height: 1000, gravity: 0 });
        const heavy = addBall(world, { id: 'h', x: 100, y: 500, r: 40, vx: 500 });
        const light = addBall(world, { id: 'l', x: 200, y: 500, r: 10 });
        run(world, 30);
        expect(light.vx).toBeGreaterThan(heavy.vx);
        expect(heavy.vx).toBeGreaterThan(0);
    });

    it('같은 입력이면 같은 결과', () => {
        const make = () => {
            const w = createWorld({ width: 240, height: 300 });
            for (let i = 0; i < 8; i++) addBall(w, { id: i, x: 40 + i * 20, y: -i * 30, r: 18 });
            run(w, 400);
            return w.balls.map(b => [b.x, b.y]);
        };
        expect(make()).toEqual(make());
    });

    it('잡고 있는 공은 떨어지지 않고, 그동안은 쉬지 않는다', () => {
        const world = createWorld({ width: 300, height: 400 });
        const b = addBall(world, { id: 1, x: 150, y: 100, r: 20 });
        b.held = true;
        run(world, 60);
        expect(b.y).toBe(100);
        expect(isResting(world)).toBe(false);
    });

    it('던진 공은 꼭대기에서 잠깐 느려져도 쉬지 않는다', () => {
        const world = createWorld({ width: 300, height: 1000 });
        addBall(world, { id: 1, x: 150, y: 900, r: 20, vy: -900 });
        let restedInAir = false;
        for (let i = 0; i < 200; i++) {
            step(world);
            if (isResting(world) && world.balls[0].y < 970) restedInAir = true;
        }
        expect(restedInAir).toBe(false);
    });

    it('resize 로 좁히면 공이 안으로 들어온다', () => {
        const world = createWorld({ width: 300, height: 400 });
        addBall(world, { id: 1, x: 280, y: 380, r: 20 });
        resize(world, 200, 300);
        expect(world.balls[0].x).toBe(180);
        expect(world.balls[0].y).toBe(280);
    });

    it('removeBall', () => {
        const world = createWorld({ width: 300, height: 400 });
        addBall(world, { id: 1, x: 50, y: 50, r: 10 });
        addBall(world, { id: 2, x: 90, y: 50, r: 10 });
        removeBall(world, 1);
        expect(world.balls.map(b => b.id)).toEqual([2]);
    });
});
