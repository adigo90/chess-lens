import {Chess} from './analysis.js';
const names={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};
export function explainSuggestion(fen,pv=[]){
 if(!pv.length)return '';
 const c=new Chess(fen),checked=c.isCheck();let m;
 try{const u=pv[0];m=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u.slice(4)||undefined});}catch{return '';}
 const reasons=[];
 if(c.isCheckmate())reasons.push('This is checkmate: the opposing king is attacked and has no legal escape.');
 else {if(checked)reasons.push('This gets your king out of check.');if(m.captured)reasons.push(`It captures the opposing ${names[m.captured]}. Watch the reply to see whether your piece can be taken back.`);if(c.isCheck())reasons.push('It gives check, so your opponent must deal with the threat to their king.');}
 if(m.flags.includes('k')||m.flags.includes('q'))reasons.push('Castling moves your king away from the center and brings your rook closer to the action.');
 if(m.promotion)reasons.push(`Your pawn becomes a ${names[m.promotion]}.`);
 if(['n','b'].includes(m.piece)&&m.from[1]===(m.color==='w'?'1':'8'))reasons.push(`It develops your ${names[m.piece]} from the back rank, bringing it into play.`);
 if(m.piece==='p'&&['d','e'].includes(m.from[0])&&m.from[1]===(m.color==='w'?'2':'7'))reasons.push('Moving this central pawn makes room for pieces behind it to come out.');
 if(!reasons.length)reasons.push('The benefit depends on the moves that follow. Replay the continuation and watch how your opponent responds; this short review cannot reliably name a tactical reason here.');
 let reply='';if(pv[1]){try{const u=pv[1],r=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u.slice(4)||undefined});reply=` One suggested reply is ${r.san}: the opposing ${names[r.piece]} moves from ${r.from} to ${r.to}.`;}catch{}}
 return `Coach Lens suggests ${m.san} — move your ${names[m.piece]} from ${m.from} to ${m.to}. ${reasons.slice(0,2).join(' ')}${reply}`;
}
