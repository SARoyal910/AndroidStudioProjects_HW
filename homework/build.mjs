// build.mjs — assembles the interactive "Projects Explained" HTML from the
// per-project JSON files in homework/_build/*.json.
//
// Code snippets are extracted from the REAL source files (by line range) so they
// are always byte-exact, then HTML-escaped and syntax-highlighted at build time.
//
//   node homework/build.mjs
//
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dirname, '..')           // /Users/.../AndroidStudioProjects
const DATA = join(__dirname, '_build')
const OUT  = join(__dirname, 'projects.html')

// ---------------------------------------------------------------------------
// Canonical structure: groups, order, chips. (Content comes from the JSON.)
// ---------------------------------------------------------------------------
const GROUPS = [
  {
    id: 'foundation', label: '1 · Compose foundation', short: 'Foundation', track: 'nav',
    blurb: 'The smallest possible Compose app — where every other project starts.',
    projects: ['SingleActivity'],
  },
  {
    id: 'two-screen', label: '2 · Navigation 3 · two screens', short: 'Two-screen nav', track: 'nav',
    blurb: 'Your first navigation: push a key to go forward, carry an argument, come back.',
    projects: ['Intent', 'NavDetailList', 'NavListDetail'],
  },
  {
    id: 'back-stack', label: '3 · Growing the back stack', short: 'Back stack', track: 'nav',
    blurb: 'Drill deeper — 3 and 4 screens — and learn to pop several levels at once.',
    projects: ['NavThreeScreen', 'NavFourScreen'],
  },
  {
    id: 'nav-concepts', label: '4 · One nav concept each', short: 'Nav concepts', track: 'nav',
    blurb: 'Seven focused demos, each isolating a single real-world navigation feature.',
    projects: ['NavDeepLinks', 'NavBottomTabs', 'NavNestedGraphs', 'NavViewModelState', 'NavTransitions', 'NavDataLayer', 'NavOverlay'],
  },
  {
    id: 'notes', label: '5 · Android concepts', short: 'Concepts track', track: 'notes',
    blurb: 'A second track of standalone concept demos: UI fundamentals, the full component catalog, modifiers & layout, lists, networking, real-time WebSockets, location, MVVM, storage, release.',
    projects: ['ComposeModernUI', 'ComposeCatalog', 'ComposeModifiers', 'ComposeLists', 'NetworkParsing', 'WebSocketLive', 'LocationServices', 'MvvmState', 'RoomAndPreferences', 'AppReleaseBasics'],
  },
]

// Flat linear order used by Prev/Next + arrow keys.
const ORDER = GROUPS.flatMap(g => g.projects)

const DOMAIN_CHIP = {
  planets: { icon: '🪐', label: 'planets domain' },
  notes:   { icon: '🗒️', label: 'notes domain' },
  none:    { icon: '▫️', label: 'no data domain' },
}
const TRACK_OF = {}
GROUPS.forEach(g => g.projects.forEach(p => (TRACK_OF[p] = g)))

// ---------------------------------------------------------------------------
// Load data
// ---------------------------------------------------------------------------
const data = {}
const missing = []
for (const name of ORDER) {
  const f = join(DATA, name + '.json')
  if (!existsSync(f)) { missing.push(name); continue }
  try {
    data[name] = JSON.parse(readFileSync(f, 'utf8'))
  } catch (e) {
    console.error('BAD JSON:', name, e.message)
    missing.push(name + ' (parse error)')
  }
}
if (missing.length) console.warn('!! Missing/invalid project data:', missing.join(', '))

// ---------------------------------------------------------------------------
// HTML escape + syntax highlight
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escAttr(s) {
  return esc(s).replace(/"/g, '&quot;')
}

const KW = [
  'package','import','class','object','data','interface','enum','sealed','fun','val','var',
  'const','lateinit','companion','init','constructor','typealias','return','if','else','when',
  'for','while','do','break','continue','in','is','as','by','out','where','this','super','null',
  'true','false','private','public','protected','internal','override','open','abstract','final',
  'suspend','inline','noinline','crossinline','reified','vararg','operator','infix','tailrec',
  'annotation','expect','actual','get','set','field','it','try','catch','finally','throw',
]
const KW_RE = KW.join('|')

// Highlights ESCAPED kotlin text. Quotes are NOT escaped by esc(), so "..." matches.
function hlKotlin(code) {
  const re = new RegExp(
    '(\\/\\/[^\\n]*)' +                          // 1 line comment
    '|(\\/\\*[\\s\\S]*?\\*\\/)' +                 // 2 block / KDoc comment
    '|("""[\\s\\S]*?""")' +                       // 3 triple string
    '|("(?:[^"\\\\]|\\\\.)*")' +                  // 4 string
    "|('(?:\\\\.|[^'\\\\])')" +                   // 5 char literal
    '|(@\\w+)' +                                  // 6 annotation
    '|(\\b\\d[\\d_]*(?:\\.\\d+)?[fFlLuU]*\\b)' +  // 7 number
    '|(\\b(?:' + KW_RE + ')\\b)' +                // 8 keyword
    '|(\\b[A-Z][A-Za-z0-9_]*\\b)',                // 9 Type / Constant
    'g'
  )
  return code.replace(re, (m, c1, c2, c3, c4, c5, c6, c7, c8, c9) => {
    if (c1 || c2) return '<span class="c">' + m + '</span>'
    if (c3 || c4 || c5) return '<span class="s">' + m + '</span>'
    if (c6) return '<span class="a">' + m + '</span>'
    if (c7) return '<span class="n">' + m + '</span>'
    if (c8) return '<span class="k">' + m + '</span>'
    if (c9) return '<span class="t">' + m + '</span>'
    return m
  })
}

// Highlights ESCAPED xml text ( < -> &lt; , > -> &gt; ).
function hlXml(code) {
  const re = new RegExp(
    '(&lt;!--[\\s\\S]*?--&gt;)' +     // 1 comment
    '|(&lt;[?!]?\\/?)([\\w.:-]+)' +    // 2 open punct + 3 tag name
    '|(\\/?&gt;)' +                    // 4 close
    '|([\\w:.\\-]+)(=)' +              // 5 attr name + 6 eq
    '|("[^"]*")',                      // 7 attr value
    'g'
  )
  return code.replace(re, (m, c1, c2, c3, c4, c5, c6, c7) => {
    if (c1) return '<span class="c">' + m + '</span>'
    if (c2 !== undefined && c3 !== undefined && c2 !== '' || c3) {
      return '<span class="px">' + (c2 || '') + '</span><span class="t">' + (c3 || '') + '</span>'
    }
    if (c4) return '<span class="px">' + m + '</span>'
    if (c5 && c6) return '<span class="a">' + c5 + '</span><span class="px">=</span>'
    if (c7) return '<span class="s">' + m + '</span>'
    return m
  })
}

function highlight(code, file) {
  const escd = esc(code)
  if (/\.xml$/.test(file)) return hlXml(escd)
  return hlKotlin(escd)
}

// Pull an exact line range out of a real source file.
const fileCache = {}
function readLines(relPath, start, end) {
  if (!(relPath in fileCache)) {
    const abs = join(REPO, relPath)
    fileCache[relPath] = existsSync(abs) ? readFileSync(abs, 'utf8').split('\n') : null
  }
  const lines = fileCache[relPath]
  if (!lines) return { ok: false, text: '// (source file not found: ' + relPath + ')' }
  const s = Math.max(1, start | 0)
  const e = Math.min(lines.length, end | 0)
  // Trim a trailing blank line for tidiness but keep internal structure.
  const slice = lines.slice(s - 1, e)
  while (slice.length && slice[slice.length - 1].trim() === '') slice.pop()
  return { ok: true, text: slice.join('\n'), start: s, end: s + slice.length - 1 }
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------
function codeBlock(h) {
  const { text, start, end } = readLines(h.file, h.start, h.end)
  const hl = highlight(text, h.file)
  const fname = basename(h.file)
  const lineLabel = start === end ? ('line ' + start) : ('lines ' + start + '–' + end)
  return `
    <figure class="code">
      <figcaption>
        <span class="codetitle">${esc(h.title)}</span>
        <span class="codemeta"><code title="${escAttr(h.file)}">${esc(fname)}</code> · ${lineLabel}</span>
        <button class="copy" type="button" aria-label="Copy code">Copy</button>
      </figcaption>
      <pre class="src"><code>${hl}</code></pre>
      ${h.explain ? `<p class="codeexplain">${esc(h.explain)}</p>` : ''}
    </figure>`
}

function chip(text, cls = '') {
  return `<span class="chip ${cls}">${text}</span>`
}

function panel(name, idx) {
  const d = data[name]
  const g = TRACK_OF[name]
  if (!d) {
    return `<section class="panel" id="p-${name}" role="tabpanel" aria-labelledby="t-${name}" hidden>
      <div class="missing">No data was generated for <b>${esc(name)}</b>.</div></section>`
  }
  const dom = DOMAIN_CHIP[d.domain] || DOMAIN_CHIP.none
  const num = ORDER.indexOf(name) + 1

  const screens = (d.screens || []).map(s =>
    `<li><b>${esc(s.name)}</b> — ${esc(s.role)}</li>`).join('')

  const concepts = (d.concepts || []).map(c =>
    `<div class="concept"><h4>${esc(c.term)}</h4><p>${esc(c.plain)}</p></div>`).join('')

  const highlights = (d.highlights || []).map(codeBlock).join('')

  const tryThis = (d.tryThis || []).map((t, i) =>
    `<li><span class="tn">${i + 1}</span><span>${esc(t)}</span></li>`).join('')

  const gotchas = (d.gotchas || []).map(x => `<li>${esc(x)}</li>`).join('')

  const files = (d.files || []).map(f =>
    `<li><code title="${escAttr(f.path)}">${esc(basename(f.path))}</code> — ${esc(f.role)}</li>`).join('')

  return `
  <section class="panel" id="p-${name}" role="tabpanel" aria-labelledby="t-${name}" hidden>
    <div class="phead">
      <div class="pcrumb">${esc(g.label)}</div>
      <h2>${esc(name)}</h2>
      <p class="tagline">${esc(d.tagline || '')}</p>
      <div class="chips">
        ${chip('Project ' + num + ' of ' + ORDER.length, 'ord')}
        ${chip(dom.icon + ' ' + dom.label, 'dom ' + (d.domain || 'none'))}
        ${d.estTime ? chip('⏱ ' + esc(d.estTime), 'time') : ''}
        ${chip(g.track === 'notes' ? 'Concepts track' : 'Navigation track', 'track ' + g.track)}
      </div>
    </div>

    <div class="bigidea">
      <span class="bilabel">The one big idea</span>
      <p>${esc(d.mentalModel || '')}</p>
    </div>

    <h3>What it does</h3>
    <p class="lead">${esc(d.whatItDoes || '')}</p>

    ${screens ? `<h3>Screens you'll see</h3><ul class="screens">${screens}</ul>` : ''}

    ${concepts ? `<h3>Key concepts</h3><div class="concepts">${concepts}</div>` : ''}

    ${highlights ? `<h3>Walk through the code</h3>
      <p class="hint">Each block is pulled straight from the project's source — the file and line numbers are real, so you can open the same lines in Android Studio.</p>
      ${highlights}` : ''}

    ${d.newVsPrev ? `<div class="callout new"><b>What's new here</b><p>${esc(d.newVsPrev)}</p></div>` : ''}

    ${tryThis ? `<h3>Try this yourself</h3><ol class="trythis">${tryThis}</ol>` : ''}

    ${gotchas ? `<div class="callout warn"><b>Good to know</b><ul>${gotchas}</ul></div>` : ''}

    ${d.runTest ? `<h3>Run &amp; check it</h3><div class="callout run"><p>${esc(d.runTest)}</p></div>` : ''}

    ${files ? `<details class="files"><summary>Files in this project (${(d.files || []).length})</summary><ul>${files}</ul></details>` : ''}

    <nav class="pager">
      <button class="prev" type="button">‹ Previous</button>
      <span class="pagerpos"></span>
      <button class="next" type="button">Next ›</button>
    </nav>
  </section>`
}

// ---------------------------------------------------------------------------
// Overview panel (hand-authored map of both tracks)
// ---------------------------------------------------------------------------
function overviewPanel() {
  const stepCards = (ids) => ids.map((id) => {
    const d = data[id]
    const num = ORDER.indexOf(id) + 1
    return `<button class="ovcard" data-goto="${id}">
      <span class="ovnum">${num}</span>
      <span class="ovbody"><b>${esc(id)}</b><span>${esc(d ? d.tagline : '')}</span></span>
    </button>`
  }).join('')

  return `
  <section class="panel" id="p-overview" role="tabpanel" aria-labelledby="t-overview">
    <div class="phead">
      <div class="pcrumb">Start here</div>
      <h2>The whole picture</h2>
      <p class="tagline">A collection of small, self-contained Jetpack&nbsp;Compose apps. Each one adds exactly one new idea on top of the last — so you can read any project top-to-bottom, then diff it against the one before to see precisely what changed.</p>
    </div>

    <div class="bigidea">
      <span class="bilabel">How to use this page</span>
      <p>Pick a project from the tabs at the top. Read <b>What it does</b>, study the <b>code walk-through</b> (the line numbers are real), then do the <b>Try this</b> experiments in Android Studio. Use the <b>Prev / Next</b> buttons — or the ← → arrow keys — to walk the progression in order.</p>
    </div>

    <h3 id="choose-layout">Which layout container should I use?</h3>
    <p class="tagline" style="margin-top:-6px;">Every Compose screen is built by nesting a handful of containers. This is the first decision you make on any screen — pick the one whose <i>job</i> matches what you're arranging.</p>
    <div style="overflow-x:auto;border:1px solid var(--line);border-radius:12px;margin:0 0 12px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;background:var(--card);">
        <thead>
          <tr style="text-align:left;background:var(--accent-deep);color:#fff;">
            <th style="padding:10px 12px;font-weight:750;">Container</th>
            <th style="padding:10px 12px;font-weight:750;">Reach for it when…</th>
            <th style="padding:10px 12px;font-weight:750;">The props you'll set</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-top:1px solid var(--line);">
            <td style="padding:10px 12px;"><code>Column</code></td>
            <td style="padding:10px 12px;">Stacking a few children <b>top&nbsp;→&nbsp;bottom</b> — a form, a labelled value, a card's body.</td>
            <td style="padding:10px 12px;"><code>verticalArrangement</code> · <code>horizontalAlignment</code></td>
          </tr>
          <tr style="border-top:1px solid var(--line);">
            <td style="padding:10px 12px;"><code>Row</code></td>
            <td style="padding:10px 12px;">Placing children <b>side&nbsp;by&nbsp;side</b> — icon + label, a toolbar. The mirror of a Column.</td>
            <td style="padding:10px 12px;"><code>horizontalArrangement</code> · <code>verticalAlignment</code></td>
          </tr>
          <tr style="border-top:1px solid var(--line);">
            <td style="padding:10px 12px;"><code>Box</code></td>
            <td style="padding:10px 12px;"><b>Overlapping</b> children — a badge on an avatar, text over an image, a centered spinner.</td>
            <td style="padding:10px 12px;"><code>contentAlignment</code> · <code>Modifier.align</code></td>
          </tr>
          <tr style="border-top:1px solid var(--line);">
            <td style="padding:10px 12px;"><code>LazyColumn</code> / <code>LazyRow</code></td>
            <td style="padding:10px 12px;">A <b>long or unbounded scrolling list</b> — it only builds the rows on screen. Don't put a big list in a scrolling Column.</td>
            <td style="padding:10px 12px;"><code>items(list) { … }</code></td>
          </tr>
          <tr style="border-top:1px solid var(--line);">
            <td style="padding:10px 12px;"><code>Scaffold</code></td>
            <td style="padding:10px 12px;">The <b>whole-screen skeleton</b> — top bar, bottom bar, FAB and snackbar in their standard Material slots.</td>
            <td style="padding:10px 12px;"><code>topBar</code> · <code>bottomBar</code> · <code>floatingActionButton</code></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p style="font-size:13px;color:var(--muted);margin:0 0 6px;"><b>Rule of thumb:</b> <code>Scaffold</code> is the outer screen frame; inside it you arrange content with <code>Column</code> / <code>Row</code>, layer things with <code>Box</code>, and scroll long lists with <code>LazyColumn</code>. They nest freely — a Scaffold's content is usually a Column, whose rows may be a LazyColumn, and so on.</p>
    <p style="font-size:13px;color:var(--muted);margin:0;"><b>See it live:</b> the <a href="./Playground/playground.html">Compose Playground</a> (root-layout dropdown + the "Choosing a container" reference cards) and the <b>Layouts</b> tab in the <b>ComposeParts</b> app both let you flip between these and watch the result change.</p>

    <div class="callout new" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
      <div style="flex:1;min-width:240px;">
        <b>🧪 Interactive Compose Playground</b>
        <p>Want to <i>change the code and see the effect</i>? Open the live playground: edit Jetpack&nbsp;Compose Kotlin (Column, Row, Box, Text, Button, Card, modifiers…) and watch the UI re-render as you type. It's the hands-on companion to the <b>ComposeCatalog</b> and <b>ComposeModifiers</b> projects.</p>
      </div>
      <a href="./Playground/playground.html" style="flex:none;background:var(--accent-deep);color:#fff;text-decoration:none;font-weight:750;padding:10px 18px;border-radius:10px;white-space:nowrap;">Open the Playground →</a>
    </div>

    <div class="callout new" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;border-color:var(--blue-line);background:var(--blue-soft);">
      <div style="flex:1;min-width:240px;">
        <b>🧭 Interactive Navigation 3 Playground</b>
        <p>See navigation as a <i>back stack of keys</i>: edit a <code>rememberNavBackStack(…)</code> list — or tap the phone, press Back, switch tabs — and watch the stack and the equivalent <code>backStack.add(…)</code> / <code>removeLastOrNull()</code> update live. The hands-on companion to the <b>navigation track</b> (NavListDetail → deep links, tabs, nested graphs).</p>
      </div>
      <a href="./Playground/nav-playground.html" style="flex:none;background:var(--blue);color:#fff;text-decoration:none;font-weight:750;padding:10px 18px;border-radius:10px;white-space:nowrap;">Open the Nav Playground →</a>
    </div>

    <div class="callout new" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;border-color:var(--accent);background:#eafaf1;">
      <div style="flex:1;min-width:240px;">
        <b>✅ Hands-on Labs (guided exercises with instant checking)</b>
        <p>Ready to <i>build</i> instead of read? The <b>labs</b> give you a task and starter code; edit it (or tap the phone) and the success checks turn green as you go — with hints and a solution if you get stuck. Seven labs across Compose (layout, modifier order, text, a profile card) and Navigation (drill-down, key arguments, deep-link seeding).</p>
      </div>
      <a href="../labs/index.html" style="flex:none;background:var(--accent-deep);color:#fff;text-decoration:none;font-weight:750;padding:10px 18px;border-radius:10px;white-space:nowrap;">Open the Labs →</a>
    </div>

    <h3>Two learning tracks</h3>
    <div class="tracks">
      <div class="trackcol nav">
        <div class="trackhead">🪐 Navigation track <span>“planets” domain · Category → Item</span></div>
        ${stepCards(['SingleActivity','Intent','NavDetailList','NavListDetail','NavThreeScreen','NavFourScreen','NavDeepLinks','NavBottomTabs','NavNestedGraphs','NavViewModelState','NavTransitions','NavDataLayer','NavOverlay'])}
      </div>
      <div class="trackcol notes">
        <div class="trackhead">🗒️ Android-concepts track <span>standalone concept demos</span></div>
        ${stepCards(['ComposeModernUI','ComposeCatalog','ComposeModifiers','ComposeLists','NetworkParsing','WebSocketLive','LocationServices','MvvmState','RoomAndPreferences','AppReleaseBasics'])}
      </div>
    </div>

    <h3>Suggested order (navigation)</h3>
    <ol class="trythis">
      <li><span class="tn">1</span><span><b>NavListDetail → NavThreeScreen → NavFourScreen</b> — build back-stack intuition: pushing a key navigates forward, popping navigates back, keys carry arguments.</span></li>
      <li><span class="tn">2</span><span><b>NavViewModelState</b> — separate UI from where state <i>lives</i> before adding more navigation surface.</span></li>
      <li><span class="tn">3</span><span><b>NavDataLayer</b> — where data <i>comes from</i>: the repository boundary + loading / empty / error / success states.</span></li>
      <li><span class="tn">4</span><span><b>NavBottomTabs</b> &amp; <b>NavNestedGraphs</b> — more advanced back-stack shapes (parallel stacks; sub-flows).</span></li>
      <li><span class="tn">5</span><span><b>NavDeepLinks</b> — entering the app from outside and rebuilding a sensible back stack.</span></li>
      <li><span class="tn">6</span><span><b>NavTransitions</b> — polish: animating the moves between screens.</span></li>
      <li><span class="tn">7</span><span><b>NavOverlay</b> — overlays: a dialog scene that sits on top of the back stack while the screen beneath stays visible.</span></li>
    </ol>

    <h3>The shared tech stack</h3>
    <div class="concepts">
      <div class="concept"><h4>Jetpack Compose + Material 3</h4><p>Declarative UI — you describe what the screen should look like for the current state, and Compose redraws when that state changes.</p></div>
      <div class="concept"><h4>Navigation 3</h4><p><code>NavDisplay</code>, <code>rememberNavBackStack</code>, <code>entryProvider</code> and <code>@Serializable</code> <code>NavKey</code>s. The back stack is just a list of keys; the top key is the screen on screen.</p></div>
      <div class="concept"><h4>Kotlin 2.2 · single Activity</h4><p>One <code>Activity</code> hosts everything via <code>setContent { }</code>. Screens are composables that get swapped — no more starting a new Activity per screen.</p></div>
      <div class="concept"><h4>Gradle (Kotlin DSL)</h4><p>Each folder is an independent project. Build a single one with <code>./gradlew :compileDebugKotlin</code> or install it with <code>./gradlew installDebug</code>.</p></div>
    </div>

    <div class="callout run">
      <b>Running any project</b>
      <p>In Android Studio: <code>File ▸ Open…</code> and pick the project folder (e.g. <code>NavFourScreen</code>), let Gradle sync, then Run ▸ on an emulator or device. From a terminal inside the folder: <code>./gradlew installDebug</code>.</p>
    </div>
  </section>`
}

// ---------------------------------------------------------------------------
// Sidebar navigation: an Overview link, then a labelled group of project links.
// ---------------------------------------------------------------------------
function sideNav() {
  let out = `<button class="navitem ov" data-proj="overview" role="tab">Overview</button>`
  for (const g of GROUPS) {
    out += `<div class="navgroup"><div class="navhead">${esc(g.label)}</div>`
    out += g.projects.map(id => {
      const n = ORDER.indexOf(id) + 1
      return `<button class="navitem" data-proj="${id}" role="tab"><span class="ni-n">${n}</span><span class="ni-t">${esc(id)}</span></button>`
    }).join('')
    out += `</div>`
  }
  return out
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------
const panels = ['overview', ...ORDER].map((id, i) =>
  id === 'overview' ? overviewPanel() : panel(id, i)).join('\n')

const clientData = {
  order: ORDER,
}

const CSS = `
:root{
  --ink:#16212e; --muted:#5b6b7b; --line:#e4e9f0; --bg:#f4f6f9; --card:#ffffff;
  --accent:#3ddc84; --accent-deep:#0f9d58; --accent-ink:#063a22;
  --blue:#2563eb; --blue-soft:#eef4ff; --blue-line:#d3e0ff;
  --purple:#7c3aed; --purple-soft:#f3eefe;
  --warn:#b45309; --warn-soft:#fff7ed; --warn-line:#fde2c0;
  --run-soft:#ecfdf3; --run-line:#bfe9cf;
  --code-bg:#0f172a; --code-ink:#e6edf6;
  --c-comment:#7d8aa0; --c-key:#c792ea; --c-str:#9ae6a6; --c-fn:#82aaff;
  --c-type:#7fd4ff; --c-num:#f5b86b; --c-anno:#ffcb6b; --c-punct:#8aa0b8;
  --shadow:0 1px 2px rgba(15,23,42,.05),0 8px 24px -16px rgba(15,23,42,.25);
}
*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased;}
.wrap{max-width:980px;margin:0 auto;padding:0 22px;}

/* Hero */
header.hero{background:linear-gradient(135deg,#0b1220 0%,#15243a 55%,#0f9d58 165%);
  color:#fff;padding:34px 0 26px;border-bottom:4px solid var(--accent);}
header.hero .wrap{max-width:1320px;padding:0 34px;}
.eyebrow{letter-spacing:.15em;text-transform:uppercase;font-size:12px;color:var(--accent);
  font-weight:800;margin:0 0 6px;}
header.hero h1{margin:0 0 8px;font-size:29px;line-height:1.18;font-weight:850;letter-spacing:-.01em;}
header.hero p.sub{margin:0 0 16px;color:#c6d2e2;font-size:15.5px;max-width:70ch;}
.hmeta{display:flex;flex-wrap:wrap;gap:9px;}
.hmeta span{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16);
  color:#e7eef7;font-size:12.5px;padding:5px 11px;border-radius:999px;}
.hmeta b{color:#fff;}

/* Shell: left sidebar + content */
.shell{display:flex;align-items:flex-start;max-width:1320px;margin:0 auto;}
.sidebar{position:sticky;top:0;align-self:flex-start;flex:none;width:268px;height:100vh;overflow-y:auto;
  background:#fff;border-right:1px solid var(--line);padding:18px 14px 30px;}
.sidebar::-webkit-scrollbar{width:9px;}
.sidebar::-webkit-scrollbar-thumb{background:#e3e9f0;border-radius:8px;}
.sidetitle{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#9aa8b8;padding:0 9px 9px;}

.search{position:relative;margin-bottom:12px;}
.search input{width:100%;padding:9px 12px 9px 32px;border:1px solid var(--line);border-radius:10px;
  background:#fff;font-size:13.5px;color:var(--ink);outline:none;}
.search input:focus{border-color:var(--accent-deep);box-shadow:0 0 0 3px rgba(15,157,88,.14);}
.search::before{content:"⌕";position:absolute;left:10px;top:50%;transform:translateY(-50%);
  color:var(--muted);font-size:16px;}
.results{position:absolute;top:42px;left:0;right:0;background:#fff;border:1px solid var(--line);
  border-radius:10px;box-shadow:var(--shadow);overflow:hidden auto;max-height:320px;display:none;z-index:60;}
.results.open{display:block;}
.results button{display:flex;flex-direction:column;width:100%;gap:1px;align-items:flex-start;text-align:left;
  border:0;background:none;padding:8px 11px;cursor:pointer;}
.results button:hover,.results button.active{background:var(--blue-soft);}
.results .rname{font-weight:700;font-size:13.5px;color:var(--ink);}
.results .rtag{color:var(--muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}
.results .empty{padding:11px 12px;color:var(--muted);font-size:13px;}

.sidenav{display:flex;flex-direction:column;gap:1px;}
.navgroup{margin-top:13px;}
.navhead{font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#9aa8b8;padding:4px 9px;}
.navitem{display:flex;align-items:center;gap:9px;width:100%;text-align:left;border:0;background:none;
  padding:7px 9px;border-radius:8px;color:var(--muted);font-size:13.5px;font-weight:600;cursor:pointer;
  border-left:3px solid transparent;transition:.1s;}
.navitem:hover{background:#f2f6fa;color:var(--ink);}
.navitem[aria-current="true"]{background:#eafaf1;color:var(--accent-ink);font-weight:750;border-left-color:var(--accent-deep);}
.navitem .ni-n{flex:none;width:21px;height:21px;border-radius:6px;background:#eef2f7;color:#8295a8;
  font-size:11px;font-weight:800;display:grid;place-items:center;}
.navitem[aria-current="true"] .ni-n{background:var(--accent-deep);color:#fff;}
.navitem.ov{font-weight:750;color:var(--ink);margin-bottom:2px;}
.navitem.ov[aria-current="true"]{background:var(--ink);color:#fff;border-left-color:#000;}

.content{flex:1;min-width:0;padding:26px 34px 72px;}
.contentwrap{max-width:860px;}

/* Mobile drawer chrome (hidden on desktop) */
.mobilebar{display:none;}
.menubtn{display:none;}
.scrim{display:none;}

/* Panels */
.panel{animation:fade .22s ease;}
@keyframes fade{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}
.phead{margin-bottom:6px;}
.pcrumb{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--accent-deep);}
.panel h2{font-size:27px;margin:4px 0 4px;letter-spacing:-.01em;font-weight:850;}
.tagline{margin:0 0 12px;color:var(--muted);font-size:16px;max-width:72ch;}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px;}
.chip{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;background:#eef2f7;color:var(--muted);
  border:1px solid var(--line);}
.chip.ord{background:#fff;}
.chip.dom.planets{background:#eef4ff;color:#274b9e;border-color:var(--blue-line);}
.chip.dom.notes{background:#fef6ec;color:#8a5a12;border-color:#f6dcb6;}
.chip.time{background:#f4f0ff;color:#5b34c2;border-color:#e3d8ff;}
.chip.track.nav{background:#eafaf1;color:#0b6b3f;border-color:#bfe9cf;}
.chip.track.notes{background:#fef6ec;color:#8a5a12;border-color:#f6dcb6;}

.panel h3{font-size:17.5px;margin:30px 0 8px;padding-top:14px;border-top:1px solid var(--line);font-weight:800;}
.lead{font-size:16px;}
.hint{color:var(--muted);font-size:14px;margin:-2px 0 12px;}

.bigidea{background:linear-gradient(180deg,#0f1f17,#13261c);color:#eafaf1;border-radius:14px;
  padding:16px 18px;margin:14px 0 4px;border:1px solid #1c3a2a;}
.bigidea .bilabel{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);margin-bottom:4px;}
.bigidea p{margin:0;font-size:15.5px;color:#dbefe3;}

ul.screens{margin:6px 0;padding-left:20px;}
ul.screens li{margin:6px 0;}
ul.screens b{color:var(--ink);}

.concepts{display:grid;grid-template-columns:repeat(auto-fill,minmax(232px,1fr));gap:12px;margin:10px 0;}
.concept{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 15px;box-shadow:var(--shadow);}
.concept h4{margin:0 0 5px;font-size:14.5px;color:var(--accent-deep);}
.concept p{margin:0;font-size:14px;color:var(--ink);}

/* Code */
figure.code{margin:16px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card);
  box-shadow:var(--shadow);}
figure.code figcaption{display:flex;align-items:center;gap:10px;padding:9px 13px;background:#f7f9fc;
  border-bottom:1px solid var(--line);}
.codetitle{font-weight:750;font-size:13.5px;}
.codemeta{color:var(--muted);font-size:12px;margin-left:2px;}
.codemeta code{background:#eef2f7;padding:1px 6px;border-radius:5px;font-size:11.5px;}
.copy{margin-left:auto;border:1px solid var(--line);background:#fff;color:var(--muted);font-size:12px;
  font-weight:700;padding:4px 10px;border-radius:7px;cursor:pointer;transition:.12s;}
.copy:hover{color:var(--ink);border-color:#c9d4e2;}
.copy.done{color:var(--accent-deep);border-color:var(--accent);background:#eafaf1;}
pre.src{margin:0;background:var(--code-bg);color:var(--code-ink);padding:14px 16px;overflow:auto;
  font:12.8px/1.6 "SF Mono",ui-monospace,Menlo,Consolas,monospace;tab-size:4;}
pre.src code{font:inherit;background:none;padding:0;}
.codeexplain{margin:0;padding:11px 15px;font-size:14px;color:var(--ink);background:#fbfdff;border-top:1px solid var(--line);}
pre .c{color:var(--c-comment);font-style:italic;}
pre .k{color:var(--c-key);}
pre .s{color:var(--c-str);}
pre .t{color:var(--c-type);}
pre .a{color:var(--c-anno);}
pre .n{color:var(--c-num);}
pre .px{color:var(--c-punct);}

/* Callouts */
.callout{border-radius:12px;padding:14px 16px;margin:16px 0;font-size:14.5px;}
.callout b{display:block;margin-bottom:3px;}
.callout p{margin:0;}
.callout ul{margin:4px 0 0;padding-left:20px;}
.callout.new{background:var(--blue-soft);border:1px solid var(--blue-line);}
.callout.warn{background:var(--warn-soft);border:1px solid var(--warn-line);color:#7c4a12;}
.callout.run{background:var(--run-soft);border:1px solid var(--run-line);}
.callout code{background:rgba(15,23,42,.07);padding:1px 6px;border-radius:5px;font-size:.9em;}

ol.trythis{list-style:none;margin:10px 0;padding:0;display:grid;gap:9px;}
ol.trythis li{display:flex;gap:12px;align-items:flex-start;background:var(--card);border:1px solid var(--line);
  border-radius:11px;padding:11px 14px;box-shadow:var(--shadow);}
.tn{flex:none;width:25px;height:25px;border-radius:50%;background:var(--accent);color:var(--accent-ink);
  font-weight:800;display:grid;place-items:center;font-size:13px;}
ol.trythis b{color:var(--ink);}

details.files{margin:18px 0 4px;border:1px solid var(--line);border-radius:10px;background:#fff;padding:4px 14px;}
details.files summary{cursor:pointer;font-weight:700;font-size:14px;padding:8px 0;color:var(--muted);}
details.files ul{margin:4px 0 12px;padding-left:20px;}
details.files code{background:#eef2f7;padding:1px 6px;border-radius:5px;font-size:12.5px;}

.pager{display:flex;align-items:center;gap:12px;margin:30px 0 0;padding-top:18px;border-top:1px solid var(--line);}
.pager button{border:1px solid var(--line);background:#fff;color:var(--ink);font-weight:700;font-size:14px;
  padding:9px 16px;border-radius:10px;cursor:pointer;transition:.12s;}
.pager button:hover:not(:disabled){border-color:var(--accent-deep);color:var(--accent-deep);}
.pager button:disabled{opacity:.4;cursor:default;}
.pager .next{margin-left:auto;}
.pagerpos{color:var(--muted);font-size:13px;}

/* Overview tracks */
.tracks{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:10px 0;}
.trackcol{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px;box-shadow:var(--shadow);}
.trackhead{font-weight:800;font-size:14px;margin:2px 4px 10px;display:flex;flex-direction:column;gap:2px;}
.trackhead span{font-weight:600;font-size:12px;color:var(--muted);}
.ovcard{display:flex;width:100%;gap:11px;align-items:center;text-align:left;border:1px solid var(--line);
  background:#fbfdff;border-radius:10px;padding:9px 11px;margin-bottom:8px;cursor:pointer;transition:.12s;}
.ovcard:hover{border-color:var(--accent-deep);background:#fff;transform:translateX(2px);}
.ovnum{flex:none;width:25px;height:25px;border-radius:7px;background:var(--ink);color:#fff;font-weight:800;
  display:grid;place-items:center;font-size:13px;}
.trackcol.notes .ovnum{background:#8a5a12;}
.ovbody{display:flex;flex-direction:column;min-width:0;}
.ovbody b{font-size:14px;}
.ovbody span{font-size:12.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

.missing{padding:30px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px;}

footer{border-top:1px solid var(--line);color:var(--muted);font-size:13px;padding:22px 0 50px;}

/* Tablet/mobile: sidebar becomes a slide-in drawer */
@media (max-width:900px){
  .shell{display:block;}
  .mobilebar{display:flex;position:sticky;top:0;z-index:90;align-items:center;gap:11px;
    background:rgba(244,246,249,.93);backdrop-filter:saturate(1.4) blur(10px);
    border-bottom:1px solid var(--line);padding:10px 16px;}
  .menubtn{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);background:#fff;
    border-radius:9px;padding:8px 13px;font-weight:750;font-size:14px;cursor:pointer;color:var(--ink);}
  .mobilebar .curname{font-weight:750;color:var(--muted);font-size:14px;overflow:hidden;
    text-overflow:ellipsis;white-space:nowrap;}
  .sidebar{position:fixed;top:0;left:0;bottom:0;height:100dvh;width:284px;z-index:120;
    transform:translateX(-100%);transition:transform .22s ease;box-shadow:0 10px 50px rgba(2,8,20,.32);}
  .sidebar.open{transform:none;}
  .scrim{display:block;position:fixed;inset:0;background:rgba(8,15,28,.45);z-index:110;
    opacity:0;pointer-events:none;transition:opacity .2s;}
  .scrim.open{opacity:1;pointer-events:auto;}
  .content{padding:20px 18px 64px;}
  .contentwrap{max-width:none;}
}
@media (max-width:720px){
  .tracks{grid-template-columns:1fr;}
  header.hero h1{font-size:24px;}
  .panel h2{font-size:23px;}
}
@media print{
  .sidebar,.mobilebar,.scrim,.pager,.copy{display:none !important;}
  .shell{display:block;}
  .content{padding:0;}
  .contentwrap{max-width:none;}
  .panel[hidden]{display:block !important;}
  body{background:#fff;}
  figure.code,.concept,ol.trythis li,.callout{break-inside:avoid;}
  pre.src{white-space:pre-wrap;}
  header.hero{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
}
`

const JS = `
(function(){
  var DATA = __DATA__;
  var qs = function(s,r){return (r||document).querySelector(s);};
  var qsa = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};

  var nav = qs('#sidenav'), sidebar = qs('#sidebar'), scrim = qs('#scrim'), curname = qs('#curname');
  var current = 'overview';
  function indexInOrder(id){ return DATA.order.indexOf(id); }
  function isMobile(){ return window.matchMedia('(max-width:900px)').matches; }
  function closeDrawer(){ if(sidebar) sidebar.classList.remove('open'); if(scrim) scrim.classList.remove('open'); }
  function openDrawer(){ if(sidebar) sidebar.classList.add('open'); if(scrim) scrim.classList.add('open'); }

  function syncTabs(){
    qsa('.navitem',nav).forEach(function(t){
      t.setAttribute('aria-current', t.dataset.proj===current ? 'true':'false');
    });
    var act=qs('.navitem[aria-current="true"]',nav);
    if(act && act.scrollIntoView){ try{ act.scrollIntoView({block:'nearest'}); }catch(e){} }
    if(curname) curname.textContent = current==='overview' ? 'Overview' : current;
  }

  var menubtn = qs('#menubtn');
  if(menubtn) menubtn.addEventListener('click',function(){
    if(sidebar.classList.contains('open')) closeDrawer(); else openDrawer();
  });
  if(scrim) scrim.addEventListener('click',closeDrawer);

  function updatePagers(){
    var i=indexInOrder(current); // -1 for overview
    var panel=qs('#p-'+current);
    if(!panel) return;
    var prev=qs('.prev',panel), next=qs('.next',panel), pos=qs('.pagerpos',panel);
    if(!prev) return;
    if(i<=0){ prev.disabled=true; prev.textContent='‹ Previous'; }
    else { prev.disabled=false; prev.textContent='‹ '+DATA.order[i-1]; }
    if(i<0){ next.disabled=false; next.textContent=DATA.order[0]+' ›'; }
    else if(i>=DATA.order.length-1){ next.disabled=true; next.textContent='Next ›'; }
    else { next.disabled=false; next.textContent=DATA.order[i+1]+' ›'; }
    if(pos) pos.textContent = i<0 ? '' : ('Project '+(i+1)+' of '+DATA.order.length);
  }

  function show(id, noHash){
    if(id!=='overview' && indexInOrder(id)<0) id='overview';
    current=id;
    qsa('.panel').forEach(function(p){ p.hidden = (p.id !== 'p-'+id); });
    syncTabs();
    updatePagers();
    if(!noHash){ try{ history.replaceState(null,'','#'+id); }catch(e){ location.hash=id; } }
    window.scrollTo({top:0,behavior:'auto'});
    if(isMobile()) closeDrawer();
  }

  // all clicks (nav items, pager, overview cards, copy) via delegation
  document.body.addEventListener('click',function(e){
    var item=e.target.closest && e.target.closest('.navitem[data-proj]');
    if(item){ show(item.dataset.proj); return; }
    var goto=e.target.closest && e.target.closest('[data-goto]');
    if(goto){ show(goto.dataset.goto); return; }
    var prev=e.target.closest && e.target.closest('.prev');
    if(prev && !prev.disabled){ var i=indexInOrder(current); show(i<=0?'overview':DATA.order[i-1]); return; }
    var next=e.target.closest && e.target.closest('.next');
    if(next && !next.disabled){ var j=indexInOrder(current); show(j<0?DATA.order[0]:DATA.order[j+1]); return; }
    var copy=e.target.closest && e.target.closest('.copy');
    if(copy){
      var code=qs('pre.src code', copy.closest('figure'));
      if(code){
        var txt=code.textContent;
        navigator.clipboard && navigator.clipboard.writeText(txt).then(function(){
          copy.textContent='Copied'; copy.classList.add('done');
          setTimeout(function(){ copy.textContent='Copy'; copy.classList.remove('done'); },1400);
        });
      }
      return;
    }
  });

  // keyboard arrows
  document.addEventListener('keydown',function(e){
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if(e.key==='ArrowRight'){ var j=indexInOrder(current); if(j<DATA.order.length-1) show(j<0?DATA.order[0]:DATA.order[j+1]); }
    else if(e.key==='ArrowLeft'){ var i=indexInOrder(current); if(i>=0) show(i===0?'overview':DATA.order[i-1]); }
  });

  // search
  var input=qs('#search'), results=qs('#results');
  var allTags={};
  qsa('.panel').forEach(function(p){
    var id=p.id.replace('p-','');
    var tag=qs('.tagline',p);
    allTags[id]= tag?tag.textContent:'';
  });
  function searchList(q){
    q=q.trim().toLowerCase();
    if(!q){ results.classList.remove('open'); results.innerHTML=''; return; }
    var hits=DATA.order.filter(function(id){
      return id.toLowerCase().indexOf(q)>=0 || (allTags[id]||'').toLowerCase().indexOf(q)>=0;
    });
    if(!hits.length){ results.innerHTML='<div class="empty">No project matches “'+q+'”.</div>'; results.classList.add('open'); return; }
    results.innerHTML=hits.map(function(id,i){
      return '<button data-proj="'+id+'" class="'+(i===0?'active':'')+'"><span class="rname">'+id+'</span><span class="rtag">'+(allTags[id]||'').replace(/</g,'&lt;')+'</span></button>';
    }).join('');
    results.classList.add('open');
  }
  if(input){
    input.addEventListener('input',function(){ searchList(input.value); });
    input.addEventListener('keydown',function(e){
      if(e.key==='Enter'){ var b=qs('button.active',results)||qs('button',results); if(b){ show(b.dataset.proj); input.value=''; results.classList.remove('open'); input.blur(); } }
      else if(e.key==='Escape'){ input.value=''; results.classList.remove('open'); input.blur(); }
    });
    results.addEventListener('click',function(e){ var b=e.target.closest('button[data-proj]'); if(b){ show(b.dataset.proj); input.value=''; results.classList.remove('open'); } });
    document.addEventListener('click',function(e){ if(!e.target.closest('.search')) results.classList.remove('open'); });
  }

  // initial
  var start=(location.hash||'').replace('#','');
  show(start && (start==='overview'||indexInOrder(start)>=0) ? start : 'overview', true);
})();
`

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Android Projects, Explained — Compose &amp; Navigation 3</title>
<style>${CSS}</style>
</head>
<body>

<header class="hero">
  <div class="wrap">
    <p class="eyebrow">Android · Kotlin · Jetpack Compose · Navigation 3</p>
    <h1>Android Projects, Explained</h1>
    <p class="sub">An interactive tour of ${ORDER.length} small, self-contained teaching apps. Each one isolates a single idea — from the smallest possible Compose screen all the way to deep links, multiple back stacks, MVVM and on-device storage. Pick a project from the sidebar and read exactly what is going on. New: live <a href="./Playground/playground.html" style="color:#fff;font-weight:800;text-decoration:underline;">Compose</a> &amp; <a href="./Playground/nav-playground.html" style="color:#fff;font-weight:800;text-decoration:underline;">Navigation</a> playgrounds where you edit code and watch the UI update.</p>
    <div class="hmeta">
      <span><b>${ORDER.length}</b> projects</span>
      <span><b>2</b> tracks · navigation &amp; Android concepts</span>
      <span>Real source · real line numbers</span>
      <span><a href="./Playground/playground.html" style="color:inherit;text-decoration:none;">🧪 compose playground</a></span>
      <span><a href="./Playground/nav-playground.html" style="color:inherit;text-decoration:none;">🧭 nav playground</a></span>
      <span><a href="../labs/index.html" style="color:inherit;text-decoration:none;">✅ hands-on labs</a></span>
      <span>← → to move · ⌕ to search</span>
    </div>
  </div>
</header>

<div class="mobilebar">
  <button class="menubtn" id="menubtn" type="button" aria-label="Open project list">☰&nbsp; Projects</button>
  <span class="curname" id="curname">Overview</span>
</div>

<div class="shell">
  <aside class="sidebar" id="sidebar" aria-label="Project navigation">
    <div class="sidetitle">${ORDER.length} Projects</div>
    <div class="search">
      <input id="search" type="text" placeholder="Search…  (back stack, Room…)" autocomplete="off" />
      <div id="results" class="results"></div>
    </div>
    <nav class="sidenav" id="sidenav" role="tablist" aria-label="Projects">${sideNav()}</nav>
  </aside>
  <div class="scrim" id="scrim"></div>
  <main class="content">
    <div class="contentwrap">
      ${panels}
    </div>
  </main>
</div>

<footer>
  <div class="wrap">
    Generated from the live source of each project — code blocks are pulled by line range from the actual <code>.kt</code> / <code>.xml</code> files, so they always match what you see in Android Studio. Jetpack Compose · Navigation&nbsp;3 · Kotlin. Open in any browser; use <em>Print → Save as PDF</em> to hand out.
  </div>
</footer>

<script>${JS.replace('__DATA__', JSON.stringify(clientData))}</script>
</body>
</html>`

writeFileSync(OUT, html, 'utf8')
const built = ORDER.filter(n => data[n]).length
console.log('Wrote ' + OUT)
console.log('Projects with data: ' + built + '/' + ORDER.length + (missing.length ? ('  MISSING: ' + missing.join(', ')) : ''))
