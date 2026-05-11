import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Editor from '@monaco-editor/react';
import './styles.css';

const starter = {
  html: `<section class="world-card">
  <p class="tag">BIGBANG v0.1</p>
  <h1>UD Singularity</h1>
  <p>One point expanding into the Universal Dragon AI universe.</p>
  <button onclick="ignite()">Ignite BigBang</button>
  <div id="signal">Awaiting spark...</div>
</section>`,
  css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at center, #291000, #050505 55%);
  color: #fff7ed;
  font-family: system-ui, sans-serif;
}

.world-card {
  width: min(90vw, 560px);
  padding: 32px;
  border: 1px solid rgba(255, 128, 0, 0.45);
  border-radius: 28px;
  background: rgba(0, 0, 0, 0.65);
  box-shadow: 0 0 50px rgba(255, 90, 0, 0.25);
}

.tag {
  color: #ffb86b;
  letter-spacing: 5px;
  font-size: 12px;
}

h1 {
  font-size: clamp(42px, 8vw, 82px);
  margin: 0 0 12px;
  color: #ffdfb3;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 14px 22px;
  margin-top: 18px;
  background: linear-gradient(90deg, #ff4d00, #ffb000);
  color: #180700;
  font-weight: 800;
}

#signal {
  margin-top: 18px;
  color: #ffb86b;
}`,
  js: `function ignite() {
  const signal = document.getElementById('signal');
  signal.textContent = 'BigBang started: module slots ready.';
}

window.UD_MODULES = {
  eveBrain: null,
  world3D: null,
  hardwareBridge: null,
  deploy: null,
  rollback: null,
};`,
};

function App() {
  const [html, setHtml] = useState(() => localStorage.getItem('ud_html') || starter.html);
  const [css, setCss] = useState(() => localStorage.getItem('ud_css') || starter.css);
  const [js, setJs] = useState(() => localStorage.getItem('ud_js') || starter.js);
  const [active, setActive] = useState('html');
  const [status, setStatus] = useState('BigBang seed ready.');

  const srcDoc = useMemo(() => `<!doctype html>
<html>
<head><style>${css}</style></head>
<body>
${html}
<script>${js}<\/script>
</body>
</html>`, [html, css, js]);

  const saveProject = () => {
    localStorage.setItem('ud_html', html);
    localStorage.setItem('ud_css', css);
    localStorage.setItem('ud_js', js);
    setStatus('Saved locally. Future database hook ready.');
  };

  const resetProject = () => {
    setHtml(starter.html);
    setCss(starter.css);
    setJs(starter.js);
    setStatus('Reset to BigBang starter.');
  };

  const architect = () => {
    setStatus('EVE Architect hook reserved. Connect private Groq/OpenAI/Gemini bridge later.');
  };

  const currentValue = active === 'html' ? html : active === 'css' ? css : js;
  const setCurrentValue = (value) => {
    if (active === 'html') setHtml(value || '');
    if (active === 'css') setCss(value || '');
    if (active === 'js') setJs(value || '');
  };

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">UNIVERSAL DRAGON • BIGBANG ENGINE</p>
          <h1>UD Singularity</h1>
          <p className="sub">Expandable AI universe seed by Aslam.</p>
        </div>
        <div className="actions">
          <button onClick={saveProject}>Save</button>
          <button onClick={resetProject}>Reset</button>
          <button className="hot" onClick={architect}>EVE Architect</button>
        </div>
      </header>

      <section className="modules">
        <span>🧠 EVE Brain Hook</span>
        <span>🌍 3D World Hook</span>
        <span>🥧 Pi5 Bridge Hook</span>
        <span>🧯 Rollback Hook</span>
      </section>

      <section className="workspace">
        <div className="editorPanel">
          <div className="tabs">
            {['html', 'css', 'js'].map((tab) => (
              <button key={tab} className={active === tab ? 'active' : ''} onClick={() => setActive(tab)}>{tab.toUpperCase()}</button>
            ))}
          </div>
          <Editor
            height="62vh"
            theme="vs-dark"
            language={active === 'js' ? 'javascript' : active}
            value={currentValue}
            onChange={setCurrentValue}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>

        <div className="previewPanel">
          <div className="previewHead">Instant Universe Preview</div>
          <iframe title="UD Preview" srcDoc={srcDoc} sandbox="allow-scripts" />
        </div>
      </section>

      <footer>{status}</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
