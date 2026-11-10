import { describe, expect, it } from 'vitest'
import { buildReminder, shouldRemind } from './tdd-reminder-lib'

describe('shouldRemind', () => {
  it('.ts 파일이면 리마인드한다', () => {
    expect(shouldRemind('server/generator.ts')).toBe(true)
  })

  it('.tsx 파일이면 리마인드한다', () => {
    expect(shouldRemind('src/components/PromptInput.tsx')).toBe(true)
  })

  it('Windows 경로 구분자여도 판정한다', () => {
    expect(shouldRemind('C:\\proj\\src\\App.tsx')).toBe(true)
  })

  it('.ts/.tsx가 아닌 파일은 리마인드하지 않는다', () => {
    expect(shouldRemind('README.md')).toBe(false)
  })

  it('확장자가 .tsx로 시작만 하는 파일은 리마인드하지 않는다', () => {
    expect(shouldRemind('notes.tsx.bak')).toBe(false)
  })
})

describe('buildReminder', () => {
  it('대상 파일 경로와 tdd.md 규칙 위치를 포함한다', () => {
    const text = buildReminder('server/generator.ts')
    expect(text).toContain('server/generator.ts')
    expect(text).toContain('.claude/rules/tdd.md')
  })

  it('RED 선행과 프로덕션 코드 삭제 규칙을 상기시킨다', () => {
    const text = buildReminder('server/generator.ts')
    expect(text).toContain('RED')
    expect(text).toContain('삭제')
  })
})
