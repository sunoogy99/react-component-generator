// 순수 함수만 둔다 (vitest/Node에서 테스트되므로 Bun.*, process.env 의존 금지)
export function shouldRemind(filePath: string): boolean {
  return /\.tsx?$/.test(filePath)
}

export function buildReminder(filePath: string): string {
  return [
    `[TDD 리마인더] ${filePath} 를 수정하려고 합니다. .claude/rules/tdd.md 규칙을 지키고 있는지 확인하세요.`,
    '- 이 수정에 대응하는 실패 테스트(RED)를 먼저 작성하고, 실행해서 "기능 미구현"으로 실패하는 것을 확인했는가?',
    '- 프로덕션 코드는 테스트를 통과시키는 최소한(YAGNI)만 작성하는가?',
    '- 테스트보다 프로덕션 코드를 먼저 썼다면 그 코드를 삭제하고 RED부터 다시 시작해야 한다. 주석 처리나 참고용 보관도 금지다.',
    '- 타입 정의, 설정 파일, 로직 없는 순수 UI는 TDD 예외다. 버그 수정은 재현 테스트가 먼저다.',
  ].join('\n')
}
