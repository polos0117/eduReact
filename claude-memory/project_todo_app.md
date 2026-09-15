---
name: project-todo-app
description: Todo List learning project structure and progress in c:\eduReact
metadata: 
  node_type: memory
  type: project
  originSessionId: 557e4b75-5770-4e11-909f-945938cbe48a
  modified: 2026-08-31T00:32:40.656Z
---

Building a Todo List app in `c:\eduReact` (Vite + React 19 + JS) as a React learning exercise. [[user-react-beginner]]

**Structure (verified 2026-08-06):**
- `src/hooks/usePersistedReducer.js` — generic `usePersistedReducer(reducer, key, initialValue)` returning `[state, dispatch]`; wraps `useReducer` with a localStorage lazy initializer plus a saving `useEffect` keyed on `[state, key]`. Deliberately knows nothing about todos.
- `src/reducers/todoReducer.js` — `ADD` / `TOGGLE` / `REMOVE` / `CLEAR_COMPLETED` / `EDIT`, all actions flat-shaped (`action.todo`, `action.id`, `action.newText`) — no `payload` wrapper.
- `src/components/Todo/TodoApp.jsx` — calls the hook in one line, holds `filter` + `search` state, computes `visibleTodos` as a plain value (no `useMemo`), five named handlers.
- `TodoForm` / `TodoList` / `TodoItem` (inline edit, Enter saves, ESC cancels) / `TodoFilter` (search + all/active/completed) / `TodoFooter` (counts, clear-completed).

**Backlog from 2026-08-06 is fully done:** search wiring, TodoItem edit-state sync bug, ESC-to-cancel, `useMemo` (learned then deliberately removed — with only `todos`/`filter`/`search` in the component, it never skipped a computation), reducer action unification + `setTodos`→`dispatch` rename, `usePersistedReducer` extraction.

**Done since (as of 2026-08-28):** `useRef` refocus (60c371a). Vitest set up + 4 passing tests in `src/reducers/todoReducer.test.js`, all written by the user: 2 ADD (dc5f06e) + 2 TOGGLE incl. an `expect(result).not.toBe(state)` immutability check (8413c6d). Lessons taught via experiments: planted-bug tests ("tests only protect the inputs you feed them"), Vitest expected/received diffs, matchers (`toEqual` vs `toBe` === React's state-change check).

**Hybrid learning mode adopted 2026-08-28:** user was frustrated that React/JS expression syntax "won't stick", so we now do short pure-JS syntax drills in `drills/` (numbered files, run with `node`, TODO-style problems I author, user types answers) before resuming project work. Drill 01 (destructuring) done — it exposed a real gap: user didn't solidly have arrays-vs-objects ("칸에 이름이 있느냐 없느냐" framing landed well) and the rule "brackets on the LEFT of = unpack, on the RIGHT create". End each drill by finding the same pattern in their own code (TodoApp.jsx worked great for this). Future drills should have NO visible example answers (user called out that drill 01's problems 1/2 answered each other). User disabled Copilot ghost text for drills. Remaining of the 5-pattern list for drills: spread, functions-as-values, ternary, chaining — user asked for an arrays-vs-objects basics drill (02) before spread.

**2026-08-28 afternoon session:** reducer test suite COMPLETE — 7 tests, all user-written, incl. `toBe` for the default case (user chose it unprompted, with decoy action fields) (d416599). Drills 02–05 done/nearly done: 02 array-vs-object (incl. single-source-of-truth design debate — user pushed back well, chose "no-field-as-truth" B안 with `find`), 03 spread (references/이름표 metaphor landed; const protects the binding not the contents), 04 functions-as-values (fn vs fn(), callbacks, props — commit 989bad6). Drill 05 (ternary+chaining) problems 1,4,5 correct; **left as homework:** 문제2 needs the expression-vs-statement half of the answer, 문제3 used `completed: true` instead of `!todo.completed` (set vs flip — blind-spot callback), 문제6 (filter order question) unanswered. Drill 05 file NOT yet committed.

**2026-08-31: 5-pattern drill series COMPLETE** (drill 05 committed, 2980144). Homework review: user fixed set-vs-flip, invented "wrap statement in a function to make it a value" on their own for the expression-vs-statement question, got filter-order commutativity right.

**Next:** async step — plan: drill 06 (pure-JS async: setTimeout/Promise/await in node) BEFORE touching the app, then add fetch with loading/error state to the project. Also pending: install `eslint-plugin-react-hooks`. Metaphors that work for this user: 서랍장(이름 있는/번호뿐인), 이름표(참조), 요리법 vs 요리(fn vs fn()), 식=값이 되는 것 vs 문장.

**Why:** tasks are ranked by concept-learned-per-effort, not feature value, since the goal is learning React.

**How to apply:** keep giving one small step at a time and reviewing after each "했어". [[feedback-teach-principles-not-just-bugs]] [[user-react-beginner]]

**2026-09-15: 학습 모드에서 "완성" 모드로 전환.** 사용자가 "하나의 완성된 프로젝트로 만들어줘 (기능·디자인·UI/UX 전부)"라고 명시 요청 → 이번엔 내가 직접 전부 작성했다 (이전의 "사용자가 타이핑" 규칙은 이 요청에 한해 해제). 결과: 공책 괘선 디자인(종이/잉크/괘선 파랑/볼펜 파랑 액센트, 크림+세리프+테라코타는 의도적으로 버림), 라이트/다크/시스템 테마(`useTheme`), 추천 할 일 fetch(dummyjson, AbortController), 삭제 취소 토스트(`RESTORE`), `TOGGLE_ALL`, 진행률, 빈 상태, 접근성. 테스트 10개 통과. 커밋은 안 함(사용자 요청 없었음). `docs/screenshot.png`는 headless Chrome으로 찍음.

**2026-09-15 오후:** 사용자 요청으로 추천(fetch) 기능 삭제, 우선순위(high/normal/low, `SET_PRIORITY`, `sortByPriority`, 예전 데이터는 `priorityOf`로 normal 취급) 추가. 테스트 12개. 사용자가 "localStorage 대신 JSON 파일로 관리"를 검토 요청 — 브라우저만으로는 파일 쓰기 불가하므로 (a) JSON 내보내기/가져오기, (b) Vite dev 미들웨어로 `data/todos.json` 읽고 쓰기(서버 학습 단계), (c) File System Access API 중 택일 필요. 결정 대기.

**2026-09-15 저녁 (현재 구조):** 사용자가 A(localStorage) 확정 + "세련된 디자인" + 탭(대시보드/캘린더) 요청 → 전면 재구성. 공책 괘선 디자인은 버리고 옅은 회색 바탕 + 흰 시트 + 헤어라인 구조로. `App.jsx`가 셸(상태, URL 해시 탭, 내보내기/가져오기, 토스트), 탭은 `TodoPage` / `Dashboard`(SVG 차트, 라이브러리 없음) / `Calendar`. 데이터에 `dueDate`, `createdAt`, `completedAt` 추가, 리듀서에 `SET_DUE`/`IMPORT`, `normalizeTodo`(가져온 JSON 검증), `src/lib/stats.js`(날짜/집계, 테스트 있음). 테스트 20개. 우선순위 색은 dataviz 검증기 돌려서 단일 색상 램프(--chart-1/2/3) + 직접 라벨 + 범례. 스크린샷은 `docs/todos|dashboard|calendar.png`. 여전히 커밋 안 함.

**2026-09-15 밤:** "미래적·3D" 요청 → 기존 클래식은 그대로 두고 `src/skin-neo.css`가 `[data-skin="neo"]`에서 토큰/재질만 덮어쓰는 스킨 토글 추가(헤더 ◈ 버튼). `useTheme.js`는 `useRootAttr(attr, key, options)`로 일반화해 `useTheme`/`useSkin` 둘 다 거기서 나온다. 네오는 다크 전용이라 테마 버튼 숨김. `index.html`에 저장된 theme/skin을 React 전에 적용하는 인라인 스크립트(첫 화면 깜빡임 방지 — 헤드리스 스크린샷에서 트랜지션 시작 상태가 찍혀 발견). 스크린샷 `docs/neo-*.png`.

**2026-09-15 심야:** 상세 화면 추가 — `src/components/TodoDetail.jsx`, 네이티브 `<dialog>`(showModal, Esc/배경 클릭 닫기). todo에 `notes: [{id, category: backend|frontend|memo, text, createdAt}]`, 리듀서 `ADD_NOTE/EDIT_NOTE/REMOVE_NOTE`, `normalizeNote`(코드 공백 보존). 목록에서 제목이 버튼이 되어 클릭 → 상세(`App`의 `detailId`), 더블클릭 편집은 제거하고 "이름 수정" 버튼만 남김. 노트 본문은 고정폭 `pre-wrap` + 복사 버튼. 네오 스킨 입력칸을 움푹한 필드로 바꿈(사용자가 안 보인다고 함). 문구: placeholder "새 할 일 — 제목을 입력하고 Enter", 빈 상태 문구 손질. 테스트 22개. 헤드리스에서 dialog 여는 법: 같은 출처 iframe 페이지에서 `contentDocument.querySelector('.todo-item-text').click()`.

**2026-09-15 마무리 리뷰 반영:** 커밋 fd7fd1d 푸시 후 검토 → A(버그) 전부 + B 7·8·10 + D 적용. `usePersistedReducer(reducer, key, initial, sanitize)`로 로드 시 검증 + `storage` 이벤트로 다른 탭 동기화(내부 `@persisted/replace` 액션). `useNow()`(1분 interval)로 App/Dashboard/Calendar/TodoPage의 "오늘" 통일. 인라인 이름 수정 제거(상세에서만). 검색이 노트 본문도 봄. 캘린더/필터 ARIA를 `aria-pressed`로 단순화. dialog cleanup, 복사 실패 표시, "최근 7일 완료" 라벨. GitHub Pages: `.github/workflows/deploy.yml`(configure-pages enablement:true), `vite.config.js` `base: process.env.BASE_PATH ?? '/'`. Git Bash에서 BASE_PATH 확인할 땐 `MSYS_NO_PATHCONV=1` 필요. 남은 후보: 모바일 항목 2줄, 드래그 정렬, 하위 할 일, 태그, 컴포넌트 테스트, package.json name/version.

**2026-09-15 저녁 2:** 대시보드·캘린더 → 목록 연결. 해시 쿼리 `#todos?filter=active|completed&due=overdue|today|week|later|none|YYYY-MM-DD&priority=high|normal|low&done=7d|YYYY-MM-DD`. `App.jsx` `useHash()`가 `{tab, params, hash}` 반환, `TodoPage key={hash}`로 조건 바뀌면 재마운트. `stats.js`에 `dueBucketOf`/`DUE_BUCKETS`/`DUE_LABEL`(대시보드 집계와 목록 필터가 같은 기준). 대시보드 타일·차트 막대·누적 막대·범례·마감 칸이 전부 `<a>`. 캘린더: 선택일 "목록에서 보기", 헤더 "마감 없음 N". 목록 위 `.todo-scope` 칩 + "조건 지우기"(href="#todos"). 캘린더 그리드 `minmax(0,1fr)` + `.cal-cell{min-width:0}` — 긴 제목이 열을 밀던 버그(KIPA 데이터로 발견).

**2026-09-15 밤 2 (기능 확장 3종, 커밋 예정):** ① 하위 체크리스트 `todo.subtasks[{id,text,done}]` — `ADD/TOGGLE/EDIT/REMOVE_SUBTASK`, `subtaskProgress()`, 목록에 `☑ 2/3`. ② 태그 `todo.tags[]` — 폼에서 `#태그` 파싱(`parseTags`), `SET_TAGS`, 상세 `TagEditor`, 목록 칩(`tagHref` in lib/linkify.js), 해시 `tag=`로 목록·대시보드(`#dashboard?tag=x`, Dashboard가 params prop 받음) 필터. ③ 노트 자동 링크 `lib/linkify.js`(URL 항상, `r\d{3,}`는 설정 `revUrl` 템플릿 있을 때) — `Settings.jsx` 다이얼로그, `useLocalState('revUrl')`. 테스트 31개. 헤드리스에서 상세 dialog 클릭 캡처는 두 번째부터 계속 실패 — 시간 쓰지 말 것.

**2026-09-15 밤 3: 태그 색.** `src/lib/tags.js` — 이름 해시(31진) → 4색 고정 배정, `tagClass()`/`tagHref()`(linkify.js에서 옮김). 칩 = 잉크색 글자 + 색 점 + 옅은 배경(`color-mix(in oklab, var(--tag) 13%, var(--tag-base, var(--sheet)))`), 네오는 `--sheet`가 반투명이라 `--tag-base: #101628` 로 덮음. 팔레트는 dataviz 검증기 `--pairs all` 통과: 라이트 `#2a78d6,#eb6834,#1baf7a,#c2185b`, 다크/네오 `#3987e5,#e0703a,#2aa87d,#b83a6b`. 테스트 34개.

**팔레트 교훈 (다음에 색 고를 때):** ① 글자색으로 쓰면 WCAG 4.5:1 때문에 다 어두워져 색끼리 구분이 죽는다 → 색은 점·배경 같은 **채움**으로 옮기고 글자는 잉크색 유지. ② `--pairs all`(태그처럼 순서가 없는 경우)은 5색부터 급격히 어려워짐 — 4색이 현실적 상한. ③ 보라↔파랑, 초록↔자홍(deutan)이 항상 먼저 깨진다. ④ 다크는 밝기 밴드가 좁음(0.48–0.67). ⑤ CSS `[class*="tag-c"]` 는 `tag-chip` 자신에도 걸린다 — `:is(.tag-c0,…)` 로 쓸 것.

**2026-09-15 밤 4: 태그 색 해시 버그.** 사용자가 '잔여'·'개선' 두 태그를 달았는데 같은 색으로 나옴. 원인은 `h*31+c` 뒤 `%4` — 하위 2비트만 보는데 그 비트가 입력 글자의 하위 비트에 끌려가고, 한글 음절은 코드포인트 하위 2비트가 치우쳐 있다(한글 20개 중 12개가 같은 색, 한 색은 0개). FNV-1a + murmur3 fmix32 마무리로 교체 → 20개 기준 6/4/6/4, 2000개 기준 470/543/489/498. 회귀 테스트 `tagColorIndex는 한글 태그를 고르게 나눈다` 추가(예전 해시로 되돌리면 실패하는 것 확인함). **교훈: 해시를 작은 수로 나눌 거면 마무리(avalanche)가 필수이고, 분포 테스트는 실제 쓰는 문자셋(여기선 한글)으로 짜야 한다.**

**2026-09-15 밤 5: 색 기준 토글 + 태그 색 직접 선택 + 정렬 수정.**
- `ColorByToggle.jsx` — 대시보드·캘린더 공용, `useLocalState('colorBy','priority')`. 태그 모드에서 대시보드는 `countByTag(active)` 누적 막대(숫자는 안 넣음 — 밝은 색 위 흰 글자 문제, 개수는 범례가 듦), 캘린더는 칩 **왼쪽 선만** 태그 색(`seg-tag`를 쓰면 배경 전체가 칠해져 글자가 안 보임).
- 태그 색 직접 선택: `tagColorIndex(tag, overrides)`, `useLocalState('tagColors',{})`, `hooks/useTagColors.js` context(목록→항목 4단계라 props 대신), `Settings.jsx`에 태그별 스와치 4개 + "자동".
- `sortByPriority`가 완료 항목을 뒤로 보내도록 수정. 사용자가 "우선순위 클릭하면 할일 상태도 변경된다"고 했는데 **데이터는 안 바뀌었고**(probe로 확인: `2/normal/DONE`→`2/high/DONE`), 완료 항목이 맨 위로 튀어서 그렇게 보인 것.
- 테스트 38개.

**헤드리스 캡처 함정 2개 (다음에 시간 낭비 말 것):** ① `public/`에 프로브·시드 HTML을 만들면 **Vite가 전체 새로고침**을 걸어 React 상태(열린 다이얼로그 등)가 지워진다 → 파일 만든 뒤 `sleep 4` 하고 실행할 것. ② 그래도 `<dialog>.showModal()`은 iframe 안에서 `--screenshot`에 안 잡힌다(top layer). 다이얼로그는 스크린샷 대신 `--dump-dom` 으로 검증할 것.

**2026-09-15 밤 6:** 캘린더 하단 선택일 목록에도 태그 칩 표시(`tagHref` + `useTagClass`, 목록 화면과 동일한 칩). 테스트 38개 유지.

**2026-09-15 밤 7: 체크박스 의미 분리 + 일괄 작업 + 순환→드롭다운.**
- 네모 체크박스 = **선택**(화면 상태, 저장 안 함), 동그란 ✓ `DoneButton` = 완료. 캘린더 날짜 목록·상세 화면의 완료 체크박스도 전부 `DoneButton` 으로 교체 — 체크박스가 완료를 뜻하는 곳을 없앴다.
- `BulkBar.jsx`: 완료 처리/취소 · 우선순위 일괄 · 삭제(되돌리기) · 선택 해제. 리듀서 `SET_COMPLETED_MANY`(토글 아닌 지정) · `SET_PRIORITY_MANY` · `REMOVE_MANY` · `RESTORE_MANY`(index 오름차순 삽입). `TOGGLE_ALL` 은 "전체 선택 + 일괄 완료"로 대체되어 제거.
- 필터 줄 체크박스 = 보이는 항목 전체 선택, 일부만 고르면 `indeterminate`(ref 로 설정).
- 클릭 순환 UI를 전부 드롭다운으로: 항목 우선순위(목록·캘린더), 머리글 테마·스킨(`useTheme` 이 `[value, setValue]` 반환, `THEMES`/`SKINS` export). `.priority-btn`·`.skin-btn`·`.theme-btn` CSS 삭제.
- 테스트 39개.

**oxlint react(purity) 함정:** 컴포넌트 본문 함수 안의 `Date.now()` 는 그 함수가 **props 로 직접 전달될 때만** 핸들러로 인정된다. `onX={() => fn(true)}` 처럼 화살표로 감싸면 "렌더 중 호출"로 오탐한다 → JSX 안에 인라인 화살표로 dispatch 하면 깨끗해진다.

**2026-09-15 밤 8: 드롭다운 디자인 손질.** 줄마다 브라우저 기본 화살표가 붙어 목록이 시끄럽고 머리글 셀렉트가 옆 글자 버튼들과 안 맞는다는 지적 → ① `.todo-item .priority-select` 는 `appearance:none` + 알약 칩 모양(화살표 없음, hover 때 테두리로 눌린다는 걸 알림), 높음일 때만 `--high-soft` 배경 ② `.header-select` 는 테두리 없이 ghost-btn 과 같은 결(hover 때 `--sheet-2`) ③ 일괄 막대 셀렉트는 높이 28px 로 옆 버튼과 맞춤. 폼(추가 줄·상세·설정)의 셀렉트는 기본 화살표 유지 — 폼 문맥에선 그게 맞다.

**localStorage 저장 형식이 두 가지다 (스크린샷 시드 짤 때 두 번 틀림):** `theme`·`skin` 은 `useRootAttr` 가 **원시 문자열**로 읽고 쓴다(`index.html` 인라인 스크립트도 동일). `colorBy`·`tagColors`·`revUrl`·`todos` 는 `useLocalState`/`usePersistedReducer` 라 **JSON**. 시드할 때 `localStorage.setItem('skin','neo')` vs `setItem('colorBy', JSON.stringify('tag'))`.

**2026-09-15 밤 9: 드롭다운 "목록 칸" 스타일.** 사용자가 원한 건 닫힌 버튼이 아니라 **열렸을 때 나오는 목록**이었다. 네이티브 목록은 CSS가 안 먹으므로 표준 customizable select 사용 — `select, ::picker(select) { appearance: base-select }` + `::picker(select)` 에 둥근 모서리·토큰 색·그림자, `option` 에 라운드/hover/checked, `option::checkmark { display:none }`, `select:open::picker-icon { rotate(180deg) }`. 이 Chrome은 지원 확인함(`CSS.supports('appearance','base-select')===true`). Firefox·Safari 는 `@supports` 밖이라 기본 목록.

**함정 3개:** ① `appearance:none` 이 있는 선택자(`.todo-item .priority-select`, `.header-select`)는 특이도가 높아 `select{base-select}` 를 이기므로, @supports 안에서 같은 선택자로 `base-select` 를 다시 주고 `::picker-icon{display:none}` 으로 화살표만 숨겨야 한다. ② **빌드의 lightningcss 가 `::picker(select) option` 을 파싱 못 한다**("Pseudo-elements can't be followed by selectors") → `option` 을 단독으로 쓸 것(닫힌 버튼은 `<selectedcontent>` 라 영향 없음). ③ `showPicker()` 는 사용자 조작이 필요해서 **헤드리스로 목록을 열어 캡처할 수 없다**(NotAllowedError) — 적용 여부는 `getComputedStyle(sel).appearance === 'base-select'` 와 빌드된 CSS grep 으로 확인할 것.

**2026-09-15 밤 10: 머리글 정렬 + 드롭다운 흔들림.**
- `.header-select` 가 `height:32px` + `text-align:center` + 1px 투명 테두리라 `.ghost-btn`(padding 으로 33px)과 글자 줄이 안 맞았다 → `padding:6px 10px; border:none; font:inherit; line-height:1.5; align-items:center` 로 맞춤. 측정 결과 머리글 5개 컨트롤 전부 `y=40 h=33 중심=56.5` 일치.
- 열린 목록이 호버 때 움직이던 것도 같이 해소(셀렉트 박스가 호버로 변하면 앵커가 움직여 팝오버가 따라간다). `::picker(select)` 의 `margin-block-start` 제거(앵커 팝오버에 margin 은 자리 부족 시 튕김 유발) + `min-width: anchor-size(width)`.
- 줄 안 우선순위 목록은 아래 공간이 150px 남아도 Chrome 이 **위로** 연다. `position-area`/`position-try-fallbacks` 로도 안 바뀜 — 브라우저 배치라 그대로 둠.

**헤드리스로 네이티브 위젯 검증하는 법 (중요):** `showPicker()` 는 사용자 조작이 필요해 JS 로는 못 연다. **CDP 를 쓰면 진짜 클릭을 보낼 수 있다** — Chrome 을 `--remote-debugging-port=9222` 로 띄우고, Node 22 의 내장 `WebSocket` 으로 `/json` → `webSocketDebuggerUrl` 접속 → `Input.dispatchMouseEvent`(mousePressed/mouseReleased) → `Runtime.evaluate` 로 측정 → `Page.captureScreenshot`. 의존성 0. 스크래치패드의 `cdp.mjs`/`cdp3.mjs`/`try.mjs` 참고(세션 끝나면 사라짐). 다음 실행 전 Escape 를 보내 이전 팝오버를 닫을 것 — 안 그러면 클릭이 토글로 먹혀 닫힌다.

**2026-09-15 밤 11: 한국 공휴일 + placeholder 잘림.**
- `src/lib/holidays.js` — 양력 고정일과 **대체공휴일은 규칙으로 계산**, 음력 기준일(설날/추석/부처님오신날)만 2025~2030 표. 웹 검색으로 날짜를 확인함(기억에 의존하지 않음). 캘린더 칸에 빨간 날짜 + 이름, 선택일 제목에도 표시.
- 규칙: 설날·추석 연휴는 **일요일**과 겹칠 때만 대체(토요일 제외), 나머지 대상은 토·일이거나 **다른 공휴일과 겹칠 때**. 신정·현충일은 국경일이 아니라 **대체 대상 아님**. **제헌절은 2026년부터 공휴일로 재지정**(2026-04-28 국무회의). 겹친 날은 이름을 '·'로 이음(2028-10-03 = 추석·개천절 → 개천절 대체 10/5).
- 구현 함정: 날짜별로 묶어서 계산해야 한다. 처음에 순서대로 put 하니 2025 어린이날+부처님오신날, 2028 추석+개천절이 틀렸다. 대체공휴일은 **원래 공휴일을 다 넣은 뒤, 날짜 오름차순으로** 자리를 잡아야 서로 겹치지 않는다.
- placeholder "새 할 일 — 제목을 입력하고 Enter (끝에 #태그 가능)" 가 칸 폭보다 길어 잘렸다 → "할 일을 입력하고 Enter" 로 줄이고 #태그 설명은 `title` 로.
- 테스트 49개.

**날짜 같은 사실은 검색으로 확인할 것:** 음력 공휴일은 기억이 틀린다. 실제로 한 출처가 2028 부처님오신날을 5/5 로 줬는데 음력 계산상 5/2 가 맞았고, 다른 출처로 5/2 확인됨. 두 출처 이상 대조할 것.

**2026-09-15 밤 12: 모바일 붕괴 수정 + 죽은 코드 정리.**
- 390px 에서 머리글이 무너져 제목이 한 글자씩 세로로 쌓이고 가로로 잘렸다. 원인은 `.header-actions { flex-shrink: 0 }` — 세션 내내 버튼을 5개까지 늘리면서 그대로 뒀다. `.app-header{flex-wrap:wrap}` + `.brand{min-width:0}` + `.header-actions{flex-wrap:wrap}` 로 해결. 스크린샷을 720px 이상으로만 찍어서 못 봤다 — **좁은 폭도 같이 찍을 것**.
- 할 일 줄도 제목 칸이 ~96px 밖에 안 남아 한 단어씩 끊겼다. `.todo-item-main`(체크·완료·제목) / `.todo-item-meta`(태그·마감·우선순위) 로 묶고, ≤560px 에서 main 을 `flex: 1 0 100%` 로.
- **CSS 함정 둘**: ① `flex: 1 1 100%` 는 줄바꿈 대신 **줄어든다** — 줄을 넘기려면 `flex: 1 0 100%`(shrink 0). ② 미디어 쿼리를 파일 앞쪽에 두면 **뒤에 오는 같은 특이도의 기본 규칙에 진다**. `.todo-item-main{flex:1}` 이 뒤에 있어서 무시됐다 → 좁은 화면 블록은 **파일 끝**에 둘 것(App.css 에 주석으로 적어 둠).
- 죽은 export 제거: `LUNAR_YEARS`, `todayHoliday`, `useTagColorIndex`, `normalizeTags`(내부 함수로).

**2026-09-15 밤 13: 태그 색 자유 선택 + 상세의 작업 경로 칸.**
- 태그 색이 4개로 부족하다는 요청 → `tagColors` 값이 **hex 문자열**이 됨(`{ 태그: '#7b2ff7' }`). 예전 판의 0..3 숫자도 계속 읽는다. `tagStyle(tag, overrides)` 가 `{className, style}` 을 돌려주고(자동이면 테마별 `tag-cN` 클래스, 직접 고르면 `tag-custom` + 인라인 `--tag`), `useTagClass` → `useTagStyle` 로 교체(4곳). 설정은 스와치 4개 대신 `<input type="color">` + "자동".
- 상세 상단에 `todo.path`(작업 화면 경로) 칸 + 복사 버튼. 리듀서 `SET_PATH`, `normalizeTodo` 에서 검증. 고정폭 글꼴.
- 테스트 55개.

**앞서 헤맨 것 두 가지 (도구 쪽):** ① `Page.navigate` 를 **같은 해시 URL**로 부르면 문서를 다시 읽지 않는다(프래그먼트 이동) → 시드한 localStorage 가 반영 안 돼 "데이터가 안 불러와진다"고 오판했다. `Page.reload({ignoreCache:true})` 를 쓸 것. ② `<dialog onClose>` 는 **프로그램이 close() 해도 불린다** → StrictMode 이중 효과의 정리(close())가 onClose 를 호출해 다이얼로그가 즉시 닫혔다. 사용자 닫기는 `onCancel` 로 받을 것.

**2026-09-15 밤 14: 스킨 3종 추가 + 기기 연동 조사.**
- 연동: 사용자가 **A안(수동 내보내기/가져오기)** 유지 결정. 조사 결론 — 자동 동기화는 서버가 필요하고, 권한: B(내 GitHub 비공개 저장소 + fine-grained 토큰, Contents R/W 한 저장소만; Gist 는 fine-grained 미지원이라 classic 토큰 필요해서 저장소 쪽이 안전) / C(Supabase 무료 500MB·2프로젝트지만 **1주 미사용 시 일시정지**). 어느 쪽이든 먼저 `updatedAt` + last-write-wins + tombstone 이 필요하다(지금 IMPORT 는 새 id 만 추가하고 기존 항목을 갱신하지 않음). 데이터에 회사 내부 정보가 있어 보안 판단이 선행.
- `src/skins.css` 신설 — 종이(크림·세리프)·터미널(초록 인광·고정폭·`--radius:0`·제목 앞 `>`)·고대비(순흑백·2px 테두리·3px 포커스). 네오는 재질까지 바꿔 분량이 커서 `skin-neo.css` 유지.
- **스킨의 태그 색은 새로 만들지 않고 검증 통과한 세트를 재사용**한다(밝은 바탕=라이트 세트, 어두운 바탕=다크 세트). 터미널용 ANSI 초록/주황을 시도했다가 deutan 에서 깨져서 버렸다.
- `--radius` 로 안 덮이는 알약·원형(`border-radius:999px|50%`)은 터미널에서 `:is(...)` 목록으로 따로 각지게 해야 한다.
- `index.html` 의 깜빡임 방지 스크립트도 `s !== 'classic'` 으로 일반화(전에는 'neo' 만).
