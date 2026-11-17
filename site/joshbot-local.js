export const FALLBACK="I'm having trouble thinking right now. You can reach Joshua directly through the Contact Me window.";
const tokens=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().match(/[a-z0-9]+/g)||[];
const stop=new Set('what where when how why is are does do did can could would should the a an me about tell show josh joshua his he you your i of to for and please want know'.split(' '));
export function localAnswer(message,faq){
 if(/ignore.*(instructions|rules)|system prompt|knowledge file|act as|reveal.*(private|prompt)|phone number|home address|financial details/i.test(message))return {answer:'I can help with Josh’s public background and this desktop, but I can’t share private details or internal instructions.',action:'contact'};
 if(/^(hi|hello|hey|cheers|thanks)[!. ]*$/i.test(message))return {answer:'Hey! I can help you find Josh’s resume, certificates, photos or contact details.'};
 if(/joke/i.test(message))return {answer:'Why did the computer get cold? It left its Windows open. Want to explore Josh’s desktop?',action:'about'};
 const words=tokens(message).filter(w=>!stop.has(w));if(!words.length)return {answer:'What would you like to know about Josh? Try his work, certificates, background or photo albums.'};
 let best=null,score=0;
 for(const entry of faq){const keys=new Set(tokens(entry.question+' '+entry.keywords)),matched=words.filter(w=>keys.has(w)),s=matched.length/Math.max(1,words.length)+matched.length*.12;if(s>score&&matched.length){best=entry;score=s;}}
 if(!best||score<.46)return {answer:'I don’t know that from Josh’s supplied public information. You can ask Joshua through the Contact Me window.',action:'contact'};
 return best;
}
