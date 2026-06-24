#!/usr/bin/env node
// Assemble the self-contained Android Storage & Persistence Master Lab from
// styles.css + engine.js + sections.json into a single offline HTML file.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "styles.css"), "utf8");
const engine = readFileSync(join(here, "engine.js"), "utf8");
const sections = JSON.parse(readFileSync(join(here, "sections.json"), "utf8"));
const out = join(here, "..", "storage-tutorial.html");

const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Android Data Storage — Master Lab · Room, DataStore, files &amp; security, interactive</title>
<meta name="description" content="The most detailed interactive Android local-storage tutorial: SharedPreferences vs DataStore, Room (entities, DAOs, reactive Flow queries, migrations, relations), files &amp; scoped storage, encryption and backup — each concept with a live, hand-built playground and real generated Kotlin/SQL.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<button id="theme" class="theme-btn" aria-label="Toggle light/dark theme" title="Toggle theme">🌙</button>
<div class="app">
  <aside class="sidebar">
    <div class="brand"><div class="logo">DB</div><div><b>Storage&nbsp;Master&nbsp;Lab</b><span>Local storage &amp; databases, interactive</span></div></div>
    <nav id="nav" aria-label="Sections"></nav>
  </aside>
  <main class="main">
    <header class="hero">
      <span class="kick">Android · Room · DataStore · Material 3 · Interactive</span>
      <h1>Android <em>Data Storage</em>, mastered</h1>
      <p>Everything you persist on-device — key/value settings with <b>DataStore</b>, structured records with <b>Room</b>, files &amp; media under <b>scoped storage</b>, plus encryption, backup and migrations — explained in real depth and made tweakable. Insert rows and watch a reactive <code>Flow</code> re-emit, flip <code>@Entity</code> annotations and watch the <code>CREATE&nbsp;TABLE</code> change, break a migration and watch it crash.</p>
      <p class="meta"><b>${sections.length} sections</b> · written for Android devs who want to <em>understand</em> persistence, not just paste it. The playgrounds are hand-built simulations of real Android behavior; the generated Kotlin &amp; SQL are the real thing.</p>
    </header>
    <section class="quick-start" aria-label="Storage quick start">
      <h2>Start here if the storage choices feel tangled</h2>
      <p>Use this page as the deep reference, not the first explanation. First answer what shape the data has, then jump into the matching section.</p>
      <div class="quick-grid">
        <div class="quick-item"><strong>Small private settings</strong><span>Use DataStore. Examples: dark mode, sort order, last-opened tab.</span></div>
        <div class="quick-item"><strong>Many records to query</strong><span>Use Room. Examples: notes, tasks, messages, cached API rows.</span></div>
        <div class="quick-item"><strong>Files or user media</strong><span>Use filesDir/cacheDir for private app files, MediaStore or SAF for user-visible files.</span></div>
      </div>
      <div class="quick-path">
        <a href="#landscape">Choose an API</a>
        <a href="#where-it-lives">What survives?</a>
        <a href="#room-why">Room basics</a>
        <a href="#sharedprefs-vs-datastore">DataStore basics</a>
      </div>
    </section>
    <div id="sections"></div>
    <footer class="foot">
      <p>A standalone, offline interactive lab. The running Android app these concepts come from is <code>RoomAndPreferences</code> in this repo — Room (via KSP) for the notes table + DataStore Preferences for settings.</p>
    </footer>
  </main>
</div>
<script>
const SECTIONS = ${JSON.stringify(sections)};
${engine}
</script>
</body>
</html>
`;

writeFileSync(out, html);
console.log("wrote", out, "(" + html.length + " bytes,", sections.length, "sections)");
