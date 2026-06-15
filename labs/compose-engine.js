// =============================================================================
// compose-engine.js — a SHARED, introspectable Jetpack Compose interpreter for
// the labs. It is the same tokenizer -> parser -> renderer used by the Compose
// Playground (homework/playground.html), repackaged as a reusable global with
// extra "check helpers" the lab harness uses to auto-grade a learner's code.
//
//   window.ComposeEngine = {
//     parse(code)            -> node[]      (the parsed composable tree)
//     render(code, themeName)-> DOM element (the rendered "screen")
//     // check helpers (operate on a parsed node tree):
//     findAll, find, modifierOps, modNames, argNum, arrangementName,
//     spacing, crossAlign, textProps, childrenNamed
//   }
//
// It is NOT a real Kotlin compiler — it understands the common composables and
// Modifier calls used in the teaching projects and maps them to HTML/CSS. The
// key fidelity point: a Modifier chain becomes nested wrapper <div>s, so changing
// the ORDER of .padding()/.background() changes the result, exactly like Compose.
// =============================================================================
(function () {
  'use strict';

  // --- Theme palettes (Material 3-ish), shared look with the playground -------
  var THEMES = {
    light: {
      primary:'#6650a4', onPrimary:'#ffffff', primaryContainer:'#eaddff', onPrimaryContainer:'#21005d',
      secondary:'#625b71', onSecondary:'#ffffff', secondaryContainer:'#e8def8',
      tertiary:'#7d5260', onTertiary:'#ffffff', tertiaryContainer:'#ffd8e4',
      background:'#fef7ff', onBackground:'#1c1b1f',
      surface:'#fef7ff', onSurface:'#1c1b1f', surfaceVariant:'#e7e0ec', onSurfaceVariant:'#49454f',
      surfaceContainer:'#f3edf7', surfaceContainerHighest:'#e6e0e9',
      error:'#b3261e', onError:'#ffffff', outline:'#79747e', outlineVariant:'#cac4d0',
    },
    dark: {
      primary:'#d0bcff', onPrimary:'#381e72', primaryContainer:'#4f378b', onPrimaryContainer:'#eaddff',
      secondary:'#ccc2dc', onSecondary:'#332d41', secondaryContainer:'#4a4458',
      tertiary:'#efb8c8', onTertiary:'#492532', tertiaryContainer:'#633b48',
      background:'#141218', onBackground:'#e6e0e9',
      surface:'#141218', onSurface:'#e6e0e9', surfaceVariant:'#49454f', onSurfaceVariant:'#cac4d0',
      surfaceContainer:'#211f26', surfaceContainerHighest:'#36343b',
      error:'#f2b8b5', onError:'#601410', outline:'#938f99', outlineVariant:'#49454f',
    }
  };
  var themeName = 'light';
  function T(){ return THEMES[themeName]; }

  var TYPOGRAPHY = {
    displayLarge:[40,400], displayMedium:[34,400], displaySmall:[28,400],
    headlineLarge:[28,400], headlineMedium:[25,400], headlineSmall:[22,400],
    titleLarge:[20,400], titleMedium:[16,500], titleSmall:[14,500],
    bodyLarge:[16,400], bodyMedium:[14,400], bodySmall:[12,400],
    labelLarge:[14,500], labelMedium:[12,500], labelSmall:[11,500],
  };
  var FONT_WEIGHTS = { Thin:100, ExtraLight:200, Light:300, Normal:400, Medium:500, SemiBold:600, Bold:700, ExtraBold:800, Black:900 };
  var NAMED_COLORS = {
    Red:'#ff0000', Green:'#00c853', Blue:'#2563eb', Black:'#000000', White:'#ffffff',
    Gray:'#888888', LightGray:'#cccccc', DarkGray:'#444444', Yellow:'#ffd400',
    Cyan:'#00bcd4', Magenta:'#e91e63', Transparent:'transparent', Unspecified:null,
  };
  var ICON_GLYPHS = {
    Star:'★', Favorite:'♥', Home:'⌂', Settings:'⚙', Search:'🔍', Add:'＋', Check:'✓',
    Close:'✕', Email:'✉', Person:'👤', Notifications:'🔔', ShoppingCart:'🛒', Menu:'≡',
    MoreVert:'⋮', ArrowBack:'←', Phone:'☎', Share:'↗', Delete:'🗑', Edit:'✎', ThumbUp:'👍',
    Info:'ⓘ', Lock:'🔒', AccountCircle:'◉', Warning:'⚠', Done:'✓', Refresh:'↻', Send:'➤',
  };

  // --- Tokenizer (tolerant; unknown chars skipped) ----------------------------
  function tokenize(src){
    var toks=[], i=0, n=src.length;
    var isStart=function(c){return /[A-Za-z_]/.test(c);}, isId=function(c){return /[A-Za-z0-9_]/.test(c);};
    while(i<n){
      var c=src[i];
      if(/\s/.test(c)){ i++; continue; }
      if(c==='/'&&src[i+1]==='/'){ while(i<n&&src[i]!=='\n') i++; continue; }
      if(c==='/'&&src[i+1]==='*'){ i+=2; while(i<n&&!(src[i]==='*'&&src[i+1]==='/')) i++; i+=2; continue; }
      if(c==='"'){
        if(src[i+1]==='"'&&src[i+2]==='"'){ var j=i+3; while(j<n&&!(src[j]==='"'&&src[j+1]==='"'&&src[j+2]==='"')) j++; toks.push({t:'str',v:src.slice(i+3,j)}); i=j+3; continue; }
        var k=i+1,out=''; while(k<n&&src[k]!=='"'){ if(src[k]==='\\'){ out+=src[k+1]||''; k+=2; } else { out+=src[k]; k++; } } toks.push({t:'str',v:out}); i=k+1; continue;
      }
      if(/[0-9]/.test(c)){
        var s=i;
        if(c==='0'&&(src[i+1]==='x'||src[i+1]==='X')){ i+=2; while(i<n&&/[0-9a-fA-F_]/.test(src[i])) i++; }
        else { while(i<n&&/[0-9_]/.test(src[i])) i++; if(src[i]==='.'&&/[0-9]/.test(src[i+1])){ i++; while(i<n&&/[0-9_]/.test(src[i])) i++; } }
        var raw=src.slice(s,i); if(/[fFlL]/.test(src[i])) i++;
        toks.push({t:'num',v:raw.replace(/_/g,'')}); continue;
      }
      if(isStart(c)){ var p=i; while(i<n&&isId(src[i])) i++; toks.push({t:'id',v:src.slice(p,i)}); continue; }
      if(c==='-'&&src[i+1]==='>'){ toks.push({t:'pn',v:'->'}); i+=2; continue; }
      if('(){}.,='.indexOf(c)>=0){ toks.push({t:'pn',v:c}); i++; continue; }
      i++;
    }
    toks.push({t:'eof',v:''});
    return toks;
  }

  // --- Parser (recursive descent; tolerant) -----------------------------------
  function parse(src){
    var toks=tokenize(src), pos=0;
    var cur=function(){return toks[pos];}, at=function(k){return toks[pos+k]||toks[toks.length-1];};
    var eof=function(){return cur().t==='eof';};
    var isPn=function(v){return cur().t==='pn'&&cur().v===v;};
    var eat=function(v){if(isPn(v)) pos++;};
    var expectId=function(){ if(cur().t==='id'){ var v=cur().v; pos++; return v; } pos++; return '?'; };
    function skipLambdaParams(){
      var depth=0;
      for(var k=pos;k<toks.length;k++){ var tk=toks[k];
        if(tk.t==='pn'&&(tk.v==='('||tk.v==='{')) depth++;
        else if(tk.t==='pn'&&(tk.v===')'||tk.v==='}')){ if(depth===0) return; depth--; }
        else if(tk.t==='pn'&&tk.v==='->'&&depth===0){ pos=k+1; return; } }
    }
    function parseBlock(){
      eat('{'); skipLambdaParams(); var nodes=[];
      while(!eof()&&!isPn('}')){ if(cur().t==='id') nodes.push(parseComposable()); else if(isPn(',')||isPn('=')) pos++; else pos++; }
      eat('}'); return nodes;
    }
    function parseValue(){
      var tk=cur();
      if(tk.t==='str'){ pos++; return {kind:'str', v:tk.v}; }
      if(tk.t==='num'){ pos++; return finishNumber(tk.v); }
      if(isPn('{')){ var fnum=(at(1)&&at(1).t==='num')?at(1).v:null; var body=parseBlock(); return {kind:'lambda', body:body, firstNum:fnum}; }
      if(tk.t==='id'){ if(tk.v==='true'||tk.v==='false'){ pos++; return {kind:'bool', v:tk.v==='true'}; } if(tk.v==='null'){ pos++; return {kind:'null'}; } return parseAccess(); }
      pos++; return {kind:'unknown'};
    }
    function finishNumber(raw){
      if(isPn('.')&&at(1).t==='id'&&(at(1).v==='dp'||at(1).v==='sp')){ var u=at(1).v; pos+=2; return {kind:'num', v:raw, unit:u}; }
      if(isPn('.')&&at(1).t==='pn'&&at(1).v==='.'){ pos+=2; parseValue(); return {kind:'num', v:raw}; }
      return {kind:'num', v:raw};
    }
    function parseAccess(){
      var root=expectId(), segs=[];
      while(true){
        if(isPn('.')){ if(at(1).t==='pn'&&at(1).v==='.'){ break; } pos++; segs.push({type:'member', name:expectId()}); }
        else if(isPn('(')){ segs.push({type:'call', args:parseArgList()}); }
        else break;
      }
      return {kind:'access', root:root, segments:segs};
    }
    function parseArgList(){
      eat('('); var positional=[], named={};
      while(!eof()&&!isPn(')')){
        var nm=null; if(cur().t==='id'&&at(1).t==='pn'&&at(1).v==='='){ nm=cur().v; pos+=2; }
        var val=parseValue(); if(nm) named[nm]=val; else positional.push(val);
        if(isPn(',')) pos++; else break;
      }
      eat(')'); return {positional:positional, named:named};
    }
    function parseComposable(){
      var name=expectId(); var node={ name:name, named:{}, positional:[], children:null };
      if(isPn('(')){ var a=parseArgList(); node.named=a.named; node.positional=a.positional; }
      if(isPn('{')){ node.children=parseBlock(); }
      return node;
    }
    var top=[]; while(!eof()){ if(cur().t==='id') top.push(parseComposable()); else pos++; }
    return top;
  }

  // --- Value evaluators -------------------------------------------------------
  function num(v, dflt){ if(!v) return dflt==null?0:dflt; if(v.kind==='num'){ var raw=v.v; if(/^0[xX]/.test(raw)) return parseInt(raw,16); return parseFloat(raw); } return dflt==null?0:dflt; }
  function str(v){ return v&&v.kind==='str'?v.v:''; }
  function hexToCss(v){ if(!v||v.kind!=='num') return null; var raw=v.v.replace(/^0[xX]/,''); if(raw.length===8) raw=raw.slice(2); return '#'+raw; }
  function color(v){
    if(!v||v.kind!=='access') return null;
    if(v.root==='Color'){ var s0=v.segments[0]; if(s0&&s0.type==='member') return (NAMED_COLORS[s0.name]!==undefined?NAMED_COLORS[s0.name]:'#000'); if(s0&&s0.type==='call'&&s0.args.positional[0]) return hexToCss(s0.args.positional[0]); }
    if(v.root==='MaterialTheme'){ var m=v.segments.filter(function(s){return s.type==='member';}); var role=m.length?m[m.length-1].name:null; if(role&&T()[role]) return T()[role]; }
    return null;
  }
  function styleOf(v){ if(v&&v.kind==='access'&&v.root==='MaterialTheme'){ var m=v.segments.filter(function(s){return s.type==='member';}); var role=m.length?m[m.length-1].name:null; if(role&&TYPOGRAPHY[role]) return TYPOGRAPHY[role]; } return null; }
  function arrangement(v){ if(!v||v.kind!=='access'||v.root!=='Arrangement') return null; var m=v.segments.filter(function(s){return s.type==='member';}); var name=m.length?m[0].name:null; if(name==='spacedBy'){ var call=v.segments.filter(function(s){return s.type==='call';})[0]; return {name:'spacedBy', gap:call?num(call.args.positional[0]):0}; } return {name:name}; }
  function alignName(v){ if(!v||v.kind!=='access'||v.root!=='Alignment') return null; var m=v.segments.filter(function(s){return s.type==='member';}); return m.length?m[m.length-1].name:null; }
  function boolOf(v, dflt){ return v&&v.kind==='bool'?v.v:!!dflt; }

  function arrToJustify(a){
    if(!a) return {justify:'flex-start', gap:0};
    switch(a.name){ case 'spacedBy': return {justify:'flex-start', gap:a.gap||0}; case 'Center': return {justify:'center', gap:0};
      case 'SpaceBetween': return {justify:'space-between', gap:0}; case 'SpaceAround': return {justify:'space-around', gap:0};
      case 'SpaceEvenly': return {justify:'space-evenly', gap:0}; case 'End': case 'Bottom': return {justify:'flex-end', gap:0};
      default: return {justify:'flex-start', gap:0}; }
  }
  function crossToAlign(name){ switch(name){ case 'CenterHorizontally': case 'CenterVertically': case 'Center': return 'center'; case 'End': case 'Bottom': return 'flex-end'; default: return 'flex-start'; } }
  var ALIGN2D = { TopStart:['start','start'], TopCenter:['start','center'], TopEnd:['start','end'], CenterStart:['center','start'], Center:['center','center'], CenterEnd:['center','end'], BottomStart:['end','start'], BottomCenter:['end','center'], BottomEnd:['end','end'] };

  // --- Modifier application (paint ops nest as wrappers; layout ops on outer) --
  function modifierOf(node){
    if(node.named.modifier&&node.named.modifier.kind==='access'&&node.named.modifier.root==='Modifier') return node.named.modifier;
    for(var i=0;i<node.positional.length;i++){ var p=node.positional[i]; if(p&&p.kind==='access'&&p.root==='Modifier') return p; }
    return null;
  }
  function modifierOps(v){
    var ops=[]; if(!v) return ops; var segs=v.segments;
    for(var i=0;i<segs.length;i++){ var s=segs[i]; if(s.type==='member'){ var args={positional:[],named:{}}; if(segs[i+1]&&segs[i+1].type==='call'){ args=segs[i+1].args; i++; } ops.push({name:s.name, positional:args.positional, named:args.named}); } }
    return ops;
  }
  var LAYOUT_OPS={weight:1, fillMaxWidth:1, fillMaxHeight:1, fillMaxSize:1, align:1, aspectRatio:1};
  function applyModifier(inner, v){
    var ops=modifierOps(v), paint=[], layout=[];
    ops.forEach(function(op){ (LAYOUT_OPS[op.name]?layout:paint).push(op); });
    var elx=inner;
    for(var k=paint.length-1;k>=0;k--){ var w=document.createElement('div'); w.style.display='flex'; w.style.flexDirection='column'; w.style.boxSizing='border-box'; elx.style.flex=elx.style.flex||'1 1 auto'; applyPaintOp(w,paint[k]); w.appendChild(elx); elx=w; }
    layout.forEach(function(op){ applyLayoutOp(elx,op); });
    return elx;
  }
  function applyPaintOp(w, op){
    var p=op.positional, nm=op.named;
    switch(op.name){
      case 'padding': { if(nm.horizontal||nm.vertical){ w.style.padding=num(nm.vertical)+'px '+num(nm.horizontal)+'px'; } else if(nm.start!=null||nm.top!=null||nm.end!=null||nm.bottom!=null){ w.style.paddingTop=num(nm.top)+'px'; w.style.paddingRight=num(nm.end)+'px'; w.style.paddingBottom=num(nm.bottom)+'px'; w.style.paddingLeft=num(nm.start)+'px'; } else if(p.length>=1){ w.style.padding=num(p[0])+'px'; } break; }
      case 'background': { var c=color(p[0]); if(c) w.style.background=c; applyShape(w,p[1]||nm.shape); break; }
      case 'border': { var bw=num(p[0],1); var bc=color(p[1])||T().outline; w.style.border=bw+'px solid '+bc; applyShape(w,p[2]||nm.shape); break; }
      case 'clip': { w.style.overflow='hidden'; applyShape(w,p[0]||nm.shape); break; }
      case 'shadow': { var e=num(p[0]!=null?p[0]:nm.elevation,4); w.style.boxShadow='0 '+Math.max(1,e/2)+'px '+e+'px rgba(2,8,20,'+Math.min(.4,.08+e/40)+')'; applyShape(w,p[1]||nm.shape); break; }
      case 'size': { if(p.length>=2){ w.style.width=num(p[0])+'px'; w.style.height=num(p[1])+'px'; } else if(nm.width!=null||nm.height!=null){ if(nm.width!=null)w.style.width=num(nm.width)+'px'; if(nm.height!=null)w.style.height=num(nm.height)+'px'; } else if(p.length===1){ w.style.width=num(p[0])+'px'; w.style.height=num(p[0])+'px'; } w.style.flex='none'; break; }
      case 'width': { w.style.width=num(p[0])+'px'; break; }
      case 'height': { w.style.height=num(p[0])+'px'; break; }
      case 'offset': { w.style.position='relative'; w.style.left=num(nm.x!=null?nm.x:p[0])+'px'; w.style.top=num(nm.y!=null?nm.y:p[1])+'px'; break; }
      case 'alpha': { w.style.opacity=String(num(p[0],1)); break; }
      case 'rotate': { w.style.transform='rotate('+num(p[0])+'deg)'; break; }
      case 'wrapContentWidth': case 'wrapContentSize': { w.style.width='fit-content'; w.style.marginLeft='auto'; w.style.marginRight='auto'; break; }
      case 'clickable': { w.style.cursor='pointer'; break; }
      default: break;
    }
  }
  function applyShape(w, shapeVal){ if(!shapeVal) return; if(shapeVal.kind==='access'){ if(shapeVal.root==='CircleShape'){ w.style.borderRadius='50%'; return; } if(shapeVal.root==='RoundedCornerShape'){ var call=shapeVal.segments.filter(function(s){return s.type==='call';})[0]; var r=call?num(call.args.positional[0]):8; w.style.borderRadius=r+'px'; return; } } }
  function applyLayoutOp(elx, op){
    switch(op.name){
      case 'fillMaxWidth': { var f=op.positional[0]!=null?num(op.positional[0]):1; elx.style.width=(f*100)+'%'; elx.style.alignSelf='stretch'; break; }
      case 'fillMaxHeight': { elx.style.height='100%'; elx.style.alignSelf='stretch'; break; }
      case 'fillMaxSize': { elx.style.width='100%'; elx.style.height='100%'; elx.style.flex='1 1 auto'; break; }
      case 'weight': { elx.style.flex=num(op.positional[0],1)+' 1 0'; elx.style.minWidth='0'; elx.style.minHeight='0'; break; }
      case 'aspectRatio': { elx.style.aspectRatio=String(num(op.positional[0],1)); break; }
      case 'align': { var a=ALIGN2D[alignName(op.positional[0])||'TopStart']||['start','start']; elx.style.alignSelf=a[0]; elx.style.justifySelf=a[1]; elx.style.gridArea='1/1'; break; }
    }
  }

  // --- Renderers --------------------------------------------------------------
  function renderChildren(parentEl, node){ if(node.children) node.children.forEach(function(ch){ parentEl.appendChild(render(ch)); }); }
  function inlineText(node){ if(node.positional[0]&&node.positional[0].kind==='str') return node.positional[0].v; if(node.named.text) return str(node.named.text); var out=''; if(node.children) node.children.forEach(function(ch){ if(ch.name==='Text') out+=inlineText(ch); }); return out; }

  function render(node){
    var inner; try { inner=build(node); } catch(e){ inner=document.createElement('span'); inner.className='unknown'; inner.textContent=node.name+' ⚠'; }
    var mod=modifierOf(node); if(mod) inner=applyModifier(inner, mod); return inner;
  }
  function build(node){
    switch(node.name){
      case 'Text': return buildText(node);
      case 'Column': return buildStack(node,'column');
      case 'Row': return buildStack(node,'row');
      case 'Box': return buildBox(node);
      case 'Spacer': { var s=document.createElement('div'); s.style.flex='none'; return s; }
      case 'Button': return buildButton(node,'filled');
      case 'FilledTonalButton': return buildButton(node,'tonal');
      case 'ElevatedButton': return buildButton(node,'elevated');
      case 'OutlinedButton': return buildButton(node,'outlined');
      case 'TextButton': return buildButton(node,'text');
      case 'IconButton': return buildIconButton(node);
      case 'FloatingActionButton': case 'SmallFloatingActionButton': return buildFab(node,false);
      case 'ExtendedFloatingActionButton': return buildFab(node,true);
      case 'Card': return buildSurface(node,'card');
      case 'ElevatedCard': return buildSurface(node,'elevated');
      case 'OutlinedCard': return buildSurface(node,'outlined');
      case 'Surface': return buildSurface(node,'surface');
      case 'TextField': return buildTextField(node,'filled');
      case 'OutlinedTextField': return buildTextField(node,'outlined');
      case 'Icon': return buildIcon(node);
      case 'Image': return buildImage(node);
      case 'HorizontalDivider': case 'Divider': return buildDivider(node,false);
      case 'VerticalDivider': return buildDivider(node,true);
      case 'Switch': return buildSwitch(node);
      case 'Checkbox': return buildCheckbox(node,false);
      case 'RadioButton': return buildCheckbox(node,true);
      case 'Slider': return buildSlider(node);
      case 'CircularProgressIndicator': return buildCircular(node);
      case 'LinearProgressIndicator': return buildLinear(node);
      case 'AssistChip': case 'SuggestionChip': case 'FilterChip': case 'InputChip': return buildChip(node);
      default: return buildUnknown(node);
    }
  }
  function buildText(node){
    var span=document.createElement('span');
    span.textContent=(node.positional[0]&&node.positional[0].kind==='str')?node.positional[0].v:str(node.named.text);
    span.style.color='inherit'; var st=styleOf(node.named.style);
    if(st){ span.style.fontSize=st[0]+'px'; span.style.fontWeight=st[1]; } else span.style.fontSize='14px';
    if(node.named.fontSize) span.style.fontSize=num(node.named.fontSize,14)+'px';
    if(node.named.fontWeight){ var w=node.named.fontWeight; var fw=(w.kind==='access'&&w.segments[0])?w.segments[0].name:null; if(FONT_WEIGHTS[fw]) span.style.fontWeight=FONT_WEIGHTS[fw]; }
    var c=color(node.named.color); if(c) span.style.color=c;
    if(node.named.fontStyle){ var fs=node.named.fontStyle; if(fs.kind==='access'&&fs.segments[0]&&fs.segments[0].name==='Italic') span.style.fontStyle='italic'; }
    if(node.named.textDecoration){ var td=node.named.textDecoration; var tdn=(td.kind==='access'&&td.segments[0])?td.segments[0].name:null; if(tdn==='Underline') span.style.textDecoration='underline'; else if(tdn==='LineThrough') span.style.textDecoration='line-through'; }
    if(node.named.textAlign){ var ta=node.named.textAlign; var tan=(ta.kind==='access'&&ta.segments[0])?ta.segments[0].name:null; span.style.display='block'; span.style.textAlign=(tan==='Center')?'center':(tan==='End')?'right':(tan==='Justify')?'justify':'left'; }
    if(node.named.maxLines&&num(node.named.maxLines)===1){ span.style.whiteSpace='nowrap'; span.style.overflow='hidden'; span.style.textOverflow='ellipsis'; span.style.display='block'; }
    return span;
  }
  function buildStack(node, dir){
    var elx=document.createElement('div'); elx.style.display='flex'; elx.style.flexDirection=dir; elx.style.boxSizing='border-box';
    var arr=arrToJustify(arrangement(dir==='column'?node.named.verticalArrangement:node.named.horizontalArrangement));
    elx.style.justifyContent=arr.justify; if(arr.gap) elx.style.gap=arr.gap+'px';
    var crossKey=dir==='column'?node.named.horizontalAlignment:node.named.verticalAlignment;
    elx.style.alignItems=crossToAlign(alignName(crossKey)); renderChildren(elx,node); return elx;
  }
  function buildBox(node){
    var elx=document.createElement('div'); elx.style.display='grid'; elx.style.boxSizing='border-box'; elx.style.gridTemplateColumns='1fr'; elx.style.gridTemplateRows='1fr';
    var pair=ALIGN2D[alignName(node.named.contentAlignment)]||['start','start']; elx.style.alignItems=pair[0]; elx.style.justifyItems=pair[1];
    if(node.children) node.children.forEach(function(ch){ var c=render(ch); c.style.gridArea='1/1'; elx.appendChild(c); });
    return elx;
  }
  function buttonContent(node){ var span=document.createElement('span'); span.style.display='inline-flex'; span.style.alignItems='center'; span.style.gap='6px'; if(node.children&&node.children.length){ node.children.forEach(function(ch){ span.appendChild(render(ch)); }); } else span.textContent=inlineText(node); return span; }
  function buildButton(node, variant){
    var b=document.createElement('span'); b.style.display='inline-flex'; b.style.alignItems='center'; b.style.justifyContent='center'; b.style.padding='9px 18px'; b.style.borderRadius='999px'; b.style.fontSize='14px'; b.style.fontWeight='600'; b.style.cursor='pointer'; b.style.userSelect='none'; b.style.lineHeight='1';
    var enabled=node.named.enabled?boolOf(node.named.enabled,true):true;
    if(variant==='filled'){ b.style.background=T().primary; b.style.color=T().onPrimary; }
    else if(variant==='tonal'){ b.style.background=T().secondaryContainer; b.style.color=T().onSurface; }
    else if(variant==='elevated'){ b.style.background=T().surface; b.style.color=T().primary; b.style.boxShadow='0 2px 6px rgba(2,8,20,.18)'; }
    else if(variant==='outlined'){ b.style.background='transparent'; b.style.color=T().primary; b.style.border='1px solid '+T().outline; }
    else { b.style.background='transparent'; b.style.color=T().primary; }
    if(!enabled){ b.style.opacity='.38'; b.style.cursor='default'; }
    var content=buttonContent(node); if(variant==='filled'||variant==='tonal'||variant==='elevated') content.style.color='inherit'; b.appendChild(content); return b;
  }
  function buildIconButton(node){ var b=document.createElement('span'); b.style.display='inline-flex'; b.style.alignItems='center'; b.style.justifyContent='center'; b.style.width='40px'; b.style.height='40px'; b.style.borderRadius='50%'; b.style.cursor='pointer'; if(node.children) node.children.forEach(function(ch){ b.appendChild(render(ch)); }); return b; }
  function buildFab(node, extended){ var f=document.createElement('span'); f.style.display='inline-flex'; f.style.alignItems='center'; f.style.justifyContent='center'; f.style.gap='8px'; f.style.background=T().primaryContainer; f.style.color=T().onPrimaryContainer; f.style.boxShadow='0 4px 10px rgba(2,8,20,.22)'; f.style.cursor='pointer'; if(extended){ f.style.padding='14px 20px'; f.style.borderRadius='16px'; f.style.fontWeight='600'; } else { f.style.width='52px'; f.style.height='52px'; f.style.borderRadius='16px'; } if(node.children) node.children.forEach(function(ch){ f.appendChild(render(ch)); }); return f; }
  function buildSurface(node, kind){
    var elx=document.createElement('div'); elx.style.boxSizing='border-box'; elx.style.background=T().surface;
    if(kind==='card'){ elx.style.borderRadius='12px'; elx.style.boxShadow='0 1px 3px rgba(2,8,20,.18)'; elx.style.background=T().surfaceContainer; }
    else if(kind==='elevated'){ elx.style.borderRadius='12px'; elx.style.boxShadow='0 4px 12px rgba(2,8,20,.22)'; elx.style.background=T().surfaceContainer; }
    else if(kind==='outlined'){ elx.style.borderRadius='12px'; elx.style.border='1px solid '+T().outlineVariant; }
    else { elx.style.background=T().surfaceContainerHighest; }
    elx.style.display='flex'; elx.style.flexDirection='column'; renderChildren(elx,node); return elx;
  }
  function buildIcon(node){ var sp=document.createElement('span'); var iconName=null; var v=node.named.imageVector||node.positional[0]; if(v&&v.kind==='access'&&v.root==='Icons'){ var m=v.segments.filter(function(s){return s.type==='member';}); iconName=m.length?m[m.length-1].name:null; } sp.textContent=(iconName&&ICON_GLYPHS[iconName])?ICON_GLYPHS[iconName]:'★'; sp.style.fontSize='22px'; sp.style.lineHeight='1'; var c=color(node.named.tint); sp.style.color=c||'inherit'; return sp; }
  function buildImage(node){ var d=document.createElement('div'); d.style.width='48px'; d.style.height='48px'; d.style.borderRadius='8px'; d.style.background='linear-gradient(135deg,'+T().primary+','+T().tertiary+')'; d.style.display='flex'; d.style.alignItems='center'; d.style.justifyContent='center'; d.style.color='#fff'; d.style.fontSize='10px'; d.style.fontWeight='700'; d.textContent='IMG'; return d; }
  function buildDivider(node, vertical){ var d=document.createElement('div'); if(vertical){ d.style.width='1px'; d.style.alignSelf='stretch'; d.style.background=T().outlineVariant; } else { d.style.height='1px'; d.style.width='100%'; d.style.background=T().outlineVariant; d.style.flex='none'; } return d; }
  function buildSwitch(node){ var checked=boolOf(node.named.checked,node.positional[0]&&node.positional[0].kind==='bool'?node.positional[0].v:false); var track=document.createElement('span'); track.style.display='inline-flex'; track.style.alignItems='center'; track.style.width='52px'; track.style.height='32px'; track.style.borderRadius='999px'; track.style.padding='3px'; track.style.cursor='pointer'; var thumb=document.createElement('span'); thumb.style.width='24px'; thumb.style.height='24px'; thumb.style.borderRadius='50%'; function paint(){ track.style.background=checked?T().primary:T().surfaceVariant; track.style.justifyContent=checked?'flex-end':'flex-start'; track.style.border=checked?'none':'2px solid '+T().outline; thumb.style.background=checked?T().onPrimary:T().outline; } paint(); track.appendChild(thumb); track.addEventListener('click',function(){ checked=!checked; paint(); }); return track; }
  function buildCheckbox(node, radio){ var checked=boolOf(node.named.checked,false)||boolOf(node.named.selected,false); var box=document.createElement('span'); box.style.display='inline-flex'; box.style.alignItems='center'; box.style.justifyContent='center'; box.style.width='20px'; box.style.height='20px'; box.style.cursor='pointer'; box.style.borderRadius=radio?'50%':'4px'; function paint(){ if(radio){ box.style.border='2px solid '+(checked?T().primary:T().outline); box.innerHTML=checked?'<span style="width:10px;height:10px;border-radius:50%;background:'+T().primary+'"></span>':''; } else { box.style.background=checked?T().primary:'transparent'; box.style.border='2px solid '+(checked?T().primary:T().outline); box.style.color=T().onPrimary; box.textContent=checked?'✓':''; box.style.fontSize='14px'; box.style.fontWeight='800'; } } paint(); box.addEventListener('click',function(){ checked=!checked; paint(); }); return box; }
  function buildSlider(node){ var wrap=document.createElement('div'); wrap.style.width='100%'; wrap.style.padding='10px 0'; wrap.style.minWidth='150px'; var track=document.createElement('div'); track.style.position='relative'; track.style.height='4px'; track.style.borderRadius='2px'; track.style.background=T().surfaceVariant; var val=num(node.named.value,0.5); var frac=val; if(val>1) frac=val/100; if(frac<0)frac=0; if(frac>1)frac=1; var fill=document.createElement('div'); fill.style.position='absolute'; fill.style.left='0'; fill.style.top='0'; fill.style.bottom='0'; fill.style.width=(frac*100)+'%'; fill.style.background=T().primary; fill.style.borderRadius='2px'; var thumb=document.createElement('div'); thumb.style.position='absolute'; thumb.style.top='50%'; thumb.style.left=(frac*100)+'%'; thumb.style.width='18px'; thumb.style.height='18px'; thumb.style.borderRadius='50%'; thumb.style.background=T().primary; thumb.style.transform='translate(-50%,-50%)'; track.appendChild(fill); track.appendChild(thumb); wrap.appendChild(track); return wrap; }
  function buildCircular(node){ var d=document.createElement('div'); d.style.width='38px'; d.style.height='38px'; d.style.borderRadius='50%'; d.style.border='4px solid '+T().surfaceVariant; d.style.borderTopColor=T().primary; return d; }
  function buildLinear(node){ var bar=document.createElement('div'); bar.style.width='100%'; bar.style.height='4px'; bar.style.borderRadius='2px'; bar.style.background=T().surfaceVariant; bar.style.overflow='hidden'; var fill=document.createElement('div'); fill.style.height='100%'; fill.style.background=T().primary; fill.style.width=node.named.progress?(progFrac(node.named.progress)*100)+'%':'40%'; bar.appendChild(fill); return bar; }
  function progFrac(v){ var f=0.5; if(v&&v.kind==='lambda'&&v.firstNum!=null) f=parseFloat(v.firstNum); else if(v&&v.kind==='num') f=num(v); if(isNaN(f)) f=0.5; return Math.max(0,Math.min(1,f)); }
  function buildChip(node){ var c=document.createElement('span'); c.style.display='inline-flex'; c.style.alignItems='center'; c.style.gap='6px'; c.style.padding='6px 12px'; c.style.border='1px solid '+T().outline; c.style.borderRadius='8px'; c.style.fontSize='13px'; c.style.color=T().onSurface; if(boolOf(node.named.selected,false)){ c.style.background=T().secondaryContainer; } c.textContent=lambdaText(node.named.label)||'Chip'; return c; }
  function lambdaText(v){ if(v&&v.kind==='lambda'&&v.body){ var t=''; v.body.forEach(function(n){ if(n.name==='Text') t+=inlineText(n); }); return t; } return ''; }
  function buildUnknown(node){ if(node.children&&node.children.length){ var elx=document.createElement('div'); elx.style.display='flex'; elx.style.flexDirection='column'; elx.style.gap='6px'; renderChildren(elx,node); return elx; } var sp=document.createElement('span'); sp.className='unknown'; sp.textContent=node.name+'(…)'; return sp; }

  // --- Public render: code -> a "screen" element ------------------------------
  function renderToElement(code, theme){
    themeName = (theme==='dark')?'dark':'light';
    var host=document.createElement('div');
    host.style.display='flex'; host.style.flexDirection='column'; host.style.gap='0';
    host.style.background=T().background; host.style.color=T().onBackground;
    host.style.minHeight='100%'; host.style.padding='16px'; host.style.boxSizing='border-box';
    var nodes; try { nodes=parse(code); } catch(e){ host.appendChild(errBox('Parse error: '+e.message)); return host; }
    try { nodes.forEach(function(n){ host.appendChild(render(n)); }); }
    catch(e){ host.appendChild(errBox('Render error: '+e.message)); }
    return host;
  }
  function errBox(msg){ var d=document.createElement('div'); d.className='unknown'; d.textContent='⚠ '+msg; return d; }

  // =========================================================================
  // CHECK HELPERS — used by lab specs to grade a learner's parsed code.
  // All operate on the node tree returned by parse().
  // =========================================================================
  function findAll(nodes, name){ var out=[]; (function walk(list){ if(!list) return; list.forEach(function(n){ if(n.name===name) out.push(n); walk(n.children); }); })(nodes); return out; }
  function find(nodes, name){ return findAll(nodes, name)[0] || null; }
  function topLevel(nodes){ return nodes && nodes[0]; }
  // op names of a node's Modifier chain, in order, e.g. ['padding','background'].
  function modNames(node){ if(!node) return []; return modifierOps(modifierOf(node)).map(function(o){ return o.name; }); }
  function hasMod(node, name){ return modNames(node).indexOf(name)>=0; }
  // index of an op name in the chain (-1 if absent) — for "order matters" checks.
  function modIndex(node, name){ return modNames(node).indexOf(name); }
  // integer value of a named arg on a node (e.g. fontSize, value), else null.
  function argNum(node, key){ if(!node) return null; var v=node.named[key]; return v? num(v): null; }
  // arrangement name + gap for a stack node, axis 'vertical'|'horizontal'.
  function arrangementOf(node, axis){ if(!node) return null; return arrangement(axis==='vertical'?node.named.verticalArrangement:node.named.horizontalArrangement); }
  function spacing(node, axis){ var a=arrangementOf(node,axis); return (a&&a.name==='spacedBy')?a.gap:null; }
  function crossAlignOf(node, axis){ if(!node) return null; return alignName(axis==='vertical'?node.named.horizontalAlignment:node.named.verticalAlignment); }
  // a Text node's resolved props for checks.
  function textProps(node){ if(!node||node.name!=='Text') return null;
    var styleRole=null; var sv=node.named.style; if(sv&&sv.kind==='access'&&sv.root==='MaterialTheme'){ var m=sv.segments.filter(function(s){return s.type==='member';}); styleRole=m.length?m[m.length-1].name:null; }
    var fw=node.named.fontWeight; var fwName=(fw&&fw.kind==='access'&&fw.segments[0])?fw.segments[0].name:null;
    var col=node.named.color; var colName=(col&&col.kind==='access')?(col.root==='Color'?(col.segments[0]&&col.segments[0].name):(col.segments.filter(function(s){return s.type==='member';}).pop()||{}).name):null;
    var fs=node.named.fontStyle; var italic=!!(fs&&fs.kind==='access'&&fs.segments[0]&&fs.segments[0].name==='Italic');
    return { text:inlineText(node), styleRole:styleRole, fontWeight:fwName, fontSize:argNum(node,'fontSize'), colorName:colName, italic:italic };
  }
  // shape applied via a clip/background modifier, e.g. 'CircleShape' or 'RoundedCornerShape'.
  function shapeOf(node){ var ops=modifierOps(modifierOf(node)); for(var i=0;i<ops.length;i++){ var sv=ops[i].positional[1]||ops[i].named.shape||(ops[i].name==='clip'?ops[i].positional[0]:null); if(sv&&sv.kind==='access'&&(sv.root==='CircleShape'||sv.root==='RoundedCornerShape')) return sv.root; } return null; }
  // does a node (or any descendant) carry Modifier.weight(...)?
  function weightOf(node){ var ops=modifierOps(modifierOf(node)); for(var i=0;i<ops.length;i++){ if(ops[i].name==='weight') return num(ops[i].positional[0],1); } return null; }

  window.ComposeEngine = {
    parse: parse,
    render: renderToElement,
    // helpers
    findAll: findAll, find: find, topLevel: topLevel,
    modNames: modNames, hasMod: hasMod, modIndex: modIndex,
    argNum: argNum, arrangementOf: arrangementOf, spacing: spacing,
    crossAlignOf: crossAlignOf, textProps: textProps, shapeOf: shapeOf,
    weightOf: weightOf, inlineText: inlineText,
  };
})();
