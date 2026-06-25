// =============================================================================
// code-lab.js — window.mountCodeLab(spec) builds a hands-on lab page for the
// data-layer tracks (Networking, Firebase, Supabase, Cumulative).
//
// It mirrors the Compose/Nav lab layout (hero · task · editor · live preview ·
// checks) from lab-harness.js, but instead of a true Compose/Nav engine it uses:
//   • a DECLARATIVE check engine — each check is data (a RegExp or all/any list),
//     so labs stay safe and portable (no eval of learner code), and
//   • a per-track SIMULATOR that reacts to which checks pass + the chosen
//     scenario, so the preview animates as the learner fixes the code.
//
// A lab spec:
//   {
//     kind:'code',
//     track:'Networking'|'Firebase'|'Supabase'|'Cumulative',
//     sim:'net'|'sync'|'pipeline'|'runner',
//     flavor:'firestore'|'supabase',     // (sync sim only) labels the cloud panel
//     id, title, level, goal,
//     steps:   [html, ...],
//     hints:   [html, ...],
//     starter: `…kotlin/sql…`,
//     solution:`…kotlin/sql…`,
//     lang:    'kotlin'|'sql',            // editor highlighting (default kotlin)
//     scenarios:[ {id, label}, ... ],     // buttons above the simulator
//     checks:  [ {id, label, re|all|any, not}, ... ],
//     tests:   [ {name, needs:[checkId,...]} ],   // (runner sim) JUnit-style rows
//     diagram: [ {label, fact:checkId, detail} ], // (pipeline sim) flow nodes
//   }
//
// THE CONTRACT between a lab's data and its simulator is the set of check `id`s.
// Each sim documents the ids it reads (see the SIMS section). Ids a lab does not
// declare default to TRUE in a sim ("an earlier step already did this"), so each
// lab's preview focuses on the one thing that lab teaches.
// =============================================================================
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // tiny helpers (shared look with lab-harness.js / the playgrounds)
  // ---------------------------------------------------------------------------
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function el(tag, cls, txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }

  var KW = ['val','var','fun','return','if','else','when','for','while','data','object','class','interface','sealed','enum',
            'import','package','true','false','null','by','it','this','suspend','override','private','public','companion','in','is','as'];
  var SQLKW = ['select','from','where','order','create','table','policy','using','check','insert','update','delete','on','conflict',
               'do','set','and','or','as','primary','key','not','default','enable','row','level','security','to','for','auth','uid'];
  function hl(code, lang){
    var extra = lang==='sql' ? '|'+SQLKW.join('|') : '';
    var KW_RE = KW.join('|')+extra;
    // case-insensitive for SQL keywords; kotlin keywords are lowercase anyway.
    var re = new RegExp('(\\/\\/[^\\n]*|--[^\\n]*)|("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')|(@\\w+)|(\\b\\d[\\d_]*(?:\\.\\d+)?L?\\b)|(\\b(?:'+KW_RE+')\\b)|(\\b[A-Z][A-Za-z0-9_]*\\b)','gi');
    return code.replace(re, function(m,c1,c2,c3,c4,c5,c6){
      if(c1) return '<span class="c">'+m+'</span>'; if(c2) return '<span class="s">'+m+'</span>';
      if(c3) return '<span class="a">'+m+'</span>'; if(c4) return '<span class="n">'+m+'</span>';
      if(c5) return '<span class="k">'+m+'</span>'; if(c6) return '<span class="t">'+m+'</span>'; return m;
    });
  }

  // ---------------------------------------------------------------------------
  // check engine — evaluate one declarative check against the learner's code
  // ---------------------------------------------------------------------------
  function asRe(x){ return x instanceof RegExp ? x : new RegExp(x); }
  function evalCheck(code, chk){
    var ok;
    if(chk.all){ ok = chk.all.every(function(r){ return asRe(r).test(code); }); }
    else if(chk.any){ ok = chk.any.some(function(r){ return asRe(r).test(code); }); }
    else if(chk.re!=null){ ok = asRe(chk.re).test(code); }
    else { ok = true; }
    return chk.not ? !ok : ok;
  }

  // ---------------------------------------------------------------------------
  // one-time injected styles for the simulator widgets + per-track accents
  // (keeps labs.css untouched; everything here is scoped to these labs)
  // ---------------------------------------------------------------------------
  function injectStyle(){
    if(document.getElementById('code-lab-style')) return;
    var s = el('style'); s.id='code-lab-style';
    s.textContent = [
      // track accents on the hero (default green is the compose look)
      'header.hero.t-firebase{background:linear-gradient(135deg,#0b1220 0%,#2a1c05 55%,#ffa000 175%);border-bottom-color:#ffa000;}',
      'header.hero.t-firebase .eyebrow{color:#ffca6b;}',
      'header.hero.t-supabase{background:linear-gradient(135deg,#0b1220 0%,#0c2a22 55%,#3ecf8e 170%);border-bottom-color:#3ecf8e;}',
      'header.hero.t-supabase .eyebrow{color:#7fe9c0;}',
      'header.hero.t-cumulative{background:linear-gradient(135deg,#0b1220 0%,#241433 55%,#a855f7 175%);border-bottom-color:#a855f7;}',
      'header.hero.t-cumulative .eyebrow{color:#d8b4fe;}',
      'header.hero.done{border-bottom-color:#ffd400;}',
      // scenario bar
      '.simbar{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;align-items:center;}',
      '.simbar .simlbl{font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#7c8aa0;margin-right:2px;}',
      '.simbtn{font-size:12px;font-weight:700;padding:5px 11px;border-radius:999px;background:#fff;color:#334;border:1px solid var(--line);cursor:pointer;}',
      '.simbtn:hover{border-color:var(--blue);}',
      '.simbtn.on{background:var(--ink);color:#fff;border-color:var(--ink);}',
      // generic note rows / cards used across sims
      '.nlist{display:flex;flex-direction:column;gap:7px;}',
      '.ncard{border:1px solid var(--line);border-radius:10px;background:#fff;padding:8px 10px;box-shadow:var(--shadow);}',
      '.ncard .nt{font-size:13.5px;font-weight:750;color:var(--ink);}',
      '.ncard .nb{font-size:12px;color:var(--muted);margin-top:1px;}',
      '.ncard.gone{opacity:.45;text-decoration:line-through;}',
      '.badge{font-size:10px;font-weight:800;letter-spacing:.03em;border-radius:999px;padding:1px 8px;float:right;text-transform:uppercase;}',
      '.b-pending{background:#fff7ed;color:#b45309;border:1px solid #fed7aa;}',
      '.b-synced{background:#ecfdf3;color:#0f9d58;border:1px solid #bfe9cf;}',
      '.b-failed{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}',
      // net sim phone bits
      '.trace{font:11px ui-monospace,Menlo,monospace;color:#64748b;background:#f7f9fc;border:1px solid var(--line);border-radius:8px;padding:6px 9px;margin:10px;}',
      '.trace b{color:#0f9d58;}',
      '.spin{width:34px;height:34px;border-radius:50%;border:4px solid #d7e0ea;border-top-color:var(--blue);animation:cl-spin .8s linear infinite;margin:0 auto;}',
      '@keyframes cl-spin{to{transform:rotate(360deg);}}',
      '.crash{margin:10px;border:1px solid #fecaca;background:#fef2f2;color:#b91c1c;border-radius:10px;padding:14px;font-size:13px;font-weight:600;}',
      '.crash .ttl{font-weight:850;font-size:14px;margin-bottom:4px;}',
      '.errcard{margin:10px;border:1px solid var(--line);background:#fff;border-radius:10px;padding:16px;text-align:center;}',
      '.errcard .em{font-size:13px;color:var(--muted);margin:6px 0 12px;}',
      '.pillrow{display:flex;gap:6px;padding:10px 10px 0;flex-wrap:wrap;}',
      '.pill{font-size:11px;font-weight:800;border-radius:999px;padding:2px 9px;}',
      '.pill.on{background:#ecfdf3;color:#0f9d58;border:1px solid #bfe9cf;}',
      '.pill.off{background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;}',
      '.pill.pend{background:#fff7ed;color:#b45309;border:1px solid #fed7aa;}',
      '.blank{margin:10px;border:1px dashed #cbd5e1;border-radius:10px;padding:18px;text-align:center;color:#94a3b8;font-size:12.5px;}',
      // sync sim two columns (device | cloud)
      '.synccols{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start;width:100%;}',
      '@media (max-width:1180px){.synccols{grid-template-columns:1fr;}}',
      '.synccol{border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden;box-shadow:var(--shadow);}',
      '.colhead{padding:9px 12px;font-size:12px;font-weight:800;color:#334;background:#f7f9fc;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px;}',
      '.colhead .ic{font-size:14px;}',
      '.colhead .rt{margin-left:auto;font-size:11px;font-weight:800;}',
      '.colbody{padding:10px;min-height:120px;}',
      '.optag{font:11px ui-monospace,Menlo,monospace;color:#475569;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:7px;padding:4px 8px;margin:10px;display:block;}',
      '.optag b{color:#0f172a;}',
      '.emptyhint{color:#94a3b8;font-size:12px;text-align:center;padding:14px;}',
      // runner sim (JUnit-style console)
      '.runner{width:100%;max-width:520px;}',
      '.rhead{font-size:12px;font-weight:800;color:#334;margin-bottom:8px;display:flex;align-items:center;gap:8px;}',
      '.rsummary{margin-left:auto;font-weight:800;}',
      '.tline{display:flex;gap:9px;align-items:flex-start;border:1px solid var(--line);border-radius:9px;background:#fff;padding:8px 11px;margin-bottom:6px;box-shadow:var(--shadow);}',
      '.tline .tmark{flex:none;width:19px;height:19px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:800;background:#eef2f7;color:#9aa8b8;}',
      '.tline.pass .tmark{background:#0f9d58;color:#fff;}',
      '.tline.fail .tmark{background:#fee2e2;color:#dc2626;}',
      '.tline .tn{font:12.5px ui-monospace,Menlo,monospace;color:#334;}',
      '.tline.pass .tn{color:#0f172a;}',
      '.rbar{margin-top:8px;border-radius:8px;padding:8px 11px;font-size:12.5px;font-weight:800;}',
      '.rbar.green{background:#ecfdf3;color:#0f9d58;border:1px solid #bfe9cf;}',
      '.rbar.red{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;}',
      // pipeline sim (layered data flow)
      '.pipe{width:100%;max-width:430px;display:flex;flex-direction:column;align-items:stretch;gap:0;}',
      '.pnode{border:1px solid var(--line);border-radius:12px;background:#fff;padding:11px 13px;box-shadow:var(--shadow);position:relative;}',
      '.pnode .pl{font-size:13px;font-weight:800;color:#94a3b8;}',
      '.pnode .pd{font-size:12px;color:#94a3b8;margin-top:2px;}',
      '.pnode.on{border-color:#bfe9cf;background:#f6fffb;}',
      '.pnode.on .pl{color:#0f172a;} .pnode.on .pd{color:#475569;}',
      '.pnode .ptick{position:absolute;top:10px;right:12px;font-size:14px;color:#cbd5e1;}',
      '.pnode.on .ptick{color:#0f9d58;}',
      '.parrow{align-self:center;color:#cbd5e1;font-size:16px;line-height:1;padding:3px 0;}',
      '.parrow.on{color:#0f9d58;}',
      '.presult{margin-top:12px;border-radius:10px;padding:10px 13px;font-size:13px;font-weight:750;}',
      '.presult.green{background:#ecfdf3;color:#0f9d58;border:1px solid #bfe9cf;}',
      '.presult.grey{background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;}',
    ].join('\n');
    document.head.appendChild(s);
  }

  // ===========================================================================
  // SIMS — each renders into `mount` from ctx = { pass, has, scenario, flavor, spec }
  //   pass[id]  : true/false for declared checks; undefined for others
  //   has(id)   : pass[id] if declared, else true (an earlier step did it)
  // ===========================================================================
  var SIMS = {};

  // --- net: HTTP request lifecycle (Loading → Success list | Error card | crash)
  // reads: serializable, endpoint, mapper, states, whenExhaustive, trycatch,
  //        collectLifecycle, ignoreUnknown
  SIMS.net = function(mount, ctx){
    var has = ctx.has, sc = ctx.scenario || 'happy';
    var phone = el('div','phone'); phone.appendChild(el('div','notch'));
    var screen = el('div','screen'); phone.appendChild(screen);
    mount.appendChild(phone);
    screen.appendChild(barTitle('Notes'));

    // compile-time gate: a missing @Serializable / endpoint means nothing decodes
    if(!has('serializable')){ return blank(screen, '⛔ Won’t compile / decode', 'NoteDto isn’t @Serializable, so Retrofit + kotlinx.serialization can’t turn the JSON into objects.'); }
    if(!has('endpoint')){ return blank(screen, '⚠ No endpoint described', 'Retrofit has no @GET suspend function to call — there’s nothing to fetch.'); }
    if(!has('states') || !has('whenExhaustive')){ return blank(screen, '⚠ UI can’t pick a state', 'Without a sealed NotesUiState + an exhaustive when(…), the screen doesn’t know whether to draw the spinner, the list, or an error.'); }

    var trace = el('div','trace'); trace.innerHTML = 'GET /posts → <b>Loading…</b> → ';
    screen.appendChild(trace);

    var collects = has('collectLifecycle');
    if(sc==='offline'){
      if(has('trycatch')){
        trace.innerHTML += 'caught → <b>Error</b>';
        errCard(screen, 'Couldn’t load notes', 'Unable to resolve host "jsonplaceholder.typicode.com": No address associated with hostname');
      } else {
        trace.innerHTML += '<span style="color:#dc2626">uncaught ↗</span>';
        crash(screen, 'UnknownHostException', 'No try/catch in loadNotes() — the thrown network error escapes the ViewModel and the app crashes instead of showing an Error state.');
      }
      return collectNote(screen, collects);
    }
    if(sc==='badjson'){
      if(!has('ignoreUnknown')){
        if(has('trycatch')){ trace.innerHTML += 'caught → <b>Error</b>'; errCard(screen, 'Couldn’t load notes', 'SerializationException: Unexpected JSON key ‘reactions’ (set ignoreUnknownKeys = true to tolerate new server fields).'); }
        else { trace.innerHTML += '<span style="color:#dc2626">uncaught ↗</span>'; crash(screen, 'SerializationException', 'The server added a field we didn’t model and Json is strict — decoding throws and nothing catches it.'); }
        return collectNote(screen, collects);
      }
      trace.innerHTML += '<b>Success</b> (unknown key ignored)';
    } else if(sc==='empty'){
      trace.innerHTML += '<b>Success</b> (0 notes)';
      screen.appendChild(emptyState('No notes yet.'));
      return collectNote(screen, collects);
    } else {
      trace.innerHTML += '<b>Success</b>';
    }

    // SUCCESS list — clean domain notes if mapped; leaky DTO rows if not
    var notes = [
      {id:1, userId:1, title:'Buy milk', body:'Whole milk and oat milk for the week.'},
      {id:2, userId:1, title:'Grocery reminder', body:'Tomatoes, basil, mozzarella for Friday.'},
      {id:3, userId:2, title:'Call the dentist', body:'Book the 6-month cleaning.'},
    ];
    var list = el('div','nlist'); list.style.padding='10px';
    notes.forEach(function(n){
      var c = el('div','ncard');
      c.appendChild(Object.assign(el('div','nt'), {textContent:n.title}));
      var b = el('div','nb');
      b.textContent = has('mapper') ? n.body : ('userId='+n.userId+' · '+n.body);  // unmapped DTO leaks userId
      c.appendChild(b);
      list.appendChild(c);
    });
    screen.appendChild(list);
    if(!has('mapper')){ screen.appendChild(noteLine('⚠ No DTO→domain mapper: the UI is bound to the raw wire shape (note the leaked userId).')); }
    return collectNote(screen, collects);
  };

  // --- sync: offline-first device ⇄ cloud (used by Firebase + Supabase)
  // reads: bookkeeping, clientId, optimistic, tombstone, lww, push, pull
  SIMS.sync = function(mount, ctx){
    var has = ctx.has, sc = ctx.scenario || 'editOffline', fl = ctx.flavor || 'firestore';
    var supa = fl==='supabase';
    var cloudName = supa ? 'Supabase · notes table' : 'Firestore · notes collection';
    var pushOp = supa ? 'INSERT … ON CONFLICT (id) DO UPDATE' : 'notes.document(id).set(dto)';
    var pullOp = supa ? 'WHERE updated_at &gt; since' : 'whereGreaterThan("updatedAt", since)';

    // model a tiny world
    var device = [];     // {title, badge}
    var cloud  = [];     // {title}
    var online = (sc==='goOnline');
    var note = supa ? {t:'Draft from the train', b:'Offline edit'} : {t:'Draft on the subway', b:'Offline edit'};

    if(!has('bookkeeping')){
      return twoCols(mount, cloudName, online,
        blankInline('⚠ The Note entity has no sync bookkeeping (updatedAt / syncState / deleted), so a row can’t be tracked as pending, ordered for last-write-wins, or tombstoned.'),
        blankInline('Nothing to sync yet.'), null, null);
    }

    var pending = 0, op = null, cloudOp = null;
    if(sc==='editOffline'){
      if(has('optimistic')){
        device.push({title:note.t, body:note.b, badge:'pending'}); pending=1;
        op = 'addNote(): dao.upsert(… syncState = PENDING)' + (has('clientId')?' · id = UUID.randomUUID()':'');
      } else {
        return twoCols(mount, cloudName, false,
          blankInline('⚠ addNote() waited for the network instead of writing Room first — offline, the user sees nothing appear.'),
          blankInline('(offline — no request reaches the cloud)'), null, null);
      }
    } else if(sc==='deleteOffline'){
      device.push({title:'Old shopping list', body:'(visible note)', badge:'synced'});
      if(has('tombstone')){
        device.push({title:'Yesterday’s note', body:'deleted offline', badge:'pending', gone:true}); pending=1;
        op = 'deleteNote(): copy(deleted = true, syncState = PENDING) — a tombstone you can still push';
      } else {
        op = '⚠ Hard-deleted the row locally — with no tombstone there’s nothing left to push, so the cloud copy lingers forever.';
      }
      cloud.push({title:'Old shopping list'});
      cloud.push({title:'Yesterday’s note'});
    } else if(sc==='goOnline'){
      // a pending local edit + a seeded cloud row → after sync both reconcile
      var pushed = has('push');
      var pulled = has('pull') && has('lww');
      device.push({title:note.t, body:note.b, badge: pushed ? 'synced':'pending'});
      if(!pushed) pending=1;
      if(pushed){ cloud.push({title:note.t}); }
      cloud.push({title:'Welcome to '+(supa?'SupabaseSync':'FirebaseSync')});
      if(pulled){ device.unshift({title:'Welcome to '+(supa?'SupabaseSync':'FirebaseSync'), body:'pulled from the cloud', badge:'synced'}); }
      op = pushed ? ('sync(): push outbox → '+ (supa?'upsert':'set') +' → mark SYNCED') : '⚠ sync() never pushes the PENDING outbox — local edits never reach the cloud.';
      cloudOp = pulled ? ('pull '+pullOp+' → shouldAcceptRemote() → Room') : '⚠ sync() never pulls remote rows (or last-write-wins is missing) — other devices’ changes never arrive.';
    } else if(sc==='remoteEdit'){
      device.push({title:'My local note', body:'(already synced)', badge:'synced'});
      cloud.push({title:'My local note'});
      cloud.push({title:'Note from another device', remote:true});
      if(has('pull') && has('lww')){
        device.push({title:'Note from another device', body:'pulled on next sync', badge:'synced'});
        cloudOp = 'pull '+pullOp+' → shouldAcceptRemote(local=null) = true → upsert';
      } else {
        cloudOp = '⚠ Without pull + last-write-wins, the remote note never reaches this device.';
      }
    }

    twoCols(mount, cloudName, online, deviceBody(device, pending), cloudBody(cloud, supa), op, cloudOp ? {op:cloudOp} : (sc==='editOffline'||sc==='deleteOffline' ? {op:'(no request — device is offline)'} : null), pushOp);
  };

  // --- runner: a JVM unit-test console (pure logic + testing labs)
  // reads: whatever check ids the lab's `tests[].needs` reference
  SIMS.runner = function(mount, ctx){
    var spec = ctx.spec, has = ctx.has;
    var box = el('div','runner');
    var head = el('div','rhead'); head.appendChild(document.createTextNode('🧪 JVM unit tests · no emulator'));
    var sum = el('span','rsummary'); head.appendChild(sum); box.appendChild(head);
    var tests = spec.tests || [];
    var passed = 0;
    tests.forEach(function(t){
      var ok = (t.needs||[]).every(function(id){ return has(id); });
      if(ok) passed++;
      var ln = el('div','tline'+(ok?' pass':' fail'));
      var mk = el('span','tmark', ok?'✓':'×'); ln.appendChild(mk);
      ln.appendChild(Object.assign(el('span','tn'), {textContent:t.name}));
      box.appendChild(ln);
    });
    sum.textContent = passed+' / '+tests.length;
    sum.style.color = passed===tests.length ? '#0f9d58' : '#94a3b8';
    var bar = el('div','rbar '+(passed===tests.length?'green':'red'));
    bar.textContent = passed===tests.length ? 'BUILD SUCCESSFUL — all '+tests.length+' tests passed' : (tests.length-passed)+' test'+((tests.length-passed)===1?'':'s')+' failing';
    box.appendChild(bar);
    mount.appendChild(box);
  };

  // --- pipeline: layered data-flow diagram (cumulative architecture labs)
  // reads: each diagram node's `fact` check id
  SIMS.pipeline = function(mount, ctx){
    var spec = ctx.spec, has = ctx.has;
    var nodes = spec.diagram || [];
    var pipe = el('div','pipe');
    var allOn = true;
    nodes.forEach(function(n, i){
      var on = n.fact==null ? true : has(n.fact);
      if(!on) allOn = false;
      var node = el('div','pnode'+(on?' on':''));
      node.appendChild(Object.assign(el('div','ptick'), {textContent: on?'✓':'○'}));
      node.appendChild(Object.assign(el('div','pl'), {textContent:n.label}));
      if(n.detail) node.appendChild(Object.assign(el('div','pd'), {textContent:n.detail}));
      pipe.appendChild(node);
      if(i<nodes.length-1){ var ar = el('div','parrow'+(on?' on':'')); ar.textContent='▼'; pipe.appendChild(ar); }
    });
    var res = el('div','presult '+(allOn?'green':'grey'));
    res.textContent = allOn ? (spec.resultOk||'The data flows end-to-end — every layer is wired.') : (spec.resultPending||'Some layers aren’t wired yet — follow the steps until each lights up.');
    pipe.appendChild(res);
    mount.appendChild(pipe);
  };

  // ---------------------------------------------------------------------------
  // small render helpers used by the sims
  // ---------------------------------------------------------------------------
  function barTitle(t){ var b=el('div','napp-bar'); b.textContent=t; return b; }
  function blank(screen, ttl, msg){ var d=el('div','blank'); d.appendChild(Object.assign(el('div',null,ttl),{style:'font-weight:800;color:#64748b;margin-bottom:5px;font-size:13px'})); d.appendChild(el('div',null,msg)); screen.appendChild(d); }
  function blankInline(msg){ var d=el('div','emptyhint'); d.textContent=msg; return d; }
  function emptyState(msg){ var d=el('div','emptyhint'); d.style.padding='30px 16px'; d.textContent=msg; return d; }
  function noteLine(msg){ var d=el('div','trace'); d.textContent=msg; return d; }
  function collectNote(screen, collects){
    if(collects) return;
    screen.appendChild(noteLine('⚠ Not collected with collectAsStateWithLifecycle() — the screen keeps observing while in the background (or won’t recompose on new emissions).'));
  }
  function crash(screen, ttl, msg){ var d=el('div','crash'); d.appendChild(Object.assign(el('div','ttl'),{textContent:'💥 '+ttl})); d.appendChild(el('div',null,msg)); screen.appendChild(d); }
  function errCard(screen, ttl, msg){ var d=el('div','errcard'); d.appendChild(Object.assign(el('div',null,ttl),{style:'font-weight:800'})); d.appendChild(Object.assign(el('div','em'),{textContent:msg})); var b=el('button','nbtn','Retry'); b.disabled=true; d.appendChild(b); screen.appendChild(d); }

  function deviceBody(device, pending){
    var wrap = document.createDocumentFragment();
    var pr = el('div','pillrow');
    pr.appendChild(Object.assign(el('span','pill '+(pending>0?'pend':'on')), {textContent: pending>0 ? (pending+' pending') : 'all synced'}));
    wrap.appendChild(pr);
    var list = el('div','nlist'); list.style.padding='10px';
    if(!device.length){ list.appendChild(blankInline('(no notes)')); }
    device.forEach(function(n){
      var c = el('div','ncard'+(n.gone?' gone':''));
      var bd = el('span','badge '+(n.badge==='synced'?'b-synced':n.badge==='failed'?'b-failed':'b-pending'));
      bd.textContent = n.badge; c.appendChild(bd);
      c.appendChild(Object.assign(el('div','nt'),{textContent:n.title}));
      if(n.body) c.appendChild(Object.assign(el('div','nb'),{textContent:n.body}));
      list.appendChild(c);
    });
    wrap.appendChild(list);
    return wrap;
  }
  function cloudBody(cloud, supa){
    var list = el('div','nlist'); list.style.padding='10px';
    if(!cloud.length){ list.appendChild(blankInline('(empty)')); return list; }
    cloud.forEach(function(r){
      var c = el('div','ncard');
      c.appendChild(Object.assign(el('div','nt'),{textContent:(supa?'▤ ':'📄 ')+r.title}));
      c.appendChild(Object.assign(el('div','nb'),{textContent:r.remote?'written by another device':'id · title · updated_at'}));
      list.appendChild(c);
    });
    return list;
  }
  function twoCols(mount, cloudName, online, deviceContent, cloudContent, deviceOp, cloudOpObj, pushOp){
    var cols = el('div','synccols');
    // device column
    var dev = el('div','synccol');
    var dh = el('div','colhead'); dh.appendChild(Object.assign(el('span','ic'),{textContent:'📱'})); dh.appendChild(document.createTextNode('This device · Room'));
    var dpill = el('span','rt'); dpill.textContent = online ? '● online' : '○ offline'; dpill.style.color = online ? '#0f9d58':'#94a3b8'; dh.appendChild(dpill);
    dev.appendChild(dh);
    var db = el('div','colbody');
    if(deviceContent) db.appendChild(deviceContent);
    if(deviceOp){ var o=el('div','optag'); o.innerHTML='<b>local:</b> '+esc(deviceOp); db.appendChild(o); }
    dev.appendChild(db);
    // cloud column
    var cl = el('div','synccol');
    var ch = el('div','colhead'); ch.appendChild(Object.assign(el('span','ic'),{textContent:'☁️'})); ch.appendChild(document.createTextNode(cloudName));
    cl.appendChild(ch);
    var cb = el('div','colbody');
    if(cloudContent) cb.appendChild(cloudContent);
    if(cloudOpObj){ var c2=el('div','optag'); c2.innerHTML='<b>remote:</b> '+esc(cloudOpObj.op); cb.appendChild(c2); }
    cl.appendChild(cb);
    cols.appendChild(dev); cols.appendChild(cl);
    mount.appendChild(cols);
  }

  // ===========================================================================
  // mountCodeLab — build the whole page
  // ===========================================================================
  window.mountCodeLab = function(spec){
    injectStyle();
    document.title = spec.title + ' — Data Labs';
    var trackKey = (spec.track||'').toLowerCase();
    var lang = spec.lang || 'kotlin';

    var body = document.body; body.innerHTML=''; body.className='labbody';

    // hero
    var hero = el('header','hero t-'+trackKey);
    var bar = el('div','bartop');
    var tw = el('div');
    tw.appendChild(el('p','eyebrow', spec.track+' · Hands-on lab'));
    tw.appendChild(el('h1', null, spec.title));
    bar.appendChild(tw);
    var links = el('div','links');
    links.appendChild(linkBtn('← All labs','./index.html'));
    bar.appendChild(links); hero.appendChild(bar);
    var chips = el('div','herochips');
    chips.appendChild(el('span','hchip', spec.track));
    if(spec.level) chips.appendChild(el('span','hchip', spec.level));
    var prog = el('span','hchip prog','0 / '+spec.checks.length+' checks'); chips.appendChild(prog);
    hero.appendChild(chips);
    hero.appendChild(el('p','goal', spec.goal));
    body.appendChild(hero);

    // main
    var main = el('div','lab');
    var left = el('section','pane left');
    var right = el('section','pane right');
    main.appendChild(left); main.appendChild(right); body.appendChild(main);

    // left: task + editor
    var task = el('div','task');
    task.appendChild(el('h3', null, 'Your task'));
    var ol = el('ol','steps'); (spec.steps||[]).forEach(function(s){ var li=el('li'); li.innerHTML=s; ol.appendChild(li); }); task.appendChild(ol);
    if(spec.hints && spec.hints.length){
      var det = el('details','hints'); det.appendChild(el('summary', null, '💡 Hints ('+spec.hints.length+')'));
      var ul=el('ul'); spec.hints.forEach(function(h){ var li=el('li'); li.innerHTML=h; ul.appendChild(li); }); det.appendChild(ul); task.appendChild(det);
    }
    left.appendChild(task);

    var ehead = el('div','panehead'); ehead.appendChild(el('span','dot')); ehead.appendChild(document.createTextNode(' Your code'));
    var ehright = el('span','right'); var copyBtn = el('button','btn','Copy'); copyBtn.style.padding='3px 9px'; ehright.appendChild(copyBtn); ehead.appendChild(ehright);
    left.appendChild(ehead);

    var ewrap = el('div','editorwrap');
    var pre = el('pre'); pre.setAttribute('aria-hidden','true'); var preCode=el('code'); pre.appendChild(preCode);
    var ta = el('textarea'); ta.spellcheck=false; ta.setAttribute('autocapitalize','off'); ta.setAttribute('autocomplete','off'); ta.setAttribute('autocorrect','off'); ta.setAttribute('aria-label','Code editor — '+spec.title);
    ewrap.appendChild(pre); ewrap.appendChild(ta); left.appendChild(ewrap);
    var status = el('div','status','Edit the code — the preview and checks update as you type.');
    left.appendChild(status);

    // right: preview + checks
    var phead = el('div','panehead'); phead.appendChild(el('span','dot')); phead.appendChild(document.createTextNode(' Live preview'));
    right.appendChild(phead);
    var pscroll = el('div','previewscroll');
    var simbar = el('div','simbar');
    var simMount = el('div','previewstage');
    pscroll.appendChild(simbar); pscroll.appendChild(simMount);
    right.appendChild(pscroll);

    // checks panel
    var checksWrap = el('div','checks');
    var banner = el('div','banner'); banner.style.display='none'; banner.textContent='✅ Lab complete — every check passed!'; checksWrap.appendChild(banner);
    var clist = el('div','checklist'); checksWrap.appendChild(clist);
    var rowEls = spec.checks.map(function(c){ var r=el('div','checkitem'); var mk=el('span','mark','○'); var lb=el('span','clabel'); lb.innerHTML=c.label; r.appendChild(mk); r.appendChild(lb); clist.appendChild(r); return {row:r, mark:mk}; });
    var btns = el('div','labbtns');
    var resetBtn=el('button','btn','↺ Reset'); var solBtn=el('button','btn','👁 Show solution');
    btns.appendChild(resetBtn); btns.appendChild(solBtn); checksWrap.appendChild(btns);
    right.appendChild(checksWrap);

    // scenario buttons
    var state = { scenario: (spec.scenarios && spec.scenarios[0] && spec.scenarios[0].id) || null };
    if(spec.scenarios && spec.scenarios.length){
      simbar.appendChild(el('span','simlbl','Scenario'));
      spec.scenarios.forEach(function(s){
        var b = el('button','simbtn'+(s.id===state.scenario?' on':''), s.label);
        b.addEventListener('click', function(){ state.scenario=s.id; Array.prototype.forEach.call(simbar.querySelectorAll('.simbtn'), function(x){ x.classList.remove('on'); }); b.classList.add('on'); recompute(); });
        simbar.appendChild(b);
      });
    } else { simbar.style.display='none'; }

    // behavior
    function refreshHl(){ preCode.innerHTML = hl(esc(ta.value), lang) + '\n'; }
    function computePass(code){ var pass={}; spec.checks.forEach(function(c){ try{ pass[c.id]=evalCheck(code,c); }catch(e){ pass[c.id]=false; } }); return pass; }
    function runChecks(pass){
      var passed=0;
      spec.checks.forEach(function(c,i){ var ok=!!pass[c.id]; rowEls[i].row.className='checkitem'+(ok?' ok':''); rowEls[i].mark.textContent=ok?'✓':'○'; if(ok)passed++; });
      prog.textContent = passed+' / '+spec.checks.length+' checks';
      var done = passed===spec.checks.length;
      banner.style.display = done?'block':'none'; hero.classList.toggle('done', done);
      return passed;
    }
    function renderSim(pass){
      simMount.innerHTML='';
      var ctx = { pass:pass, scenario:state.scenario, flavor:spec.flavor, spec:spec,
        has:function(id){ return (id in pass) ? pass[id] : true; } };
      try { (SIMS[spec.sim]||function(){})(simMount, ctx); status.className='status'; status.textContent='✓ Preview updated.'; }
      catch(e){ status.className='status err'; status.textContent='⚠ '+e.message; }
    }
    function recompute(){ refreshHl(); var pass=computePass(ta.value); runChecks(pass); renderSim(pass); }

    var timer=null;
    ta.addEventListener('input', function(){ if(timer) clearTimeout(timer); timer=setTimeout(recompute,130); });
    ta.addEventListener('scroll', function(){ pre.scrollTop=ta.scrollTop; pre.scrollLeft=ta.scrollLeft; });
    ta.addEventListener('keydown', function(e){ if(e.key==='Tab'){ e.preventDefault(); var s=ta.selectionStart, en=ta.selectionEnd; ta.value=ta.value.slice(0,s)+'    '+ta.value.slice(en); ta.selectionStart=ta.selectionEnd=s+4; } });
    resetBtn.addEventListener('click', function(){ ta.value=spec.starter; recompute(); ta.focus(); });
    solBtn.addEventListener('click', function(){ ta.value=spec.solution; recompute(); solBtn.textContent='✓ Solution shown'; });
    copyBtn.addEventListener('click', function(){ navigator.clipboard && navigator.clipboard.writeText(ta.value).then(function(){ copyBtn.textContent='Copied'; setTimeout(function(){ copyBtn.textContent='Copy'; },1200); }); });

    ta.value = spec.starter; recompute();
  };

  function linkBtn(text, href){ var a=document.createElement('a'); a.className='back'; a.href=href; a.textContent=text; return a; }
})();
