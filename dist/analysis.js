import {Chess} from './vendor/chess.js';
export {Chess};
export const SAMPLE='[Event "Learning example"]\n[White "Curious player"]\n[Black "Practice partner"]\n[Result "1-0"]\n\n1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0';
export function parseGame(pgn){
 if(typeof pgn!=='string')throw Error('PGN must be text.');
 if(new TextEncoder().encode(pgn).length>150000)throw Error('Please import one game smaller than 150 KB.');
 if((pgn.match(/\[Event\s/g)||[]).length>1 || /(?:1-0|0-1|1\/2-1\/2|\*)\s+(?:\[|1\.)/.test(pgn.replace(/\{[^}]*\}/g,'')))throw Error('Please import one game at a time.');
 if(/\[Variant\s+"(?!Standard|Chess)[^"]+/i.test(pgn))throw Error('This version supports standard chess only.');
 const c=new Chess();try{c.loadPgn(pgn);}catch{throw Error('That PGN could not be read. Export a complete, legal PGN and try again.');}
 const moves=c.history({verbose:true});if(!moves.length)throw Error('No moves found. Paste a game with its move text.');
 if(moves.length>600)throw Error('Please use a game with fewer than 600 half-moves.');
 return {headers:c.getHeaders(),moves,fens:[moves[0].before,...moves.map(m=>m.after)]};
}
export function lineSAN(fen,pv=[]){const c=new Chess(fen);const out=[];for(const u of pv.slice(0,8)){try{const m=c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u.slice(4)||undefined});out.push(m.san);}catch{break;}}return out;}
export function classify(move,before,after){
 const c=new Chess(move.after);if(c.isCheckmate())return {kind:'good',title:'Delivered checkmate',text:'The king is in check and has no legal escape. You finished the game.',loss:0};
 if(!before||!after)return null;
 const sign=move.color==='w'?1:-1;const b=before.value*sign,a=after.value*sign;
 const u=move.from+move.to+(move.promotion||'');const matched=before.pv?.[0]===u;
 if(before.type==='mate'&&b>0&&!(after.type==='mate'&&a>0))return {kind:'mate',title:'Missed a forced mate',text:'The engine found a forced mate before this move, but no longer finds one afterward at this search budget. Explore the suggested line.',loss:0};
 if(after.type==='mate'&&a<0&&!(before.type==='mate'&&b<0))return {kind:'blunder',title:'Allowed a forced mate',text:'After this move, the engine finds a forced checkmate for your opponent. Replay their response, then compare the suggested move.',loss:0};
 if(before.type==='cp'&&after.type==='cp'){
 const loss=Math.max(0,b-a);const kind=loss>=300?'blunder':loss>=150?'mistake':loss>=50?'inaccuracy':matched?'good':'steady';
 const title={blunder:'A costly move',mistake:'A better option was available',inaccuracy:'A small opportunity missed',good:'Found the engine’s suggestion',steady:'Kept the position steady'}[kind];
 return {kind,title,loss,text:kind==='good'?'Your move matches the engine’s first choice at this search budget. Look at the continuation to see how it works.':kind==='steady'?'The engine sees little change in your position after this move.':({blunder:'This move made your position much harder to play. The engine found a stronger option. Compare the two moves and watch what your opponent can do next.',mistake:'This move gave your opponent a better position than necessary. Try the suggested move and compare the replies.',inaccuracy:'Your position became a little worse. There was a slightly better move available; try it on the board to see the difference.'}[kind])};
 }
 return {kind:matched?'good':'steady',title:matched?'Found the engine’s suggestion':'A forced-mate position',text:'The engine sees a path to checkmate. Replay the suggested moves to see how the king can be trapped. This quick review does not judge whether another move reaches checkmate faster.',loss:0};
}
