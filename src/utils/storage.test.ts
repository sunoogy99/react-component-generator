import { beforeEach, describe, expect, it } from 'vitest';
import { readStorage, writeStorage, parseComponents, parseProvider } from './storage';

describe('readStorage / writeStorage', () => {
  beforeEach(() => localStorage.clear());

  it('저장한 값을 그대로 읽는다', () => {
    writeStorage('k', { a: 1 });
    expect(readStorage('k', null)).toEqual({ a: 1 });
  });

  it('키가 없으면 fallback을 반환한다', () => {
    expect(readStorage('missing', 'fb')).toBe('fb');
  });

  it('깨진 JSON이면 fallback을 반환한다', () => {
    localStorage.setItem('k', '{broken');
    expect(readStorage('k', 'fb')).toBe('fb');
  });
});

describe('parseComponents', () => {
  it('createdAt 문자열을 Date로 복원한다', () => {
    const raw = [{ id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-01T00:00:00.000Z' }];
    const [item] = parseComponents(raw);
    expect(item.createdAt).toBeInstanceOf(Date);
    expect(item.createdAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('형식이 잘못된 항목은 버린다', () => {
    const raw = [{ id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-01T00:00:00.000Z' }, { id: 2 }, null];
    expect(parseComponents(raw)).toHaveLength(1);
  });

  it('배열이 아니면 빈 배열을 반환한다', () => {
    expect(parseComponents({})).toEqual([]);
  });
});

describe('parseProvider', () => {
  it('유효한 provider는 그대로 반환한다', () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
  });

  it('알 수 없는 값은 google로 대체한다', () => {
    expect(parseProvider('openai')).toBe('google');
  });
});
