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
export function continuation(fen,pv=[],viewerSide){
 const c=new Chess(fen),steps=[];let balance=0;const color=viewerSide||c.turn();
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
function moveIdea(move){
 const c=new Chess(move.after),actor=move.color==='w'?'White':'Black',other=move.color==='w'?'Black':'White';
 if(c.isCheckmate())return {text:`${actor} gives checkmate: the king has no legal escape.`,theme:'checks'};
 if(c.isDraw())return {text:'This position is a draw under the rules checked by this review.',theme:'threats'};
 if(move.promotion)return {text:`The pawn promotes to a ${names[move.promotion]}, adding a new piece to the board.`,theme:'captures'};
 if(move.flags.includes('k')||move.flags.includes('q'))return {text:'Castling moves the king away from its starting square and brings the rook closer to the centre.',theme:'threats'};
 const attacked=c.board().flat().filter(p=>p&&p.color!==move.color&&p.type!=='p'&&c.attackers(p.square,move.color).includes(move.to));
 if(attacked.length>=2)return {text:`The ${names[move.piece]} attacks ${attacked.map(p=>`the ${names[p.type]} on ${p.square}`).join(' and ')} at once—a fork. Whether it wins a piece depends on the reply.`,theme:'forks'};
 if(move.captured)return {text:`The ${names[move.piece]} captures the ${names[move.captured]} on ${move.to}.${c.isCheck()?' It also gives check.':' Check the continuation to see whether it can be recaptured.'}`,theme:'captures'};
 if(c.isCheck())return {text:`This gives check, so ${other} must respond to the attack on the king.`,theme:'checks'};
 if(attacked.some(p=>p.type==='q'))return {text:`The ${names[move.piece]} attacks the queen on ${attacked.find(p=>p.type==='q').square}, creating a threat to answer.`,theme:'threats'};
 if(['n','b'].includes(move.piece)&&move.from[1]===(move.color==='w'?'1':'8'))return {text:`The ${names[move.piece]} develops from the back rank, bringing another piece into play.`,theme:'development'};
 if(move.piece==='p'&&['d4','e4','d5','e5'].includes(move.to))return {text:`The pawn takes space in the centre on ${move.to}, influencing the nearby squares.`,theme:'centre'};
 return {text:`The ${names[move.piece]} moves from ${move.from} to ${move.to}. The benefit depends on the replies; Coach Lens cannot confidently name a specific tactic here.`,theme:'threats'};
}
export function coachMoment(game,index,analysis,grade,viewerSide=game.moves[index].color){
 const move=game.moves[index],actor=move.color==='w'?'White':'Black',own=move.color===viewerSide;
 const played=moveIdea(move),steps=continuation(move.before,analysis?.pv,viewerSide);
 const matched=analysis?.pv?.[0]===move.from+move.to+(move.promotion||'');
 const mate=new Chess(move.after).isCheckmate();
 const titles={good:'Strong move',steady:'Steady move',inaccuracy:'A small improvement was available',mistake:'A better option was available',blunder:'A costly move',mate:'Missed a checkmate opportunity'};
 const title=mate?'Checkmate':matched?'Strong move':grade?titles[grade.kind]||'Position reviewed':'Not analyzed yet';
 const assessments={good:'This matches Coach Lens’s first choice at this depth.',steady:'The analysis sees little change in the position.',inaccuracy:'A small advantage was lost.',mistake:'This gave the other player a better chance.',blunder:'This made the position much harder to play.',mate:'The analysis found a forced mate before this move, but no longer finds it afterward.'};
 let assessment=grade?(assessments[grade.kind]||''):'Run analysis to get an assessment for this move.';
 if(mate)assessment='The king is attacked and has no legal escape.';
 else if(grade?.title==='Allowed a forced mate')assessment=`This allowed a forced checkmate for ${own?'your opponent':'you'} at this search depth.`;
 else if(analysis?.type==='mate'&&grade?.kind==='steady')assessment='This is a forced-mate position; the exact route may change with deeper analysis.';
 let explanation=played.text,theme=played.theme;
 if(!mate&&steps.length){
  const c=new Chess(move.before),u=analysis.pv[0];const suggested=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u.slice(4)||undefined});
  const idea=moveIdea(suggested);theme=idea.theme;
  if(matched){explanation=`${own?'Good choice':'A strong choice by '+actor}—${played.text} Explore this move to see one possible continuation.`;}
  else {explanation+=` Coach Lens prefers ${suggested.san} for ${actor}: ${idea.text}`;
   if(grade?.kind==='mate')explanation+=' The analysis finds a route to checkmate with this move; the preview may show only its opening moves.';
   if(grade?.title==='Allowed a forced mate'&&game.moves[index+1]?.san.endsWith('#'))explanation+=` In the game, ${move.san} allowed ${game.moves[index+1].san} and checkmate.`;
  }
 }else if(!mate&&grade)explanation+=' No playable continuation was saved. Try a deeper analysis for a suggested line.';
 return {title,text:explanation,assessment,matched,steps:mate?[]:steps,theme};
}
export function takeawayFor(themes=[]){
 if(!themes.length)return 'Before committing to a move, check your opponent’s checks, captures, and threats. No major missed opportunities were flagged at this search depth.';
 const count={};for(const t of themes)count[t]=(count[t]||0)+1;
 const theme=Object.keys(count).sort((a,b)=>count[b]-count[a])[0];
 return {checks:'Before taking a piece, look at your checks. One forcing move can change the whole position.',captures:'Before moving, look for pieces you can capture—and check whether your opponent can take you back.',forks:'Look for a move that attacks two pieces at once, especially a check that also attacks another piece.',development:'Bring your knights and bishops into play, and check what each move leaves undefended.',centre:'Look for safe ways to influence the centre before starting an attack.',threats:'After choosing your move, pause and look for your opponent’s strongest check or capture.'}[theme];
}
