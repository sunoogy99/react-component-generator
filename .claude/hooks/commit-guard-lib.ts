// 순수 함수만 둔다 (vitest/Node에서 테스트되므로 Bun.*, process.env 의존 금지)
const COMMIT_SEGMENT = /^git(\s+-\S+(\s+\S+)?)*\s+commit(\s|$)/

export function isCommitCommand(command: string): boolean {
  return command
    .split(/&&|\|\||[;|\n]/)
    .some((segment) => COMMIT_SEGMENT.test(segment.trim()))
}
