import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import { addPromptHistory } from './utils/promptHistory';
import {
  STORAGE_KEYS,
  parseProvider,
  parseString,
  parseStringArray,
} from './utils/storage';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = usePersistentState(STORAGE_KEYS.apiKey, '', parseString);
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = usePersistentState<Provider>(
    STORAGE_KEYS.provider,
    'google',
    parseProvider,
  );
  const [promptHistory, setPromptHistory] = usePersistentState<string[]>(
    STORAGE_KEYS.promptHistory,
    [],
    parseStringArray,
  );
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    setPromptHistory((prev) => addPromptHistory(prev, prompt));
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;

  return (
    <div className="app">
      <header className="menubar">
        <div className="menubar-brand">
          <span className="brand-mark" aria-hidden="true">
            RC
          </span>
          <h1>React 컴포넌트 생성기</h1>
        </div>
        <div className="menubar-status" aria-label="현재 작업 상태">
          <span>
            Provider <strong>{activeProvider}</strong>
          </span>
          <span>
            컴포넌트 <strong>{components.length}</strong>
          </span>
        </div>
      </header>

      <main className="workspace">
        <section className="window composer-panel" aria-label="컴포넌트 생성">
          <div className="titlebar">
            <span className="titlebar-box" aria-hidden="true" />
            <span className="titlebar-title">새 컴포넌트</span>
          </div>
          <div className="window-body">
            <p className="intro">
              요청을 입력하면 React 컴포넌트를 만들고, 바로 미리보기와 코드로 확인할 수 있습니다.
            </p>
            <PromptInput
              onGenerate={handleGenerate}
              isLoading={isLoading}
              history={promptHistory}
            />
          </div>
        </section>

        <aside className="window settings-panel" aria-label="실행 설정">
          <div className="titlebar">
            <span className="titlebar-box" aria-hidden="true" />
            <span className="titlebar-title">제어판</span>
          </div>
          <div className="window-body">
            <div className="provider-select">
              <label htmlFor="provider">Provider</label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as Provider)}
              >
                {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="api-key-input">
              <label htmlFor="api-key">API Key</label>
              <div className="api-key-field">
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    hasEnvKey
                      ? '서버 키 사용 중 (직접 입력으로 덮어쓰기 가능)'
                      : PROVIDER_CONFIG[provider].placeholder
                  }
                />
                <button
                  className="btn-toggle-key"
                  onClick={() => setShowKey(!showKey)}
                  type="button"
                >
                  {showKey ? '숨기기' : '보기'}
                </button>
              </div>
              <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
                <span className="key-led" aria-hidden="true" />
                {hasEnvKey
                  ? '.env 키가 연결되어 있습니다.'
                  : '직접 입력하거나 서버 환경변수를 설정하세요.'}
              </p>
            </div>
          </div>
        </aside>
      </main>

      {error && (
        <div className="error-banner" role="alert">
          <span className="error-icon" aria-hidden="true">
            !
          </span>
          <p>{error}</p>
        </div>
      )}

      <section className="results-section">
        {components.length > 0 && (
          <div className="results-header">
            <h2>생성된 컴포넌트</h2>
            <button className="btn-clear" onClick={clearAll}>
              전체 삭제
            </button>
          </div>
        )}

        {components.length === 0 && !isLoading && (
          <div className="window empty-state">
            <div className="titlebar">
              <span className="titlebar-box" aria-hidden="true" />
              <span className="titlebar-title">결과 폴더</span>
            </div>
            <div className="empty-body">
              <div className="empty-icon" aria-hidden="true">
                <span className="empty-folder" />
              </div>
              <div className="empty-copy">
                <h2>폴더가 비어 있습니다.</h2>
                <p>만들고 싶은 UI를 입력해 생성하면, 결과가 여기에 창으로 쌓입니다.</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="window loading-card" role="status">
            <div className="titlebar">
              <span className="titlebar-box" aria-hidden="true" />
              <span className="titlebar-title">생성 중</span>
            </div>
            <div className="window-body">
              <p>컴포넌트를 생성하고 있습니다...</p>
              <div className="progress" aria-hidden="true">
                <div className="progress-fill" />
              </div>
            </div>
          </div>
        )}

        <div className="results-grid">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
