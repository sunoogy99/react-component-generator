# server/AGENTS.md

## Module Context

Bun 런타임에서 실행되는 AI API 프록시. `index.ts`가 `Bun.serve`로 라우팅과 외부 API 호출을 맡고, `generator.ts`/`fallback.ts`는 순수 함수만 둔다.

## Tech Stack and Constraints

- 외부 API 호출은 내장 `fetch`만 사용한다 (`index.ts:69,101`). SDK나 axios를 추가하지 않는다.
- 서버 진입점은 `bun --watch run server/index.ts`. 테스트는 Node 환경의 vitest가 실행한다 (`vite.config.ts` `test.include`에 `server/**/*.test.ts`).

## Implementation Patterns

- 새 로직은 `index.ts`에 추가하지 말고, 테스트 가능한 순수 함수로 별도 파일에 만든 뒤 `index.ts`에서 import한다 (`generator.ts`, `fallback.ts` 방식).
- 모든 `Response`에 `CORS_HEADERS`를 붙인다 (`index.ts:51-55`). 에러 응답과 404 포함, 누락된 분기가 없어야 한다.
- 새 엔드포인트는 `fetch` 핸들러(`index.ts:140`) 안에서 `method`와 `pathname`을 함께 검사하는 기존 패턴을 따른다.

## Testing Strategy

- 실행: `bunx vitest run server/`
- 테스트 파일은 대상 파일 옆에 `<name>.test.ts`로 둔다 (`fallback.test.ts`, `generator.test.ts`).
- 외부 API는 호출하지 않는다. 폴백 로직은 `attempt` 콜백을 stub으로 넘겨 검증한다 (`withModelFallback` 시그니처).

## Local Golden Rules

- Do: `stripCodeFences`는 응답에 섞인 ```` ``` ```` 펜스를 정규식으로 제거한다 (`generator.ts:5-10`). 모델이 시스템 프롬프트의 "no markdown fences" 지시를 어겨도 이 보정이 있어야 하므로, 프롬프트와 보정 중 한쪽만 믿고 다른 쪽을 제거하지 않는다.
- Do: Google 모델 우선순위는 `GOOGLE_MODELS` 배열 순서다 (`index.ts:5`). 모델 교체는 이 배열에서만 하고, `callGoogleModel` 내부에 모델명을 하드코딩하지 않는다.
- Don't: `withModelFallback`은 어떤 에러든 다음 모델로 넘어가고 마지막 에러만 던진다 (`fallback.ts:13-19`). 인증 오류(401/403)도 재시도되므로, 에러 종류별 분기가 필요하면 이 함수가 아니라 `attempt` 안에서 처리한다.
- Don't: `Anthropic` 모델 ID는 `index.ts:77`에 하드코딩되어 있다. 변경하면 에러 메시지·README의 모델 설명과 어긋나는지 확인한다.
