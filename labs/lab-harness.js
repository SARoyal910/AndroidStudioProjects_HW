// =============================================================================
// lab-harness.js — window.mountLab(spec) builds an entire hands-on lab page:
// a task panel (goal + steps + hints), an editable code editor, a LIVE preview
// (reusing ComposeEngine / NavEngine), and a checks panel that turns ✓ as the
// learner's code meets each success criterion. Reset + Show-solution buttons and
// a "Lab complete!" banner round it out.
//
// A lab spec:
//   {
//     kind: 'compose' | 'nav',
//     id, title, track, level, goal,
//     steps:   [string, ...],            // numbered guidance
//     starter: `…kotlin…`,               // pre-filled editor code
//     solution:`…kotlin…`,               // revealed by "Show solution"
//     hints:   [string, ...],
//     checks:  [ { label, test(api)->bool }, ... ],
//   }
//
// The `api` passed to each check.test():
//   compose → { code, nodes, find, findAll, top, modNames, modIndex, hasMod,
//               argNum, arrangementOf, spacing, crossAlignOf, textProps,
//               shapeOf, weightOf, inlineText }
//   nav     → { code, stack, mk, keyToKotlin, keyScreen, stacksEqual }
// =============================================================================
(function () {
  'use strict';

  // --- tiny Kotlin highlighter (shared look with the playgrounds) ------------
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var KW = ['val','var','fun','return','if','else','when','for','while','data','object','class','import','package','true','false','null','by','it','this'];
  var KW_RE = KW.join('|');
  function hlKotlin(code){
    var re = new RegExp('(\\/\\/[^\\n]*)|("(?:[^"\\\\]|\\\\.)*")|(@\\w+)|(\\b\\d[\\d_]*(?:\\.\\d+)?\\b)|(\\b(?:'+KW_RE+')\\b)|(\\b[A-Z][A-Za-z0-9_]*\\b)','g');
    return code.replace(re, function(m,c1,c2,c3,c4,c5,c6){
      if(c1) return '<span class="c">'+m+'</span>'; if(c2) return '<span class="s">'+m+'</span>';
      if(c3) return '<span class="a">'+m+'</span>'; if(c4) return '<span class="n">'+m+'</span>';
      if(c5) return '<span class="k">'+m+'</span>'; if(c6) return '<span class="t">'+m+'</span>'; return m;
    });
  }
  function el(tag, cls, txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }
  function leadingComment(code){ var out=[]; var lines=String(code).split('\n'); for(var i=0;i<lines.length;i++){ if(lines[i].trim().indexOf('//')===0) out.push(lines[i]); else if(lines[i].trim()==='') { if(out.length) break; } else break; } return out.join('\n'); }

  window.mountLab = function(spec){
    var isNav = spec.kind === 'nav';
    document.title = spec.title + ' — Compose/Nav Labs';

    // ---- page skeleton -------------------------------------------------------
    var body = document.body;
    body.innerHTML = '';
    body.className = 'labbody';

    // hero
    var hero = el('header','hero'+(isNav?' nav':''));
    var bar = el('div','bartop');
    var titleWrap = el('div');
    titleWrap.appendChild(el('p','eyebrow', (isNav?'Jetpack Navigation 3':'Jetpack Compose')+' · Hands-on lab'));
    titleWrap.appendChild(el('h1', null, spec.title));
    bar.appendChild(titleWrap);
    var links = el('div','links');
    links.appendChild(linkBtn('← All labs', './index.html'));
    links.appendChild(linkBtn(isNav?'🧭 Nav Playground':'🎨 Compose Playground', isNav?'../homework/Playground/nav-playground.html':'../homework/Playground/playground.html'));
    bar.appendChild(links);
    hero.appendChild(bar);
    var chips = el('div','herochips');
    chips.appendChild(el('span','hchip', spec.track));
    if(spec.level) chips.appendChild(el('span','hchip', spec.level));
    var prog = el('span','hchip prog','0 / '+spec.checks.length+' checks'); chips.appendChild(prog);
    hero.appendChild(chips);
    hero.appendChild(el('p','goal', spec.goal));
    body.appendChild(hero);

    // main row
    var main = el('div','lab');
    var left = el('section','pane left');
    var right = el('section','pane right');
    main.appendChild(left); main.appendChild(right);
    body.appendChild(main);

    // --- left: task + editor --------------------------------------------------
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
    var pre = el('pre'); pre.id='hl'; pre.setAttribute('aria-hidden','true'); var preCode=el('code'); pre.appendChild(preCode);
    var ta = el('textarea'); ta.id='code'; ta.spellcheck=false; ta.setAttribute('autocapitalize','off'); ta.setAttribute('autocomplete','off'); ta.setAttribute('autocorrect','off');
    ewrap.appendChild(pre); ewrap.appendChild(ta);
    left.appendChild(ewrap);
    var status = el('div','status','Edit the code — the preview and checks update as you type.');
    left.appendChild(status);

    // --- right: preview + checks ---------------------------------------------
    var phead = el('div','panehead'); phead.appendChild(el('span','dot')); phead.appendChild(document.createTextNode(' Live preview'));
    right.appendChild(phead);

    var stage = el('div','previewstage');
    var stackPanel = null, stackList = null;
    if(isNav){
      stackPanel = el('div','stackpanel');
      stackPanel.appendChild(el('p','stitle','Back stack'));
      stackPanel.appendChild(el('div','stackcap','▲ top — on screen'));
      stackList = el('div','stacklist'); stackPanel.appendChild(stackList);
      stackPanel.appendChild(el('div','stackcap','bottom — root'));
      stage.appendChild(stackPanel);
    }
    var phone = el('div','phone'); phone.appendChild(el('div','notch'));
    var screen = el('div','screen'); phone.appendChild(screen); stage.appendChild(phone);
    var pscroll = el('div','previewscroll'); pscroll.appendChild(stage); right.appendChild(pscroll);

    // checks panel
    var checksWrap = el('div','checks');
    var banner = el('div','banner'); banner.style.display='none'; banner.textContent='✅ Lab complete — every check passed!'; checksWrap.appendChild(banner);
    var clist = el('div','checklist'); checksWrap.appendChild(clist);
    var rowEls = spec.checks.map(function(c){ var r=el('div','checkitem'); var mk=el('span','mark','○'); var lb=el('span','clabel'); lb.innerHTML=c.label; r.appendChild(mk); r.appendChild(lb); clist.appendChild(r); return {row:r, mark:mk}; });
    var btns = el('div','labbtns');
    var resetBtn=el('button','btn','↺ Reset'); var solBtn=el('button','btn','👁 Show solution');
    btns.appendChild(resetBtn); btns.appendChild(solBtn); checksWrap.appendChild(btns);
    right.appendChild(checksWrap);

    // --- behavior -------------------------------------------------------------
    var navHeader = isNav ? leadingComment(spec.starter) : '';

    function refreshHl(){ preCode.innerHTML = hlKotlin(esc(ta.value)) + '\n'; }

    function buildApi(){
      var code = ta.value;
      if(isNav){
        var stack = window.NavEngine.parseStack(code) || [];
        return { code:code, stack:stack, mk:window.NavEngine.mk, keyToKotlin:window.NavEngine.keyToKotlin, keyScreen:window.NavEngine.keyScreen, stacksEqual:window.NavEngine.stacksEqual };
      }
      var nodes = window.ComposeEngine.parse(code);
      var E = window.ComposeEngine;
      return { code:code, nodes:nodes,
        find:function(n){return E.find(nodes,n);}, findAll:function(n){return E.findAll(nodes,n);}, top:function(){return E.topLevel(nodes);},
        modNames:E.modNames, modIndex:E.modIndex, hasMod:E.hasMod, argNum:E.argNum, arrangementOf:E.arrangementOf,
        spacing:E.spacing, crossAlignOf:E.crossAlignOf, textProps:E.textProps, shapeOf:E.shapeOf, weightOf:E.weightOf, inlineText:E.inlineText };
    }

    function runChecks(api){
      var passed=0;
      spec.checks.forEach(function(c, i){
        var ok=false; try { ok = !!c.test(api); } catch(e){ ok=false; }
        rowEls[i].row.className = 'checkitem' + (ok?' ok':'');
        rowEls[i].mark.textContent = ok ? '✓' : '○';
        if(ok) passed++;
      });
      prog.textContent = passed+' / '+spec.checks.length+' checks';
      var done = passed===spec.checks.length;
      banner.style.display = done ? 'block' : 'none';
      hero.classList.toggle('done', done);
      return passed;
    }

    function renderPreview(api){
      if(isNav){
        window.NavEngine.renderVisualizer(stackList, api.stack, { onPopTo:function(idx){ commitStack(api.stack.slice(0, idx+1)); } });
        screen.innerHTML='';
        window.NavEngine.renderPhone(screen, api.stack, {
          onPush:function(key){ commitStack(api.stack.concat([key])); },
          onPop:function(){ if(api.stack.length>1) commitStack(api.stack.slice(0,-1)); },
        });
        status.className='status';
        status.textContent = api.stack.length ? (api.stack.length+' key'+(api.stack.length===1?'':'s')+' · top = '+window.NavEngine.keyToKotlin(api.stack[api.stack.length-1])) : '(empty back stack)';
      } else {
        screen.innerHTML='';
        screen.appendChild(window.ComposeEngine.render(api.code, 'light'));
        status.className='status'; status.textContent='✓ Preview updated.';
      }
    }

    // recompute from the editor text (does NOT rewrite the textarea)
    function recompute(){
      refreshHl();
      var api = buildApi();
      try { renderPreview(api); } catch(e){ status.className='status err'; status.textContent='⚠ '+e.message; }
      runChecks(api);
    }
    // nav taps: rewrite the editor from a new stack, then recompute
    function commitStack(newStack){
      ta.value = (navHeader? navHeader+'\n':'') + window.NavEngine.stackToKotlin(newStack);
      recompute();
    }

    var timer=null;
    ta.addEventListener('input', function(){ if(timer) clearTimeout(timer); timer=setTimeout(recompute, 130); });
    ta.addEventListener('scroll', function(){ pre.scrollTop=ta.scrollTop; pre.scrollLeft=ta.scrollLeft; });
    ta.addEventListener('keydown', function(e){ if(e.key==='Tab'){ e.preventDefault(); var s=ta.selectionStart, en=ta.selectionEnd; ta.value=ta.value.slice(0,s)+'    '+ta.value.slice(en); ta.selectionStart=ta.selectionEnd=s+4; } });

    resetBtn.addEventListener('click', function(){ ta.value=spec.starter; recompute(); ta.focus(); });
    solBtn.addEventListener('click', function(){ ta.value=spec.solution; recompute(); solBtn.textContent='✓ Solution shown'; });
    copyBtn.addEventListener('click', function(){ navigator.clipboard && navigator.clipboard.writeText(ta.value).then(function(){ copyBtn.textContent='Copied'; setTimeout(function(){ copyBtn.textContent='Copy'; },1200); }); });

    // go
    ta.value = spec.starter;
    recompute();
  };

  function linkBtn(text, href){ var a=document.createElement('a'); a.className='back'; a.href=href; a.textContent=text; return a; }
})();
