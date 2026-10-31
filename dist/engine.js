export class Engine {
 constructor(){this.worker=null;this.pending=null;}
 async init(){this.worker=new Worker('./vendor/stockfish-17.1-lite-single-03e3232.js');
 this.worker.onmessage=e=>this.receive(String(e.data));
 this.worker.onerror=()=>this.fail(Error('The analysis engine could not load. Try a recent browser and reload the page.'));
 await this.waitFor('uciok','uci',20000);this.send('setoption name Hash value 32');await this.waitFor('readyok','isready',10000);}
 send(s){this.worker.postMessage(s);}
 waitFor(token,cmd,timeout){return new Promise((resolve,reject)=>{this.pending={token,resolve,reject,timer:setTimeout(()=>this.fail(Error('Engine timed out. Please retry analysis.')),timeout)};this.send(cmd);});}
 receive(line){const p=this.pending;if(!p)return;
 if(p.token==='bestmove'&&line.startsWith('info ')&&!/lowerbound|upperbound/.test(line)){
 const score=line.match(/score (cp|mate) (-?\d+)/),pv=line.match(/ pv (.+)$/),depth=line.match(/depth (\d+)/);
 if(score)p.result={type:score[1],value:Number(score[2])*p.sign,pv:pv?pv[1].trim().split(' '):[],depth:depth?Number(depth[1]):0};}
 if(line.startsWith(p.token)){clearTimeout(p.timer);this.pending=null;p.resolve(p.result);}}
 async evaluate(fen,ms){this.send('position fen '+fen);const promise=this.waitFor('bestmove','go movetime '+ms,Math.max(15000,ms*5));this.pending.sign=fen.split(' ')[1]==='w'?1:-1;return promise;}
 fail(error){if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(error);this.pending=null;}}
 close(){this.fail(Error('Analysis stopped.'));this.worker?.terminate();this.worker=null;}
}
