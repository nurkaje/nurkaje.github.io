/* Ludo Club game engine and UI — standalone, separate from portfolio. */
'use strict';
const PATH = [
  [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]
];
const HOME_LANES = {
  red:[[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  yellow:[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  blue:[[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  green:[[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]]
};
const BASES = {
  red:[[1,1],[1,3],[3,1],[3,3]],
  yellow:[[1,11],[1,13],[3,11],[3,13]],
  green:[[11,1],[11,3],[13,1],[13,3]],
  blue:[[11,11],[11,13],[13,11],[13,13]]
};
const START_INDEX={red:0,yellow:13,blue:26,green:39};
const SAFE_INDEXES=new Set([0,8,13,21,26,34,39,47]);
const MAIN_PATH_LAST_PROGRESS=50,HOME_ENTRY_PROGRESS=51,FINISH_PROGRESS=56;
const ACTIVE=['red','blue'];
const board=document.getElementById('board'),turnEl=document.getElementById('turn');
const diceEl=document.getElementById('dice'),statusEl=document.getElementById('status');
const rollBtn=document.getElementById('rollBtn'),resetBtn=document.getElementById('resetBtn');
let state;
function makeState(){
  return {current:'red',dice:null,awaitingMove:false,animating:false,winner:null,
    rng:{red:{noSix:0,last:0,consSix:0},blue:{noSix:0,last:0,consSix:0}},
    players:{red:{name:'Crveni',pieces:Array.from({length:4},()=>({progress:-1}))},
      blue:{name:'Plavi',pieces:Array.from({length:4},()=>({progress:-1}))},
      yellow:{name:'Žuti',pieces:Array.from({length:4},()=>({progress:-1,disabled:true}))},
      green:{name:'Zeleni',pieces:Array.from({length:4},()=>({progress:-1,disabled:true}))}}};
}
function inCoords(list,target){return list.some(([r,c])=>r===target[0]&&c===target[1]);}
function buildBoard(){
  board.innerHTML='';
  const pathMap=new Map(PATH.map((c,i)=>[c.join(','),i]));
  const laneSets=Object.fromEntries(Object.entries(HOME_LANES).map(([k,v])=>[k,new Set(v.map(x=>x.join(',')))]));
  for(let r=0;r<15;r++)for(let c=0;c<15;c++){
    const cell=document.createElement('div');cell.className='cell';cell.dataset.row=r;cell.dataset.col=c;
    const key=`${r},${c}`;const inCross=(r>=6&&r<=8)||(c>=6&&c<=8);
    const inAnyBase=Object.values(BASES).some(arr=>arr.some(([rr,cc])=>rr===r&&cc===c));
    if(!inCross&&!inAnyBase)cell.classList.add('void');
    else if(['6,6','6,8','8,6','8,8'].includes(key))cell.classList.add('hidden-cross');
    else if(key==='7,7')cell.classList.add('center');
    else if(inCoords(BASES.red,[r,c]))cell.classList.add('red-home');
    else if(inCoords(BASES.yellow,[r,c]))cell.classList.add('yellow-home');
    else if(inCoords(BASES.green,[r,c]))cell.classList.add('green-home');
    else if(inCoords(BASES.blue,[r,c]))cell.classList.add('blue-home');
    else if(laneSets.red.has(key))cell.classList.add('red-lane');
    else if(laneSets.yellow.has(key))cell.classList.add('yellow-lane');
    else if(laneSets.green.has(key))cell.classList.add('green-lane');
    else if(laneSets.blue.has(key))cell.classList.add('blue-lane');
    else cell.classList.add('path');
    if(pathMap.has(key)&&SAFE_INDEXES.has(pathMap.get(key)))cell.classList.add('safe');
    if(pathMap.get(key)===START_INDEX.red||pathMap.get(key)===START_INDEX.blue)cell.classList.add('start-mark');
    if(inAnyBase){const slot=document.createElement('div');slot.className='home-slot';cell.appendChild(slot);}
    board.appendChild(cell);
  }
}
function cellAt(coord){return board.querySelector(`.cell[data-row="${coord[0]}"][data-col="${coord[1]}"]`);}
function countBase(color){return state.players[color].pieces.filter(p=>p.progress===-1).length;}
function countDone(color){return state.players[color].pieces.filter(p=>p.progress===FINISH_PROGRESS).length;}
function pieceCoord(color,index){
  const p=state.players[color].pieces[index];
  if(p.progress===-1)return BASES[color][index];
  if(p.progress<=MAIN_PATH_LAST_PROGRESS)return PATH[(START_INDEX[color]+p.progress)%52];
  if(p.progress<=FINISH_PROGRESS)return HOME_LANES[color][p.progress-HOME_ENTRY_PROGRESS];
  return HOME_LANES[color][5];
}
function absIndex(color,progress){return(START_INDEX[color]+progress)%52;}
function validMove(color,index,dice=state.dice){
  if(dice==null)return false;
  const p=state.players[color].pieces[index];
  if(p.progress===FINISH_PROGRESS)return false;
  if(p.progress===-1)return dice===6;
  return p.progress+dice<=FINISH_PROGRESS;
}
function selectable(color,index){return state.awaitingMove&&!state.animating&&color===state.current&&validMove(color,index);}
function validIndexes(color){return state.players[color].pieces.map((_,i)=>validMove(color,i)?i:null).filter(v=>v!==null);}
function render(){
  board.querySelectorAll('.piece-stack').forEach(x=>x.remove());
  board.querySelectorAll('.highlight').forEach(x=>{x.classList.remove('highlight');x.onclick=null;});
  const map=new Map();
  ['red','yellow','green','blue'].forEach(color=>state.players[color].pieces.forEach((_,i)=>{
    const key=pieceCoord(color,i).join(',');if(!map.has(key))map.set(key,[]);map.get(key).push({color,index:i});
  }));
  map.forEach((stack,key)=>{
    const coord=key.split(',').map(Number),cell=cellAt(coord);if(!cell)return;
    const stackEl=document.createElement('div');stackEl.className=`piece-stack stack-${Math.min(stack.length,4)}`;
    const firstSelectable=stack.find(x=>selectable(x.color,x.index));
    if(firstSelectable){cell.classList.add('highlight');cell.onclick=()=>movePiece(firstSelectable.color,firstSelectable.index);}
    stack.forEach((item,idx)=>{
      const b=document.createElement('button');b.type='button';b.className=`piece ${item.color}`;b.dataset.stackIndex=idx;
      b.setAttribute('aria-label',`${item.color} token ${item.index+1}`);
      if(selectable(item.color,item.index)){b.classList.add('clickable');b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();movePiece(item.color,item.index);});}
      else b.disabled=true;
      stackEl.appendChild(b);
    });
    cell.appendChild(stackEl);
  });updatePanel();
}
function updatePanel(){
  turnEl.textContent=`Na redu: ${state.players[state.current].name}`;
  turnEl.style.background=state.current==='red'?'rgba(239,68,68,.18)':'rgba(59,130,246,.18)';
  diceEl.textContent=state.dice??'?';
  document.getElementById('redBase').textContent=`${countBase('red')}/4`;
  document.getElementById('blueBase').textContent=`${countBase('blue')}/4`;
  document.getElementById('redDone').textContent=`${countDone('red')}/4`;
  document.getElementById('blueDone').textContent=`${countDone('blue')}/4`;
  rollBtn.disabled=state.awaitingMove||state.animating||!!state.winner;
  if(state.winner){statusEl.textContent=`Pobjeda: ${state.players[state.winner].name}.`;return;}
  if(state.animating){statusEl.textContent='Pomjeranje pijuna...';return;}
  if(state.awaitingMove){const v=validIndexes(state.current);statusEl.textContent=v.length?`${state.players[state.current].name}, klikni označeni pijun ili njegovo polje.`:`${state.players[state.current].name} nema validan potez.`;return;}
  statusEl.textContent=state.dice==null?'Baci kocku da počneš.':`${state.players[state.current].name} je bacio ${state.dice}.`;
}
function chooseDice(color){
  const s=state.rng[color],weights={1:1,2:1,3:1,4:1,5:1,6:1};
  if(countBase(color)===4)weights[6]+=.18;
  if(s.noSix>=5)weights[6]+=.10;
  if(s.consSix>=1)weights[6]-=.10;
  weights[6]=Math.max(.92,weights[6]);
  const total=Object.values(weights).reduce((a,b)=>a+b,0);
  let pick=Math.random()*total,value=6;
  for(let i=1;i<=6;i++){pick-=weights[i];if(pick<=0){value=i;break;}}
  if(value===6){s.noSix=0;s.consSix+=1;}else{s.noSix+=1;s.consSix=0;}
  s.last=value;return value;
}
function rollDice(){
  if(state.awaitingMove||state.animating||state.winner)return;
  rollBtn.disabled=true;
  diceEl.classList.remove('roll');void diceEl.offsetWidth;diceEl.classList.add('roll');
  const value=chooseDice(state.current);
  setTimeout(()=>{state.dice=value;state.awaitingMove=true;render();if(validIndexes(state.current).length===0)setTimeout(()=>endTurn(value===6),500);},430);
}
async function movePiece(color,index){
  if(!selectable(color,index))return;
  const p=state.players[color].pieces[index],dice=state.dice,extra=dice===6;
  state.awaitingMove=false;state.animating=true;render();
  if(p.progress===-1){p.progress=0;render();await wait(220);}else{for(let i=0;i<dice;i++){p.progress+=1;render();await wait(160);}}
  capture(color,index);render();await wait(200);
  if(countDone(color)===4){state.winner=color;state.dice=null;state.animating=false;render();return;}
  state.animating=false;state.dice=null;render();setTimeout(()=>endTurn(extra),140);
}
function capture(color,index){
  const p=state.players[color].pieces[index];if(p.progress<0||p.progress>MAIN_PATH_LAST_PROGRESS)return;
  const abs=absIndex(color,p.progress);if(SAFE_INDEXES.has(abs))return;
  ACTIVE.filter(c=>c!==color).forEach(enemy=>state.players[enemy].pieces.forEach(ep=>{
    if(ep.progress<0||ep.progress>51)return;
    if(absIndex(enemy,ep.progress)===abs)ep.progress=-1;
  }));
}
function endTurn(extra){
  if(state.winner)return;
  state.awaitingMove=false;state.animating=false;state.dice=null;
  if(!extra)state.current=state.current==='red'?'blue':'red';render();
}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}
function reset(){state=makeState();render();}
rollBtn.addEventListener('pointerdown',e=>{e.preventDefault();rollDice();});
resetBtn.addEventListener('pointerdown',e=>{e.preventDefault();reset();});
// Keyboard activate buttons via click without duplicate pointer events.
rollBtn.addEventListener('click',e=>{if(e.detail===0)rollDice();});
resetBtn.addEventListener('click',e=>{if(e.detail===0)reset();});
buildBoard();reset();
