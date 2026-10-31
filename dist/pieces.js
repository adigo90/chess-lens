// Colin M. L. Burnett’s classic pieces, GPL-2.0-or-later. See credits.html.
// SVG assets avoid platform-specific chess glyphs and emoji rendering.
export function pieceSVG(type,color){
 if(typeof type!=='string'||type.length!==1||!'kqrbnp'.includes(type)||!['w','b'].includes(color))return '';
 return `<img src="assets/pieces/${color}${type.toUpperCase()}.svg" alt="" aria-hidden="true" draggable="false" width="45" height="45">`;
}
