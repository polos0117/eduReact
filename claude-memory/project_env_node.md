---
name: project-env-node
description: eduReact 실행 환경 — 시스템 Node 16은 못 쓰고 fnm의 Node 22를 PATH에 넣어야 vite/vitest가 돈다
metadata:
  type: project
---

이 PC의 시스템 Node는 v16.13.1 (`C:\Program Files\nodejs`)이고 다른 프로젝트가 쓰므로 건드리지 않는다. 2026-09-15에 fnm(winget `Schniz.fnm`)으로 Node 22.23.2를 따로 설치했다.

**Why:** Vite 8 / Vitest 4 / React 19는 Node 20+ 필요. npm 8로 설치하면 rolldown 네이티브 바이너리가 빠지고, npm 10은 vitest optional peer에서 arborist 크래시가 나서 `.npmrc`에 `legacy-peer-deps=true`를 뒀다.

**How to apply:** Bash 툴에서 명령 앞에 `export PATH="/c/Users/jjshs/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH"`를 붙인다 (셸 상태가 유지되지 않으므로 매번). 사용자 터미널에는 PowerShell 프로필에 `fnm env --use-on-cd | Out-String | Invoke-Expression` 한 줄을 넣으면 `.node-version`으로 자동 전환된다 — 아직 사용자가 넣었는지 미확인. [[project-todo-app]]
