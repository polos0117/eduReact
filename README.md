# 할 일

오늘의 할 일을 적고, 지우고, 한눈에 보는 작은 앱. React를 처음 배우면서 만든 프로젝트입니다.

| 할 일 | 대시보드 | 캘린더 |
|---|---|---|
| ![할 일 목록](docs/todos.png) | ![대시보드](docs/dashboard.png) | ![캘린더](docs/calendar.png) |

## 기능

**할 일**
- 추가 · 삭제. 제목·마감일 편집은 상세 화면에서
- **네모 체크박스는 "선택", 동그란 ✓ 버튼이 "완료"** — 체크가 곧 완료가 아니다
- **일괄 작업** — 하나라도 고르면 막대가 떠서 완료 처리 / 완료 취소 / 우선순위 일괄 변경 / 삭제(되돌리기 가능). 필터 줄의 체크박스로 보이는 항목 전체 선택(일부만 고르면 중간 표시)
- 삭제 직후 6초 안에 되돌리기
- 우선순위 높음 · 보통 · 낮음 — 추가할 때, 또는 항목의 드롭다운에서 골라서. 정렬은 완료한 것을 뒤로 보낸 다음 우선순위 순
- 마감일 — 지나면 빨갛게
- 전체 / 진행중 / 완료 보기, 검색(제목과 노트 본문), 전체 완료 토글, 완료 진행률
- **태그** — 제목 끝에 `#kipa #개인`처럼 붙이면 태그로 분리. 상세에서 편집, 목록의 태그 칩을 누르면 그 태그만, 대시보드도 태그별로. 태그마다 **색**이 붙습니다 — 기본은 이름 해시로 자동 배정이고, 설정에서 태그별로 직접 고를 수 있습니다. 색은 네 가지뿐인데, 색각 이상에서도 서로 구분되는 한도가 거기까지라서입니다(dataviz 검증기 전체 쌍 통과). 태그가 더 많으면 색이 겹치지만 이름이 함께 보이므로 구분에는 지장이 없습니다
- **하위 체크리스트** — 상세에서 항목을 추가·체크·수정·삭제. 목록에 `☑ 2/3` 진행 표시
- **상세 화면** — 제목을 누르면 열림. 제목·우선순위·마감일·태그 편집, 하위 항목, 그리고 **백엔드 / 프론트엔드 / 메모**로 나뉜 노트 목록. 코드·경로·링크를 붙여 넣으면 줄바꿈과 들여쓰기가 그대로 보존되고(고정폭), 노트마다 복사·수정·삭제. Ctrl+Enter로 추가, Esc로 닫기
- **노트 자동 링크** — `https://…`는 항상 링크, `r5074` 같은 커밋 번호는 설정(헤더 "설정")에 링크 형식(`https://svn.example.com/rev/{n}`)을 넣으면 링크

![상세 화면](docs/detail.png)

**대시보드**
- 숫자·차트 막대·마감 칸을 누르면 그 조건으로 걸러진 할 일 목록으로 이동 (`#todos?filter=active&due=overdue` 같은 해시라 북마크·뒤로가기 가능). 목록 위에 조건 칩과 "조건 지우기"
- 남은 할 일 · 완료율 · 높음 우선순위 · 최근 7일 완료
- 최근 14일 날짜별 완료 막대 차트
- 남은 할 일 분포 — **우선순위 / 태그** 중 골라서 (캘린더와 같은 설정을 씁니다)

![태그 기준 대시보드](docs/dashboard-tag.png)
- 마감 현황 (지남 · 오늘 · 이번 주 · 그 이후 · 없음)

**캘린더**
- 월 단위로 마감일별 할 일 표시, 날짜를 누르면 그 날 목록과 바로 추가 (목록에 태그·노트 개수도 함께)
- 선택한 날의 "목록에서 보기", 헤더의 "마감 없음 N" → 할 일 목록으로
- 칩 색을 **우선순위 / 태그** 중 선택
- **한국 공휴일 표시** — 날짜가 빨갛게, 칸에 이름이 뜹니다(설날·추석 연휴, 부처님오신날, 대체공휴일 포함)
- 오늘로 이동, 이전/다음 달

**저장과 이동**
- 할 일과 테마는 브라우저 `localStorage`에 자동 저장. 읽을 때 검증하고, 다른 탭에서 바꾼 내용도 바로 반영
- JSON 내보내기 / 가져오기 — 백업하거나 다른 기기로 옮길 때. 가져오기는 이미 있는 항목은 두고 새 것만 합침
- 라이트 / 다크 / 시스템 테마 — 머리글 드롭다운에서 선택
- 스킨 두 가지 — 클래식(흰 시트, 헤어라인)과 네오(우주 배경, 유리 패널, 네온, 3D). 머리글 ◈ 드롭다운에서 선택. 네오는 어두운 톤 전용이라 테마 선택은 숨겨진다
- 키보드만으로 조작 가능, 스크린리더 레이블, `prefers-reduced-motion` 존중

차트는 라이브러리 없이 SVG로 그립니다. 의존성은 `react`, `react-dom` 둘뿐입니다.

드롭다운 목록 칸도 앱 색과 둥근 모서리에 맞춰 직접 그립니다 — 표준 기능(customizable select, `appearance: base-select`)이라 `<select>`의 키보드 동작과 접근성은 그대로입니다. 이 기능이 없는 브라우저(현재 Firefox·Safari)에서는 브라우저 기본 목록이 나옵니다.

## 실행

Node 20 이상이 필요합니다. 프로젝트에 `.node-version`이 있어서 [fnm](https://github.com/Schniz/fnm)이나 nvm이 자동으로 버전을 맞춥니다.

```sh
npm install     # .npmrc가 legacy-peer-deps를 켜 둡니다 (npm 10 + vitest peer 버그 우회)
npm run dev     # http://localhost:5173
npm run build   # dist/
npm test        # vitest (watch)
npm run test:run
npm run lint    # oxlint
```

## 배포

`main`에 푸시하면 [deploy.yml](.github/workflows/deploy.yml)이 테스트 → 빌드 → GitHub Pages 배포를 합니다.
공개 주소: https://polos0117.github.io/eduReact/
처음 한 번은 저장소 **Settings → Pages → Build and deployment → Source**를 "GitHub Actions"로 바꿔야 합니다 (워크플로 토큰은 Pages를 만들 권한이 없음).
빌드 시 `BASE_PATH=/eduReact/`를 주므로 로컬 개발 주소는 그대로 `/`입니다.

## 구조

```
src/
  main.jsx                  진입점
  App.jsx                   셸 — 상태(useReducer + localStorage), 헤더, 탭(URL 해시), 내보내기/가져오기, 토스트
  index.css                 색 토큰(라이트/다크), 리셋, 포커스
  App.css                   시트·목록·대시보드·캘린더 스타일 (클래식)
  skin-neo.css              [data-skin="neo"]일 때 토큰과 재질만 덮어쓰는 네오 스킨
  hooks/
    usePersistedReducer.js  useReducer + localStorage (읽을 때 sanitize, 다른 탭 변경은 storage 이벤트로 반영)
    useNow.js               1분마다 갱신되는 현재 시각 — 자정 넘겨도 "오늘"이 맞게
    useTheme.js             useRootAttr — <html data-*> 속성을 localStorage와 묶어 순환 (useTheme, useSkin)
    useLocalState.js        작은 설정값용 useState + localStorage
    useTagColors.js         고른 태그 색을 트리 전체에 전달하는 context
  reducers/
    todoReducer.js          ADD · TOGGLE · TOGGLE_ALL · REMOVE · RESTORE · CLEAR_COMPLETED · EDIT · SET_PRIORITY · SET_DUE · SET_TAGS
                            · ADD/EDIT/REMOVE_NOTE · ADD/TOGGLE/EDIT/REMOVE_SUBTASK · IMPORT
                            · 일괄: SET_COMPLETED_MANY · SET_PRIORITY_MANY · REMOVE_MANY · RESTORE_MANY
                            + 우선순위 정렬, 가져온 JSON 정규화(normalizeTodo), parseTags, subtaskProgress
    todoReducer.test.js
  lib/
    stats.js                날짜 키, 날짜별 완료 수, 우선순위 집계, 마감 분류, 달력 칸 생성
    stats.test.js
    holidays.js             한국 공휴일 — 양력 고정일과 대체공휴일은 계산, 음력 기준일만 표
    holidays.test.js
    linkify.js              노트의 URL·r번호를 링크 조각으로
    linkify.test.js
    tags.js                 태그 색 배정(이름 해시 → 4색), 태그 링크 주소
    tags.test.js
  components/
    Todo/
      TodoPage.jsx          "할 일" 탭 — 필터·검색 상태, 액션 dispatch
      TodoForm.jsx          입력 + 마감일 + 우선순위
      TodoFilter.jsx        전체 완료 · 보기 탭 · 검색
      TodoList.jsx / TodoItem.jsx
      TodoFooter.jsx        진행률, 완료 항목 지우기
    TodoDetail.jsx          상세 <dialog> — 제목/우선순위/마감일/태그, 하위 항목, 분류별 노트 목록과 추가 폼
    Settings.jsx            설정 <dialog> — 태그 색 고르기, 커밋 번호 링크 형식
    ColorByToggle.jsx       대시보드·캘린더 공용 색 기준 전환
    Dashboard.jsx           통계 타일, SVG 막대 차트, 우선순위 누적 막대, 마감 현황
    Calendar.jsx            월 달력, 선택한 날 목록과 추가
drills/                     학습용 순수 JS 연습 문제 (node drills/01-destructuring.js)
```

상태는 `App` 한 곳에서 `useReducer`로 관리하고, 각 탭은 `todos`와 `dispatch`를 props로 받습니다. 리듀서와 통계 함수는 순수 함수라 테스트가 쉽습니다.

### 데이터 모양

```json
{ "id": 1757900000000, "text": "로그인 API 연동", "completed": false,
  "priority": "high", "dueDate": "2026-09-18",
  "createdAt": 1757900000000, "completedAt": 1757950000000,
  "tags": ["kipa"],
  "subtasks": [{ "id": 1757900000002, "text": "JWT 발급", "done": true }],
  "notes": [
    { "id": 1757900000001, "category": "backend", "text": "POST /api/auth/login", "createdAt": 1757900000001 }
  ] }
```

`priority`·`dueDate`·`completedAt`·`tags`·`subtasks`·`notes`는 없을 수 있습니다(예전 데이터). 없으면 보통 / 마감 없음 / 시각 모름 / 없음으로 봅니다. `notes[].category`는 `backend` · `frontend` · `memo`.

### 공휴일

양력 고정일(신정·삼일절·어린이날·현충일·제헌절·광복절·개천절·한글날·성탄절)과 **대체공휴일은 규칙으로 계산**합니다.
연도별로 적어 두면 틀리기 쉬워서, 바뀌지 않는 것만 표로 뒀습니다 — 음력 기준일(설날·추석·부처님오신날)이며 **2025~2030년** 범위입니다.
그 밖의 해는 양력 고정일만 나옵니다. 임시공휴일·선거일처럼 그때그때 정해지는 날은 담지 않습니다.

대체공휴일 규칙: 설날·추석 연휴는 **일요일**과 겹칠 때만, 나머지 대상 공휴일은 토·일이거나 다른 공휴일과 겹칠 때 다음 첫 평일로.
신정과 현충일은 국경일이 아니라 대체공휴일 대상이 아닙니다. 제헌절은 2026년에 공휴일로 재지정되었습니다.
`holidays.test.js`가 2025·2026·2028년 전체를 공표된 날짜와 대조합니다.

## 배운 것

`drills/`의 01–06은 프로젝트를 만들며 막혔던 JS 문법을 따로 떼어 연습한 파일입니다: 구조 분해, 배열과 객체, 스프레드, 값으로서의 함수, 삼항과 체이닝, 비동기.
