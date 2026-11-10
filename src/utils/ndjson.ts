/** NDJSON 응답 본문을 줄 단위로 읽어 파싱한 객체를 콜백에 전달한다. */
export async function readNdjsonStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: unknown) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const flushLine = (line: string) => {
    if (line.trim()) onEvent(JSON.parse(line));
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    lines.forEach(flushLine);
  }

  flushLine(buffer + decoder.decode());
}
