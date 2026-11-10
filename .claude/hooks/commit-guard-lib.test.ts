import { describe, expect, it } from 'vitest'
import { isCommitCommand } from './commit-guard-lib'

describe('isCommitCommand', () => {
  it('단독 git commit 명령을 커밋으로 판정한다', () => {
    expect(isCommitCommand('git commit -m "feat: 추가"')).toBe(true)
  })

  it('&&로 이어진 명령 뒤쪽의 git commit을 판정한다', () => {
    expect(isCommitCommand('git add . && git commit -m "x"')).toBe(true)
  })

  it('git 전역 옵션이 commit 앞에 있어도 판정한다', () => {
    expect(isCommitCommand('git -C . commit -m "x"')).toBe(true)
  })

  it('커밋이 아닌 git 명령은 판정하지 않는다', () => {
    expect(isCommitCommand('git status')).toBe(false)
  })

  it('commit-tree 같은 다른 서브커맨드는 판정하지 않는다', () => {
    expect(isCommitCommand('git commit-tree HEAD^{tree}')).toBe(false)
  })

  it('문자열 인자에 git commit이 들어 있는 다른 명령은 판정하지 않는다', () => {
    expect(isCommitCommand('echo "git commit"')).toBe(false)
  })
})
