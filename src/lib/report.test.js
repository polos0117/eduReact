import { test, expect } from 'vitest';
import { buildReport } from './report';

const today = '2026-09-16';
const at = (m, d) => new Date(2026, m - 1, d, 10).getTime();
const todos = [
    { id: 1, text: '로그인 API 연동', completed: true, completedAt: at(9, 15), priority: 'high', startDate: '2026-09-07', endDate: '2026-09-15',
      tags: ['kipa'], path: 'IP 담보대출 > MyWork', subtasks: [{ id: 1, text: 'JWT', done: true }, { id: 2, text: 'refresh', done: false }],
      notes: [{ id: 1, category: 'memo', text: '메모 하나' }, { id: 2, category: 'backend', text: 'r5074 토큰 발급\n두 번째 줄' }] },
    { id: 2, text: '조회 성능 튜닝', completed: false, startDate: '2026-09-15' },              // 진행 중 (종료일 없음)
    { id: 3, text: '보고서 제출', completed: false, dueDate: '2026-09-18' },                     // 마감 예정
    { id: 4, text: '지난주에 끝낸 것', completed: true, completedAt: at(9, 8) },                 // 기간 밖
    { id: 5, text: '다음 주 시작', completed: false, startDate: '2026-09-22', dueDate: '2026-09-19' }, // 기간엔 마감만 걸림
];

test('buildReport는 끝낸 일·진행 중·마감 예정을 기간으로 걸러 Markdown 으로 쓴다', () => {
    const md = buildReport(todos, { from: '2026-09-14', to: '2026-09-20' }, today);
    expect(md).toBe(`# 작업 보고 2026-09-14 ~ 2026-09-20

## 끝낸 일 (1)

- [x] 로그인 API 연동 — 9/7 ~ 9/15 · 높음 · #kipa
  - 경로: IP 담보대출 > MyWork
  - 하위: JWT ✓ / refresh
  - 백엔드: r5074 토큰 발급
    두 번째 줄
  - 메모: 메모 하나

## 진행 중 (1)

- [ ] 조회 성능 튜닝 — 9/15 ~ · 보통

## 마감 예정 (2)

- [ ] 보고서 제출 — 9/18 마감 · 보통
- [ ] 다음 주 시작 — 9/19 마감 · 보통
`);
});

test('buildReport 옵션으로 노트·하위 항목을 뺄 수 있고, 빈 구역은 "없음"', () => {
    const md = buildReport(todos, { from: '2026-09-01', to: '2026-09-06' }, today, { notes: false, subtasks: false });
    expect(md).toContain('## 끝낸 일 (0)\n\n- 없음');
    expect(md).not.toContain('하위:');
    expect(md).not.toContain('메모:');
});
