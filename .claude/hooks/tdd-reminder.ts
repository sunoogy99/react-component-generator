// PreToolUse 훅: .ts/.tsx 파일을 생성·수정하기 직전에 TDD 규칙 리마인더를 에이전트 컨텍스트로 주입한다.
// 차단하지 않는다(종료 코드 0). Bun으로 실행된다.
import { buildReminder, shouldRemind } from './tdd-reminder-lib'

const input = JSON.parse(await Bun.stdin.text()) as {
  tool_input?: { file_path?: string }
}

const filePath = input.tool_input?.file_path ?? ''
if (!shouldRemind(filePath)) process.exit(0)

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      additionalContext: buildReminder(filePath),
    },
  }),
)
