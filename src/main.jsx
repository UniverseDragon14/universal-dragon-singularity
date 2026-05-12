import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Editor from '@monaco-editor/react';
import './styles.css';

const templates = {
  singularity: {
    name: 'Singularity Starter',
    html: `<section class="world-card">
  <p class="tag">SINGULARITY v0.1</p>
  <h1>UD Singularity</h1>
  <p>One point expanding into the Universal Dragon AI universe.</p>
  <button onclick="ignite()">Ignite Singularity</button>
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
  signal.textContent = 'Singularity ignition complete: module slots ready.';
  console.log('UD Singularity core ignited');
}

window.UD_MODULES = {
  eveBrain: null,
  world3D: null,
  hardwareBridge: null,
  deploy: null,
  rollback: null,
};`,
  },
  blank: {
    name: 'Blank Universe',
    html: `<main>
  <h1>New Universal Dragon World</h1>
  <p>Start from one point.</p>
</main>`,
    css: `body {
  margin: 0;
  padding: 40px;
  background: #050505;
  color: white;
  font-family: system-ui, sans-serif;
}`,
    js: `console.log('Blank universe ready');`,
  },
  portal: {
    name: 'Neon Portal',
    html: `<div class="portal">
  <div class="orb"></div>
  <h1>Universal Dragon Portal</h1>
  <p>Module slot: 3D world / EVE brain / hardware bridge.</p>
</div>`,
    css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #020308;
  color: #e9fbff;
  font-family: system-ui, sans-serif;
}
.portal { text-align: center; padding: 40px; }
.orb {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  margin: 0 auto 24px;
  background: radial-gradient(circle, #00d9ff, #ff5a00 55%, transparent 70%);
  box-shadow: 0 0 80px #00d9ff;
}`,
    js: `console.log('Neon portal online');`,
  },
};

function readSaved(key, fallback) {
  return localStorage.getItem(key) || fallback;
}

function App() {
  const [title, setTitle] = useState(() => readSaved('ud_title', 'UD Singularity'));
  const [description, setDescription] = useState(() => readSaved('ud_description', 'Expandable AI universe seed for Universal Dragon by Aslam.'));
  const [tags, setTags] = useState(() => readSaved('ud_tags', 'Universal Dragon, Aslam, EVE, NOVA, UDOS'));
  const [visibility, setVisibility] = useState(() => readSaved('ud_visibility', 'public'));
  const [html, setHtml] = useState(() => readSaved('ud_html', templates.singularity.html));
  const [css, setCss] = useState(() => readSaved('ud_css', templates.singularity.css));
  const [js, setJs] = useState(() => readSaved('ud_js', templates.singularity.js));
  const [active, setActive] = useState('html');
  const [status, setStatus] = useState('Singularity core ready.');
  const [consoleLines, setConsoleLines] = useState(['Preview console ready.']);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiReply, setAiReply] = useState('');

  useEffect(() => {
    const handler = (event) => {
      if (!event.data || event.data.source !== 'ud-preview') return;
      setConsoleLines((lines) => [...lines.slice(-9), `${event.data.type}: ${event.data.message}`]);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const srcDoc = useMemo(() => `<!doctype html>
<html>
<head>
<style>${css}</style>
<script>
  const send = (type, value) => parent.postMessage({ source: 'ud-preview', type, message: String(value) }, '*');
  window.addEventListener('error', (event) => send('error', event.message));
  console.log = (...args) => send('log', args.join(' '));
<\/script>
</head>
<body>
${html}
<script>${js}<\/script>
</body>
</html>`, [html, css, js]);

  const files = [
    { id: 'html', name: 'index.html', icon: '<>' },
    { id: 'css', name: 'style.css', icon: '{}' },
    { id: 'js', name: 'script.js', icon: '*' },
  ];

  const saveProject = () => {
    localStorage.setItem('ud_title', title);
    localStorage.setItem('ud_description', description);
    localStorage.setItem('ud_tags', tags);
    localStorage.setItem('ud_visibility', visibility);
    localStorage.setItem('ud_html', html);
    localStorage.setItem('ud_css', css);
    localStorage.setItem('ud_js', js);
    setStatus('Saved locally. Database hook reserved for later.');
  };

  const exportProject = () => {
    const safeTitle = (title || 'ud-singularity')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'ud-singularity';

    const file = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
  <script>
${js}
  <\/script>
</body>
</html>`;

    const blob = new Blob([file], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('Exported standalone HTML file.');
  };

  const applyTemplate = (templateKey) => {
    const template = templates[templateKey];
    setHtml(template.html);
    setCss(template.css);
    setJs(template.js);
    setConsoleLines([`${template.name} loaded.`]);
    setStatus(`${template.name} template loaded.`);
  };

  const architect = async () => {
    setStatus('EVE Architect private bridge checking...');
    try {
      const response = await fetch(`http://${window.location.hostname}:8787/api/architect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          css,
          js,
          question: aiQuestion || 'Review this project and suggest the next Universal Dragon module improvement.',
        }),
      });
      const data = await response.json();
      const reply = data.reply || data.error || 'No reply.';
      setAiReply(reply);
      setConsoleLines((lines) => [...lines.slice(-6), `EVE: ${reply.slice(0, 700)}`]);
      setStatus('EVE Architect replied.');
    } catch {
      setStatus('EVE Architect backend not running yet. Frontend is safe and working.');
    }
  };

  const extractCodeBlock = (reply, lang) => {
    const aliases = lang === 'js' ? ['js', 'javascript'] : [lang];
    for (const name of aliases) {
      const pattern = new RegExp('```' + name + '\\n([\\s\\S]*?)```', 'i');
      const match = reply.match(pattern);
      if (match) return match[1].trim();
    }
    return '';
  };

  const applyAiCode = () => {
    const nextHtml = extractCodeBlock(aiReply, 'html');
    const nextCss = extractCodeBlock(aiReply, 'css');
    const nextJs = extractCodeBlock(aiReply, 'js');

    if (!nextHtml && !nextCss && !nextJs) {
      setStatus('No HTML/CSS/JS code blocks found in EVE reply.');
      return;
    }

    if (nextHtml) setHtml(nextHtml);
    if (nextCss) setCss(nextCss);
    if (nextJs) setJs(nextJs);

    setConsoleLines((lines) => [...lines.slice(-6), 'EVE code applied safely to editor.']);
    setStatus('EVE generated code applied.');
  };

  const currentValue = active === 'html' ? html : active === 'css' ? css : js;
  const setCurrentValue = (value) => {
    if (active === 'html') setHtml(value || '');
    if (active === 'css') setCss(value || '');
    if (active === 'js') setJs(value || '');
  };

  return (
    <main className="appShell">
      <header className="studioTopbar">
        <button className="iconButton" onClick={() => setSideOpen(!sideOpen)}>☰</button>
        <div className="brandBlock">
          <p>UNIVERSAL DRAGON • SINGULARITY ENGINE</p>
          <h1>{title}</h1>
          <span>UD Singularity • Aslam • Expandable Universe</span>
        </div>
        <div className="topActions">
          <button onClick={() => setSettingsOpen(true)}>Settings</button>
          <button onClick={saveProject}>Save</button>
          <button onClick={exportProject}>Export</button>
          <button className="hot" onClick={architect}>EVE Architect</button>
        </div>
      </header>

      <section className="aiPanel">
        <div>
          <h2>🧠 EVE Code Creator</h2>
          <p>Ask EVE to create, fix, or upgrade HTML/CSS/JS. Example: “create a fire dragon landing page with animated portal”.</p>
        </div>
        <textarea
          value={aiQuestion}
          onChange={(e) => setAiQuestion(e.target.value)}
          placeholder="Ask EVE to create code..."
        />
        <div className="aiActions">
          <button className="hot" onClick={architect}>Generate / Review</button>
          <button onClick={applyAiCode}>Apply AI Code</button>
        </div>
        {aiReply && <pre className="aiReply">{aiReply}</pre>}
      </section>

      <section className="studioGrid">
        {sideOpen && (
          <aside className="sidePanel">
            <h2>Files</h2>
            <input className="search" placeholder="Search files..." />
            <div className="fileList">
              {files.map((file) => (
                <button key={file.id} className={active === file.id ? 'file active' : 'file'} onClick={() => setActive(file.id)}>
                  <span>{file.icon}</span>{file.name}
                </button>
              ))}
            </div>

            <h2>Templates</h2>
            <div className="templateList">
              {Object.entries(templates).map(([key, template]) => (
                <button key={key} onClick={() => applyTemplate(key)}>{template.name}</button>
              ))}
            </div>

            <h2>Module Slots</h2>
            <div className="slotList">
              <span>🧠 EVE Brain</span>
              <span>🌍 3D World</span>
              <span>🥧 Pi5 Bridge</span>
              <span>🧯 Rollback</span>
            </div>
          </aside>
        )}

        <section className="mainStudio">
          <div className="editorPanel">
            <div className="tabs">
              {files.map((file) => (
                <button key={file.id} className={active === file.id ? 'active' : ''} onClick={() => setActive(file.id)}>{file.name}</button>
              ))}
            </div>
            <Editor
              height="58vh"
              theme="vs-dark"
              language={active === 'js' ? 'javascript' : active}
              value={currentValue}
              onChange={setCurrentValue}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>

          <div className="previewPanel">
            <div className="previewHead">
              <span>Preview: /</span>
              <button onClick={() => setConsoleLines(['Preview console cleared.'])}>Clear Console</button>
            </div>
            <iframe title="UD Preview" srcDoc={srcDoc} sandbox="allow-scripts" />
            <div className="previewConsole">
              {consoleLines.map((line, index) => <div key={`${line}-${index}`}>{line}</div>)}
            </div>
          </div>
        </section>
      </section>

      <footer>{status}</footer>

      {settingsOpen && (
        <div className="modalBackdrop">
          <section className="settingsModal">
            <button className="close" onClick={() => setSettingsOpen(false)}>×</button>
            <h2>UD Project Settings</h2>
            <label>Project Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label>
            <label>Tags<input value={tags} onChange={(e) => setTags(e.target.value)} /></label>
            <label>Visibility
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="public">Public demo</option>
                <option value="private-local">Private local only</option>
              </select>
            </label>
            <p className="safeNote">Never expose API keys or EVE Terminal here. Public studio is for demos only.</p>
            <button className="hot" onClick={() => { saveProject(); setSettingsOpen(false); }}>Save Settings</button>
          </section>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
