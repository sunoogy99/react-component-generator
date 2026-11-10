// PreToolUse 훅: git commit 직전에 `bun run test`를 실행하고, 실패하면 커밋을 차단한다.
// 종료 코드 2 = 차단 (stderr가 에이전트에게 전달된다). Bun으로 실행된다.
import { isCommitCommand } from './commit-guard-lib'

const input = JSON.parse(await Bun.stdin.text()) as {
  cwd?: string
  tool_input?: { command?: string }
}

const command = input.tool_input?.command ?? ''
if (!isCommitCommand(command)) process.exit(0)

const proc = Bun.spawn(['bun', 'run', 'test'], {
  cwd: input.cwd ?? process.cwd(),
  stdout: 'pipe',
  stderr: 'pipe',
})
const [stdout, stderr, exitCode] = await Promise.all([
  new Response(proc.stdout).text(),
  new Response(proc.stderr).text(),
  proc.exited,
])

if (exitCode === 0) process.exit(0)

const tail = (stdout + stderr).split('\n').slice(-40).join('\n')
console.error(`테스트가 실패해 커밋을 차단했습니다. 테스트를 모두 통과시킨 뒤 다시 커밋하세요.\n\n${tail}`)
process.exit(2)
