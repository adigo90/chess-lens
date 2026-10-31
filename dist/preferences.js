// A browser-local display preference; never store game content here.
const key='chess-lens.hide-analysis-guide.v1';
let hidden=false;
export const guidePreference={
 get(){try{const saved=globalThis.localStorage.getItem(key);if(saved!==null)hidden=saved==='true';}catch{}return hidden;},
 set(value){hidden=Boolean(value);try{globalThis.localStorage.setItem(key,String(hidden));}catch{}return hidden;}
};

const playerKey='chess-lens.player-name.v1';
let player='';
export const playerPreference={
 get(){try{const saved=globalThis.localStorage.getItem(playerKey);if(saved!==null)player=saved;}catch{}return player;},
 set(value){player=String(value).trim();try{globalThis.localStorage.setItem(playerKey,player);}catch{}return player;}
};
export function detectSide(headers,username){
 const normalized=String(username||'').trim().toLowerCase();
 if(!normalized)return null;
 const white=String(headers.White||'').trim().toLowerCase()===normalized;
 const black=String(headers.Black||'').trim().toLowerCase()===normalized;
 return white===black?null:white?'w':'b';
}
