// =============================================================================
// build-solutions.mjs — generate labs-SOLUTIONS.html (an instructor answer key)
// straight from the labs themselves. It loads each lab HTML, stubs mountLab() to
// capture the lab `spec` (goal, steps, starter, solution, hints, checks), and
// renders a single self-contained, printable solutions page.
//
// Because the solution CODE is read from each lab's own spec, the answer key can
// never drift out of sync with the labs. Re-run after editing any lab:
//     node labs/build-solutions.mjs
// =============================================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));

// Labs in display order (matches index.html: Compose 1–10, then Navigation 11–13).
const FILES = [
  'compose-01-layout.html', 'compose-02-modifiers.html', 'compose-03-text.html',
  'compose-04-profile.html', 'compose-05-state.html', 'compose-06-row.html',
  'compose-07-arrangement.html', 'compose-08-weight.html', 'compose-09-weight-split.html',
  'compose-10-box-align.html',
  'nav-01-drilldown.html', 'nav-02-argument.html', 'nav-03-deeplink.html',
];

// --- extract the spec a lab passes to mountLab() ----------------------------
function extractSpec(file) {
  const html = readFileSync(join(HERE, file), 'utf8');
  // grab every <script> block that has NO src= attribute (the inline one holds mountLab)
  const inline = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(m => !/\bsrc\s*=/.test(m[1])).map(m => m[2]).join('\n');
  let captured = null;
  // a tiny DOM stub so labs whose script also pokes the DOM (e.g. lab 5's note) don't throw
  const stubEl = () => ({ style: {}, className: '', appendChild() {}, setAttribute() {},
    insertBefore() {}, set innerHTML(_) {}, get innerHTML() { return ''; }, parentNode: { insertBefore() {} } });
  const sandbox = {
    mountLab: (spec) => { captured = spec; },
    document: { title: '', querySelector: () => null, createElement: stubEl, body: stubEl() },
    window: {},
  };
  vm.createContext(sandbox);
  vm.runInContext(inline, sandbox, { filename: file });
  if (!captured) throw new Error('no mountLab spec captured in ' + file);
  return captured;
}

// --- Kotlin highlighter (ported verbatim from lab-harness.js) ----------------
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
const KW = ['val','var','fun','return','if','else','when','for','while','data','object','class','import','package','true','false','null','by','it','this'];
function hlKotlin(code) {
  const re = new RegExp('(\\/\\/[^\\n]*)|("(?:[^"\\\\]|\\\\.)*")|(@\\w+)|(\\b\\d[\\d_]*(?:\\.\\d+)?\\b)|(\\b(?:' + KW.join('|') + ')\\b)|(\\b[A-Z][A-Za-z0-9_]*\\b)', 'g');
  return code.replace(re, (m, c1, c2, c3, c4, c5, c6) =>
    c1 ? `<span class="c">${m}</span>` : c2 ? `<span class="s">${m}</span>` :
    c3 ? `<span class="a">${m}</span>` : c4 ? `<span class="n">${m}</span>` :
    c5 ? `<span class="k">${m}</span>` : c6 ? `<span class="t">${m}</span>` : m);
}

// --- render one lab section --------------------------------------------------
function section(spec, file) {
  const isNav = spec.kind === 'nav';
  const num = (spec.title.match(/Lab\s+(\d+)/) || [])[1] || '?';
  const title = spec.title.replace(/^Lab\s+\d+\s*·\s*/, '');
  const code = hlKotlin(esc((spec.solution || '').replace(/\n+$/, '')));
  const steps = (spec.steps || []).map(s => `<li>${s}</li>`).join('\n');
  const checks = (spec.checks || []).map(c => `<li>${c.label}</li>`).join('\n');
  const hints = (spec.hints || []).map(h => `<li>${h}</li>`).join('\n');
  return `<section class="lab${isNav ? ' nav' : ''}" id="lab-${num}">
  <div class="lab-head">
    <span class="lab-num">Lab ${num}</span>
    <span class="lab-track">${isNav ? 'Navigation 3' : 'Compose'}</span>
    <span class="lab-level">${esc(spec.level || '')}</span>
    <a class="lab-src" href="./${file}">open lab ↗</a>
  </div>
  <h2>${esc(title)}</h2>
  <p class="goal"><b>The task.</b> ${esc(spec.goal || '')}</p>

  <h3>Solution</h3>
  <pre class="sol"><code>${code}</code></pre>

  <h3>How it works</h3>
  <ol class="how">${steps}</ol>
${hints ? `  <details class="deeper"><summary>Going deeper</summary><ul>${hints}</ul></details>\n` : ''}  <h3 class="vh">What the auto-checks verify</h3>
  <ul class="verify">${checks}</ul>
</section>`;
}

const specs = FILES.map(f => ({ file: f, spec: extractSpec(f) }));
const composeCount = specs.filter(s => s.spec.kind !== 'nav').length;
const navCount = specs.length - composeCount;

const toc = specs.map(({ spec }) => {
  const num = (spec.title.match(/Lab\s+(\d+)/) || [])[1] || '?';
  const title = spec.title.replace(/^Lab\s+\d+\s*·\s*/, '');
  const nav = spec.kind === 'nav';
  return `<a class="tocitem${nav ? ' nav' : ''}" href="#lab-${num}"><span>${num}</span>${esc(title)}</a>`;
}).join('\n');

const body = specs.map(({ spec, file }) => section(spec, file)).join('\n\n');

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hands-on Labs — Solutions &amp; Explanations</title>
<style>
  :root{
    --ink:#16181d; --muted:#5b6472; --line:#e4e7ee; --bg:#f5f6fa; --card:#ffffff;
    --accent:#2f9e62; --accent-deep:#1b7a48; --blue:#2563eb; --blue-deep:#1e40af;
    --code-bg:#0f172a; --code-ink:#e6edf6;
    --c-comment:#7d8aa0; --c-key:#c792ea; --c-str:#9ae6a6; --c-type:#7fd4ff;
    --c-anno:#ffcb6b; --c-num:#f5b86b; --c-punct:#8aa0b8;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);line-height:1.55;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}
  .wrap{max-width:940px;margin:0 auto;padding:30px 20px 90px;}
  header.page{background:linear-gradient(135deg,#2f9e62,#1b7a48);color:#fff;border-radius:16px;
    padding:26px 28px;margin-bottom:22px;box-shadow:0 8px 24px rgba(27,122,72,.20);}
  header.page .eyebrow{margin:0 0 6px;font-size:.78rem;letter-spacing:.6px;text-transform:uppercase;opacity:.85;}
  header.page h1{margin:0 0 8px;font-size:1.55rem;letter-spacing:.2px;}
  header.page p{margin:0;opacity:.95;font-size:.96rem;max-width:70ch;}
  header.page .links{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;}
  header.page .links a{color:#fff;text-decoration:none;font-size:.84rem;font-weight:600;
    background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:5px 12px;}
  .note{background:#fffaf0;border:1px solid #f3e2c0;border-left:5px solid #e0a93b;border-radius:12px;
    padding:12px 16px;margin:0 0 22px;font-size:.9rem;color:#6b5418;}
  .toc{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin-bottom:26px;}
  .toc h2{margin:0 0 12px;font-size:.82rem;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);}
  .tocgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;}
  .tocitem{display:flex;align-items:center;gap:9px;text-decoration:none;color:var(--ink);font-size:.9rem;
    border:1px solid var(--line);border-radius:9px;padding:8px 10px;background:#fbfcfe;}
  .tocitem:hover{border-color:var(--accent);}
  .tocitem span{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;
    background:var(--accent);color:#fff;border-radius:6px;font-size:.74rem;font-weight:700;}
  .tocitem.nav span{background:var(--blue);}
  .tocitem.nav:hover{border-color:var(--blue);}

  .lab{background:var(--card);border:1px solid var(--line);border-radius:16px;
    padding:22px 24px;margin-bottom:22px;box-shadow:0 1px 2px rgba(0,0,0,.03);}
  .lab.nav{border-top:4px solid var(--blue);}
  .lab:not(.nav){border-top:4px solid var(--accent);}
  .lab-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px;}
  .lab-num{background:var(--accent);color:#fff;font-weight:700;font-size:.74rem;
    padding:3px 10px;border-radius:999px;letter-spacing:.4px;}
  .lab.nav .lab-num{background:var(--blue);}
  .lab-track,.lab-level{font-size:.74rem;font-weight:600;color:var(--muted);
    border:1px solid var(--line);border-radius:999px;padding:3px 9px;}
  .lab-src{margin-left:auto;font-size:.8rem;font-weight:600;text-decoration:none;color:var(--accent-deep);}
  .lab.nav .lab-src{color:var(--blue-deep);}
  .lab h2{margin:2px 0 10px;font-size:1.2rem;}
  .lab h3{margin:18px 0 8px;font-size:.78rem;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);}
  .goal{margin:0 0 4px;font-size:.96rem;}
  ol.how,ul.verify,.deeper ul{margin:0;padding-left:22px;}
  ol.how li,ul.verify li,.deeper li{margin:0 0 7px;font-size:.93rem;}
  ul.verify{list-style:none;padding-left:2px;}
  ul.verify li{position:relative;padding-left:24px;}
  ul.verify li::before{content:"✓";position:absolute;left:0;top:0;color:var(--accent-deep);font-weight:800;}
  .deeper{margin:6px 0 0;background:#f7faf8;border:1px solid var(--line);border-radius:10px;padding:6px 12px;}
  .deeper summary{cursor:pointer;font-size:.86rem;font-weight:600;color:var(--accent-deep);}
  .deeper ul{margin-top:8px;}
  .vh{color:var(--accent-deep)!important;}

  code{font-family:"SF Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    background:#eef2f7;color:#2b3550;padding:1px 5px;border-radius:5px;font-size:.88em;}
  pre.sol{background:var(--code-bg);border-radius:12px;padding:16px 18px;overflow:auto;margin:0;
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.05);}
  pre.sol code{background:none;color:var(--code-ink);padding:0;border-radius:0;
    font:13px/1.65 "SF Mono",ui-monospace,Menlo,Consolas,monospace;white-space:pre;}
  pre.sol .c{color:var(--c-comment);font-style:italic;} pre.sol .k{color:var(--c-key);}
  pre.sol .s{color:var(--c-str);} pre.sol .t{color:var(--c-type);}
  pre.sol .a{color:var(--c-anno);} pre.sol .n{color:var(--c-num);}
  li code,.goal code{background:#eef2f7;}

  footer{color:var(--muted);font-size:.82rem;text-align:center;margin-top:30px;}
  @media print{
    body{background:#fff;} .wrap{max-width:none;} .lab,.toc{break-inside:avoid;box-shadow:none;}
    header.page .links,.lab-src{display:none;}
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="page">
    <p class="eyebrow">Android · Kotlin · Jetpack Compose &amp; Navigation 3</p>
    <h1>Hands-on Labs — Solutions &amp; Explanations</h1>
    <p>The full answer key for every browser lab: the task, the working solution, why it works, and exactly what the auto-grader checks. ${composeCount} Compose labs and ${navCount} Navigation labs.</p>
    <div class="links">
      <a href="./index.html">← All labs</a>
      <a href="../Playground/playground.html">🎨 Compose Playground</a>
      <a href="../Playground/nav-playground.html">🧭 Nav Playground</a>
    </div>
  </header>

  <p class="note">📋 Instructor / self-check reference. Each lab can also reveal its own solution in-browser via the <b>Show solution</b> button — this page collects them all in one place. Generated from the labs by <code>build-solutions.mjs</code>, so the code always matches.</p>

  <div class="toc">
    <h2>Jump to a lab</h2>
    <div class="tocgrid">
${toc}
    </div>
  </div>

${body}

  <footer>Generated by <code>labs/build-solutions.mjs</code> · re-run after editing any lab to refresh.</footer>
</div>
</body>
</html>
`;

writeFileSync(join(HERE, 'labs-SOLUTIONS.html'), out);
console.log(`Wrote labs-SOLUTIONS.html · ${specs.length} labs (${composeCount} Compose, ${navCount} Nav)`);
