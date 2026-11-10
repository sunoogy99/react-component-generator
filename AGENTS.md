# AGENTS.md

## Operational Commands

- 패키지 매니저는 `bun` 고정. npm/yarn/pnpm 사용 금지 (`bun.lock` 기준).
- 개발 서버(API + Vite 동시): `bun run dev`
- API 서버만: `bun run server` (포트 3002)
- 테스트: `bun run test` (vitest). `bun test`(Bun 내장 러너)는 사용 금지: `vite.config.ts`의 jsdom/setupFiles 설정이 적용되지 않는다.
- 단일 테스트: `bunx vitest run server/generator.test.ts`
- 린트: `bun run lint`
- 빌드(타입체크 포함): `bun run build`
- 커밋 보호 훅: `git commit`(Bash/PowerShell) 직전에 `.claude/hooks/commit-guard.ts`가 `bun run test`를 실행하고, 실패하면 커밋을 차단한다. 훅을 우회(`--no-verify`로 인한 우회 시도, 훅 설정 제거·완화)하지 않는다. 훅 수정은 사용자의 명시적 승인이 필요하다.
- TDD 리마인더 훅: `.ts`/`.tsx`를 Edit/Write하기 직전에 `.claude/hooks/tdd-reminder.ts`가 `.claude/rules/tdd.md` 준수 여부를 확인하라는 프롬프트를 주입한다(차단하지 않음). 리마인더를 받으면 RED 선행 여부를 점검하고, 훅을 제거·완화하지 않는다.
- 변경 후 완료 선언 전에 `bun run test`, `bun run lint`, `bun run build`를 실행한다.

## Golden Rules

### Immutable

- 서버가 `.env`의 키 값을 클라이언트로 반환하지 않는다. `/api/config`는 boolean만 반환한다 (`server/index.ts:147-153`). 키 값을 응답, 로그, 에러 메시지에 넣지 않는다.
- Google 호출은 API 키를 URL 쿼리(`?key=`)로 전달한다 (`server/index.ts:99`). 이 URL을 로그나 에러 메시지에 포함하지 않는다.
- 사용자가 UI에 입력한 `apiKey`는 새로고침 후에도 유지되도록 `localStorage`(`rcg:apiKey`)에 저장한다 (`src/App.tsx`, `src/utils/storage.ts`). 서버로는 요청 본문으로만 보내고, 로그/에러 메시지/URL에 넣지 않는다. 이 저장은 사용자 결정으로 허용된 예외다(XSS 시 유출 위험 인지).
- `.env`는 커밋하지 않는다 (`.gitignore`). 키 이름 추가 시 `.env.example`도 함께 수정한다.
- 민감 파일은 에이전트가 읽거나 수정하지 않는다. `.claude/settings.json`의 `permissions.deny`로 차단되어 있다.
  - 대상: `.env`, `.env.local`, `.env.*.local`, `.env.development|production|test`, 이름에 `credential`/`secret`이 들어간 파일, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `.npmrc`, `.netrc`, SSH 키(`id_rsa*`, `id_ed25519*`), `~/.ssh`, `~/.aws`, `~/.config/gcloud`.
  - `.env.example`은 값이 없는 템플릿이므로 예외로 읽고 수정할 수 있다.
  - Read/Edit뿐 아니라 셸(`cat`, `Get-Content`, `grep`, `cp`, `rm`, `printenv` 등)로 우회해서 읽거나 내용을 출력하지 않는다. 차단 규칙에 걸리지 않는 우회 경로라도 금지다.
  - 키 값이 필요한 작업은 사용자에게 직접 설정을 요청한다. 값을 대화, 로그, 커밋에 옮기지 않는다.
  - deny 규칙을 완화하거나 제거하는 수정은 사용자의 명시적 승인 없이 하지 않는다.

### Do's and Don'ts

- Do: 포트 3002는 `server/index.ts:139`와 `vite.config.ts:11`(proxy target) 두 곳에 있다. 하나를 바꾸면 반드시 다른 쪽도 바꾼다.
- Do: `Provider` 타입이 `src/types/index.ts:1`과 `server/index.ts:57`에 각각 선언되어 있다. 프로바이더를 추가하면 두 곳, `ENV_KEYS`, `/api/config`, `src/App.tsx`의 선택 UI를 함께 수정한다.
- Do: 생성 코드는 react-live `noInline` 모드로 실행된다 (`src/components/LivePreview.tsx:15`). `render(<Component />)` 호출이 없으면 미리보기가 비어 있으므로, 이 보정(`ensureRenderCall`)과 시스템 프롬프트의 "call render(...)" 규칙(`server/index.ts:12`)을 둘 다 유지한다.
- Do: 시스템 프롬프트는 TypeScript 문법과 import 문을 금지한다 (`server/index.ts:11,20`). react-live가 순수 JS만 실행하고 `React`를 전역으로 제공하기 때문이다. 프롬프트를 수정할 때 이 제약을 제거하지 않는다.
- Don't: `server/generator.ts`, `server/fallback.ts`에 `Bun.*` 또는 `process.env` 의존을 넣지 않는다. 이 파일들은 vitest(Node)에서 테스트되며 부수효과가 없어야 한다 (`server/generator.ts:1-2`).
- Don't: 에러 분기는 메시지 문자열에 `503`/`429`가 포함되는지로 판정한다 (`server/index.ts:194,201`). 업스트림 에러 메시지 형식(`... API error: <status>`, `index.ts:85,112`)을 바꾸면 상태 코드 매핑이 깨진다.

### Asymmetry

- Google 경로에만 모델 폴백(`GOOGLE_MODELS`, `withModelFallback`)과 `MAX_TOKENS` 잘림 검사가 있다 (`server/index.ts:5,123,134-136`). Anthropic 경로(`callAnthropic`, `index.ts:68-96`)에는 없다. 한쪽을 수정할 때 다른 쪽에도 필요한지 판단한다.

### Test Boundary

- 테스트가 있는 곳: `server/generator.ts`, `server/fallback.ts`, `src/components/PromptInput.tsx`. 순수 함수는 테스트 파일을 같은 위치에 `*.test.ts(x)`로 추가한다.
- 테스트가 없는 곳: `server/index.ts`(라우팅, 외부 API 호출), `src/App.tsx`, `src/hooks/useComponentGenerator.ts`. 이 영역을 수정하면 가능한 로직을 순수 함수로 분리해 테스트하고, 외부 API는 실제 호출하지 않는다.

## Project Context

- 프롬프트로 React 컴포넌트를 생성하고 미리보기/코드를 보여주는 도구.
- Stack: React 19, TypeScript, Vite, Bun(API 서버), react-live, vitest, Testing Library.

## Context Map

- **[프론트엔드 수정 (React/Vite)](./src/AGENTS.md)** — 컴포넌트, 훅, 스타일, 프론트 테스트 작업 시.
- **[API 서버 수정 (Bun)](./server/AGENTS.md)** — 라우팅, AI 프로바이더 호출, 폴백, 서버 테스트 작업 시.

## Standards and References

- 사용법과 기능 설명은 `README.md` 참조.
- 커밋 메시지: `<type>: <한국어 요약>` (type: feat, fix, refactor, chore). 요약은 마침표 없이 50자 안팎.
- Maintenance Policy: 규칙과 코드가 어긋난 것을 발견하면 이 파일의 수정을 제안한다.
