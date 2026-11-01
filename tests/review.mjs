import assert from 'node:assert/strict';
import {Chess,parseGame,SAMPLE} from '../dist/analysis.js';
import {selectMoments,continuation,coachMoment,takeawayFor} from '../dist/review.js';
const game=parseGame(SAMPLE);
assert.deepEqual(selectMoments(game,game.moves.map(()=>({kind:'inaccuracy',loss:60})),'w'),[]);
assert.deepEqual(selectMoments(game,game.moves.map(()=>({kind:'mistake',loss:170})),'b'),[1,3,5]);
const long={moves:Array.from({length:8},()=>({color:'w'}))};
assert.deepEqual(selectMoments(long,Array.from({length:8},(_,i)=>({kind:'mistake',loss:i*10})),'w'),[3,4,5,6,7]);
const mate=continuation(game.fens[6],['h5f7']);assert.equal(mate[0].mate,true);assert.match(mate[0].caption,/Checkmate/);
assert.equal(continuation(new Chess().fen(),['e2e5']).length,0);
const defense=coachMoment(game,5,{pv:['g7g6','h5f3']},{kind:'blunder',title:'Allowed a forced mate'});
assert.match(defense.text,/attacks the queen on h5/);assert.match(defense.text,/Qxf7#/);
assert.equal(defense.steps.length,2);assert.match(defense.steps[0].caption,/attacks the queen/);
const fallback=coachMoment(game,0,{pv:['a2a3']},{kind:'mistake',title:'A better option'});assert.match(fallback.text,/cannot confidently/);
assert.match(takeawayFor(['checks','checks','captures']),/look at your checks/);
assert.match(takeawayFor([]),/No major/);
console.log('Guided review: selection, legal playback, mate, defense explanation and takeaway passed');

// Every half-move, including opponent moves and the final mate, has a review.
for (const [i,m] of game.moves.entries()) {
 const pv=[m.from+m.to+(m.promotion||'')];
 const d=coachMoment(game,i,{pv},{kind:'good',title:'Found the engine’s suggestion'},'b');
 assert.ok(d.title && d.text && d.assessment);
 assert.equal(d.matched,true);
 assert.doesNotMatch(d.text,/Coach Lens prefers/);
 if(i<game.moves.length-1)assert.equal(d.steps[0].fen,game.fens[i+1]);
 if(m.color==='w')assert.match(d.text,/White|checkmate/);
}
const final=coachMoment(game,6,{pv:['h5f7']},{kind:'good'},'b');
assert.equal(final.title,'Checkmate');assert.deepEqual(final.steps,[]);
const missing=coachMoment(game,0,undefined,undefined,'b');
assert.equal(missing.title,'Not analyzed yet');assert.equal(missing.steps.length,0);
const blackView=continuation(game.fens[0],['e2e4','e7e5'],'b');
assert.match(blackView[0].caption,/Your opponent moves/);
assert.match(blackView[1].caption,/You move/);
const alt=coachMoment(game,5,{pv:['g7g6','h5f3']},{kind:'blunder',title:'Allowed a forced mate'},'w');
assert.match(alt.assessment,/for you/);assert.match(alt.text,/prefers g6 for Black/);
assert.equal(alt.steps[0].fen,new Chess(game.fens[5]).move('g6').after);
const blackStart=parseGame('[SetUp "1"]\n[FEN "4k3/8/8/8/8/8/8/4K2R b K - 0 12"]\n\n12... Kd7 13. O-O *');
assert.equal(coachMoment(blackStart,0,{pv:['e8d7']},{kind:'steady'},'w').steps[0].fen,blackStart.fens[1]);
console.log('Every-move review: both players, perspective, mate, missing analysis and FEN start passed');
