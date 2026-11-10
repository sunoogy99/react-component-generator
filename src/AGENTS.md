# src/AGENTS.md

## Module Context

Vite로 번들되는 브라우저 프론트엔드. 서버와는 상대 경로 `/api/*` 요청으로만 통신한다. 루트 `AGENTS.md`의 보안/프로바이더 규칙을 전제로 한다.

## Tech Stack and Constraints

- TypeScript strict. `erasableSyntaxOnly`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters` 활성 (`tsconfig.app.json:15,19-21`).
  - `enum`, `namespace`, 생성자 파라미터 프로퍼티를 쓰지 않는다.
  - 타입만 가져올 때는 `import type`을 쓴다 (`App.tsx:5`, `ComponentCard.tsx:2`).
- 스타일은 CSS 파일(`App.css`, `index.css`)과 클래스명으로 관리한다. CSS-in-JS, Tailwind 등을 도입하지 않는다. (생성 컴포넌트의 inline style 규칙은 서버 시스템 프롬프트의 것이며 이 앱 UI와 무관하다.)
- ESLint는 `react-hooks`, `react-refresh/only-export-components`를 적용한다 (`eslint.config.js:14-15`). 컴포넌트 파일에서 컴포넌트 외 값을 export하지 않는다.

## Implementation Patterns

- 컴포넌트는 named export + `<Name>Props` 인터페이스 (`CodeView.tsx`, `ComponentCard.tsx`). `App`만 default export (`main.tsx:4`).
- 서버 호출과 목록 상태는 `hooks/useComponentGenerator.ts`에 모은다. 컴포넌트에서 `/api/generate`를 직접 `fetch`하지 않는다. 예외는 마운트 시 `/api/config` 조회 하나뿐이다 (`App.tsx:24-29`).
- UI 문구와 접근성 이름(aria-label, role)은 한국어를 쓴다.
- 창 형태 UI는 `window` > `titlebar`(+ `titlebar-box`, `titlebar-title`) > 본문 구조를 따른다 (`App.tsx:68-79`, `ComponentCard.tsx:24-31`). 새 패널도 같은 구조로 만든다.

## Testing Strategy

- 실행: `bunx vitest run src/`
- 환경은 jsdom, 각 테스트 후 `cleanup()`이 자동 호출된다 (`src/test/setup.ts:5-7`). 테스트에서 수동 cleanup을 추가하지 않는다.
- 쿼리는 role과 접근성 이름으로 한다 (`PromptInput.test.tsx:9,18`). 사용자 입력은 `userEvent.setup()`을 쓴다 (`:14`).
- 테스트 파일은 대상 컴포넌트 옆에 `<Name>.test.tsx`로 둔다.

## Local Golden Rules

- Do: 미리보기 새로고침은 `LivePreview`에 `key={previewKey}`를 바꿔 리마운트하는 방식이다 (`ComponentCard.tsx:35,72`). 애니메이션 컴포넌트를 처음부터 다시 그리기 위한 동작이므로 상태 초기화 로직으로 바꾸지 않는다.
- Do: `provider`를 항상 요청 본문에 명시해 보낸다 (`useComponentGenerator.ts:26`). 클라이언트 기본값은 `'google'`(`App.tsx:16`)이지만 서버 기본값은 `'anthropic'`(`server/index.ts:161`)이라, 생략하면 의도와 다른 프로바이더가 호출된다.
- Do: 프로바이더를 바꾸면 입력한 `apiKey`를 비운다 (`App.tsx:41-44`). 다른 회사 키가 잘못된 서버로 전송되는 것을 막는 동작이므로 유지한다.
- Do: 재생성은 `onRegenerate`로 `handleGenerate`를 다시 호출하며 프롬프트 문자열만 전달한다 (`App.tsx:192`, `ComponentCard.tsx:43`). 현재 `apiKey`/`provider` 상태를 쓰므로 카드에 키나 프로바이더를 저장하지 않는다.
- Do: 키 누락 검사는 클라이언트(`App.tsx:34`)와 서버(400 응답, `server/index.ts:169`) 양쪽에 있다. 한쪽을 제거하지 않는다.
- Don't: `/api/...`는 상대 경로로만 호출한다 (`useComponentGenerator.ts:20`, `App.tsx:25`). `localhost:3002`를 직접 쓰면 Vite 프록시를 우회해 배포 환경에서 깨진다.
- Don't: `generate`는 에러를 던지지 않고 `error` 상태로 변환한다 (`useComponentGenerator.ts:44-47`). 호출부에서 `try/catch`나 `.catch`를 추가해 중복 처리하지 않는다.
- Don't: 버튼 라벨 `컴포넌트 생성`, `생성 중...`은 테스트가 접근성 이름으로 조회한다 (`PromptInput.test.tsx:9,18,27`). 문구를 바꾸면 테스트도 함께 수정한다.
- Test Boundary: `PromptInput` 외 컴포넌트(`ComponentCard`, `CodeView`, `LivePreview`), 훅, `App`에는 테스트가 없다. 해당 파일의 동작을 바꾸면 테스트를 새로 추가한다.
