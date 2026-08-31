---
name: feedback-teach-principles-not-just-bugs
description: "User wants React's underlying model explained, not just bug-fix/naming reviews"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 557e4b75-5770-4e11-909f-945938cbe48a
  modified: 2026-08-06T00:43:28.814Z
---

On 2026-08-06 the user said that after several rounds of step-by-step code review they still didn't understand how React actually works ("이렇게 해도 아직 react 동작 원리를 잘 모르겠네"). The reviews up to that point had been mostly bug fixes, naming, and style — useful, but they taught JavaScript hygiene rather than React's mental model.

**Why:** the user's goal is learning React, not shipping the todo app. Correct-but-shallow feedback lets them fix each symptom without ever building the model that would let them predict behavior on their own.

**How to apply:** teach in the order "개념 하나 → 그 개념이 드러나는 실험 → 지금 코드에서 확인". Anchor explanations in the render loop (state 변경 → 컴포넌트 함수 재실행 → JSX는 화면이 아니라 설명서 → 리액트가 차이만 DOM에 반영), since `useState` 초기값, 불변성, `key`, `useMemo` all fall out of it. Prefer runnable experiments they can observe over prose — e.g. `console.log` at the top of `TodoApp`/`TodoItem`, then type one character in the search box and watch every component function re-run. Keep using their own code as the teaching material. Still keep steps small and review after each "했어". [[user-react-beginner]] [[project-todo-app]]
