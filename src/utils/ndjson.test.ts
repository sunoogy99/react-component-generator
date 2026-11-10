import { describe, it, expect } from 'vitest';
import { readNdjsonStream } from './ndjson';

function streamOf(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
      controller.close();
    },
  });
}

describe('readNdjsonStream', () => {
  it('줄 단위 JSON을 순서대로 콜백에 전달한다', async () => {
    const events: unknown[] = [];
    await readNdjsonStream(streamOf(['{"a":1}\n{"a":2}\n']), (e) => events.push(e));
    expect(events).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it('청크 경계에서 잘린 줄을 이어 붙인다', async () => {
    const events: unknown[] = [];
    await readNdjsonStream(streamOf(['{"a":', '1}\n{"a"', ':2}\n']), (e) => events.push(e));
    expect(events).toEqual([{ a: 1 }, { a: 2 }]);
  });

  it('개행 없이 끝난 마지막 줄도 처리한다', async () => {
    const events: unknown[] = [];
    await readNdjsonStream(streamOf(['{"a":1}']), (e) => events.push(e));
    expect(events).toEqual([{ a: 1 }]);
  });
});
