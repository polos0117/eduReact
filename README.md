# 할 일

오늘의 할 일을 적고, 지우고, 한눈에 보는 작은 앱. React를 처음 배우면서 만든 프로젝트입니다.

| 할 일 | 대시보드 | 캘린더 |
|---|---|---|
| ![할 일 목록](docs/todos.png) | ![대시보드](docs/dashboard.png) | ![캘린더](docs/calendar.png) |

## 기능

**할 일**
- 추가 · 완료 · 삭제. 제목·우선순위·마감일 편집은 상세 화면에서
- 삭제 직후 6초 안에 되돌리기
- 우선순위 높음 · 보통 · 낮음 — 추가할 때 고르거나 항목의 표시를 눌러 순환, 높은 것부터 정렬
- 마감일 — 지나면 빨갛게
- 전체 / 진행중 / 완료 보기, 검색(제목과 노트 본문), 전체 완료 토글, 완료 진행률
- **상세 화면** — 제목을 누르면 열림. 제목·우선순위·마감일 편집, 그리고 **백엔드 / 프론트엔드 / 메모**로 나뉜 노트 목록. 코드·경로·링크를 붙여 넣으면 줄바꿈과 들여쓰기가 그대로 보존되고(고정폭), 노트마다 복사·수정·삭제. Ctrl+Enter로 추가, Esc로 닫기

![상세 화면](docs/detail.png)

**대시보드**
- 남은 할 일 · 완료율 · 높음 우선순위 · 최근 7일 완료
- 최근 14일 날짜별 완료 막대 차트
- 남은 할 일의 우선순위 분포
- 마감 현황 (지남 · 오늘 · 이번 주 · 그 이후 · 없음)

**캘린더**
- 월 단위로 마감일별 할 일 표시, 날짜를 누르면 그 날 목록과 바로 추가
- 오늘로 이동, 이전/다음 달

**저장과 이동**
- 할 일과 테마는 브라우저 `localStorage`에 자동 저장. 읽을 때 검증하고, 다른 탭에서 바꾼 내용도 바로 반영
- JSON 내보내기 / 가져오기 — 백업하거나 다른 기기로 옮길 때. 가져오기는 이미 있는 항목은 두고 새 것만 합침
- 라이트 / 다크 / 시스템 테마
- 스킨 두 가지 — 클래식(흰 시트, 헤어라인)과 네오(우주 배경, 유리 패널, 네온, 3D). 헤더의 ◈ 버튼으로 전환. 네오는 어두운 톤 전용
- 키보드만으로 조작 가능, 스크린리더 레이블, `prefers-reduced-motion` 존중

차트는 라이브러리 없이 SVG로 그립니다. 의존성은 `react`, `react-dom` 둘뿐입니다.

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
  reducers/
    todoReducer.js          ADD · TOGGLE · TOGGLE_ALL · REMOVE · RESTORE · CLEAR_COMPLETED · EDIT · SET_PRIORITY · SET_DUE
                            · ADD_NOTE · EDIT_NOTE · REMOVE_NOTE · IMPORT
                            + 우선순위 정렬, 가져온 JSON 정규화(normalizeTodo)
    todoReducer.test.js
  lib/
    stats.js                날짜 키, 날짜별 완료 수, 우선순위 집계, 마감 분류, 달력 칸 생성
    stats.test.js
  components/
    Todo/
      TodoPage.jsx          "할 일" 탭 — 필터·검색 상태, 액션 dispatch
      TodoForm.jsx          입력 + 마감일 + 우선순위
      TodoFilter.jsx        전체 완료 · 보기 탭 · 검색
      TodoList.jsx / TodoItem.jsx
      TodoFooter.jsx        진행률, 완료 항목 지우기
    TodoDetail.jsx          상세 <dialog> — 제목/우선순위/마감일, 분류별 노트 목록과 추가 폼
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
  "notes": [
    { "id": 1757900000001, "category": "backend", "text": "POST /api/auth/login", "createdAt": 1757900000001 }
  ] }
```

`priority`·`dueDate`·`completedAt`·`notes`는 없을 수 있습니다(예전 데이터). 없으면 보통 / 마감 없음 / 시각 모름 / 노트 없음으로 봅니다. `notes[].category`는 `backend` · `frontend` · `memo`.

## 배운 것

`drills/`의 01–06은 프로젝트를 만들며 막혔던 JS 문법을 따로 떼어 연습한 파일입니다: 구조 분해, 배열과 객체, 스프레드, 값으로서의 함수, 삼항과 체이닝, 비동기.
