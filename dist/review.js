import {Chess} from './analysis.js';
const names={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};
const values={p:1,n:3,b:3,r:5,q:9,k:0};
export function selectMoments(game,grades,side){
 const own=grades.map((g,i)=>({g,i})).filter(x=>x.g&&game.moves[x.i].color===side);
 const important=own.filter(x=>['mate','blunder','mistake'].includes(x.g.kind));
 // Keep a review short, then restore chronological order.
 const priority=g=>g.kind==='mate'?10000:g.title==='Allowed a forced mate'?9000:(g.loss??0);
 return important.sort((a,b)=>priority(b.g)-priority(a.g)).slice(0,5).sort((a,b)=>a.i-b.i).map(x=>x.i);
}
export function continuation(fen,pv=[]){
 const c=new Chess(fen),steps=[];let balance=0;const color=c.turn();
 for(const u of pv.slice(0,8)){
  let m;try{m=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u.slice(4)||undefined});}catch{break;}
  if(m.captured)balance+=(m.color===color?1:-1)*values[m.captured];
  let caption=`${m.color===color?'You':'Your opponent'} move${m.color===color?'':'s'} the ${names[m.piece]} from ${m.from} to ${m.to}.`;
  if(m.captured)caption=`${m.color===color?'You capture':'Your opponent captures'} the ${names[m.captured]} on ${m.to} with ${m.piece==='p'?'a pawn':`the ${names[m.piece]}`}.`;
  if(m.flags.includes('k')||m.flags.includes('q'))caption=`${m.color===color?'You castle':'Your opponent castles'}, moving the king and rook together.`;
  if(m.promotion)caption+=` The pawn becomes a ${names[m.promotion]}.`;
  if(c.isCheckmate())caption+=' Checkmate: the king has no legal escape.';
  else if(c.isCheck())caption+=' This is check: the king must be protected.';
  if(!c.isCheck()&&!m.captured){const queen=c.board().flat().find(p=>p&&p.color!==m.color&&p.type==='q'&&c.attackers(p.square,m.color).includes(m.to));if(queen)caption+=` It attacks the queen on ${queen.square}.`;}
  steps.push({fen:c.fen(),san:m.san,from:m.from,to:m.to,caption,balance,mate:c.isCheckmate()});
 }
 return steps;
}
export function coachMoment(game,index,analysis,grade){
 const move=game.moves[index],c=new Chess(move.before),steps=continuation(move.before,analysis?.pv);
 if(!steps.length)return {title:'A moment worth revisiting',text:'No playable alternative was saved for this position. Try a deeper review.',steps,theme:'threats'};
 const first=steps[0],m=c.move({from:first.from,to:first.to,promotion:analysis.pv[0].slice(4)||undefined});
 let title=grade.kind==='mate'?'You missed a checkmate opportunity':grade.title;
 let why='The advantage depends on the replies that follow. Watch this short line to compare the positions; this review cannot confidently name a specific tactic here.';
 let theme='threats';
 if(first.mate){title='You had checkmate in one move';why='This move attacks the king, and your opponent has no legal way to escape, block the attack, or capture the attacking piece.';theme='checks';}
 else {
  const attacked=[];for(const row of c.board())for(const piece of row)if(piece&&piece.color!==m.color&&piece.type!=='p'&&c.attackers(piece.square,m.color).includes(m.to))attacked.push(piece);
  if(attacked.length>=2){why=`Your ${names[m.piece]} attacks ${attacked.map(p=>`the ${names[p.type]} on ${p.square}`).join(' and ')} at once. This is called a fork. Watch the reply to see what can be captured.`;title='A chance to attack two pieces at once';theme='forks';}
  else if(attacked.some(p=>p.type==='q')){why=`This attacks the queen on ${attacked.find(p=>p.type==='q').square} with your ${names[m.piece]}, giving your opponent a threat to respond to. Watch the reply to see how the queen reacts.`;theme='threats';}
  else if(m.captured){why=`Your ${names[m.piece]} can capture the ${names[m.captured]} on ${m.to}. The reply matters: watch whether your opponent can take your piece back.`;theme='captures';}
  else if(c.isCheck()){why='This gives check, so your opponent must deal with the attack on their king. Watch how that changes their options.';theme='checks';}
  else if(m.flags.includes('k')||m.flags.includes('q'))why='Castling moves your king away from its starting square and brings your rook into play.';
  else if(['n','b'].includes(m.piece)&&m.from[1]===(m.color==='w'?'1':'8'))why=`This brings your ${names[m.piece]} off the back rank and into play. The continuation shows the position Coach Lens prefers.`;
  if(grade.kind==='mate'){title='You missed a checkmate opportunity';why+=' The analysis found a route to checkmate here; the preview may show only its opening moves.';theme='checks';}
  if(grade.kind==='blunder'&&grade.title==='Allowed a forced mate'){title='Your king needed protection';why+=game.moves[index+1]?.san.endsWith('#')?` In your game, ${move.san} let your opponent play ${game.moves[index+1].san} and deliver checkmate.`:' Your played move allowed a mating attack in this analysis.';theme='threats';}
 }
 return {title,text:`Coach Lens suggests ${m.san}. ${why}`,steps,theme};
}
export function takeawayFor(themes=[]){
 if(!themes.length)return 'Before committing to a move, check your opponent’s checks, captures, and threats. No major missed opportunities were flagged at this search depth.';
 const count={};for(const t of themes)count[t]=(count[t]||0)+1;
 const theme=Object.keys(count).sort((a,b)=>count[b]-count[a])[0];
 return {checks:'Before taking a piece, look at your checks. One forcing move can change the whole position.',captures:'Before moving, look for pieces you can capture—and check whether your opponent can take you back.',forks:'Look for a move that attacks two pieces at once, especially a check that also attacks another piece.',threats:'After choosing your move, pause and look for your opponent’s strongest check or capture.'}[theme];
}
