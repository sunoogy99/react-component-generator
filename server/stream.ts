// 업스트림 SSE 스트림을 파싱하는 순수 함수들. 부수효과가 없어 단위 테스트가 가능하다.

/** SSE 버퍼에서 완성된 이벤트의 data 페이로드를 꺼내고, 미완성 꼬리는 rest로 돌려준다. */
export function parseSseChunk(buffer: string): { data: string[]; rest: string } {
  const events = buffer.replace(/\r\n/g, '\n').split('\n\n');
  const rest = events.pop() ?? '';
  const data: string[] = [];

  for (const event of events) {
    const lines = event
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart());
    if (lines.length > 0) data.push(lines.join('\n'));
  }

  return { data, rest };
}

/** Anthropic 스트림 이벤트(JSON)에서 텍스트 델타를 꺼낸다. */
export function extractAnthropicText(data: string): string {
  const event = JSON.parse(data) as {
    type: string;
    delta?: { type: string; text?: string };
  };

  if (event.type === 'error') {
    throw new Error('Claude API error: stream');
  }

  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
    return event.delta.text ?? '';
  }
  return '';
}

/** Gemini 스트림 청크(JSON)에서 텍스트를 꺼낸다. 토큰 한도로 잘리면 에러를 던진다. */
export function extractGoogleText(data: string): string {
  const chunk = JSON.parse(data) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  };

  const candidate = chunk.candidates?.[0];
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new Error('생성된 코드가 너무 길어 잘렸습니다. 더 간단한 컴포넌트를 요청해주세요.');
  }

  return candidate?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
}
