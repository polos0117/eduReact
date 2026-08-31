// ===== 드릴 05: 삼항 연산자 + 체이닝 — 5개 패턴의 마지막! =====
// 실행 방법: node drills/05-ternary-chaining.js

// ---------------------------------------------------------
// [문제 1] if/else → 삼항
// 아래 if/else 네 줄을 "삼항 연산자를 쓴 const 한 줄"로 바꾸세요.
// (let을 const로 바꿀 수 있게 된다는 것에 주목!)
// ---------------------------------------------------------
const score = 85;

// let grade;
// if (score >= 60) {
//     grade = '합격';
// } else {
//     grade = '불합격';
// }
const grade = score >= 60 ? '합격' : '불합격';
console.log('문제1:', grade);
// 기대 출력 → 문제1: 합격

// ---------------------------------------------------------
// [문제 2] 생각 문제 (코드 작성 없음)
// 문제 1에서 왜 if/else일 때는 let이 필요했고, 삼항으로 바꾸면
// const가 될까요?
// 힌트: 삼항은 "값이 되는 식"이고, if는 "행동을 시키는 문장"이에요.
//       const grade = if (...) {...}  ← 이건 문법 에러! 왜일까?
// 답: if / else 는 function 이 아니므로, function() {if / else / return} 식이였으면 같은 const 를 써도 됐을것
// (이게 JSX의 {} 안에 if는 못 쓰고 삼항은 쓸 수 있는 이유이기도 해요)
// ---------------------------------------------------------

// ---------------------------------------------------------
// [문제 3] 삼항 + map = 미니 TOGGLE 재구현!
// todos에서 id가 2인 것만 completed를 반전시킨 "새 배열" flipped를
// 만드세요. (map + 삼항 + 객체 스프레드 — 배운 것 총출동)
// 원본 todos는 건드리면 안 됩니다.
// ---------------------------------------------------------
const todos = [
    { id: 1, text: '우유 사기', completed: false },
    { id: 2, text: '산책하기', completed: false },
];

// TODO: flipped 만들기
const flipped = todos.map(todo=>todo.id===2?{...todo, completed : !todo.completed} : todo);
console.log('문제3:', flipped[1].completed, todos[1].completed, flipped === todos);
// 기대 출력 → 문제3: true false false

// ---------------------------------------------------------
// [문제 4] 체이닝 풀어쓰기
// 아래 한 줄 체인을 "중간 변수 2개를 쓰는 세 줄"로 풀어 쓰세요.
// 각 단계의 결과가 무엇인지 변수 이름으로 드러나게!
// (체인이 안 읽힐 때 이렇게 풀어보는 게 실전 디버깅 기술이에요)
// ---------------------------------------------------------
const messy = '  HELLO World  ';

// TODO: 위의 cleaned를 지우고, 세 줄 버전으로 다시 만들기
//       (1단계: trim 결과 → 2단계: toLowerCase 결과)
const trimMessy = messy.trim();
const trimMessyLowerCase = trimMessy.toLowerCase();
const cleaned = trimMessyLowerCase;
console.log('문제4:', cleaned);
// 기대 출력 → 문제4: hello world

// ---------------------------------------------------------
// [문제 5] 체인 만들기
// nums에서 짝수만 남기고 → 각각 10배로 만든 배열 result를
// "한 줄 체인"으로 만드세요. (filter 다음 map)
// ---------------------------------------------------------
const nums = [1, 2, 3, 4, 5, 6];

// TODO: result 만들기
const result = nums.filter(num=>num%2==0).map(num=>num*10);
console.log('문제5:', result);
// 기대 출력 → 문제5: [ 20, 40, 60 ]

// ---------------------------------------------------------
// [문제 6] 내 코드에서 찾기 (코드 작성 없음)
// TodoApp.jsx의 visibleTodos 계산(34~42번째 줄 근처)을 여세요.
// 거기엔 체인이 두 개 있어요:
//   - search.trim().toLowerCase()
//   - todos.filter(...).filter(...)
// 두 번째 체인(filter 두 번)에 대해:
// (a) 첫 filter가 하는 일과 두 번째 filter가 하는 일을 각각 한 줄로.
// (b) 두 filter의 순서를 바꾸면 결과가 달라질까요? 이유는?
// 답: (a) 첫번째 : 전체 todos 중에서 필터링(필터상태(all/active/completed)) 두번째 : 첫번째 필터에 걸러진 값을 필터링(검색어 포함 여부) 
// 답: (b) 달라지지 않는다. 같은 todos 에서 필터링을 하므로. 
// ---------------------------------------------------------
