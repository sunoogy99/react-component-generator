import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

describe('usePersistentState', () => {
  beforeEach(() => localStorage.clear());

  it('저장된 값이 있으면 초기값으로 복원한다', () => {
    localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    expect(result.current[0]).toBe('saved');
  });

  it('값을 바꾸면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    act(() => result.current[1]('next'));
    expect(JSON.parse(localStorage.getItem('k')!)).toBe('next');
  });

  it('parse 함수로 저장값을 변환해 복원한다', () => {
    localStorage.setItem('k', JSON.stringify('bad'));
    const { result } = renderHook(() =>
      usePersistentState('k', 'good', (raw) => (raw === 'ok' ? 'ok' : 'good')),
    );
    expect(result.current[0]).toBe('good');
  });
});
