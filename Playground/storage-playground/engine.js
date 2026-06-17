/* ===========================================================================
   Android Data Storage — Master Lab · interactive engine
   Renders the whole page from the global SECTIONS array and drives a family of
   hand-built, storage-specific playgrounds:
     db-live          live reactive Room/Flow simulator (insert/update/delete →
                      watch a Flow<List<Note>> re-emit and the UI recompose)
     entity-schema    @Entity annotations → generated Kotlin + CREATE TABLE SQL
     dao-builder      pick a DAO operation → generated method + SQL + result
     storage-chooser  "which storage do I use?" decision tree
     prefs-datastore  SharedPreferences (sync, ANR-prone) vs DataStore (Flow)
     device-map       where data lives + what survives clear-cache/uninstall
     migration        bump the schema and watch it preserve / crash / wipe
     threading        main-thread blocking vs suspend on Room's executor
     type-converter   non-primitive Kotlin types → stored column values
     backup-rules     pick buckets → generated data_extraction_rules.xml
   SECTIONS is injected above this script by build.mjs.
   =========================================================================== */
(function () {
  "use strict";

  // ----- tiny DOM + util -------------------------------------------------
  function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function el(tag, attrs, kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) { if (k === "class") e.className = attrs[k]; else if (k === "html") e.innerHTML = attrs[k]; else if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (kids) kids.forEach(function (k) { if (k) e.appendChild(k); });
    return e;
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  var REDUCED_MOTION = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function live(node, mode) { node.setAttribute("aria-live", mode || "polite"); node.setAttribute("role", mode === "off" ? "" : "status"); return node; }

  // ----- Kotlin highlighter (single pass, no span corruption) -----------
  function kt(code) {
    const re = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(@\w+)|\b(val|var|fun|by|return|if|else|when|true|false|this|in|is|as|object|class|interface|abstract|import|package|suspend|override|private|companion|enum|data|sealed|open|const|null|for|while|try|catch|throw)\b|(\b\d+(?:\.\d+)?[fL]?)(\.dp|\.sp)?|\b([A-Z][A-Za-z0-9_]*)\b|\b([a-z][A-Za-z0-9_]*)(?=\s*\()/g;
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="tok-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-ann">' + esc(m[3]) + "</span>";
      else if (m[4]) out += '<span class="tok-kw">' + esc(m[4]) + "</span>";
      else if (m[5] !== undefined) { out += '<span class="tok-num">' + esc(m[5]) + "</span>"; if (m[6]) out += '<span class="tok-prop">' + esc(m[6]) + "</span>"; }
      else if (m[7]) out += '<span class="tok-type">' + esc(m[7]) + "</span>";
      else if (m[8]) out += '<span class="tok-fn">' + esc(m[8]) + "</span>";
      last = re.lastIndex;
    }
    out += esc(code.slice(last));
    return out;
  }

  // ----- SQL highlighter -------------------------------------------------
  const SQL_KW = new Set(("select from where order by asc desc insert into values update set delete create table if not exists primary key autoincrement null integer text real blob default index on unique foreign references alter add column collate nocase and or limit count drop explain query plan using scan search begin commit transaction distinct group having inner left join as case when then end").split(" "));
  function sql(code) {
    const re = /(--[^\n]*)|('(?:[^'\\]|\\.)*')|(`[^`]*`)|(:\w+|\?)|\b(\d+)\b|\b([A-Za-z_][A-Za-z0-9_]*)\b/g;
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="tok-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-sqlid">' + esc(m[3]) + "</span>";
      else if (m[4]) out += '<span class="tok-prop">' + esc(m[4]) + "</span>";
      else if (m[5]) out += '<span class="tok-num">' + esc(m[5]) + "</span>";
      else if (m[6]) { out += SQL_KW.has(m[6].toLowerCase()) ? '<span class="tok-sqlkw">' + esc(m[6]) + "</span>" : esc(m[6]); }
      last = re.lastIndex;
    }
    out += esc(code.slice(last));
    return out;
  }

  // ----- XML highlighter (single pass, no span corruption) ---------------
  function xml(code) {
    const re = /(<!--[\s\S]*?-->)|("[^"]*")|(<\/?)([A-Za-z_][\w:.-]*)?|(\/?>)|([A-Za-z_][\w:.-]*)(?=\s*=)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="tok-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + "</span>";
      else if (m[3] !== undefined) { out += esc(m[3]); if (m[4]) out += '<span class="tok-sqlkw">' + esc(m[4]) + "</span>"; }
      else if (m[5]) out += esc(m[5]);
      else if (m[6]) out += '<span class="tok-prop">' + esc(m[6]) + "</span>";
      last = re.lastIndex;
    }
    out += esc(code.slice(last));
    return out;
  }

  // ----- code panel helper ----------------------------------------------
  function codePanel(title, getCode, lang) {
    const panel = h("div", "codepanel");
    const ch = h("div", "ch", "<span>" + esc(title) + "</span>");
    const copy = h("button", null, "Copy");
    ch.appendChild(copy);
    const pre = h("pre");
    panel.appendChild(ch); panel.appendChild(pre);
    const hl = lang === "sql" ? sql : lang === "xml" ? xml : kt;
    panel.update = function () { const c = getCode(); pre.innerHTML = hl(c); panel._raw = c; };
    copy.addEventListener("click", function () {
      navigator.clipboard && navigator.clipboard.writeText(panel._raw || getCode());
      copy.textContent = "Copied!"; setTimeout(function () { copy.textContent = "Copy"; }, 1200);
    });
    panel.update();
    return panel;
  }

  // ----- small control builders -----------------------------------------
  function segmented(options, value, onChange) {
    const seg = h("div", "seg"); seg.setAttribute("role", "radiogroup");
    function mark(v) { seg.querySelectorAll("button").forEach(function (x) { const on = x.dataset.v === v; x.classList.toggle("on", on); x.setAttribute("aria-checked", on ? "true" : "false"); }); }
    options.forEach(function (o) {
      const label = typeof o === "string" ? o : o.label;
      const val = typeof o === "string" ? o : o.value;
      const b = h("button", val === value ? "on" : null, esc(label)); b.type = "button"; b.dataset.v = val;
      b.setAttribute("role", "radio"); b.setAttribute("aria-checked", val === value ? "true" : "false");
      b.addEventListener("click", function () { value = val; mark(val); onChange(val); });
      seg.appendChild(b);
    });
    seg.setValue = function (v) { value = v; mark(v); };
    return seg;
  }
  function toggle(label, checked, onChange) {
    const wrap = h("label", "switch");
    const inp = h("input"); inp.type = "checkbox"; inp.checked = !!checked;
    wrap.appendChild(inp); wrap.appendChild(h("span", "track")); wrap.appendChild(h("span", null, esc(label)));
    inp.addEventListener("change", function () { onChange(inp.checked); });
    wrap.setChecked = function (c) { inp.checked = c; };
    return wrap;
  }
  function ctrlLabel(text) { return h("div", "pg-label", esc(text)); }

  // =========================================================================
  // WIDGET: db-live — reactive Room/Flow simulator
  // =========================================================================
  function wDbLive(spec, mount) {
    let nextId = 4;
    let table = (spec.seed || [
      { id: 1, title: "Buy groceries", body: "Milk, eggs, bread", done: false },
      { id: 2, title: "Read Room docs", body: "Focus on @Dao Flow queries", done: true },
      { id: 3, title: "Try Database Inspector", body: "App Inspection tool window", done: false },
    ]).map(function (n) { return Object.assign({}, n); });
    let sortOrder = "NEWEST";
    let step = 0;
    let logLines = [];

    const root = h("div", "dbsim");
    // -- left column: controls --
    const left = h("div", "col");
    const addbox = h("div", "addbox");
    const titleIn = h("input", "tinput"); titleIn.placeholder = "Title"; titleIn.setAttribute("aria-label", "Note title");
    const bodyIn = h("input", "tinput"); bodyIn.placeholder = "Body"; bodyIn.setAttribute("aria-label", "Note body");
    const addBtn = h("button", "btn", "Insert note");
    const r1 = h("div", "row"); r1.appendChild(titleIn);
    const r2 = h("div", "row"); r2.appendChild(bodyIn); r2.appendChild(addBtn);
    addbox.appendChild(ctrlLabel("Add a note (a Room INSERT)"));
    addbox.appendChild(r1); addbox.appendChild(r2);
    left.appendChild(addbox);

    const sortWrap = h("div", "ctrl");
    sortWrap.appendChild(ctrlLabel("Sort order (a DataStore setting → flatMapLatest)"));
    const sortSeg = segmented([{ label: "Newest first", value: "NEWEST" }, { label: "Title A–Z", value: "TITLE" }], sortOrder, function (v) { sortOrder = v; logRead("setting change → swap query"); renderList(); pulse(); });
    sortWrap.appendChild(sortSeg);
    left.appendChild(sortWrap);

    const btnRow = h("div", "btn-row");
    const restartBtn = h("button", "btn ghost small", "⟳ Force-stop & relaunch");
    const clearBtn = h("button", "btn danger small", "Delete all");
    btnRow.appendChild(restartBtn); btnRow.appendChild(clearBtn);
    left.appendChild(btnRow);
    left.appendChild(h("div", "hint", "Everything here is written to the simulated <code>notes.db</code> on disk. Force-stop &amp; relaunch throws away the in-memory UI/ViewModel — the list comes back because it was <b>persisted</b>."));

    // -- right column: the phone (UI layer) --
    const right = h("div", "col");
    const phone = h("div", "phone");
    const pbar = h("div", "pbar", '<span>NotesScreen</span><span class="dots"><i></i><i></i><i></i></span>');
    const pbody = h("div", "pbody");
    const statline = h("div", "statline");
    const uilist = h("div", "uilist");
    pbody.appendChild(statline); pbody.appendChild(uilist);
    phone.appendChild(pbar); phone.appendChild(pbody);
    right.appendChild(phone);

    root.appendChild(left); root.appendChild(right);
    mount.appendChild(root);

    // -- flow pipeline strip (full width) --
    const STAGES = [
      { ic: "✎", nm: "DAO write", sub: "@Insert" },
      { ic: "🗄️", nm: "SQLite", sub: "notes.db" },
      { ic: "👁️", nm: "Invalidation", sub: "Tracker" },
      { ic: "💧", nm: "Flow emits", sub: "observeNotes()" },
      { ic: "📦", nm: "StateFlow", sub: "stateIn" },
      { ic: "📱", nm: "UI recomposes", sub: "collectAsState" },
    ];
    const pipe = h("div", "flowpipe");
    const stageEls = STAGES.map(function (s) {
      const st = h("div", "stage");
      st.appendChild(h("div", "ic", s.ic));
      st.appendChild(h("div", "nm", esc(s.nm)));
      st.appendChild(h("div", "sub", esc(s.sub)));
      pipe.appendChild(st); return st;
    });
    mount.appendChild(ctrlLabel("Reactive pipeline — a write ripples all the way to the UI, no manual refresh"));
    mount.appendChild(pipe);

    // -- SQL/Flow console --
    const console_ = h("div", "console");
    console_.setAttribute("aria-live", "polite");
    mount.appendChild(ctrlLabel("Generated SQL & Flow log (newest on top)"));
    mount.appendChild(console_);

    // ---- behavior ----
    function fmtStr(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
    function querySql() {
      return sortOrder === "NEWEST"
        ? "SELECT * FROM notes ORDER BY id DESC"
        : "SELECT * FROM notes ORDER BY title COLLATE NOCASE ASC";
    }
    function pushLine(kind, sqlText, emit) {
      step++;
      logLines.unshift({ kind: kind, sql: sqlText, emit: emit, t: step });
      logLines = logLines.slice(0, 30);
      renderConsole();
    }
    function logWrite(sqlText) { pushLine("write", sqlText); }
    function logRead(note) { pushLine("read", querySql() + "   -- " + note); }
    function logEmit() {
      step++;
      logLines.unshift({ kind: "emit", emit: "↻ observeNotes() re-emits → List(" + table.length + ")", t: step });
      logLines = logLines.slice(0, 30); renderConsole();
    }
    function renderConsole() {
      console_.innerHTML = "";
      if (!logLines.length) { console_.appendChild(h("div", "empty", "// operations will appear here")); return; }
      logLines.forEach(function (l) {
        const line = h("div", "line " + l.kind);
        if (l.kind === "emit") { line.innerHTML = '<span class="t">' + l.t + '</span>' + esc(l.emit); }
        else { line.innerHTML = '<span class="t">' + l.t + '</span><span class="sql">' + esc(l.sql) + "</span>"; }
        console_.appendChild(line);
      });
    }
    function sortedView() {
      const v = table.slice();
      if (sortOrder === "NEWEST") v.sort(function (a, b) { return b.id - a.id; });
      else v.sort(function (a, b) { return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : a.title.toLowerCase() > b.title.toLowerCase() ? 1 : 0; });
      return v;
    }
    function renderList() {
      statline.innerHTML = "Persisted notes: <b>&nbsp;" + table.length + "</b>";
      uilist.innerHTML = "";
      const view = sortedView();
      if (!view.length) { uilist.appendChild(h("div", "empty", "No notes yet. Insert one — it survives an app restart.")); return; }
      view.forEach(function (n) {
        const row = h("div", "noterow" + (n.done ? " done" : ""));
        const chk = h("button", "chk" + (n.done ? " on" : ""), n.done ? "✓" : "");
        chk.setAttribute("aria-label", "toggle done");
        const body = h("div", "body");
        body.appendChild(h("div", "ntitle", esc(n.title) + ' <span class="nid">#' + n.id + "</span>"));
        if (n.body) body.appendChild(h("div", "nbody", esc(n.body)));
        const del = h("button", "del", "✕"); del.setAttribute("aria-label", "delete note");
        chk.addEventListener("click", function () { toggleDone(n); });
        del.addEventListener("click", function () { deleteNote(n, row); });
        row.appendChild(chk); row.appendChild(body); row.appendChild(del);
        uilist.appendChild(row);
      });
    }
    function pulse() {
      if (REDUCED_MOTION) return;   // CSS already neutralizes the animation; skip the staggered cascade
      stageEls.forEach(function (st, i) {
        setTimeout(function () { st.classList.add("pulse"); setTimeout(function () { st.classList.remove("pulse"); }, 900); }, i * 110);
      });
    }
    function insert() {
      const t = titleIn.value.trim(); if (!t) { titleIn.focus(); return; }
      const b = bodyIn.value.trim();
      const note = { id: nextId++, title: t, body: b, done: false };
      table.push(note);
      logWrite("INSERT INTO notes (title, body, done) VALUES (" + fmtStr(t) + ", " + fmtStr(b) + ", 0)");
      logEmit();
      titleIn.value = ""; bodyIn.value = ""; renderList(); pulse(); titleIn.focus();
    }
    function toggleDone(n) {
      n.done = !n.done;
      logWrite("UPDATE notes SET done = " + (n.done ? 1 : 0) + " WHERE id = " + n.id);
      logEmit(); renderList(); pulse();
    }
    function deleteNote(n, row) {
      row.classList.add("removing");
      logWrite("DELETE FROM notes WHERE id = " + n.id);
      table = table.filter(function (x) { return x.id !== n.id; });
      logEmit();
      setTimeout(function () { renderList(); }, 230); pulse();
    }
    function clearAll() {
      if (!table.length) return;
      logWrite("DELETE FROM notes");
      table = []; logEmit(); renderList(); pulse();
    }
    function restart() {
      // The UI/ViewModel layer is gone; the table on disk survives.
      uilist.innerHTML = '<div class="empty">App relaunching… re-reading notes.db…</div>';
      statline.innerHTML = "Persisted notes: <b>&nbsp;…</b>";
      logRead("cold start: collect observeNotes()");
      setTimeout(function () { renderList(); logEmit(); pulse(); }, 650);
    }

    addBtn.addEventListener("click", insert);
    titleIn.addEventListener("keydown", function (e) { if (e.key === "Enter") bodyIn.focus(); });
    bodyIn.addEventListener("keydown", function (e) { if (e.key === "Enter") insert(); });
    clearBtn.addEventListener("click", clearAll);
    restartBtn.addEventListener("click", restart);

    renderList(); renderConsole();
  }

  // =========================================================================
  // WIDGET: entity-schema — @Entity → Kotlin + CREATE TABLE
  // =========================================================================
  function wEntitySchema(spec, mount) {
    const s = { tableName: "notes", autoGen: true, renameTitle: false, nullableBody: false, addCreated: false, doneDefault: true, indexTitle: false, ignoreField: false };

    const grid = h("div", "pg-2col");
    const controls = h("div", "pg-controls");
    const right = h("div", "pg-right");

    controls.appendChild(ctrlLabel("@Entity options"));
    function addToggle(label, key) { controls.appendChild(toggle(label, s[key], function (v) { s[key] = v; refresh(); })); }
    addToggle("@PrimaryKey(autoGenerate = true)", "autoGen");
    addToggle("Rename title → @ColumnInfo(\"note_title\")", "renameTitle");
    addToggle("Make body nullable (String?)", "nullableBody");
    addToggle("Add createdAt: Long column", "addCreated");
    addToggle("done has a default (= false)", "doneDefault");
    addToggle("@Index on the title column", "indexTitle");
    addToggle("@Ignore a transient draftCache field", "ignoreField");
    controls.appendChild(h("div", "hint", "Each constructor property becomes a <b>column</b>; <code>@Ignore</code> fields do not. Booleans store as <code>INTEGER</code> 0/1; <code>Long</code>/<code>Int</code> → <code>INTEGER</code>; <code>String</code> → <code>TEXT</code>."));

    const dual = h("div", "codedual");
    const ktPanel = codePanel("Kotlin @Entity", genKotlin, "kotlin");
    const sqlPanel = codePanel("Generated CREATE TABLE", genSql, "sql");
    dual.appendChild(ktPanel); dual.appendChild(sqlPanel);
    right.appendChild(dual);

    grid.appendChild(controls); grid.appendChild(right);
    mount.appendChild(grid);

    function titleCol() { return s.renameTitle ? "note_title" : "title"; }
    function genKotlin() {
      const ann = [];
      const entityArgs = ['tableName = "' + s.tableName + '"'];
      if (s.indexTitle) entityArgs.push('indices = [Index(value = ["' + titleCol() + '"])]');
      let out = "@Entity(" + entityArgs.join(", ") + ")\n";
      out += "data class Note(\n";
      out += "    @PrimaryKey" + (s.autoGen ? "(autoGenerate = true)" : "") + " val id: Long" + (s.autoGen ? " = 0" : "") + ",\n";
      out += "    " + (s.renameTitle ? '@ColumnInfo(name = "note_title") ' : "") + "val title: String,\n";
      out += "    val body: String" + (s.nullableBody ? "?" : "") + ",\n";
      if (s.addCreated) out += "    val createdAt: Long,\n";
      out += "    val done: Boolean" + (s.doneDefault ? " = false" : "") + ",\n";
      if (s.ignoreField) out += "    @Ignore val draftCache: String? = null,\n";
      out += ")";
      return out;
    }
    function genSql() {
      const lines = [];
      lines.push("`id` INTEGER PRIMARY KEY " + (s.autoGen ? "AUTOINCREMENT " : "") + "NOT NULL");
      lines.push("`" + titleCol() + "` TEXT NOT NULL");
      lines.push("`body` TEXT" + (s.nullableBody ? "" : " NOT NULL"));
      if (s.addCreated) lines.push("`createdAt` INTEGER NOT NULL");
      lines.push("`done` INTEGER NOT NULL");
      let out = "CREATE TABLE IF NOT EXISTS `" + s.tableName + "` (\n  " + lines.join(",\n  ") + "\n);";
      if (s.indexTitle) out += "\nCREATE INDEX IF NOT EXISTS\n  `index_" + s.tableName + "_" + titleCol() + "` ON `" + s.tableName + "` (`" + titleCol() + "`);";
      out += "\n-- @Ignore fields never become columns." + (s.ignoreField ? " (draftCache omitted)" : "");
      return out;
    }
    function refresh() { ktPanel.update(); sqlPanel.update(); }
  }

  // =========================================================================
  // WIDGET: dao-builder — pick an operation → method + SQL + result
  // =========================================================================
  function wDaoBuilder(spec, mount) {
    const sample = [
      { id: 1, title: "Buy groceries", body: "Milk, eggs", done: 0 },
      { id: 2, title: "Read Room docs", body: "Flow queries", done: 1 },
      { id: 3, title: "Apartment", body: "Call landlord", done: 0 },
    ];
    const st = { op: "observe", ret: "flow", order: "NEWEST", conflict: "ABORT" };

    const grid = h("div", "pg-2col");
    const controls = h("div", "pg-controls");
    const right = h("div", "pg-right");

    controls.appendChild(ctrlLabel("DAO operation"));
    const opSeg = segmented([
      { label: "Observe all", value: "observe" }, { label: "Get one", value: "getone" },
      { label: "Insert", value: "insert" }, { label: "Update", value: "update" },
      { label: "Delete", value: "delete" }, { label: "Count", value: "count" },
    ], st.op, function (v) { st.op = v; syncOptionVis(); refresh(); });
    controls.appendChild(opSeg);

    const retWrap = h("div", "ctrl");
    retWrap.appendChild(ctrlLabel("Return type"));
    const retSeg = segmented([{ label: "Flow (reactive)", value: "flow" }, { label: "suspend (one-shot)", value: "suspend" }], st.ret, function (v) { st.ret = v; refresh(); });
    retWrap.appendChild(retSeg);
    controls.appendChild(retWrap);

    const orderWrap = h("div", "ctrl");
    orderWrap.appendChild(ctrlLabel("Order by"));
    const orderSeg = segmented([{ label: "Newest (id DESC)", value: "NEWEST" }, { label: "Title A–Z", value: "TITLE" }], st.order, function (v) { st.order = v; refresh(); });
    orderWrap.appendChild(orderSeg);
    controls.appendChild(orderWrap);

    const confWrap = h("div", "ctrl");
    confWrap.appendChild(ctrlLabel("Conflict strategy"));
    const confSeg = segmented([{ label: "ABORT (default)", value: "ABORT" }, { label: "IGNORE", value: "IGNORE" }, { label: "REPLACE", value: "REPLACE" }], st.conflict, function (v) { st.conflict = v; refresh(); });
    confWrap.appendChild(confSeg);
    controls.appendChild(confWrap);

    const dual = h("div", "codedual");
    const ktPanel = codePanel("Kotlin @Dao method", genKotlin, "kotlin");
    const sqlPanel = codePanel("SQL Room runs", genSql, "sql");
    dual.appendChild(ktPanel); dual.appendChild(sqlPanel);
    right.appendChild(dual);
    const note = h("div", "note");
    right.appendChild(note);
    const runWrap = h("div", null);
    const runBtn = h("button", "btn tonal small", "▶ Run on a 3-row sample");
    const runOut = h("div", "console"); runOut.setAttribute("aria-live", "polite");
    runWrap.appendChild(runBtn); runWrap.appendChild(h("div", "hint", "&nbsp;")); runWrap.appendChild(runOut);
    right.appendChild(runWrap);
    runOut.appendChild(h("div", "empty", "// result appears here"));

    grid.appendChild(controls); grid.appendChild(right);
    mount.appendChild(grid);

    function syncOptionVis() {
      retWrap.style.display = (st.op === "observe" || st.op === "getone" || st.op === "count") ? "" : "none";
      orderWrap.style.display = (st.op === "observe") ? "" : "none";
      confWrap.style.display = (st.op === "insert") ? "" : "none";
      // count is always reactive-or-suspend but order N/A; getone uses suspend usually
    }
    function orderClause() { return st.order === "NEWEST" ? "ORDER BY id DESC" : "ORDER BY title COLLATE NOCASE ASC"; }
    function genKotlin() {
      switch (st.op) {
        case "observe":
          return st.ret === "flow"
            ? '@Query("SELECT * FROM notes ' + orderClause() + '")\nfun observeNotes(): Flow<List<Note>>'
            : '@Query("SELECT * FROM notes ' + orderClause() + '")\nsuspend fun getNotes(): List<Note>';
        case "getone":
          return '@Query("SELECT * FROM notes WHERE id = :id")\nsuspend fun getNote(id: Long): Note?';
        case "insert":
          return "@Insert(onConflict = OnConflictStrategy." + st.conflict + ")\nsuspend fun insert(note: Note): Long";
        case "update":
          return "@Update\nsuspend fun update(note: Note): Int";
        case "delete":
          return "@Delete\nsuspend fun delete(note: Note): Int";
        case "count":
          return '@Query("SELECT COUNT(*) FROM notes")\nfun count(): Flow<Int>';
      }
    }
    function genSql() {
      switch (st.op) {
        case "observe": return "SELECT * FROM notes " + orderClause() + ";";
        case "getone": return "SELECT * FROM notes WHERE id = ?;";
        case "insert": return "INSERT OR " + st.conflict + " INTO notes\n  (title, body, done) VALUES (?, ?, ?);";
        case "update": return "UPDATE OR ABORT notes\n  SET title = ?, body = ?, done = ?\n  WHERE id = ?;";
        case "delete": return "DELETE FROM notes WHERE id = ?;";
        case "count": return "SELECT COUNT(*) FROM notes;";
      }
    }
    function noteText() {
      switch (st.op) {
        case "observe": return st.ret === "flow"
          ? "<b>Reactive.</b> Room watches the <code>notes</code> table and re-emits a fresh list on <b>every</b> change. Collect it once; never call it imperatively."
          : "<b>One-shot.</b> <code>suspend</code> → runs on Room's own executor (off the main thread). Returns a snapshot — it will <b>not</b> update when the table changes.";
        case "getone": return "<b>One-shot read by key.</b> Returns <code>Note?</code> — null when no row has that id.";
        case "insert": return st.conflict === "IGNORE"
          ? "<b>IGNORE</b> skips a conflicting row and returns <code>-1</code> for it (check the rowid!)."
          : st.conflict === "REPLACE"
            ? "<b>REPLACE</b> deletes the conflicting row then inserts — beware: it fires <code>ON DELETE</code> foreign-key actions."
            : "<b>ABORT</b> (the default) rolls back the statement on conflict. <code>@Insert</code> returns the new rowid.";
        case "update": return "<b>Matched by @PrimaryKey.</b> Returns the number of rows updated (0 if the id wasn't found).";
        case "delete": return "<b>Matched by @PrimaryKey.</b> Returns the number of rows deleted.";
        case "count": return "<b>Reactive count.</b> A <code>Flow&lt;Int&gt;</code> that re-emits whenever rows are added or removed.";
      }
    }
    function runResult() {
      runOut.innerHTML = "";
      function line(cls, txt) { const l = h("div", "line " + (cls || ""), esc(txt)); runOut.appendChild(l); }
      const ordered = sample.slice();
      if (st.op === "observe") {
        if (st.order === "NEWEST") ordered.sort(function (a, b) { return b.id - a.id; });
        else ordered.sort(function (a, b) { return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1; });
        ordered.forEach(function (n) { line("read", "#" + n.id + "  " + n.title + "  done=" + n.done); });
        line("emit", st.ret === "flow" ? "→ Flow<List<Note>> emits List(" + ordered.length + ")" : "→ returns List(" + ordered.length + ") once");
      } else if (st.op === "getone") {
        line("read", "#2  Read Room docs  done=1"); line("emit", "→ Note? = Note(id=2, …)");
      } else if (st.op === "insert") {
        line("write", "INSERT OR " + st.conflict + " … (id=4)"); line("emit", st.conflict === "IGNORE" ? "→ returns rowid 4  (or -1 if skipped)" : "→ returns new rowid 4");
      } else if (st.op === "update") {
        line("write", "UPDATE … WHERE id=2"); line("emit", "→ returns 1 (rows updated)");
      } else if (st.op === "delete") {
        line("write", "DELETE … WHERE id=2"); line("emit", "→ returns 1 (rows deleted)");
      } else if (st.op === "count") {
        line("read", "SELECT COUNT(*) → 3"); line("emit", "→ Flow<Int> emits 3");
      }
    }
    runBtn.addEventListener("click", runResult);

    function refresh() { ktPanel.update(); sqlPanel.update(); note.innerHTML = noteText(); }
    syncOptionVis(); refresh();
  }

  // =========================================================================
  // WIDGET: storage-chooser — decision tree
  // =========================================================================
  function wStorageChooser(spec, mount) {
    const NODES = {
      start: {
        q: "What are you storing?",
        opts: [
          { label: "A handful of user settings or flags", sub: "dark mode, last tab, onboarding seen", to: "settings" },
          { label: "Many structured records you'll query / sort / filter", sub: "notes, messages, a catalog", to: "relational" },
          { label: "Large files: photos, video, PDFs, downloads", sub: "binary blobs, documents", to: "files" },
          { label: "One bundle of typed app state", sub: "a UserPrefs object with a schema", to: "reco:proto" },
        ],
      },
      settings: {
        q: "How much structure do those settings need?",
        opts: [
          { label: "A few independent keys (Boolean / Int / String)", sub: "no schema", to: "reco:prefs" },
          { label: "A typed object with a defined schema", sub: "validated shape, defaults", to: "reco:proto" },
        ],
      },
      relational: {
        q: "Is any of that data sensitive?",
        opts: [
          { label: "No — ordinary app data", sub: "notes, cached items", to: "reco:room" },
          { label: "Yes — tokens, personal, health or financial data", sub: "needs encryption at rest", to: "reco:room-enc" },
        ],
      },
      files: {
        q: "Who needs to see the file?",
        opts: [
          { label: "Only my app", sub: "working files, downloaded cache", to: "filesPrivate" },
          { label: "The user, in their gallery / Files app", sub: "saved photos, exports", to: "reco:mediastore" },
          { label: "Let the user pick where to open / save", sub: "import / export anywhere", to: "reco:saf" },
        ],
      },
      filesPrivate: {
        q: "Does it need to survive low-storage cleanup?",
        opts: [
          { label: "Yes — keep until I delete it", sub: "filesDir", to: "reco:internal" },
          { label: "No — it's re-creatable cache", sub: "cacheDir", to: "reco:cache" },
        ],
      },
    };
    const RECO = {
      prefs: { ic: "🔑", title: "Preferences DataStore", pill: "androidx.datastore:datastore-preferences", why: "A few independent key/value settings with no schema is exactly DataStore's sweet spot. It replaces SharedPreferences with an async, Flow-based, transactional API — no main-thread disk I/O.", bullets: ["Reads are a <code>Flow&lt;Preferences&gt;</code> you <code>.map</code>", "Writes are a suspending, transactional <code>edit { }</code>", "Stored at <code>files/datastore/&lt;name&gt;.preferences_pb</code>"], alt: "Need a validated typed object instead of loose keys? Use Typed (Proto) DataStore." },
      proto: { ic: "🧱", title: "Typed (Proto) DataStore", pill: "androidx.datastore:datastore", why: "When the state is one structured object with a schema, a typed DataStore gives you compile-time type safety via a Serializer (Protocol Buffers, JSON, …) instead of stringly-typed keys.", bullets: ["Define a schema + a <code>Serializer&lt;T&gt;</code>", "Reads <code>Flow&lt;T&gt;</code>; writes <code>updateData { }</code>", "Type-safe, with real defaults"], alt: "Just a couple of loose flags? Preferences DataStore is lighter." },
      room: { ic: "🗃️", title: "Room (SQLite)", pill: "androidx.room", why: "Many records you query, sort, filter or relate = a database. Room maps annotated Kotlin classes to SQLite, verifies your SQL at compile time, and hands you reactive <code>Flow</code> queries.", bullets: ["<code>@Entity</code> tables, <code>@Dao</code> queries, <code>@Database</code> holder", "<code>Flow&lt;List&lt;T&gt;&gt;</code> queries auto-update the UI", "Relations, indices, migrations, transactions"], alt: "Only a few unrelated keys? That's DataStore, not Room." },
      "room-enc": { ic: "🔐", title: "Room + SQLCipher", pill: "net.zetetic:sqlcipher-android", why: "Sensitive structured data still belongs in Room — but encrypt the whole database file at rest with SQLCipher, keying it from a secret held in the Android Keystore.", bullets: ["SQLCipher <code>SupportFactory</code> → <code>openHelperFactory</code>", "Passphrase wrapped by an Android Keystore key", "Pair with <code>androidx.sqlite</code>"], alt: "Not actually sensitive? Plain Room is simpler and faster. (Jetpack Security's EncryptedSharedPreferences is deprecated — don't reach for it.)" },
      mediastore: { ic: "🖼️", title: "MediaStore + Photo Picker", pill: "no storage permission", why: "User-visible media should live in the shared MediaStore so it appears in the gallery and survives your app's uninstall. To let users pick media, use the Photo Picker — no permission required.", bullets: ["<code>ActivityResultContracts.PickVisualMedia</code> to pick", "<code>MediaStore</code> to insert into Images/Video/Downloads", "Shared entries persist after uninstall"], alt: "Private working files instead? Use internal app storage." },
      saf: { ic: "📂", title: "Storage Access Framework", pill: "ACTION_OPEN_DOCUMENT", why: "When the user should choose the exact file/location, SAF gives you a content URI with no storage permission. Persist the grant to keep access across reboots.", bullets: ["<code>OpenDocument</code> / <code>CreateDocument</code> contracts", "<code>takePersistableUriPermission()</code> to keep access", "Great for import/export"], alt: "Sharing your own private file out? Use a FileProvider content:// URI." },
      internal: { ic: "📁", title: "Internal app storage — filesDir", pill: "context.filesDir", why: "Private to your app and permission-free, and protected at rest by the device's file-based encryption on modern (Android 10+) devices. Perfect for files only your app reads that must persist until you delete them.", bullets: ["<code>context.filesDir</code> / <code>openFileOutput()</code>", "Removed on uninstall (private)", "Device encryption at rest — not a substitute for app-level encryption of secrets"], alt: "Re-creatable? Use cacheDir so the system can reclaim it. Storing real secrets? See the encryption section." },
      cache: { ic: "🧹", title: "Internal cache — cacheDir", pill: "context.cacheDir", why: "Re-creatable scratch data goes in the cache, which the system can evict under low storage and the user can clear anytime. Always existence-check before reading.", bullets: ["<code>context.cacheDir</code> (never backed up)", "Evictable under low storage", "Keep it small"], alt: "Must it persist? Use filesDir instead." },
    };

    let nodeId = "start";
    const trail = [];        // option labels, for breadcrumbs
    const navStack = [];     // previous node ids, for a deterministic single-step Back
    const wrap = h("div", "tree");
    const crumbs = h("div", "breadcrumbs");
    const slot = h("div");
    wrap.appendChild(crumbs); wrap.appendChild(slot);
    mount.appendChild(wrap);

    function renderCrumbs() {
      crumbs.innerHTML = "";
      if (!trail.length) { crumbs.appendChild(h("span", "bc q", "Start")); return; }
      trail.forEach(function (t) { crumbs.appendChild(h("span", "bc", esc(t))); });
    }
    function go(to, label) {
      navStack.push(nodeId);             // remember where we came from
      if (label) trail.push(label);
      if (to.indexOf("reco:") === 0) { renderReco(to.slice(5)); }
      else { nodeId = to; renderNode(); }
      renderCrumbs();
    }
    function back() {
      nodeId = navStack.pop() || "start";
      trail.pop();
      renderNode(); renderCrumbs();
    }
    function reset() { navStack.length = 0; trail.length = 0; nodeId = "start"; renderNode(); renderCrumbs(); }
    function renderNode() {
      const n = NODES[nodeId];
      slot.innerHTML = "";
      const card = h("div", "qcard");
      card.appendChild(h("div", "qstep", "Question " + (trail.length + 1)));
      card.appendChild(h("div", "qtext", esc(n.q)));
      const opts = h("div", "qopts");
      n.opts.forEach(function (o) {
        const b = h("button", "qopt"); b.type = "button";
        b.innerHTML = "<span>" + esc(o.label) + "</span><span class='qsub'>" + esc(o.sub) + "</span>";
        b.addEventListener("click", function () { go(o.to, o.label); });
        opts.appendChild(b);
      });
      card.appendChild(opts);
      slot.appendChild(card);
      if (navStack.length) slot.appendChild(backBtn());
    }
    function renderReco(id) {
      const r = RECO[id];
      slot.innerHTML = "";
      const card = h("div", "reco");
      const rh = h("div", "rh");
      rh.appendChild(h("div", "ric", r.ic));
      rh.appendChild(h("h3", null, esc(r.title)));
      rh.appendChild(h("span", "pill api", esc(r.pill)));
      card.appendChild(rh);
      card.appendChild(h("div", "why", "<b>Why:</b> " + r.why));
      const ul = h("ul"); r.bullets.forEach(function (b) { ul.appendChild(h("li", null, b)); }); card.appendChild(ul);
      card.appendChild(h("div", "alt", r.alt));
      slot.appendChild(card);
      const row = h("div", "btn-row"); row.appendChild(backBtn()); row.appendChild(restartBtn());
      slot.appendChild(row);
    }
    function backBtn() {
      const b = h("button", "btn ghost small", "← Back");
      b.addEventListener("click", back);
      return b;
    }
    function restartBtn() {
      const b = h("button", "btn ghost small", "↺ Start over");
      b.addEventListener("click", reset);
      return b;
    }

    renderCrumbs(); renderNode();
  }

  // =========================================================================
  // WIDGET: prefs-datastore — SharedPreferences vs DataStore
  // =========================================================================
  function wPrefsDatastore(spec, mount) {
    const state = { dark: false, username: "ada" };
    const emits = [];

    const top = h("div", "pg-controls");
    top.appendChild(ctrlLabel("Change a setting (both stores see it)"));
    const darkToggle = toggle("Dark theme", state.dark, function (v) { state.dark = v; onChange("dark_theme", v); });
    const userRow = h("div", "btn-row");
    const userIn = h("input", "tinput"); userIn.value = state.username; userIn.setAttribute("aria-label", "username"); userIn.style.maxWidth = "180px";
    const setBtn = h("button", "btn small", "Set username");
    userRow.appendChild(userIn); userRow.appendChild(setBtn);
    top.appendChild(darkToggle); top.appendChild(userRow);
    mount.appendChild(top);

    const versus = h("div", "versus");
    // OLD card
    const oldCard = h("div", "vcard old");
    oldCard.innerHTML = "<h4>SharedPreferences <span class='vtag'>legacy · discouraged</span></h4>";
    const oldReadout = h("div", "readout");
    const oldCode = codePanel("Read + write (synchronous)", function () {
      return 'val prefs = getSharedPreferences("settings", MODE_PRIVATE)\n' +
        '// synchronous getter — returns immediately, may touch disk:\n' +
        'val dark = prefs.getBoolean("dark_theme", false)\n' +
        '// write (apply = async to disk, commit = blocking):\n' +
        'prefs.edit().putBoolean("dark_theme", ' + state.dark + ').apply()';
    }, "kotlin");
    const readBtn = h("button", "btn ghost small", "Read on the main thread");
    const anr = h("div", "anr", "⚠ StrictMode flags a disk read on the UI thread → jank / ANR risk");
    const frameOld = h("div", "framebar");
    for (let i = 0; i < 18; i++) frameOld.appendChild(h("div", "fr"));
    const oldBody = h("div", "vbody");
    oldBody.appendChild(oldReadout); oldBody.appendChild(oldCode);
    oldBody.appendChild(readBtn); oldBody.appendChild(anr);
    oldBody.appendChild(h("div", "hint", "To react to changes you must register an <code>OnSharedPreferenceChangeListener</code> — a callback, not a stream."));
    oldBody.appendChild(frameOld);
    oldCard.appendChild(oldBody);

    // NEW card
    const newCard = h("div", "vcard new");
    newCard.innerHTML = "<h4>DataStore <span class='vtag'>recommended</span></h4>";
    const newCode = codePanel("Read (Flow) + write (suspend)", function () {
      return 'val Context.dataStore by preferencesDataStore("settings")\n' +
        'val KEY = booleanPreferencesKey("dark_theme")\n\n' +
        '// reactive read — emits on every change:\n' +
        'val darkFlow: Flow<Boolean> = dataStore.data.map { it[KEY] ?: false }\n\n' +
        '// transactional suspend write:\n' +
        'suspend fun set(v: Boolean) = dataStore.edit { it[KEY] = v }';
    }, "kotlin");
    const ticker = h("div", "emitticker");
    const frameNew = h("div", "framebar");
    for (let i = 0; i < 18; i++) frameNew.appendChild(h("div", "fr"));
    const newBody = h("div", "vbody");
    newBody.appendChild(newCode);
    newBody.appendChild(ctrlLabel("darkFlow / usernameFlow emissions"));
    newBody.appendChild(ticker);
    newBody.appendChild(h("div", "hint", "The Flow emits automatically — the UI just collects it. No callbacks, no main-thread I/O."));
    newBody.appendChild(frameNew);
    newCard.appendChild(newBody);

    versus.appendChild(oldCard); versus.appendChild(newCard);
    mount.appendChild(versus);

    function renderReadout() {
      oldReadout.innerHTML = '<span class="k">dark_theme</span> = ' + state.dark + '<br><span class="k">username</span> = "' + esc(state.username) + '"';
    }
    function pushEmit(key, val) {
      emits.unshift(key + " → " + JSON.stringify(val));
      while (emits.length > 8) emits.pop();
      ticker.innerHTML = "";
      emits.forEach(function (e) { ticker.appendChild(h("div", "e", esc(e))); });
    }
    function onChange(key, val) {
      renderReadout(); oldCode.update(); newCode.update(); pushEmit(key, val);
    }
    setBtn.addEventListener("click", function () { state.username = userIn.value.trim() || "ada"; onChange("username", state.username); });
    userIn.addEventListener("keydown", function (e) { if (e.key === "Enter") setBtn.click(); });
    readBtn.addEventListener("click", function () {
      anr.classList.add("show");
      const frs = frameOld.querySelectorAll(".fr");
      frs.forEach(function (f, i) { if (i >= 6 && i <= 12) f.classList.add("drop"); });
      setTimeout(function () { anr.classList.remove("show"); frs.forEach(function (f) { f.classList.remove("drop"); }); }, 1800);
    });

    renderReadout(); pushEmit("dark_theme", state.dark);
  }

  // =========================================================================
  // WIDGET: device-map — where data lives + lifecycle
  // =========================================================================
  function wDeviceMap(spec, mount) {
    const BUCKETS = [
      { g: "Internal app storage  ·  /data/data/<pkg>/", items: [
        { id: "files", ic: "📄", nm: "files/", path: "filesDir", backup: true, survives: false },
        { id: "ds", ic: "🔑", nm: "datastore/settings.preferences_pb", path: "DataStore", backup: true, survives: false },
        { id: "db", ic: "🗃️", nm: "databases/notes.db", path: "Room", backup: true, survives: false },
        { id: "sp", ic: "⚙️", nm: "shared_prefs/*.xml", path: "SharedPreferences", backup: true, survives: false },
        { id: "cache", ic: "🧹", nm: "cache/", path: "cacheDir", backup: false, survives: false },
      ]},
      { g: "External app-specific  ·  /Android/data/<pkg>/", items: [
        { id: "extf", ic: "📁", nm: "files/", path: "getExternalFilesDir()", backup: false, survives: false },
        { id: "extc", ic: "🧹", nm: "cache/", path: "externalCacheDir", backup: false, survives: false },
      ]},
      { g: "Shared storage  ·  visible to user & other apps", items: [
        { id: "media", ic: "🖼️", nm: "MediaStore (Pictures / Downloads)", path: "shared", backup: false, survives: true },
      ]},
    ];

    const wrap = h("div", "devmap");
    const buckets = h("div", "buckets");
    const elMap = {};
    BUCKETS.forEach(function (grp) {
      const g = h("div", "bgroup");
      g.appendChild(h("div", "bg-h", esc(grp.g)));
      grp.items.forEach(function (it) {
        const row = h("div", "bucket");
        row.appendChild(h("div", "bic", it.ic));
        const txt = h("div"); txt.appendChild(h("div", "bn", esc(it.nm))); txt.appendChild(h("div", "bp", esc(it.path)));
        row.appendChild(txt);
        const meta = h("div", "bmeta");
        meta.appendChild(h("span", "pill " + (it.survives ? "good" : "bad"), it.survives ? "survives uninstall" : "removed on uninstall"));
        meta.appendChild(h("span", "pill " + (it.backup ? "good" : ""), it.backup ? "in backup" : "not backed up"));
        row.appendChild(meta);
        g.appendChild(row); elMap[it.id] = { row: row, def: it };
      });
      buckets.appendChild(g);
    });

    const panel = h("div");
    panel.appendChild(ctrlLabel("Trigger a lifecycle event"));
    const btns = h("div", "btn-row");
    const actions = [
      { k: "cache", label: "Clear cache", cls: "ghost" },
      { k: "data", label: "Clear storage (Clear data)", cls: "ghost" },
      { k: "uninstall", label: "Uninstall app", cls: "danger" },
      { k: "restore", label: "Restore from backup", cls: "tonal" },
      { k: "reset", label: "Reset", cls: "ghost" },
    ];
    actions.forEach(function (a) { const b = h("button", "btn small " + a.cls, esc(a.label)); b.addEventListener("click", function () { run(a.k); }); btns.appendChild(b); });
    panel.appendChild(btns);
    const narr = live(h("div", "verdict-line")); narr.style.marginTop = "10px"; narr.textContent = "Pick an event to see which buckets are wiped or kept.";
    panel.appendChild(narr);
    const legend = h("div", "legend");
    legend.innerHTML =
      '<div class="lg"><span class="pill bad">removed on uninstall</span> app-private &amp; app-specific dirs are deleted</div>' +
      '<div class="lg"><span class="pill good">survives uninstall</span> shared MediaStore entries remain</div>' +
      '<div class="lg"><span class="pill">not backed up</span> cache &amp; <code>noBackupFilesDir</code> are never in Auto Backup</div>';
    panel.appendChild(legend);

    wrap.appendChild(buckets); wrap.appendChild(panel);
    mount.appendChild(wrap);

    function clearAll() { Object.keys(elMap).forEach(function (k) { elMap[k].row.classList.remove("wiped", "kept", "flash"); }); }
    function wipe(ids) { ids.forEach(function (id) { const e = elMap[id]; if (e) { e.row.classList.add("flash"); setTimeout(function () { e.row.classList.add("wiped"); }, 250); } }); }
    function keep(ids) { ids.forEach(function (id) { const e = elMap[id]; if (e) e.row.classList.add("kept"); }); }
    function run(k) {
      clearAll();
      if (k === "reset") { narr.className = "verdict-line"; narr.textContent = "Reset — all buckets intact."; return; }
      if (k === "cache") { wipe(["cache", "extc"]); narr.className = "verdict-line bad"; narr.textContent = "Clear cache → only cacheDir + external cache are emptied. Everything else stays. (The system does this automatically under low storage too.)"; }
      else if (k === "data") { wipe(["files", "ds", "db", "sp", "cache", "extf", "extc"]); keep(["media"]); narr.className = "verdict-line bad"; narr.textContent = "Clear storage (Settings → Clear data) → ALL app-private + app-specific external data is wiped; the app starts as if freshly installed. Shared MediaStore entries remain."; }
      else if (k === "uninstall") { wipe(["files", "ds", "db", "sp", "cache", "extf", "extc"]); keep(["media"]); narr.className = "verdict-line bad"; narr.textContent = "Uninstall → every app-specific directory (internal AND external) is deleted. Only the shared MediaStore files your app wrote persist."; }
      else if (k === "restore") { keep(["files", "ds", "db", "sp"]); narr.className = "verdict-line ok"; narr.textContent = "Auto Backup restore → files, DataStore, Room DB and SharedPreferences come back (per your rules). cache/ and noBackupFilesDir are never restored. Keystore-encrypted data won't decrypt on a new device."; }
    }
  }

  // =========================================================================
  // WIDGET: migration — bump the schema, watch it preserve / crash / wipe
  // =========================================================================
  function wMigration(spec, mount) {
    const v1rows = [
      { id: 1, title: "Buy groceries" },
      { id: 2, title: "Read Room docs" },
      { id: 3, title: "Call landlord" },
    ];
    let version = 1, bumped = false, strategy = null;

    const wrap = h("div", "migwrap");
    const statusEl = h("div", "statline");
    wrap.appendChild(statusEl);

    const tables = h("div", "mig-tables");
    const leftT = h("div"); const rightT = h("div");
    tables.appendChild(leftT); tables.appendChild(rightT);
    wrap.appendChild(tables);

    const ctrls = h("div");
    ctrls.appendChild(ctrlLabel("Step 1 — change the schema"));
    const bumpBtn = h("button", "btn small", "Add `color` column → bump to v2");
    ctrls.appendChild(bumpBtn);
    const stratLabel = ctrlLabel("Step 2 — choose a migration strategy");
    const stratRow = h("div", "btn-row");
    const strategies = [
      { k: "none", label: "No migration", cls: "danger" },
      { k: "manual", label: "Manual Migration(1,2)", cls: "tonal" },
      { k: "auto", label: "AutoMigration", cls: "tonal" },
      { k: "destructive", label: "fallbackToDestructiveMigration", cls: "ghost" },
    ];
    strategies.forEach(function (s) { const b = h("button", "btn small " + s.cls, esc(s.label)); b.dataset.k = s.k; b.disabled = true; b.addEventListener("click", function () { strategy = s.k; render(); }); stratRow.appendChild(b); });
    ctrls.appendChild(stratLabel); ctrls.appendChild(stratRow);
    const resetBtn = h("button", "btn ghost small", "↺ Reset to v1");
    resetBtn.style.marginTop = "8px";
    resetBtn.addEventListener("click", function () { version = 1; bumped = false; strategy = null; render(); });
    ctrls.appendChild(resetBtn);
    wrap.appendChild(ctrls);

    const crash = h("div", "crashcard"); crash.setAttribute("aria-live", "polite");
    wrap.appendChild(crash);
    const outcome = h("div"); outcome.setAttribute("aria-live", "polite");
    wrap.appendChild(outcome);
    const codeSlot = h("div");
    wrap.appendChild(codeSlot);

    mount.appendChild(wrap);

    bumpBtn.addEventListener("click", function () { if (!bumped) { bumped = true; version = 2; strategy = null; } render(); });

    function renderTable(container, caption, cols, rows, opts) {
      opts = opts || {};
      container.innerHTML = "";
      const t = h("div", "dtable");
      t.appendChild(h("div", "dt-cap", "<span>" + esc(caption) + "</span><span class='pill'>" + rows.length + " rows</span>"));
      const tbl = h("table");
      const thead = h("tr");
      cols.forEach(function (c) { const th = h("th", c.newcol ? "newcol" : null, esc(c.name)); thead.appendChild(th); });
      tbl.appendChild(thead);
      rows.forEach(function (r) {
        const tr = h("tr");
        cols.forEach(function (c) { const td = h("td", c.newcol ? "newcol" : null, esc(r[c.key] == null ? "" : r[c.key])); tr.appendChild(td); });
        tbl.appendChild(tr);
      });
      t.appendChild(tbl); container.appendChild(t);
    }
    function code(title, text, lang) { const c = codePanel(title, function () { return text; }, lang || "kotlin"); codeSlot.innerHTML = ""; codeSlot.appendChild(c); }

    function render() {
      statusEl.innerHTML = "Schema version on disk: <b>&nbsp;v1</b> &nbsp; · &nbsp; @Database(version = <b>" + version + "</b>)";
      // left = what's on disk (v1)
      renderTable(leftT, "On disk (written at v1)", [{ name: "id", key: "id" }, { name: "title", key: "title" }], v1rows);
      // strategy buttons enabled only after bump
      stratRow.querySelectorAll("button").forEach(function (b) { b.disabled = !bumped; b.classList.toggle("on", b.dataset.k === strategy); });
      crash.classList.remove("show"); outcome.innerHTML = ""; codeSlot.innerHTML = "";

      const v2cols = [{ name: "id", key: "id" }, { name: "title", key: "title" }, { name: "color", key: "color", newcol: true }];
      if (!bumped) {
        renderTable(rightT, "After app opens (v1, unchanged)", [{ name: "id", key: "id" }, { name: "title", key: "title" }], v1rows);
        return;
      }
      if (!strategy) {
        rightT.innerHTML = "<div class='hint' style='padding:18px'>You added a column and bumped to v2. Room now needs to reconcile the on-disk v1 schema with v2. Pick a strategy →</div>";
        return;
      }
      if (strategy === "none") {
        renderTable(rightT, "App fails to open", [{ name: "id", key: "id" }, { name: "title", key: "title" }], v1rows);
        crash.innerHTML = "<h4>💥 App crashes on launch</h4>";
        const pre = h("pre"); pre.textContent = "java.lang.IllegalStateException: A migration from 1 to 2\nwas required but not found. Please provide the necessary\nMigration path via RoomDatabase.Builder.addMigration(...) or\nallow for destructive migrations via one of the\nfallbackToDestructiveMigration* methods.";
        crash.appendChild(pre); crash.classList.add("show");
        code("Builder (missing the migration)", 'Room.databaseBuilder(context.applicationContext, NoteDatabase::class.java, "notes.db")\n    // ❌ nothing tells Room how to get from v1 → v2\n    .build()');
      } else if (strategy === "manual") {
        const rows = v1rows.map(function (r) { return { id: r.id, title: r.title, color: "#FFFFFF" }; });
        renderTable(rightT, "After open (migrated)", v2cols, rows);
        outcome.innerHTML = "<div class='outcome ok'>✓ Data preserved — 3 rows kept, new column filled with its default.</div>";
        code("Manual Migration + ALTER TABLE", 'val MIGRATION_1_2 = object : Migration(1, 2) {\n    override fun migrate(db: SupportSQLiteDatabase) {\n        db.execSQL(\n            "ALTER TABLE notes ADD COLUMN color TEXT NOT NULL DEFAULT \'#FFFFFF\'"\n        )\n    }\n}\n\nRoom.databaseBuilder(context.applicationContext, NoteDatabase::class.java, "notes.db")\n    .addMigrations(MIGRATION_1_2)   // ✓ Room runs it on open\n    .build()');
      } else if (strategy === "auto") {
        const rows = v1rows.map(function (r) { return { id: r.id, title: r.title, color: "#FFFFFF" }; });
        renderTable(rightT, "After open (auto-migrated)", v2cols, rows);
        outcome.innerHTML = "<div class='outcome ok'>✓ Data preserved — Room generated the ALTER for this additive change. Requires exportSchema = true + a schema directory.</div>";
        code("AutoMigration (Room diffs the exported schemas)", '@Database(\n    entities = [Note::class],\n    version = 2,\n    exportSchema = true,\n    autoMigrations = [AutoMigration(from = 1, to = 2)]\n)\nabstract class NoteDatabase : RoomDatabase()\n\n// No hand-written SQL: Room infers "add column color" by\n// diffing schemas/…/1.json and 2.json at compile time.');
      } else if (strategy === "destructive") {
        renderTable(rightT, "After open (recreated)", v2cols, []);
        outcome.innerHTML = "<div class='outcome lost'>✗ All rows wiped — the table was dropped and recreated empty. Only acceptable for caches you can rebuild.</div>";
        code("fallbackToDestructiveMigration", 'Room.databaseBuilder(context.applicationContext, NoteDatabase::class.java, "notes.db")\n    // ⚠ no Migration provided → on a version mismatch Room\n    // DROPS every table and recreates the schema. Data is lost.\n    .fallbackToDestructiveMigration(dropAllTables = true)\n    .build()');
      }
    }
    render();
  }

  // =========================================================================
  // WIDGET: threading — main-thread blocking vs suspend
  // =========================================================================
  function wThreading(spec, mount) {
    let allowMain = false;
    const wrap = h("div", "threadwrap");

    const top = h("div", "btn-row");
    const blockBtn = h("button", "btn small danger", "Query on the main thread (blocking)");
    const suspendBtn = h("button", "btn small", "Query with suspend / Flow");
    top.appendChild(blockBtn); top.appendChild(suspendBtn);
    const allowToggle = toggle("allowMainThreadQueries()", false, function (v) { allowMain = v; });
    wrap.appendChild(top);
    wrap.appendChild(allowToggle);

    const lanes = h("div", "lanes");
    const mainTrack = h("div", "track");
    const ioTrack = h("div", "track");
    const mainLane = h("div", "lane main"); mainLane.appendChild(h("div", "lname", "Main / UI")); mainLane.appendChild(mainTrack);
    const ioLane = h("div", "lane"); ioLane.appendChild(h("div", "lname", "Room executor")); ioLane.appendChild(ioTrack);
    lanes.appendChild(mainLane); lanes.appendChild(ioLane);
    wrap.appendChild(lanes);

    const framesWrap = h("div", "lane");
    framesWrap.appendChild(h("div", "lname", "Frames"));
    const frames = h("div", "frames");
    for (let i = 0; i < 24; i++) frames.appendChild(h("div", "f"));
    framesWrap.appendChild(frames);
    wrap.appendChild(framesWrap);

    const verdict = live(h("div", "verdict-line"));
    verdict.textContent = "Run a query each way and watch the threads.";
    wrap.appendChild(verdict);

    mount.appendChild(wrap);

    function reset() {
      mainTrack.innerHTML = ""; ioTrack.innerHTML = "";
      frames.querySelectorAll(".f").forEach(function (f) { f.classList.remove("bad"); });
    }
    function blk(track, cls, text, leftPct, widthPct) {
      const b = h("div", "blk " + cls, esc(text));
      b.style.left = leftPct + "%"; b.style.width = widthPct + "%";
      track.appendChild(b); return b;
    }
    function runBlocking() {
      reset();
      verdict.className = "verdict-line";
      verdict.textContent = "Running a synchronous query on the main thread…";
      // main thread is blocked the whole time
      blk(mainTrack, "block", allowMain ? "DB read BLOCKS UI" : "DB read…", 8, 84);
      // frames drop during the block
      const fs = frames.querySelectorAll(".f");
      fs.forEach(function (f, i) { if (i >= 3 && i <= 20) f.classList.add("bad"); });
      setTimeout(function () {
        if (allowMain) {
          verdict.className = "verdict-line bad";
          verdict.textContent = "allowMainThreadQueries() let it run — but the UI froze for the whole read. Long enough → \"Application Not Responding\" (ANR). This is the footgun.";
        } else {
          verdict.className = "verdict-line bad";
          verdict.textContent = "IllegalStateException: Cannot access database on the main thread since it may potentially lock the UI for a long period of time. (Room blocks this by default — make the query suspend or return Flow.)";
          blk(mainTrack, "block", "💥 crash", 8, 84).style.opacity = ".0";
        }
      }, 1200);
    }
    function runSuspend() {
      reset();
      verdict.className = "verdict-line";
      verdict.textContent = "Launching a coroutine; Room moves the work to its own executor…";
      // UI stays responsive: small UI blocks keep rendering
      blk(mainTrack, "ui", "frame", 4, 12);
      blk(mainTrack, "ui", "frame", 20, 12);
      blk(mainTrack, "ui", "frame", 72, 12);
      blk(mainTrack, "ui", "deliver", 86, 11);
      // DB work in the IO lane
      blk(ioTrack, "db", "SQLite query", 30, 42);
      // frames stay green (no .bad)
      setTimeout(function () {
        verdict.className = "verdict-line ok";
        verdict.textContent = "UI stayed smooth at 60fps. The suspend function ran on Room's executor (not Dispatchers.IO — don't wrap it in withContext(IO)), then the result was delivered back to Main.";
      }, 1200);
    }
    blockBtn.addEventListener("click", runBlocking);
    suspendBtn.addEventListener("click", runSuspend);
  }

  // =========================================================================
  // WIDGET: type-converter
  // =========================================================================
  function wTypeConverter(spec, mount) {
    const TYPES = {
      list: {
        label: "List<String>", kotlin: 'List<String>', sample: '["work", "urgent"]', stored: '\'["work","urgent"]\'', affinity: "TEXT",
        code: '@TypeConverter\nfun fromList(tags: List<String>): String = Json.encodeToString(tags)\n\n@TypeConverter\nfun toList(json: String): List<String> = Json.decodeFromString(json)',
        note: "A collection has no SQLite affinity — encode it to a JSON <code>TEXT</code> column.",
      },
      instant: {
        label: "Instant (date)", kotlin: 'java.time.Instant', sample: '2026-06-17T10:00:00Z', stored: '1781690400000', affinity: "INTEGER",
        code: '@TypeConverter\nfun fromInstant(t: Instant?): Long? = t?.toEpochMilli()\n\n@TypeConverter\nfun toInstant(ms: Long?): Instant? = ms?.let(Instant::ofEpochMilli)',
        note: "Store time as epoch millis (<code>Long</code> → <code>INTEGER</code>); it sorts and compares correctly.",
      },
      enumv: {
        label: "enum Priority", kotlin: 'enum class Priority', sample: 'Priority.HIGH', stored: "'HIGH'", affinity: "TEXT",
        code: '@TypeConverter\nfun fromPriority(p: Priority): String = p.name   // store NAME, never ordinal\n\n@TypeConverter\nfun toPriority(s: String): Priority = Priority.valueOf(s)',
        note: "Persist <code>enum.name</code>, not <code>ordinal</code> — reordering the enum would silently corrupt stored values.",
      },
      color: {
        label: "Color (ARGB)", kotlin: 'androidx.compose.ui.graphics.Color', sample: 'Color(0xFF1FA9A0)', stored: '4280265120', affinity: "INTEGER",
        code: '@TypeConverter\nfun fromColor(c: Color): Int = c.toArgb()   // 0xFF1FA9A0 = 4280265120\n\n@TypeConverter\nfun toColor(argb: Int): Color = Color(argb)',
        note: "Store the packed <strong>ARGB Int</strong> via <code>c.toArgb()</code> → an <code>INTEGER</code> column. Don't store <code>Color.value</code>: it is a 64-bit value that also encodes the color space, not the plain ARGB int.",
      },
    };
    let cur = "list";
    const wrap = h("div", "tcgrid");
    wrap.appendChild(ctrlLabel("Pick a non-primitive Kotlin type to store"));
    const seg = segmented(Object.keys(TYPES).map(function (k) { return { label: TYPES[k].label, value: k }; }), cur, function (v) { cur = v; render(); });
    wrap.appendChild(seg);
    const map = h("div", "tcmap");
    wrap.appendChild(map);
    const note = h("div", "note");
    wrap.appendChild(note);
    const codeSlot = h("div");
    wrap.appendChild(codeSlot);
    mount.appendChild(wrap);

    function render() {
      const t = TYPES[cur];
      map.innerHTML = "";
      const a = h("div", "tcbox"); a.innerHTML = "<div class='tch'>Kotlin value</div><div class='tcv'>" + esc(t.sample) + "</div>";
      const arrow = h("div", "tcarrow", "→<span class='al'>@TypeConverter</span>");
      const b = h("div", "tcbox"); b.innerHTML = "<div class='tch'>Stored column (" + t.affinity + ")</div><div class='tcv'>" + esc(t.stored) + "</div>";
      map.appendChild(a); map.appendChild(arrow); map.appendChild(b);
      note.innerHTML = t.note;
      codeSlot.innerHTML = "";
      codeSlot.appendChild(codePanel("Converter pair", function () { return t.code; }, "kotlin"));
    }
    render();
  }

  // =========================================================================
  // WIDGET: backup-rules — pick buckets → data_extraction_rules.xml
  // =========================================================================
  function wBackupRules(spec, mount) {
    const BUCKETS = [
      { id: "db", domain: "database", path: "notes.db", label: "Room DB notes.db", cloud: true, device: true },
      { id: "sp", domain: "sharedpref", path: "settings.xml", label: "SharedPreferences settings", cloud: true, device: true },
      { id: "ds", domain: "file", path: "datastore/", label: "DataStore files", cloud: true, device: true },
      { id: "token", domain: "file", path: "token_cache.bin", label: "Encrypted token cache", cloud: false, device: false, sensitive: true },
    ];
    const wrap = h("div", "bkgrid");
    const left = h("div");
    left.appendChild(ctrlLabel("Choose what to back up"));
    BUCKETS.forEach(function (b) {
      const row = h("div", "bkbucket");
      row.appendChild(h("span", null, esc(b.label) + (b.sensitive ? " 🔐" : "")));
      const tags = h("div", "bk-tags");
      const cloudT = toggle("cloud", b.cloud, function (v) { b.cloud = v; refresh(); });
      const devT = toggle("D2D", b.device, function (v) { b.device = v; refresh(); });
      cloudT.style.fontSize = ".78rem"; devT.style.fontSize = ".78rem";
      tags.appendChild(cloudT); tags.appendChild(devT);
      row.appendChild(tags);
      left.appendChild(row);
    });
    left.appendChild(h("div", "hint", "🔐 Keystore-encrypted data should be <b>excluded</b> from cloud backup: the key never leaves the device, so a restored blob can't be decrypted elsewhere."));

    const right = h("div");
    const newPanel = codePanel("res/xml/data_extraction_rules.xml  (Android 12+)", genNew, "xml");
    const oldPanel = codePanel("res/xml/backup_rules.xml  (Android 11 and lower)", genOld, "xml");
    right.appendChild(newPanel);
    right.appendChild(h("div", "hint", "&nbsp;"));
    right.appendChild(oldPanel);

    wrap.appendChild(left); wrap.appendChild(right);
    mount.appendChild(wrap);

    function refresh() { newPanel.update(); oldPanel.update(); }
    function rule(kind, b) { return '    <' + kind + ' domain="' + b.domain + '" path="' + b.path + '" />'; }
    function genNew() {
      const cloudInc = BUCKETS.filter(function (b) { return b.cloud; });
      const cloudExc = BUCKETS.filter(function (b) { return !b.cloud; });
      const devInc = BUCKETS.filter(function (b) { return b.device; });
      const devExc = BUCKETS.filter(function (b) { return !b.device; });
      let s = "<data-extraction-rules>\n  <cloud-backup>\n";
      cloudInc.forEach(function (b) { s += rule("include", b) + "\n"; });
      cloudExc.forEach(function (b) { s += rule("exclude", b) + "\n"; });
      s += "  </cloud-backup>\n  <device-transfer>\n";
      devInc.forEach(function (b) { s += rule("include", b) + "\n"; });
      devExc.forEach(function (b) { s += rule("exclude", b) + "\n"; });
      s += "  </device-transfer>\n</data-extraction-rules>";
      return s;
    }
    function genOld() {
      let s = "<full-backup-content>\n";
      BUCKETS.forEach(function (b) { s += rule(b.cloud ? "include" : "exclude", b) + "\n"; });
      s += "</full-backup-content>";
      return s;
    }
  }

  // ----- widget registry -------------------------------------------------
  const WIDGETS = {
    "db-live": wDbLive,
    "entity-schema": wEntitySchema,
    "dao-builder": wDaoBuilder,
    "storage-chooser": wStorageChooser,
    "prefs-datastore": wPrefsDatastore,
    "device-map": wDeviceMap,
    "migration": wMigration,
    "threading": wThreading,
    "type-converter": wTypeConverter,
    "backup-rules": wBackupRules,
  };

  function buildPlayground(pg) {
    const root = h("div");
    root.appendChild(h("div", "pg-label", pg.title || "Interactive playground"));
    if (pg.intro) root.appendChild(h("p", "pg-intro", pg.intro));
    const board = h("div", "playground");
    const builder = WIDGETS[pg.kind];
    if (builder) { try { builder(pg, board); } catch (e) { board.appendChild(h("div", "hint", "playground error: " + esc(e.message))); } }
    else board.appendChild(h("div", "hint", "Unknown playground: " + esc(pg.kind)));
    root.appendChild(board);
    return root;
  }

  // ======================= PAGE RENDER =======================
  function renderSection(s) {
    const sec = h("section", "section"); sec.id = s.id;
    const head = h("div", "section-head");
    head.appendChild(h("div", "emoji", esc(s.emoji || "▫️")));
    const ht = h("div"); ht.appendChild(h("h2", null, esc(s.title)));
    if (s.category) ht.appendChild(h("span", "cat-badge", esc(s.category)));
    head.appendChild(ht); sec.appendChild(head);
    if (s.summary) sec.appendChild(h("p", "summary", esc(s.summary)));
    if (s.explanation_html) sec.appendChild(h("div", "explain", s.explanation_html));
    if (s.key_points && s.key_points.length) {
      const kp = h("div", "keypoints", "<h4>Key points</h4>"); const ul = h("ul");
      s.key_points.forEach(function (p) { ul.appendChild(h("li", null, p)); }); kp.appendChild(ul); sec.appendChild(kp);
    }
    if (s.playground) sec.appendChild(buildPlayground(s.playground));
    if (s.gotchas_html) sec.appendChild(h("div", "gotchas", "<h4>⚠️ Common mistakes</h4>" + s.gotchas_html));
    if (s.canonical_blocks && s.canonical_blocks.length) {
      const canon = h("div", "canon"); canon.appendChild(h("div", "pg-label", "Canonical example"));
      s.canonical_blocks.forEach(function (b) { canon.appendChild(codePanel(b.label || (b.lang || "kotlin").toUpperCase(), function () { return b.code; }, b.lang || "kotlin")); });
      sec.appendChild(canon);
    } else if (s.canonical_code) {
      const canon = h("div", "canon"); canon.appendChild(h("div", "pg-label", "Canonical example"));
      const pre = h("pre"); pre.innerHTML = (s.canonical_lang === "sql" ? sql : s.canonical_lang === "xml" ? xml : kt)(s.canonical_code);
      canon.appendChild(pre); sec.appendChild(canon);
    }
    return sec;
  }

  function init() {
    const nav = document.getElementById("nav");
    const main = document.getElementById("sections");
    if (!nav || !main) return;
    const cats = []; const byCat = {};
    SECTIONS.forEach(function (s) { const c = s.category || "Sections"; if (!byCat[c]) { byCat[c] = []; cats.push(c); } byCat[c].push(s); });
    cats.forEach(function (cat) {
      nav.appendChild(h("div", "nav-group", esc(cat)));
      const box = h("div", "nav");
      byCat[cat].forEach(function (s) {
        const a = h("a", null, '<span class="ne">' + esc(s.emoji || "▫️") + "</span><span>" + esc(s.title) + "</span>");
        a.href = "#" + s.id; a.dataset.id = s.id;
        box.appendChild(a);
      });
      nav.appendChild(box);
    });
    SECTIONS.forEach(function (s) { main.appendChild(renderSection(s)); });

    // scroll spy
    const links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (l) { l.classList.toggle("active", l.dataset.id === en.target.id); });
      });
    }, { rootMargin: "-10% 0px -75% 0px", threshold: 0 });
    SECTIONS.forEach(function (s) { const e = document.getElementById(s.id); if (e) io.observe(e); });

    // theme toggle
    const tb = document.getElementById("theme");
    if (tb) tb.addEventListener("click", function () {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
      tb.textContent = dark ? "🌙" : "☀️";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
