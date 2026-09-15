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
