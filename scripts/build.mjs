import {access} from 'node:fs/promises';
const files=['index.html','app.js','style.css','pieces.js','preferences.js','assets/pieces/LICENSE.txt',...[...'wb'].flatMap(c=>[...'KQRBNP'].map(p=>`assets/pieces/${c}${p}.svg`)),'engine.js','analysis.js','coaching.js','review.js','assets/knight-lens.svg','assets/coach-knight.png','vendor/chess.js','vendor/stockfish-17.1-lite-single-03e3232.js','vendor/stockfish-17.1-lite-single-03e3232.wasm'];
for(const file of files)await access(new URL('../dist/'+file,import.meta.url));
console.log('Static release is ready in dist/');
