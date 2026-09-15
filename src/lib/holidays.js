import { addDays } from './stats';

// 한국 공휴일(관공서의 공휴일에 관한 규정 기준).
// 양력 고정일은 계산하고, 음력 기반(설날·추석·부처님오신날)만 표로 둔다.
// 대체공휴일은 표로 박지 않고 규칙으로 계산한다 — 연도별로 적어 두면 틀리기 쉽다.
// 임시공휴일·선거일처럼 그때그때 정해지는 날은 담지 않는다.

// 음력 기반 공휴일의 양력 '당일' (2026-09-15 확인)
const LUNAR = {
    2025: { seollal: '2025-01-29', chuseok: '2025-10-06', buddha: '2025-05-05' },
    2026: { seollal: '2026-02-17', chuseok: '2026-09-25', buddha: '2026-05-24' },
    2027: { seollal: '2027-02-07', chuseok: '2027-09-15', buddha: '2027-05-13' },
    2028: { seollal: '2028-01-27', chuseok: '2028-10-03', buddha: '2028-05-02' },
    2029: { seollal: '2029-02-13', chuseok: '2029-09-22', buddha: '2029-05-20' },
    2030: { seollal: '2030-02-03', chuseok: '2030-09-12', buddha: '2030-05-09' },
};

// 양력 고정 공휴일. sub = 대체공휴일 대상인가.
// 신정·현충일은 국경일이 아니라 대체공휴일 대상이 아니다.
const FIXED = [
    { md: '01-01', name: '신정', sub: false },
    { md: '03-01', name: '삼일절', sub: true },
    { md: '05-05', name: '어린이날', sub: true },
    { md: '06-06', name: '현충일', sub: false },
    { md: '07-17', name: '제헌절', sub: true, from: 2026 }, // 2026년 공휴일로 재지정
    { md: '08-15', name: '광복절', sub: true },
    { md: '10-03', name: '개천절', sub: true },
    { md: '10-09', name: '한글날', sub: true },
    { md: '12-25', name: '성탄절', sub: true },
];

function dowOf(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).getDay();
}
const isWeekend = (key) => dowOf(key) === 0 || dowOf(key) === 6;

// 대체공휴일 자리: 그 날 다음의 첫 번째 '평일이면서 아직 공휴일이 아닌' 날
function nextOpenDay(key, taken) {
    let d = addDays(key, 1);
    while (isWeekend(d) || taken.has(d)) d = addDays(d, 1);
    return d;
}

// 그 해의 공휴일 전부를 { 'YYYY-MM-DD': 이름 } 으로.
// 한 날에 둘이 겹치면 이름을 '·' 로 잇는다 (예: 추석·개천절).
// 표에 없는 연도는 양력 고정일만 나온다.
export function holidaysFor(year) {
    const entries = [];
    const blocks = []; // 설날·추석 연휴 — 일요일과 겹칠 때만 대체공휴일
    const lunar = LUNAR[year];

    if (lunar) {
        for (const [day, label] of [[lunar.seollal, '설날'], [lunar.chuseok, '추석']]) {
            const days = [addDays(day, -1), day, addDays(day, 1)];
            entries.push({ key: days[0], name: `${label} 연휴`, sub: false });
            entries.push({ key: days[1], name: label, sub: false });
            entries.push({ key: days[2], name: `${label} 연휴`, sub: false });
            blocks.push({ label, days });
        }
        entries.push({ key: lunar.buddha, name: '부처님오신날', sub: true });
    }
    for (const f of FIXED) {
        if (f.from && year < f.from) continue;
        entries.push({ key: `${year}-${f.md}`, name: f.name, sub: f.sub });
    }

    const byDay = new Map();
    for (const e of entries) {
        if (!byDay.has(e.key)) byDay.set(e.key, []);
        byDay.get(e.key).push(e);
    }

    // 밀려날 공휴일 모으기 (아직 날짜는 정하지 않는다)
    const pushed = [];
    for (const { label, days } of blocks) {
        if (days.some(d => dowOf(d) === 0)) pushed.push({ after: days[2], name: label });
    }
    for (const [key, list] of byDay) {
        const eligible = list.filter(e => e.sub);
        if (eligible.length === 0) continue;
        // 주말이면 그 날 공휴일이 통째로 밀리고, 평일이면 겹친 만큼(하나는 그 날을 쓴다) 밀린다
        const count = isWeekend(key) ? eligible.length : Math.min(list.length - 1, eligible.length);
        for (let i = 0; i < count; i++) {
            pushed.push({ after: key, name: eligible[eligible.length - 1 - i].name });
        }
    }

    // 날짜 순으로 자리를 잡아야 서로 같은 날에 겹치지 않는다
    const taken = new Set(byDay.keys());
    pushed.sort((a, b) => a.after.localeCompare(b.after));
    for (const { after, name } of pushed) {
        const key = nextOpenDay(after, taken);
        taken.add(key);
        byDay.set(key, [{ key, name: `${name} 대체공휴일`, sub: false }]);
    }

    return new Map([...byDay]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, list]) => [key, list.map(e => e.name).join('·')]));
}

// 달력이 보는 범위(여러 해에 걸친다)를 한 번에
export function holidaysForRange(startKey, endKey) {
    const map = new Map();
    for (let y = Number(startKey.slice(0, 4)); y <= Number(endKey.slice(0, 4)); y++) {
        for (const [key, name] of holidaysFor(y)) map.set(key, name);
    }
    return map;
}

// 날짜 하나가 공휴일인지. 공휴일은 변하지 않으니 연도별로 한 번만 만들어 둔다.
const cache = new Map();
export function holidayOn(dateKey) {
    if (!dateKey) return undefined;
    const year = Number(dateKey.slice(0, 4));
    if (!cache.has(year)) cache.set(year, holidaysFor(year));
    return cache.get(year).get(dateKey);
}
