import { describe, expect, it } from 'vitest';
import { addPromptHistory, MAX_HISTORY } from './promptHistory';

describe('addPromptHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addPromptHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('중복 프롬프트는 맨 앞으로 옮기고 하나만 남긴다', () => {
    expect(addPromptHistory(['a', 'b'], 'b')).toEqual(['b', 'a']);
  });

  it(`최대 ${MAX_HISTORY}개까지만 유지한다`, () => {
    const full = Array.from({ length: MAX_HISTORY }, (_, i) => `p${i}`);
    const next = addPromptHistory(full, 'new');
    expect(next).toHaveLength(MAX_HISTORY);
    expect(next[0]).toBe('new');
  });
});
