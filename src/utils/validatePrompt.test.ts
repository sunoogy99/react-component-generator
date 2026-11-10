import { describe, it, expect } from 'vitest';
import { validatePrompt } from './validatePrompt';

describe('validatePrompt', () => {
  it('500자 이하면 유효하다', () => {
    expect(validatePrompt('가'.repeat(500)).valid).toBe(true);
  });

  it('501자 이상이면 길이 초과 에러 메시지와 함께 유효하지 않다', () => {
    const result = validatePrompt('가'.repeat(501));
    expect(result.valid).toBe(false);
    expect(result.error).toBe('프롬프트는 500자를 넘을 수 없습니다.');
  });

  it('앞뒤 공백은 길이에 포함하지 않는다', () => {
    expect(validatePrompt(`  ${'가'.repeat(500)}  `).valid).toBe(true);
  });
});
