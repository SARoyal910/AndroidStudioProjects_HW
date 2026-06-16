// =============================================================================
// nav-engine.js — a SHARED, introspectable Navigation 3 model for the labs,
// distilled from the Navigation 3 Playground (homework/Playground/nav-playground.html).
//
// The back stack is a list of keys; the TOP key is on screen. This engine
// parses an editable rememberNavBackStack(...) key list, renders an interactive
// phone (tap a row to push, Back to pop) + a back-stack visualizer, and exposes
// helpers the lab harness uses to auto-grade the resulting stack.
//
//   window.NavEngine = {
//     parseStack(code) -> key[]            (the back stack)
//     stackToKotlin(stack, header?) -> code
//     keyToKotlin(key), keyScreen(key), mk(type, val), stacksEqual(a,b)
//     renderPhone(el, stack, { onPush, onPop })
//     renderVisualizer(el, stack, { onPopTo })
//   }
//
// Models the same "planets" domain (Category -> Item) as the nav teaching
// projects. NOT a real Android runtime — a teaching model.
// =============================================================================
(function () {
  'use strict';

  // --- The shared "planets" domain (matches the projects' Data.kt) -----------
  var CATEGORIES = [
    { id:1, name:'Rocky Planets', description:'Small, dense worlds with solid surfaces.' },
    { id:2, name:'Gas Giants', description:'Massive planets made mostly of gas.' },
  ];
  var ITEMS = [
    { id:1, categoryId:1, title:'Mercury', blurb:'The smallest planet and the closest to the Sun.' },
    { id:2, categoryId:1, title:'Venus', blurb:'The hottest planet, wrapped in thick clouds of acid.' },
    { id:3, categoryId:1, title:'Earth', blurb:'The only planet known to support life — so far.' },
    { id:4, categoryId:1, title:'Mars', blurb:'The red planet, a frequent target for rovers.' },
    { id:5, categoryId:2, title:'Jupiter', blurb:'The largest planet, a gas giant with a great red spot.' },
    { id:6, categoryId:2, title:'Saturn', blurb:'The ringed gas giant, second largest in the system.' },
  ];
  var categoryById = function(id){ return CATEGORIES.filter(function(c){return c.id===id;})[0]; };
  var itemById = function(id){ return ITEMS.filter(function(i){return i.id===id;})[0]; };
  var itemsInCategory = function(cid){ return ITEMS.filter(function(i){return i.categoryId===cid;}); };

  // --- Key registry: name -> { arg, screen-label } ---------------------------
  var KEYS = {
    CategoriesKey: { arg:null,         screen:function(){ return 'Categories screen'; } },
    ItemsKey:      { arg:'categoryId', screen:function(a){ if(a.categoryId==null) return 'Items · (no category)'; var c=categoryById(a.categoryId); return 'Items · '+(c?c.name:'category '+a.categoryId); } },
    DetailKey:     { arg:'itemId',     screen:function(a){ if(a.itemId==null) return 'Detail · (no item)'; var i=itemById(a.itemId); return 'Detail · '+(i?i.title:'item '+a.itemId); } },
  };
  function mk(type, val){ var def=KEYS[type], args={}; if(def&&def.arg&&val!=null) args[def.arg]=val; return { type:type, args:args }; }
  function keyToKotlin(k){ var def=KEYS[k.type]; if(def&&def.arg&&k.args[def.arg]!=null) return k.type+'('+def.arg+' = '+k.args[def.arg]+')'; return k.type; }
  function keyScreen(k){ var def=KEYS[k.type]; return def?def.screen(k.args):'unknown key'; }

  // --- Parse / generate the editable rememberNavBackStack(...) list -----------
  function extractStackArgs(src){
    var i=src.indexOf('rememberNavBackStack'); if(i<0) return null;
    var open=src.indexOf('(', i); if(open<0) return null;
    var depth=0, j=open; for(; j<src.length; j++){ if(src[j]==='(') depth++; else if(src[j]===')'){ depth--; if(depth===0) break; } }
    return src.slice(open+1, j);
  }
  function splitTopLevel(s){ var parts=[], depth=0, cur=''; for(var i=0;i<s.length;i++){ var c=s[i]; if(c==='('){ depth++; cur+=c; } else if(c===')'){ depth--; cur+=c; } else if(c===','&&depth===0){ parts.push(cur); cur=''; } else cur+=c; } if(cur.trim()) parts.push(cur); return parts; }
  function parseKeyPiece(piece){
    var p=piece.replace(/\/\/[^\n]*/g,'').trim(); if(!p) return null;
    var m=p.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(([^)]*)\))?$/);
    if(!m) return { type:p.split(/[\s(]/)[0]||'?', args:{}, unknown:true };
    var type=m[1], argText=m[2], args={};
    if(argText){ var nm=argText.match(/-?\d+/); var def=KEYS[type]; if(def&&def.arg&&nm) args[def.arg]=parseInt(nm[0],10); }
    return { type:type, args:args, unknown:!KEYS[type] };
  }
  function parseStack(src){
    var clean=String(src).replace(/\/\/[^\n]*/g,'');
    var inside=extractStackArgs(clean); if(inside==null) return null;
    return splitTopLevel(inside).map(parseKeyPiece).filter(Boolean);
  }
  function stackToKotlin(stack, header){
    var lines=[]; if(header) lines.push(header);
    lines.push('val backStack = rememberNavBackStack(');
    stack.forEach(function(k){ lines.push('    '+keyToKotlin(k)+','); });
    lines.push(')');
    return lines.join('\n')+'\n';
  }
  function stacksEqual(a, b){
    if(!a||!b||a.length!==b.length) return false;
    for(var i=0;i<a.length;i++){ if(a[i].type!==b[i].type) return false;
      var def=KEYS[a[i].type]; if(def&&def.arg){ if((a[i].args[def.arg])!==(b[i].args[def.arg])) return false; } }
    return true;
  }

  // --- DOM helpers ------------------------------------------------------------
  function el(tag, cls, txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }

  // --- Interactive phone (renders the TOP key's screen) -----------------------
  function renderPhone(host, stack, handlers){
    host.innerHTML='';
    if(!stack || !stack.length){ host.appendChild(el('div','nempty','(empty back stack — nothing on screen)')); return; }
    var top=stack[stack.length-1];
    var canBack = stack.length>1;
    function bar(title){ var b=el('div','napp-bar'); if(canBack){ var bk=el('button','nback','‹ Back'); bk.addEventListener('click', function(){ handlers.onPop(); }); b.appendChild(bk); } b.appendChild(el('span',null,title)); return b; }
    function row(title, blurb, onTap){ var r=el('div','nrow'); var t=el('div','nt',title); t.appendChild(el('span','chev','›')); r.appendChild(t); if(blurb) r.appendChild(el('div','nb',blurb)); r.addEventListener('click', onTap); return r; }

    if(top.type==='CategoriesKey'){
      host.appendChild(bar('🪐 Planets'));
      var l1=el('div','scrollarea'); CATEGORIES.forEach(function(c){ l1.appendChild(row(c.name, c.description, function(){ handlers.onPush(mk('ItemsKey', c.id)); })); }); host.appendChild(l1);
    } else if(top.type==='ItemsKey'){
      var cat=categoryById(top.args.categoryId);
      host.appendChild(bar(cat?cat.name:'Items'));
      var l2=el('div','scrollarea'); itemsInCategory(top.args.categoryId).forEach(function(it){ l2.appendChild(row(it.title, it.blurb, function(){ handlers.onPush(mk('DetailKey', it.id)); })); }); host.appendChild(l2);
    } else if(top.type==='DetailKey'){
      host.appendChild(bar('Detail'));
      var it2=itemById(top.args.itemId);
      var d=el('div','ndetail'); d.appendChild(el('h3',null, it2?it2.title:'Item '+top.args.itemId)); d.appendChild(el('p',null, it2?it2.blurb:'Unknown item.'));
      var b=el('button','nbtn','‹ Back to list'); b.addEventListener('click', function(){ handlers.onPop(); }); d.appendChild(b); host.appendChild(d);
    } else {
      var u=el('div','ncenter'); u.appendChild(el('div','big','⚠️')); u.appendChild(el('div',null, top.type+' is not a known screen.')); host.appendChild(u);
    }
  }

  // --- Back-stack visualizer (top = on screen; click lower to pop to it) ------
  function renderVisualizer(host, stack, handlers){
    host.innerHTML='';
    if(!stack || !stack.length){ host.appendChild(el('div','skey empty','(empty)')); return; }
    for(var i=stack.length-1;i>=0;i--){ (function(idx){
      var k=stack[idx], isTop=idx===stack.length-1;
      var card=el('div','skey'+(isTop?' top':''));
      if(isTop) card.appendChild(el('div','ktop','● on screen'));
      card.appendChild(el('div','kname', keyToKotlin(k)));
      card.appendChild(el('div','kscreen', keyScreen(k)));
      if(!isTop){ card.title='Pop down to here'; card.addEventListener('click', function(){ handlers.onPopTo(idx); }); }
      host.appendChild(card);
    })(i); }
  }

  window.NavEngine = {
    parseStack: parseStack, stackToKotlin: stackToKotlin,
    keyToKotlin: keyToKotlin, keyScreen: keyScreen, mk: mk, stacksEqual: stacksEqual,
    renderPhone: renderPhone, renderVisualizer: renderVisualizer,
    CATEGORIES: CATEGORIES, ITEMS: ITEMS,
  };
})();
