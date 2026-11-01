import {Chess,SAMPLE,parseGame,classify} from './analysis.js';
import {Engine} from './engine.js';
import {pieceSVG} from './pieces.js';
import {guidePreference,playerPreference,detectSide} from './preferences.js';
import {selectMoments,coachMoment,takeawayFor} from './review.js';
const $=id=>document.getElementById(id),text=(id,s)=>$(id).textContent=s;
let game,side='w',knownSide=true,flipped=false,sample=true,ply=0,panel=0,stage='welcome',analyses=[],grades=[],moments=[],momentIndex=0,detail=null,steps=[],step=0,lineActive=false,timer=null,worker=null,run=0,busy=false,complete=false,tourSeen=false;
function btn(label,fn,cls=''){const b=document.createElement('button');b.textContent=label;b.onclick=fn;b.className=cls;return b;}
function name(color){return game.headers[color==='w'?'White':'Black']|| (color==='w'?'White':'Black');}
function pause(){clearInterval(timer);timer=null;text('pauseLine','Play');}
function choosePanel(n){panel=n;$('reviewActionbar').hidden=panel!==0||busy||(!knownSide&&complete);for(let i=0;i<2;i++){$('panel'+i).hidden=i!==n;$('tab'+i).setAttribute('aria-selected',String(i===n));$('tab'+i).tabIndex=i===n?0:-1;}if(n!==0)pause();draw();document.querySelector('.widget-body').scrollTop=0;}
for(let i=0;i<2;i++){$('tab'+i).onclick=()=>choosePanel(i);$('tab'+i).onkeydown=e=>{if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();e.stopPropagation();choosePanel((i+1)%2);$('tab'+panel).focus();}};}
function draw(){
 const c=new Chess(lineActive&&panel===0?(step?steps[step-1].fen:game.fens[Math.max(0,ply-1)]):game.fens[ply]);
 const files=flipped?'hgfedcba':'abcdefgh',ranks=flipped?'12345678':'87654321';const root=$('board');root.replaceChildren();
 const mark=lineActive&&panel===0?(step?steps[step-1]:null):ply?game.moves[ply-1]:null;
 for(let r=0;r<8;r++)for(let f=0;f<8;f++){const sq=files[f]+ranks[r],piece=c.get(sq),el=document.createElement('div');el.className='square'+(((sq.charCodeAt(0)-97)+Number(sq[1]))%2===1?' dark':'')+(mark&&(mark.from===sq||mark.to===sq)?lineActive&&panel===0?' whatif':' last':'');el.setAttribute('aria-label',sq+(piece?` ${piece.color==='w'?'white':'black'} ${{p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'}[piece.type]}`:' empty'));if(piece){const span=document.createElement('span');span.className=piece.color==='w'?'piece-white':'piece-black';span.innerHTML=pieceSVG(piece.type,piece.color);el.append(span);}if(r===7){const s=document.createElement('span');s.className='coord';s.textContent=files[f];el.append(s);}if(f===0){const s=document.createElement('span');s.className='coord rank';s.textContent=ranks[r];el.append(s);}root.append(el);}
 text('topPlayer',`${flipped?'White':'Black'} · ${name(flipped?'w':'b')}`);text('bottomPlayer',`${flipped?'Black':'White'} · ${name(flipped?'b':'w')}`);text('positionLabel',c.isCheckmate()?'Checkmate':c.isDraw()?'Draw':`${c.turn()==='w'?'White':'Black'} to move`);
 text('movePosition',lineActive&&panel===0?'What if · '+step+'/'+steps.length:ply?`${game.moves[ply-1].before.split(' ')[5]}${game.moves[ply-1].color==='w'?'.':'…'} ${game.moves[ply-1].san}`:'Starting position');
 for(const b of $('moves').querySelectorAll('[data-ply]')){const active=Number(b.dataset.ply)===ply;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}
 $('first').disabled=$('prev').disabled=busy||ply===0;
 $('last').disabled=$('next').disabled=busy||ply===game.moves.length;

}
function renderLists(){
 $('moves').replaceChildren();game.moves.forEach((m,i)=>{if(m.color==='w'){const n=document.createElement('span');n.textContent=m.before.split(' ')[5]+'.';$('moves').append(n);}else if(i===0)$('moves').append(document.createElement('span'),document.createElement('span'));const label=grades[i]?({blunder:'??',mistake:'?',inaccuracy:'?!',mate:'M!',good:'✓',steady:''}[grades[i].kind]||''):'';const b=btn(`${m.san} ${label}`.trim(),()=>openMove(i+1),grades[i]?.kind||'');b.dataset.ply=i+1;b.disabled=busy;b.setAttribute('aria-label',`${m.color==='w'?'White':'Black'} ${m.before.split(' ')[5]}: ${m.san}${grades[i]?' — '+grades[i].title:''}`);$('moves').append(b);});
 $('moments').replaceChildren();text('momentCount',complete?`${moments.length} key moments · ${side==='w'?'White':'Black'} · in game order`:'Your moments appear after analysis.');
 if(!moments.length){const p=document.createElement('p');p.textContent=complete?'No major missed opportunities flagged at this depth. You can review every move or try a deeper review.':'Import and analyze a game to get started.';$('moments').append(p);}
 for(const [n,i] of moments.entries()){const d=coachMoment(game,i,analyses[i],grades[i]);$('moments').append(btn(`${n+1}. ${d.title} · ${game.moves[i].before.split(' ')[5]}${side==='w'?'.':'…'} ${game.moves[i].san}`,()=>openMoment(n),'moment '+grades[i].kind));}
}
function render(){
 $('reviewActionbar').hidden=panel!==0||busy||(!knownSide&&complete);
 $('progressArea').hidden=!busy;$('identity').hidden=knownSide||!complete;$('momentContent').hidden=stage!=='moment';$('takeaway').hidden=stage!=='done';$('reviewSettings').hidden=stage==='welcome'||busy;$('moveReview').hidden=stage==='welcome';
 $('primaryAction').hidden=busy||(!knownSide&&complete);$('secondaryAction').hidden=busy||(!knownSide&&complete);$('previousMoment').hidden=true;$('backToMoment').hidden=!lineActive;$('continuation').hidden=!lineActive;$('analyze').disabled=busy;
 text('gameTitle',stage==='welcome'?'':`${name('w')} vs ${name('b')}${sample?' · Example game':''}`);
 if(stage==='welcome'){text('stageLabel','01 / IMPORT YOUR GAME');text('reviewTitle','Your next lesson starts here.');text('reviewText','Bring a game you played. Review every move with Coach Lens, understand the ideas, and explore what could have happened.');text('primaryAction','Import a game');text('secondaryAction','Try the example');}
 if(stage==='analyzing'){text('stageLabel','02 / ANALYZING');text('reviewTitle','Coach Lens is reviewing your game…');text('reviewText','Looking for missed chances and useful ideas. Your game stays in this browser.');}
 if(stage==='ready'){text('stageLabel','02 / ANALYSIS COMPLETE');text('reviewTitle',knownSide?'Your review is ready.':'Which player were you?');text('reviewText',knownSide?`All ${game.moves.length} moves are analyzed. Start at move one or choose any move below. Moments are shortcuts to your missed chances.`:'Choose your name so Coach Lens can distinguish your moves from your opponent’s.');text('primaryAction','Start review');text('secondaryAction','Key moments');}
 if(stage==='start'){text('stageLabel','STARTING POSITION');text('reviewTitle','Let’s follow the game.');text('reviewText','Choose Next move or select any move below. The board shows the position after the selected move.');text('primaryAction','Next move');text('secondaryAction','Key moments');}
 if(stage==='moment'){text('stageLabel',`MOVE ${ply} OF ${game.moves.length} · ${game.moves[ply-1].color===side?'YOUR MOVE':'OPPONENT’S MOVE'}`);text('reviewTitle',detail.title);text('reviewText',lineActive?'Exploring the suggested line from before this move.':'The board shows the position after this move.');text('played',`${game.moves[ply-1].color==='w'?'White':'Black'} played ${game.moves[ply-1].san}. ${detail.assessment}`);text('explanation',detail.text);text('primaryAction',ply===game.moves.length?'Finish review':'Next move');text('secondaryAction',lineActive?'Replay line':detail.matched?'Explore this move':'Show me what if');$('secondaryAction').disabled=!steps.length;}
 else $('secondaryAction').disabled=false;
 $('primaryAction').disabled=false;
 if(stage==='done'){text('stageLabel','04 / REVIEW COMPLETE');text('reviewTitle','One idea for your next game.');text('reviewText',moments.length?'You reached the end of the game. Keep this habit in mind next time you play.':'A quick review is an estimate, not a verdict on your game.');text('takeaway',takeawayFor(moments.map(i=>coachMoment(game,i,analyses[i],grades[i]).theme)));text('primaryAction','Review another game');text('secondaryAction','Revisit moments');}
 if(stage==='error'){text('stageLabel','ANALYSIS PAUSED');text('reviewTitle','Let’s try that again.');text('primaryAction','Retry analysis');text('secondaryAction','Review every move');}
 text('journeyStatus',stage==='moment'?`MOVE ${ply} / ${game.moves.length}`:stage==='done'?'READY FOR YOUR NEXT GAME':'IMPORT → REVIEW → TAKEAWAY');draw();
}
function openMove(n){
 if(busy)return;
 pause();lineActive=false;step=0;ply=Math.max(0,Math.min(game.moves.length,n));stage=ply?'moment':'start';
 detail=ply?coachMoment(game,ply-1,analyses[ply-1],grades[ply-1],side):null;steps=detail?.steps||[];
 choosePanel(0);render();
 const active=$('moves').querySelector(`[data-ply="${ply}"]`);if(active){const list=$('moves');const top=active.getBoundingClientRect().top-list.getBoundingClientRect().top;if(top<0)list.scrollTop+=top;else if(top+active.offsetHeight>list.clientHeight)list.scrollTop+=top+active.offsetHeight-list.clientHeight;}
}
function openMoment(n){momentIndex=n;openMove(moments[n]+1);}
function nextMoment(){if(ply<game.moves.length)openMove(ply+1);else{pause();lineActive=false;stage='done';render();}}
function lineStep(n){step=Math.max(0,Math.min(steps.length,n));text('caption',step?steps[step-1].caption:'Start from the position before the selected move.');text('lineCount',`${step} / ${steps.length}`);$('lineBack').disabled=step===0;$('lineNext').disabled=step===steps.length;if(step===steps.length)pause();draw();}
function play(){pause();if(step>=steps.length)step=0;lineStep(step);text('pauseLine','Pause');timer=setInterval(()=>lineStep(step+1),2400);}
function startLine(){lineActive=true;step=0;render();lineStep(0);const scroller=document.querySelector('.widget-body');scroller.scrollTop+= $('continuation').getBoundingClientRect().top-scroller.getBoundingClientRect().top-16;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){lineStep(1);if(step<steps.length)play();}}
function openGuide(){pause();$('hideGuide').checked=guidePreference.get();$('guideDialog').showModal();tourSeen=true;}
$('openGuide').onclick=$('helpLink').onclick=openGuide;$('closeGuide').onclick=$('startLearning').onclick=()=>$('guideDialog').close();$('hideGuide').onchange=()=>guidePreference.set($('hideGuide').checked);
$('primaryAction').onclick=()=>{if(stage==='welcome'||stage==='done')openImport();else if(stage==='ready'){openMove(1);if(!tourSeen&&!guidePreference.get())openGuide();}else if(stage==='moment'||stage==='start')nextMoment();else if(stage==='error')void analyze();};
$('secondaryAction').onclick=()=>{if(stage==='welcome')load(SAMPLE,true,true);else if(stage==='moment')startLine();else if(stage==='error')openMove(1);else choosePanel(1);};
$('previousMoment').onclick=()=>openMoment(momentIndex-1);$('backToMoment').onclick=()=>openMove(ply);$('lineBack').onclick=()=>{pause();lineStep(step-1);};$('lineNext').onclick=()=>{pause();lineStep(step+1);};$('pauseLine').onclick=()=>timer?pause():play();
function navigate(n){openMove(n);}
$('first').onclick=()=>navigate(0);$('last').onclick=()=>navigate(game.moves.length);$('prev').onclick=()=>navigate(ply-1);$('next').onclick=()=>navigate(ply+1);$('flip').onclick=()=>{flipped=!flipped;draw();};
function setSide(color){pause();side=color;knownSide=true;flipped=side==='b';$('side').value=side;moments=selectMoments(game,grades,side);lineActive=false;if(complete)stage='ready';else if(stage==='moment'){detail=coachMoment(game,ply-1,analyses[ply-1],grades[ply-1],side);steps=detail.steps;}text('sideDetection',`Reviewing ${side==='w'?'White':'Black'}.`);renderLists();render();}
$('side').onchange=e=>setSide(e.target.value);$('username').value=playerPreference.get();$('username').onchange=e=>{playerPreference.set(e.target.value);const found=detectSide(game.headers,e.target.value);if(found)setSide(found);else text('sideDetection','No unique match. Choose your side below.');};
function stop(){run++;worker?.close();worker=null;busy=false;pause();}
function load(pgn,isSample=false,auto=true){const parsed=parseGame(pgn);stop();game=parsed;sample=isSample;complete=false;analyses=[];grades=[];moments=[];lineActive=false;ply=0;const found=isSample?'b':detectSide(game.headers,playerPreference.get());knownSide=!!found;side=found||'w';flipped=side==='b';$('side').value=side;text('sideDetection',found?`Reviewing ${side==='w'?'White':'Black'}.`:'Choose which player you were after analysis.');$('sampleBadge').hidden=!sample;text('result',game.headers.Result||'*');$('playerChoices').replaceChildren(...['w','b'].map(c=>btn(`${name(c)} · ${c==='w'?'White':'Black'}`,()=>setSide(c))));stage='welcome';renderLists();choosePanel(0);render();if(auto)void analyze();}
async function analyze(){stop();const token=run;const current=new Engine();worker=current;busy=true;complete=false;stage='analyzing';lineActive=false;analyses=[];grades=[];moments=[];ply=0;choosePanel(0);renderLists();render();text('status','Loading Stockfish…');$('progress').value=0;const ms=Number($('budget').value);
 try{await current.init();for(let i=0;i<game.fens.length;i++){if(token!==run)return;const c=new Chess(game.fens[i]);let a;if(c.isCheckmate())a={type:'mate',value:c.turn()==='w'?-1:1,pv:[]};else if(c.isDraw())a={type:'cp',value:0,pv:[]};else a=await current.evaluate(game.fens[i],ms);if(token!==run)return;if(!a)throw Error('The engine returned no score. Please retry.');analyses[i]=a;if(i)grades[i-1]=classify(game.moves[i-1],analyses[i-1],a);$('progress').value=(i+1)/game.fens.length*100;text('status',`Position ${i+1} of ${game.fens.length}`);}
 current.close();worker=null;busy=false;complete=true;stage='ready';moments=selectMoments(game,grades,side);renderLists();render();
 }catch(err){if(token!==run)return;current.close();worker=null;busy=false;stage='error';renderLists();render();text('reviewText',err.message);}
}
$('cancel').onclick=()=>{stop();stage='error';renderLists();render();text('reviewText','Analysis stopped. Retry when you’re ready, or review every move.');};$('analyze').onclick=()=>void analyze();
function openImport(){pause();text('importError','');$('importDialog').showModal();$('pgn').focus();}
$('openImport').onclick=openImport;$('closeImport').onclick=()=>$('importDialog').close();$('importForm').onsubmit=e=>{e.preventDefault();try{load($('pgn').value);$('importDialog').close();}catch(err){text('importError',err.message);}};
$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>150000)throw Error('Choose a PGN smaller than 150 KB.');const pgn=await f.text();load(pgn);$('pgn').value=pgn;$('importDialog').close();}catch(err){text('importError',err.message);}finally{e.target.value='';}};$('loadSample').onclick=()=>{load(SAMPLE,true,true);$('importDialog').close();};
function theme(on){document.body.classList.toggle('dark-mode',on);$('themeToggle').setAttribute('aria-pressed',String(on));const label=on?'Switch to light mode':'Switch to dark mode';$('themeToggle').setAttribute('aria-label',label);$('themeToggle').title=label;$('themeToggle').innerHTML=on?'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg>':'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z"/></svg>';}
let saved;try{saved=localStorage.getItem('chess-lens.dark-mode.v1');}catch{}theme(saved===null||saved===undefined?matchMedia('(prefers-color-scheme: dark)').matches:saved==='true');$('themeToggle').onclick=()=>{const on=!document.body.classList.contains('dark-mode');theme(on);try{localStorage.setItem('chess-lens.dark-mode.v1',String(on));}catch{}};
$('pgnInfo').onclick=()=>{$('pgnHelp').hidden=false;};$('pgnInfo').onmouseenter=$('pgnInfo').onfocus=()=>{$('pgnHelp').hidden=false;};$('pgnInfo').onmouseleave=$('pgnInfo').onblur=()=>{$('pgnHelp').hidden=true;};
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('pgnHelp').hidden=true;if($('importDialog').open||$('guideDialog').open||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.target.getAttribute('role')==='tab')return;if(e.key==='ArrowLeft'){e.preventDefault();$('prev').click();}if(e.key==='ArrowRight'){e.preventDefault();$('next').click();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});load(SAMPLE,true,false);
