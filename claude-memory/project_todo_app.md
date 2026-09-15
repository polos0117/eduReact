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
