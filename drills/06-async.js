// ===== 드릴 06: 비동기 — "JS는 기다려주지 않는다" =====
// 실행 방법: node drills/06-async.js
// 이 드릴은 fetch로 가는 징검다리예요. 규칙은 동일: 실험은 예측 먼저!

// ---------------------------------------------------------
// [문제 1] 실험: 출력 순서 맞히기
// setTimeout(fn, 1000)은 "1초 뒤에 fn을 실행해줘"라고 예약하는 함수예요.
// (함수를 값으로 넘기기 — 드릴 04의 그 패턴!)
// 아래 세 줄의 출력 순서를 예측하세요.
// ---------------------------------------------------------

// 예측: A → C → B
console.log('A');
setTimeout(() => console.log('B'), 1000);
console.log('C');

// 관찰 후 한 문장으로:
// JS는 예약을 걸어두고 기다리지 않고 실행 한다.

// ---------------------------------------------------------
// [문제 2] await: "이 함수 안에서만" 기다리기
// delay는 ms 밀리초 뒤에 완료되는 Promise(약속)를 돌려주는 헬퍼예요.
// async 함수 run을 만들어서:
//   '시작' 출력 → await delay(1000) → '끝' 출력
// 순서로 실행되게 하세요. 마지막에 run(); 으로 호출!
//
// 모양 힌트:  async function 이름() { ... await ... }
// ---------------------------------------------------------
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// TODO: run 만들고 호출하기
async function run() {
    console.log('시작');
    await delay(1000);
    console.log('끝');
}
run();
// 기대: '시작' 출력 → 1초 멈춤 → '끝' 출력
// (문제 1의 B보다 '끝'이 먼저일까 나중일까? 실행 전에 예측해보기)

// ---------------------------------------------------------
// [문제 3] 가짜 서버에서 데이터 받기
// fakeFetchTodos는 1초 뒤에 todo 배열을 "배달"해주는 가짜 서버예요.
// async 함수 loadTodos를 만들어서:
//   결과를 await로 받아 → '문제3: 개수 = N' 형태로 출력하세요.
// ---------------------------------------------------------
function fakeFetchTodos() {
    return new Promise(resolve => {
        setTimeout(() => resolve([
            { id: 1, text: '우유 사기', completed: false },
            { id: 2, text: '산책하기', completed: true },
        ]), 1000);
    });
}

// TODO: loadTodos 만들고 호출하기
async function loadTodos() {
    const result = await fakeFetchTodos();
    console.log('문제3: 개수 = ', result.length);
}
loadTodos();
// 기대 출력 → 문제3: 개수 = 2

// ---------------------------------------------------------
// [문제 4] 실패하는 서버: try/catch
// fakeBrokenServer는 1초 뒤에 실패하는 가짜 서버예요.
// async 함수 loadBroken을 만들어서 await로 받되,
// try/catch로 감싸서 프로그램이 죽지 않고
// '문제4: 실패함 - 서버 폭발' 이 출력되게 하세요.
//
// 모양 힌트:
//   try { ... } catch (err) { ... err.message ... }
// ---------------------------------------------------------
function fakeBrokenServer() {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('서버 폭발')), 1000);
    });
}

// TODO: loadBroken 만들고 호출하기
async function loadBroken () {
    try {
        await fakeBrokenServer();
    } catch (error) {
        console.log('문제4: 실패함 - ', error.message);
    }
}
loadBroken();
// 기대 출력 → 문제4: 실패함 - 서버 폭발

// ---------------------------------------------------------
// [문제 5] 진짜 fetch! (인터넷 연결 필요)
// jsonplaceholder는 연습용 무료 가짜 API예요. 아래 주소는
// 진짜 todo 3개를 JSON으로 돌려줍니다:
//   https://jsonplaceholder.typicode.com/todos?_limit=3
//
// async 함수 loadReal을 만들어서:
//   1) const res = await fetch(주소);
//   2) const data = await res.json();   ← await가 왜 또 필요할까? 생각해보기
//   3) data의 각 title을 출력 (data.map 또는 반복)
// ---------------------------------------------------------

// TODO: loadReal 만들고 호출하기
async function loadReal() {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=3");
    const data = await res.json();
    console.log(data.map(result=>result.title));
}
loadReal();
// 기대 출력 → 영어 문장 3줄 (진짜 서버에서 온 데이터!)

// ---------------------------------------------------------
// [문제 6] 생각 문제: React로 가는 다리 (코드 작성 없음)
// 컴포넌트 함수는 화면을 그려야 해서 1초를 멈춰 기다릴 수 없어요.
// 그래서 fetch하는 동안 화면은 "상태"가 필요합니다.
// (a) 데이터를 fetch해서 보여주는 화면에 필요한 상태 3가지는?
//     (문제 3과 4에서 겪은 상황들을 떠올려보세요)
// (b) 1초 뒤 데이터가 도착했을 때, 화면을 다시 그리게 만드는
//     유일한 방법은? (렌더 루프를 떠올려보세요)
// 답: (a)로딩, 성공, 실패
// 답: (b)state 변경
// ---------------------------------------------------------
