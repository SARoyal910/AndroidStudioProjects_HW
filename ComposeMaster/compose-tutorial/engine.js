/* Jetpack Compose Layout Lab — interactive engine.
   Renders the whole page from the global SECTIONS array, and drives each
   playground: live CSS-flexbox emulation of Compose layout + live generated
   Kotlin. SECTIONS is injected above this script by build.mjs. */
(function () {
  "use strict";

  // ----- role defaults (merged with per-control overrides from the recipe) -----
  const SELECT_OPTS = {
    verticalArrangement: ["Top", "Bottom", "Center", "SpaceBetween", "SpaceAround", "SpaceEvenly"],
    horizontalArrangement: ["Start", "End", "Center", "SpaceBetween", "SpaceAround", "SpaceEvenly"],
    verticalAlignment: ["Top", "CenterVertically", "Bottom"],
    horizontalAlignment: ["Start", "CenterHorizontally", "End"],
    boxContentAlignment: ["TopStart", "TopCenter", "TopEnd", "CenterStart", "Center", "CenterEnd", "BottomStart", "BottomCenter", "BottomEnd"],
    background: ["Coral", "Teal", "Indigo", "Amber", "Slate"],
    fontWeight: ["Normal", "Medium", "SemiBold", "Bold"],
    textAlign: ["Start", "Center", "End", "Justify"],
    buttonStyle: ["Filled", "Tonal", "Outlined", "Elevated", "Text"],
    cardStyle: ["Elevated", "Filled", "Outlined"],
    control: ["Switch", "Checkbox", "RadioButton", "Slider"],
    textFieldStyle: ["Filled", "Outlined"],
    insets: ["none", "systemBarsPadding", "Scaffold"],
    avatarShape: ["Circle", "Rounded"],
  };
  const SLIDER = {
    padding: [0, 48, 4, 16], paddingHorizontal: [0, 48, 4, 16], paddingVertical: [0, 48, 4, 12],
    paddingStart: [0, 48, 4, 0], paddingTop: [0, 48, 4, 0], paddingEnd: [0, 48, 4, 0], paddingBottom: [0, 48, 4, 0],
    width: [24, 240, 8, 120], height: [24, 200, 8, 80], size: [24, 200, 8, 96], childSize: [24, 96, 4, 48],
    gap: [0, 32, 2, 8], offsetX: [-48, 48, 4, 0], offsetY: [-48, 48, 4, 0],
    cornerRadius: [0, 48, 2, 12], borderWidth: [0, 8, 1, 0], aspectRatio: [0.5, 2.5, 0.1, 1],
    fillFraction: [0.1, 1, 0.05, 1], fontSize: [10, 40, 2, 18], maxLines: [1, 5, 1, 2],
    itemCount: [2, 12, 1, 6], childCount: [1, 8, 1, 3],
    cardElevation: [0, 12, 1, 2], nestDepth: [1, 4, 1, 2],
  };
  const TOGGLES = ["fillMaxWidth", "fillMaxHeight", "clip", "scroll", "orderSwap",
    "enabled", "withIcon", "checked", "singleLine", "showLabel", "topBar", "bottomBar", "fab", "showSubtitle", "showTrailing"];

  const JUSTIFY = { Top: "flex-start", Bottom: "flex-end", Start: "flex-start", End: "flex-end", Center: "center", SpaceBetween: "space-between", SpaceAround: "space-around", SpaceEvenly: "space-evenly" };
  const ALIGN = { Start: "flex-start", End: "flex-end", Top: "flex-start", Bottom: "flex-end", CenterHorizontally: "center", CenterVertically: "center", Center: "center" };
  const PLACE = { TopStart: "start start", TopCenter: "start center", TopEnd: "start end", CenterStart: "center start", Center: "center center", CenterEnd: "center end", BottomStart: "end start", BottomCenter: "end center", BottomEnd: "end end" };
  const COLORVAR = { Coral: "coral", Teal: "teal", Indigo: "indigo", Amber: "amber", Slate: "slate" };
  const COLORK = ["Color(0xFFEC6A5E)", "Color(0xFF1FA9A0)", "Color(0xFF5C6BC0)", "Color(0xFFF2B441)", "Color(0xFF5B6B7B)"];
  const WEIGHT = { Normal: 400, Medium: 500, SemiBold: 600, Bold: 700 };
  const TEXTALIGN = { Start: "left", Center: "center", End: "right", Justify: "justify" };
  const FONTW = { Normal: "FontWeight.Normal", Medium: "FontWeight.Medium", SemiBold: "FontWeight.SemiBold", Bold: "FontWeight.Bold" };

  // ----- tiny DOM + util -----
  function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function hasRole(pg, role) { return pg.controls.some(function (c) { return c.role === role; }); }
  function num(v, d) { const n = parseFloat(v); return isFinite(n) ? n : d; }

  // ----- Kotlin highlighter (single pass, no span corruption) -----
  function kt(code) {
    const re = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(@\w+)|\b(val|var|fun|by|return|if|else|true|false|this|in|is|as|object|class|import|package)\b|(\b\d+(?:\.\d+)?f?)(\.dp|\.sp)?|\b([A-Z][A-Za-z0-9_]*)\b|\b([a-z][A-Za-z0-9_]*)(?=\s*\()/g;
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

  // ----- control state defaults -----
  function defaults(pg) {
    const v = {};
    pg.controls.forEach(function (c) {
      if (c.role === "weightPerChild") { const n = pg.childCount || 3; for (let i = 0; i < n; i++) v["weight" + i] = "1"; return; }
      if (TOGGLES.indexOf(c.role) >= 0) { v[c.role] = c.default != null ? String(c.default) : "false"; return; }
      if (SELECT_OPTS[c.role]) { v[c.role] = c.default != null ? String(c.default) : SELECT_OPTS[c.role][0]; return; }
      const s = SLIDER[c.role] || [0, 100, 1, 0];
      v[c.role] = c.default != null ? String(c.default) : String(s[3]);
    });
    if (hasRole(pg, "childCount") == false && hasRole(pg, "itemCount") == false) v.childCount = String(pg.childCount || 3);
    return v;
  }

  // ----- padding helpers -----
  function padCss(v, sides) {
    if (v.paddingStart != null || v.paddingTop != null || v.paddingEnd != null || v.paddingBottom != null) {
      return num(v.paddingTop, 0) + "px " + num(v.paddingEnd, 0) + "px " + num(v.paddingBottom, 0) + "px " + num(v.paddingStart, 0) + "px";
    }
    if (v.paddingHorizontal != null || v.paddingVertical != null) return num(v.paddingVertical, 0) + "px " + num(v.paddingHorizontal, 0) + "px";
    if (v.padding != null) return num(v.padding, 0) + "px";
    return null;
  }
  function padKotlin(v) {
    if (v.paddingStart != null || v.paddingTop != null || v.paddingEnd != null || v.paddingBottom != null)
      return "padding(start = " + num(v.paddingStart, 0) + ".dp, top = " + num(v.paddingTop, 0) + ".dp, end = " + num(v.paddingEnd, 0) + ".dp, bottom = " + num(v.paddingBottom, 0) + ".dp)";
    if (v.paddingHorizontal != null || v.paddingVertical != null)
      return "padding(horizontal = " + num(v.paddingHorizontal, 0) + ".dp, vertical = " + num(v.paddingVertical, 0) + ".dp)";
    if (v.padding != null) return "padding(" + num(v.padding, 0) + ".dp)";
    return null;
  }
  function spacedAlign(arr, isCol) {
    if (isCol) return arr === "Center" ? "CenterVertically" : arr; // Top / Bottom / CenterVertically
    return arr === "Center" ? "CenterHorizontally" : arr; // Start / End / CenterHorizontally
  }

  // ======================= PREVIEW =======================
  function applyPreview(pg, v, stage) {
    stage.className = "stage"; stage.removeAttribute("style"); stage.innerHTML = "";
    let c = pg.container;
    if (COMPONENT_PV[c]) { stage.classList.add("stage-comp"); COMPONENT_PV[c](pg, v, stage); return; }
    if (c === "Box" && !hasRole(pg, "boxContentAlignment")) c = "single"; // a Box styled by size/offset/corner roles is really a single box
    const n = Math.round(num(v.childCount, num(v.itemCount, pg.childCount || 3)));
    const pad = padCss(v);

    if (c === "Column" || c === "Row") {
      const isCol = c === "Column";
      stage.style.display = "flex"; stage.style.flexDirection = isCol ? "column" : "row";
      const arr = v[isCol ? "verticalArrangement" : "horizontalArrangement"];
      const cross = v[isCol ? "horizontalAlignment" : "verticalAlignment"];
      if (arr) stage.style.justifyContent = JUSTIFY[arr] || "flex-start";
      if (cross) stage.style.alignItems = ALIGN[cross] || "flex-start";
      const gap = num(v.gap, 0), isSpace = ["SpaceBetween", "SpaceAround", "SpaceEvenly"].indexOf(arr) >= 0;
      stage.style.gap = (gap && !isSpace) ? gap + "px" : "0px";
      if (pad) stage.style.padding = pad;
      if (v.height != null) { stage.style.flex = "none"; stage.style.height = num(v.height, 200) + "px"; }
      if (v.scroll === "true") stage.classList.add("scrollable");
      const weighted = hasRole(pg, "weightPerChild");
      for (let i = 0; i < n; i++) {
        const chip = h("div", "chip c" + (i % 5));
        if (weighted) {
          const w = num(v["weight" + i], 0);
          if (w > 0) { chip.style.flexGrow = w; chip.style.flexBasis = "0"; } else { chip.style.flexGrow = "0"; }
          chip.innerHTML = '<span class="inner">' + (w > 0 ? "weight " + w : "intrinsic") + "</span>";
          if (isCol) chip.style.height = "44px"; else chip.style.height = "64px";
          if (!isCol && w === 0) chip.style.width = "52px";
        } else {
          chip.textContent = (pg.childLabels && pg.childLabels[i]) || String.fromCharCode(65 + i);
          if (isCol) { chip.style.padding = "7px 16px"; chip.style.minHeight = "20px"; }
          else { chip.style.width = num(v.childSize, 46) + "px"; chip.style.height = num(v.childSize, 60) + "px"; }
        }
        stage.appendChild(chip);
      }
    } else if (c === "Box") {
      stage.style.display = "grid";
      stage.style.placeItems = PLACE[v.boxContentAlignment || "Center"] || "center center";
      if (pad) stage.style.padding = pad;
      if (v.size != null) { stage.style.flex = "none"; stage.style.width = num(v.size, 200) + "px"; stage.style.height = num(v.size, 200) + "px"; stage.style.margin = "auto"; }
      if (v.background) stage.style.background = "var(--" + (COLORVAR[v.background] || "indigo") + ")";
      const cs = v.childSize != null ? num(v.childSize, 48) : null;
      const sz = [[120, 76], [88, 56], [58, 38], [40, 28]];
      for (let i = 0; i < Math.min(n, 4); i++) {
        const chip = h("div", "chip c" + ((i + (v.background ? 1 : 0)) % 5));
        chip.style.gridArea = "1 / 1";
        chip.style.width = (cs != null ? cs : sz[i][0]) + "px";
        chip.style.height = (cs != null ? cs : sz[i][1]) + "px";
        chip.textContent = (pg.childLabels && pg.childLabels[i]) || String.fromCharCode(65 + i);
        stage.appendChild(chip);
      }
    } else if (c === "Text") {
      stage.style.display = "flex"; stage.style.alignItems = "center"; stage.style.padding = "16px";
      const t = h("div", "txtchip");
      t.textContent = "Jetpack Compose makes building native Android UI delightful, declarative, and fast.";
      if (v.fontSize) t.style.fontSize = num(v.fontSize, 18) + "px";
      if (v.fontWeight) t.style.fontWeight = WEIGHT[v.fontWeight] || 400;
      if (v.textAlign) { t.style.textAlign = TEXTALIGN[v.textAlign] || "left"; t.style.width = "100%"; }
      if (v.maxLines) { t.style.display = "-webkit-box"; t.style.webkitLineClamp = String(num(v.maxLines, 2)); t.style.webkitBoxOrient = "vertical"; t.style.overflow = "hidden"; }
      stage.appendChild(t);
    } else { // single
      stage.style.display = "grid"; stage.style.placeItems = "center"; stage.style.padding = "18px";
      const chip = h("div", "chip c0");
      let w = num(v.width, num(v.size, num(v.childSize, 130))), ht = num(v.height, num(v.size, num(v.childSize, 84)));
      chip.style.width = w + "px"; chip.style.height = ht + "px";
      if (v.fillMaxWidth === "true") chip.style.width = "100%";
      if (v.fillMaxHeight === "true") chip.style.height = "100%";
      if (v.fillFraction != null) chip.style.width = (num(v.fillFraction, 1) * 100) + "%";
      if (v.aspectRatio != null) { chip.style.height = "auto"; chip.style.aspectRatio = String(num(v.aspectRatio, 1)); }
      if (v.background) chip.style.background = "var(--" + (COLORVAR[v.background] || "coral") + ")";
      if (v.cornerRadius != null) chip.style.borderRadius = num(v.cornerRadius, 0) + "px";
      if (v.borderWidth != null && num(v.borderWidth, 0) > 0) chip.style.boxShadow = "inset 0 0 0 " + num(v.borderWidth, 0) + "px rgba(0,0,0,.6)";
      if (v.clip === "true") chip.style.overflow = "hidden";
      if (v.offsetX != null || v.offsetY != null) chip.style.transform = "translate(" + num(v.offsetX, 0) + "px," + num(v.offsetY, 0) + "px)";
      const inner = h("div", "inner", "content");
      if (v.fontSize != null) { inner.style.fontSize = num(v.fontSize, 16) + "px"; inner.textContent = num(v.fontSize, 16) + " sp"; }
      if (hasRole(pg, "orderSwap")) {
        if (v.orderSwap === "true") { // padding THEN background: outer transparent, inner colored
          chip.style.background = "transparent"; chip.style.boxShadow = "none"; chip.style.padding = pad || "16px";
          inner.style.cssText = "background:var(--indigo);color:#fff;width:100%;height:100%;display:grid;place-items:center;border-radius:6px";
        } else { // background THEN padding: colored fills, content inset
          chip.style.background = "var(--indigo)"; chip.style.padding = pad || "16px"; inner.textContent = "content";
        }
      } else if (pad) { chip.style.padding = pad; }
      if (hasRole(pg, "clip") && v.clip === "true" && v.cornerRadius) { const bleed = h("div", "", ""); }
      chip.appendChild(inner);
      stage.appendChild(chip);
    }
  }

  // ======================= KOTLIN CODE GEN =======================
  function genKotlin(pg, v) {
    const c = pg.container;
    if (COMPONENT_GEN[c]) return COMPONENT_GEN[c](pg, v);
    if (c === "Text") return genText(v);
    if (c === "single") return genSingle(pg, v);
    if (c === "Box") return hasRole(pg, "boxContentAlignment") ? genBox(pg, v) : genSingle(pg, v);
    return genColRow(pg, v);
  }
  function childColor(i) { return COLORK[i % COLORK.length]; }

  function genColRow(pg, v) {
    const isCol = pg.container === "Column";
    const n = Math.round(num(v.childCount, pg.childCount || 3));
    const mods = [];
    if (v.height != null) { mods.push("fillMaxWidth()"); mods.push("height(" + num(v.height, 200) + ".dp)"); }
    else mods.push("fillMaxSize()");
    const pad = padKotlin(v); if (pad) mods.push(pad);
    if (v.scroll === "true") mods.push("verticalScroll(rememberScrollState())");
    const arr = v[isCol ? "verticalArrangement" : "horizontalArrangement"];
    const cross = v[isCol ? "horizontalAlignment" : "verticalAlignment"];
    const gap = num(v.gap, 0);
    const params = ["modifier = Modifier\n        ." + mods.join("\n        .")];
    let arrLine = null;
    if (arr) {
      if (["SpaceBetween", "SpaceAround", "SpaceEvenly"].indexOf(arr) >= 0) arrLine = "Arrangement." + arr;
      else if (gap > 0) arrLine = "Arrangement.spacedBy(" + gap + ".dp, Alignment." + spacedAlign(arr, isCol) + ")";
      else arrLine = "Arrangement." + arr;
    } else if (gap > 0) arrLine = "Arrangement.spacedBy(" + gap + ".dp)";
    if (arrLine) params.push((isCol ? "verticalArrangement" : "horizontalArrangement") + " = " + arrLine);
    if (cross) params.push((isCol ? "horizontalAlignment" : "verticalAlignment") + " = Alignment." + cross);
    let kids = "";
    const weighted = hasRole(pg, "weightPerChild");
    for (let i = 0; i < n; i++) {
      if (weighted) {
        const w = num(v["weight" + i], 0);
        const cm = ["Modifier"]; if (w > 0) cm.push("weight(" + w + "f)"); cm.push(isCol ? "fillMaxWidth()" : "fillMaxHeight()"); cm.push("height(48.dp)"); cm.push("background(" + childColor(i) + ")");
        kids += "\n    Box(" + cm.join("\n        .") + "\n    )";
      } else {
        kids += "\n    Box(Modifier.size(" + num(v.childSize, 48) + ".dp).background(" + childColor(i) + "))";
      }
    }
    return (isCol ? "Column" : "Row") + "(\n    " + params.join(",\n    ") + "\n) {" + kids + "\n}";
  }

  function genBox(pg, v) {
    const n = Math.min(Math.round(num(v.childCount, pg.childCount || 3)), 4);
    const mods = ["size(" + (v.size != null ? num(v.size, 200) : 200) + ".dp)"];
    if (v.background) mods.push("background(" + COLORK[SELECT_OPTS.background.indexOf(v.background)] + ")");
    const pad = padKotlin(v); if (pad) mods.push(pad);
    const ca = v.boxContentAlignment || "Center";
    const cs = v.childSize != null ? num(v.childSize, 48) : null;
    let kids = ""; const sz = [120, 88, 58, 40];
    for (let i = 0; i < n; i++) kids += "\n    Box(Modifier.size(" + (cs != null ? cs : sz[i]) + ".dp).background(" + childColor(i) + "))";
    return "Box(\n    modifier = Modifier." + mods.join(".") + ",\n    contentAlignment = Alignment." + ca + "\n) {" + kids + "\n}";
  }

  function genSingle(pg, v) {
    const chain = ["Modifier"];
    if (v.size != null) chain.push("size(" + num(v.size, 96) + ".dp)");
    else if (v.childSize != null && v.width == null && v.height == null) chain.push("size(" + num(v.childSize, 96) + ".dp)");
    else { if (v.width != null) chain.push("width(" + num(v.width, 120) + ".dp)"); if (v.height != null) chain.push("height(" + num(v.height, 84) + ".dp)"); }
    if (v.fillMaxWidth === "true") chain.push("fillMaxWidth()");
    if (v.fillFraction != null) chain.push("fillMaxWidth(" + num(v.fillFraction, 1) + "f)");
    if (v.aspectRatio != null) chain.push("aspectRatio(" + num(v.aspectRatio, 1) + "f)");
    if (v.offsetX != null || v.offsetY != null) chain.push("offset(x = " + num(v.offsetX, 0) + ".dp, y = " + num(v.offsetY, 0) + ".dp)");
    const shape = v.cornerRadius != null ? "RoundedCornerShape(" + num(v.cornerRadius, 0) + ".dp)" : null;
    if (v.clip === "true" && shape) chain.push("clip(" + shape + ")");
    if (hasRole(pg, "orderSwap")) {
      // visualize order with padding + background
      if (v.orderSwap === "true") { const p = padKotlin(v) || "padding(16.dp)"; chain.push(p); chain.push("background(Color(0xFF5C6BC0))"); }
      else { chain.push("background(Color(0xFF5C6BC0))"); const p = padKotlin(v) || "padding(16.dp)"; chain.push(p); }
    } else {
      if (v.background != null) chain.push("background(" + COLORK[SELECT_OPTS.background.indexOf(v.background)] + (shape ? ", " + shape : "") + ")");
      if (v.borderWidth != null && num(v.borderWidth, 0) > 0) chain.push("border(" + num(v.borderWidth, 0) + ".dp, Color.DarkGray" + (shape ? ", " + shape : "") + ")");
      const p = padKotlin(v); if (p) chain.push(p);
    }
    const body = (v.fontSize != null) ? ' {\n    Text("Aa", fontSize = ' + num(v.fontSize, 16) + '.sp)\n}' : '';
    return "Box(\n    " + chain.join("\n        .") + "\n)" + body;
  }

  function genText(v) {
    const p = ['text = "Compose makes UI declarative."'];
    if (v.fontSize != null) p.push("fontSize = " + num(v.fontSize, 18) + ".sp");
    if (v.fontWeight) p.push("fontWeight = " + (FONTW[v.fontWeight] || "FontWeight.Normal"));
    if (v.textAlign) p.push("textAlign = TextAlign." + v.textAlign);
    if (v.maxLines != null) { p.push("maxLines = " + num(v.maxLines, 2)); p.push("overflow = TextOverflow.Ellipsis"); }
    return "Text(\n    " + p.join(",\n    ") + "\n)";
  }

  // ======================= COMPONENT CONTAINERS =======================
  function frame(stage, justify) { stage.style.display = "flex"; stage.style.alignItems = "center"; stage.style.justifyContent = justify || "center"; stage.style.padding = "20px"; }

  function pvButton(pg, v, stage) {
    frame(stage); const st = (v.buttonStyle || "Filled"); const b = h("div", "mbtn mbtn-" + st.toLowerCase());
    if (v.enabled === "false") b.classList.add("mbtn-dis");
    if (v.withIcon === "true") b.appendChild(h("span", "mbtn-ic", "★"));
    b.appendChild(h("span", null, "Button")); stage.appendChild(b);
  }
  function genButton(pg, v) {
    const fn = { Filled: "Button", Tonal: "FilledTonalButton", Outlined: "OutlinedButton", Elevated: "ElevatedButton", Text: "TextButton" }[v.buttonStyle || "Filled"];
    const en = v.enabled === "false" ? ",\n    enabled = false" : "";
    const content = v.withIcon === "true"
      ? '    Icon(Icons.Default.Star, contentDescription = null)\n    Spacer(Modifier.width(ButtonDefaults.IconSpacing))\n    Text("Button")'
      : '    Text("Button")';
    return fn + "(\n    onClick = { }" + en + "\n) {\n" + content + "\n}";
  }

  function pvCard(pg, v, stage) {
    frame(stage); const st = (v.cardStyle || "Elevated").toLowerCase(); const el = num(v.cardElevation, 2);
    const card = h("div", "mcard mcard-" + st); card.style.borderRadius = num(v.cornerRadius, 12) + "px";
    if (st === "elevated") card.style.boxShadow = "0 " + (1 + el) + "px " + (4 + el * 2) + "px rgba(0,0,0," + (0.08 + el * 0.012) + ")";
    const body = h("div", "mcard-body"); body.style.padding = num(v.padding, 16) + "px";
    body.appendChild(h("div", "mcard-title", "Card title"));
    body.appendChild(h("div", "mcard-sub", "Supporting text lives in the card's content slot."));
    card.appendChild(body); stage.appendChild(card);
  }
  function genCard(pg, v) {
    const st = v.cardStyle || "Elevated"; const fn = { Elevated: "ElevatedCard", Filled: "Card", Outlined: "OutlinedCard" }[st];
    const elev = st === "Elevated" ? "\n    elevation = CardDefaults.cardElevation(defaultElevation = " + num(v.cardElevation, 2) + ".dp)," : "";
    return fn + "(\n    shape = RoundedCornerShape(" + num(v.cornerRadius, 12) + ".dp)," + elev + "\n) {\n    Column(Modifier.padding(" + num(v.padding, 16) + ".dp)) {\n        Text(\"Card title\", style = MaterialTheme.typography.titleMedium)\n        Text(\"Supporting text.\", style = MaterialTheme.typography.bodyMedium)\n    }\n}";
  }

  function pvControls(pg, v, stage) {
    frame(stage); const ctl = v.control || "Switch"; const on = v.checked !== "false"; let el;
    if (ctl === "Switch") { el = h("div", "msw" + (on ? " on" : "")); el.appendChild(h("span", "msw-thumb")); }
    else if (ctl === "Checkbox") { el = h("div", "mcheck" + (on ? " on" : ""), on ? "✓" : ""); }
    else if (ctl === "RadioButton") { el = h("div", "mradio" + (on ? " on" : "")); el.appendChild(h("span", "mradio-dot")); }
    else { el = h("div", "mslider", '<span class="mslider-fill"></span><span class="mslider-thumb"></span>'); }
    if (v.enabled === "false") el.classList.add("ctl-dis");
    stage.appendChild(el);
  }
  function genControls(pg, v) {
    const ctl = v.control || "Switch"; const on = v.checked !== "false"; const en = v.enabled === "false" ? ",\n    enabled = false" : "";
    if (ctl === "Switch") return "Switch(\n    checked = " + on + ",\n    onCheckedChange = { }" + en + "\n)";
    if (ctl === "Checkbox") return "Checkbox(\n    checked = " + on + ",\n    onCheckedChange = { }" + en + "\n)";
    if (ctl === "RadioButton") return "RadioButton(\n    selected = " + on + ",\n    onClick = { }" + en + "\n)";
    return "Slider(\n    value = 0.4f,\n    onValueChange = { },\n    valueRange = 0f..1f" + en + "\n)";
  }

  function pvTextField(pg, v, stage) {
    frame(stage); const st = (v.textFieldStyle || "Filled").toLowerCase(); const tf = h("div", "mtf mtf-" + st);
    if (v.enabled === "false") tf.classList.add("mtf-dis");
    if (v.showLabel !== "false") tf.appendChild(h("div", "mtf-label", "Email"));
    tf.appendChild(h("div", "mtf-val", "you@example.com")); stage.appendChild(tf);
  }
  function genTextField(pg, v) {
    const fn = v.textFieldStyle === "Outlined" ? "OutlinedTextField" : "TextField";
    const lab = v.showLabel !== "false" ? '\n    label = { Text("Email") },' : "";
    const sl = v.singleLine === "true" ? "\n    singleLine = true," : "";
    const en = v.enabled === "false" ? "\n    enabled = false," : "";
    return fn + "(\n    value = text,\n    onValueChange = { text = it }," + lab + '\n    placeholder = { Text("you@example.com") },' + sl + en + "\n)";
  }

  function pvNesting(pg, v, stage) {
    stage.style.display = "grid"; stage.style.placeItems = "center"; stage.style.padding = "14px"; stage.style.overflow = "auto";
    const depth = Math.max(1, Math.min(4, Math.round(num(v.nestDepth, 2)))); const order = ["Card", "Column", "Row", "Box"];
    let cur = h("div", "nest-leaf", 'Text("Hello")');
    for (let i = depth - 1; i >= 0; i--) { const w = h("div", "nest n" + i); w.appendChild(h("div", "nest-tag", order[i])); const body = h("div", "nest-body"); body.appendChild(cur); w.appendChild(body); cur = w; }
    stage.appendChild(cur);
  }
  function genNesting(pg, v) {
    const depth = Math.max(1, Math.min(4, Math.round(num(v.nestDepth, 2)))); const order = ["Card", "Column", "Row", "Box"];
    function build(i) { const pad = "    ".repeat(i); if (i >= depth) return pad + 'Text("Hello")'; return pad + order[i] + " {\n" + build(i + 1) + "\n" + pad + "}"; }
    return build(0);
  }

  function pvScaffold(pg, v, stage) {
    stage.style.display = "flex"; stage.style.flexDirection = "column"; stage.style.padding = "0"; stage.style.overflow = "hidden"; stage.style.position = "relative";
    if (v.topBar === "true") stage.appendChild(h("div", "sc-top", "&#9776;&nbsp;&nbsp;Title"));
    const content = h("div", "sc-content" + (v.insets === "none" ? " sc-nopad" : ""));
    content.innerHTML = '<div class="sc-line w80"></div><div class="sc-line w95"></div><div class="sc-line w60"></div><div class="sc-line w90"></div>';
    stage.appendChild(content);
    if (v.fab === "true") stage.appendChild(h("div", "sc-fab", "+"));
    if (v.bottomBar === "true") stage.appendChild(h("div", "sc-bottom", "&#9679; &#9675; &#9675;"));
  }
  function genScaffold(pg, v) {
    const top = v.topBar === "true" ? '\n    topBar = { TopAppBar(title = { Text("Title") }) },' : "";
    const bot = v.bottomBar === "true" ? '\n    bottomBar = { NavigationBar { /* items */ } },' : "";
    const fab = v.fab === "true" ? '\n    floatingActionButton = { FloatingActionButton(onClick = { }) { Icon(Icons.Default.Add, null) } },' : "";
    const ins = v.insets || "Scaffold";
    const mod = ins === "Scaffold" ? "Modifier.padding(innerPadding)" : ins === "systemBarsPadding" ? "Modifier.systemBarsPadding()" : "Modifier // ⚠ no insets: content slides under the bars";
    return "Scaffold(" + top + bot + fab + "\n) { innerPadding ->\n    Column(" + mod + ") {\n        // your screen content\n    }\n}";
  }

  function pvProfileRow(pg, v, stage) {
    stage.style.display = "flex"; stage.style.padding = "16px";
    stage.style.alignItems = v.verticalAlignment === "Top" ? "flex-start" : v.verticalAlignment === "Bottom" ? "flex-end" : "center";
    const row = h("div", "prow");
    const av = h("div", "prow-av" + (v.avatarShape === "Rounded" ? " rounded" : ""), "A");
    const col = h("div", "prow-col"); col.appendChild(h("div", "prow-name", "Ada Lovelace"));
    if (v.showSubtitle !== "false") col.appendChild(h("div", "prow-sub", "Online"));
    row.appendChild(av); row.appendChild(col);
    if (v.showTrailing !== "false") { const sw = h("div", "msw on prow-tr"); sw.appendChild(h("span", "msw-thumb")); row.appendChild(sw); }
    stage.appendChild(row);
  }
  function genProfileRow(pg, v) {
    const va = v.verticalAlignment || "CenterVertically"; const shape = v.avatarShape === "Rounded" ? "RoundedCornerShape(12.dp)" : "CircleShape";
    let s = "Row(\n    modifier = Modifier.fillMaxWidth().padding(16.dp),\n    verticalAlignment = Alignment." + va + "\n) {\n";
    s += "    Box(\n        Modifier.size(48.dp).clip(" + shape + ").background(MaterialTheme.colorScheme.primaryContainer),\n        contentAlignment = Alignment.Center\n    ) { Text(\"A\") }\n";
    s += "    Spacer(Modifier.width(12.dp))\n";
    s += "    Column(Modifier.weight(1f)) {\n        Text(\"Ada Lovelace\", style = MaterialTheme.typography.titleMedium)\n";
    if (v.showSubtitle !== "false") s += "        Text(\"Online\", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)\n";
    s += "    }\n";
    if (v.showTrailing !== "false") s += "    Switch(checked = true, onCheckedChange = { })\n";
    return s + "}";
  }

  const COMPONENT_PV = { Button: pvButton, Card: pvCard, Controls: pvControls, TextField: pvTextField, Nesting: pvNesting, Scaffold: pvScaffold, ProfileRow: pvProfileRow };
  const COMPONENT_GEN = { Button: genButton, Card: genCard, Controls: genControls, TextField: genTextField, Nesting: genNesting, Scaffold: genScaffold, ProfileRow: genProfileRow };

  // ======================= PLAYGROUND UI =======================
  function buildControl(pg, c, v, onChange) {
    const wrap = h("div", "ctrl");
    if (c.role === "weightPerChild") {
      const n = Math.round(num(v.childCount, pg.childCount || 3));
      for (let i = 0; i < n; i++) {
        (function (i) {
          const lab = h("div", "clab", "<span>" + esc((c.label || "weight") + " — child " + String.fromCharCode(65 + i)) + '</span><span class="cval">' + num(v["weight" + i], 0) + "</span>");
          const inp = h("input"); inp.type = "range"; inp.min = 0; inp.max = 3; inp.step = 1; inp.value = num(v["weight" + i], 1);
          inp.addEventListener("input", function () { v["weight" + i] = inp.value; lab.querySelector(".cval").textContent = inp.value; onChange(); });
          wrap.appendChild(lab); wrap.appendChild(inp);
        })(i);
      }
      return wrap;
    }
    if (TOGGLES.indexOf(c.role) >= 0) {
      const sw = h("label", "switch"); const inp = h("input"); inp.type = "checkbox"; inp.checked = v[c.role] === "true";
      sw.appendChild(inp); sw.appendChild(h("span", "track")); sw.appendChild(h("span", null, esc(c.label || c.role)));
      inp.addEventListener("change", function () { v[c.role] = inp.checked ? "true" : "false"; onChange(); });
      wrap.appendChild(sw); return wrap;
    }
    if (SELECT_OPTS[c.role]) {
      const opts = (c.options && c.options.length ? c.options : SELECT_OPTS[c.role]);
      wrap.appendChild(h("div", "clab", "<span>" + esc(c.label || c.role) + "</span>"));
      const seg = h("div", "seg");
      opts.forEach(function (o) {
        const b = h("button", v[c.role] === o ? "on" : null, esc(o)); b.type = "button";
        b.addEventListener("click", function () { v[c.role] = o; seg.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); onChange(); });
        seg.appendChild(b);
      });
      wrap.appendChild(seg); return wrap;
    }
    // slider
    const s = SLIDER[c.role] || [0, 100, 1, 0];
    const mn = c.min != null ? c.min : s[0], mx = c.max != null ? c.max : s[1], st = c.step != null ? c.step : s[2];
    const unit = (c.role === "fontSize") ? "sp" : (c.role === "aspectRatio" || c.role === "fillFraction" || c.role === "nestDepth" || c.role.indexOf("Count") >= 0) ? "" : "dp";
    const lab = h("div", "clab", "<span>" + esc(c.label || c.role) + '</span><span class="cval">' + esc(v[c.role]) + (unit ? " " + unit : "") + "</span>");
    const inp = h("input"); inp.type = "range"; inp.min = mn; inp.max = mx; inp.step = st; inp.value = v[c.role];
    inp.addEventListener("input", function () { v[c.role] = inp.value; lab.querySelector(".cval").textContent = inp.value + (unit ? " " + unit : ""); onChange(); });
    wrap.appendChild(lab); wrap.appendChild(inp); return wrap;
  }

  function buildPlayground(pg) {
    const v = defaults(pg);
    const root = h("div");
    root.appendChild(h("div", "pg-label", "Interactive playground"));
    if (pg.intro) root.appendChild(h("p", "pg-intro", esc(pg.intro)));
    const grid = h("div", "playground");
    const controls = h("div", "pg-controls");
    const right = h("div", "pg-right");
    const preview = h("div", "preview", '<div class="bar"><i></i><i></i><i></i></div>');
    const sw = h("div", "stagewrap"); const stage = h("div", "stage"); sw.appendChild(stage); preview.appendChild(sw);
    const code = h("div", "codepanel"); const ch = h("div", "ch", "<span>Generated Kotlin</span>"); const copy = h("button", null, "Copy"); ch.appendChild(copy);
    const pre = h("pre"); code.appendChild(ch); code.appendChild(pre);
    right.appendChild(preview); right.appendChild(code);

    function render() { applyPreview(pg, v, stage); pre.innerHTML = kt(genKotlin(pg, v)); }
    copy.addEventListener("click", function () { navigator.clipboard && navigator.clipboard.writeText(genKotlin(pg, v)); copy.textContent = "Copied!"; setTimeout(function () { copy.textContent = "Copy"; }, 1200); });

    pg.controls.forEach(function (c) { controls.appendChild(buildControl(pg, c, v, render)); });
    grid.appendChild(controls); grid.appendChild(right); root.appendChild(grid);
    render();
    return root;
  }

  // ======================= PAGE RENDER =======================
  function renderSection(s) {
    const sec = h("section", "section"); sec.id = s.id;
    const head = h("div", "section-head");
    head.appendChild(h("div", "emoji", esc(s.emoji || "▫️")));
    const ht = h("div"); ht.appendChild(h("h2", null, esc(s.title))); ht.appendChild(h("span", "cat-badge", esc(s.category)));
    head.appendChild(ht); sec.appendChild(head);
    sec.appendChild(h("p", "summary", esc(s.summary)));
    sec.appendChild(h("div", "explain", s.explanation_html || ""));
    if (s.key_points && s.key_points.length) {
      const kp = h("div", "keypoints", "<h4>Key points</h4>"); const ul = h("ul");
      s.key_points.forEach(function (p) { ul.appendChild(h("li", null, esc(p))); }); kp.appendChild(ul); sec.appendChild(kp);
    }
    if (s.playground) sec.appendChild(buildPlayground(s.playground));
    if (s.gotchas_html) sec.appendChild(h("div", "gotchas", "<h4>⚠️ Common mistakes</h4>" + s.gotchas_html));
    if (s.canonical_code) {
      const canon = h("div", "canon"); canon.appendChild(h("div", "pg-label", "Canonical example"));
      const pre = h("pre"); pre.innerHTML = kt(s.canonical_code); canon.appendChild(pre); sec.appendChild(canon);
    }
    return sec;
  }

  function init() {
    const app = document.getElementById("app");
    const nav = document.getElementById("nav");
    const main = document.getElementById("sections");
    // nav grouped by category (preserve first-seen order)
    const cats = []; const byCat = {};
    SECTIONS.forEach(function (s) { if (!byCat[s.category]) { byCat[s.category] = []; cats.push(s.category); } byCat[s.category].push(s); });
    cats.forEach(function (cat) {
      nav.appendChild(h("div", "nav-group", esc(cat)));
      const box = h("div", "nav");
      byCat[cat].forEach(function (s) {
        const a = h("a", null, '<span class="ne">' + esc(s.emoji || "▫️") + "</span><span>" + esc(s.title) + "</span>"); a.href = "#" + s.id; a.dataset.id = s.id;
        box.appendChild(a);
      });
      nav.appendChild(box);
    });
    SECTIONS.forEach(function (s) { main.appendChild(renderSection(s)); });

    // scroll spy
    const links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle("active", l.dataset.id === en.target.id); });
        }
      });
    }, { rootMargin: "-10% 0px -75% 0px", threshold: 0 });
    SECTIONS.forEach(function (s) { const el = document.getElementById(s.id); if (el) io.observe(el); });

    // theme toggle
    const tb = document.getElementById("theme");
    tb.addEventListener("click", function () {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
      tb.textContent = dark ? "🌙" : "☀️";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
