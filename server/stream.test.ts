import { describe, it, expect } from 'vitest';
import { parseSseChunk, extractAnthropicText, extractGoogleText } from './stream';

describe('parseSseChunk', () => {
  it('완성된 이벤트의 data만 추출하고 나머지는 rest로 돌려준다', () => {
    const buffer = 'event: a\ndata: {"x":1}\n\ndata: {"x":2}\n\ndata: {"x"';
    expect(parseSseChunk(buffer)).toEqual({
      data: ['{"x":1}', '{"x":2}'],
      rest: 'data: {"x"',
    });
  });

  it('CRLF 구분자도 처리한다', () => {
    expect(parseSseChunk('data: hi\r\n\r\n')).toEqual({ data: ['hi'], rest: '' });
  });

  it('data 줄이 없는 이벤트는 건너뛴다', () => {
    expect(parseSseChunk('event: ping\n\n')).toEqual({ data: [], rest: '' });
  });
});

describe('extractAnthropicText', () => {
  it('text_delta 이벤트에서 텍스트를 꺼낸다', () => {
    const data = JSON.stringify({
      type: 'content_block_delta',
      delta: { type: 'text_delta', text: 'const A' },
    });
    expect(extractAnthropicText(data)).toBe('const A');
  });

  it('텍스트가 없는 이벤트는 빈 문자열을 반환한다', () => {
    expect(extractAnthropicText(JSON.stringify({ type: 'message_start' }))).toBe('');
  });

  it('error 이벤트는 에러를 던진다', () => {
    const data = JSON.stringify({ type: 'error', error: { type: 'overloaded_error' } });
    expect(() => extractAnthropicText(data)).toThrow('Claude API error');
  });
});

describe('extractGoogleText', () => {
  it('parts의 텍스트를 이어 붙인다', () => {
    const data = JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'foo' }, { text: 'bar' }] } }],
    });
    expect(extractGoogleText(data)).toBe('foobar');
  });

  it('finishReason이 MAX_TOKENS면 에러를 던진다', () => {
    const data = JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'x' }] }, finishReason: 'MAX_TOKENS' }],
    });
    expect(() => extractGoogleText(data)).toThrow('너무 길어');
  });

  it('candidates가 없으면 빈 문자열을 반환한다', () => {
    expect(extractGoogleText('{}')).toBe('');
  });
});
