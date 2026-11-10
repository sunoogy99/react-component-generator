import { useEffect, useRef } from 'react';

interface StreamingCardProps {
  prompt: string;
  code: string;
}

export function StreamingCard({ prompt, code }: StreamingCardProps) {
  const blockRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const block = blockRef.current;
    if (block) block.scrollTop = block.scrollHeight;
  }, [code]);

  return (
    <div className="window component-card streaming-card">
      <div className="titlebar">
        <span className="titlebar-box" aria-hidden="true" />
        <span className="titlebar-title" title={prompt}>
          {prompt}
        </span>
        <span className="titlebar-time">생성 중</span>
      </div>
      <div className="card-tabs" role="tablist">
        <button role="tab" aria-selected={false} className="tab" disabled>
          미리보기
        </button>
        <button role="tab" aria-selected={true} className="tab tab--active">
          코드
        </button>
      </div>
      <div className="card-content">
        <div className="code-panel">
          {code ? (
            <pre className="code-block" ref={blockRef}>
              <code>{code}</code>
              <span className="stream-caret" aria-hidden="true" />
            </pre>
          ) : (
            <div className="streaming-wait" role="status">
              <p>응답을 기다리는 중...</p>
              <div className="progress" aria-hidden="true">
                <div className="progress-fill" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
