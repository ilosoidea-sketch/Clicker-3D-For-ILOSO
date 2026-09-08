import { bindKeyPress } from './animation.js';
import { calculatePrice, sendWhatsAppOrder } from './upgrade.js';
import { LAYOUTS, positionsFor } from './layouts.js';

export const BASE_COLORS = [
  { name: "Pink", hex: "#ec4899" },
  { name: "Biru Tua", hex: "#1d4ed8" },
  { name: "Biru Muda", hex: "#38bdf8" },
  { name: "Abu", hex: "#94a3b8" },
  { name: "Merah", hex: "#dc2626" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Cream", hex: "#fef08a", border: true },
  { name: "Coklat", hex: "#78350f" },
  { name: "Kuning", hex: "#facc15" },
  { name: "Ungu", hex: "#8b5cf6" },
  { name: "Hitam", hex: "#1e293b" },
  { name: "Putih", hex: "#f8fafc", border: true },
  { name: "Hijau", hex: "#22c55e" }
];

export const TOP_COLORS = [
  { name: "Merah", hex: "#dc2626" },
  { name: "Kuning", hex: "#facc15" },
  { name: "Biru Tua", hex: "#1d4ed8" },
  { name: "Hitam", hex: "#1e293b" },
  { name: "Ungu Muda", hex: "#c084fc" },
  { name: "Ungu", hex: "#7c3aed" },
  { name: "Abu", hex: "#94a3b8" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Hijau", hex: "#22c55e" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Putih", hex: "#ffffff", border: true },
  { name: "Biru Muda", hex: "#38bdf8" }
];

export const FONT_COLORS = [
  { name: "Merah", hex: "#dc2626" },
  { name: "Kuning", hex: "#eab308" },
  { name: "Hijau Muda", hex: "#4ade80" },
  { name: "Biru", hex: "#2563eb" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Putih", hex: "#ffffff", border: true },
  { name: "Abu", hex: "#94a3b8" },
  { name: "Hitam", hex: "#0f172a" },
  { name: "Ungu", hex: "#8b5cf6" }
];

const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('id', { granularity: 'grapheme' }) : null;
export const splitCharacters = text => segmenter ? Array.from(segmenter.segment(text), item => item.segment) : Array.from(text);
export function resolveCharacters(text, layout) {
  const model = LAYOUTS[layout];
  const fallback = layout === 'arrow' ? '↑←↓→' : (layout === 'linear' ? 'ILOSO' : 'LOVE');
  const chars = splitCharacters(text.trim().toUpperCase() || fallback).slice(0, model.max);
  if (model.count) while (chars.length < model.count) chars.push('★');
  return chars;
}
export function assignedColor(editor, index) {
  return editor.colors[editor.dual && editor.assignments[index] === 1 ? 1 : 0];
}
export function describeAssignments(editor, count) {
  const groups = new Map();
  for (let i=0; i<count; i++) {
    const color = assignedColor(editor,i);
    if (!groups.has(color.hex)) groups.set(color.hex, {name:color.name, numbers:[]});
    groups.get(color.hex).numbers.push(i+1);
  }
  return Array.from(groups.values(), g => `${g.name}: kotak ${g.numbers.join(', ')}`).join(' | ');
}
function shade(hex, factor) {
  const values = hex.match(/[a-f0-9]{2}/gi).map(value => Math.round(parseInt(value, 16) * factor));
  return `rgb(${values.join(',')})`;
}
// Tangent faces close the perimeter even when viewed at exactly 90 degrees.
function updateRim(parent, faces, width, height, radius, depth, z, color, polygon = null) {
  const points = [];
  const corners = [[width-radius,radius,-90], [width-radius,height-radius,0], [radius,height-radius,90], [radius,radius,180]];
  corners.forEach(([x,y,start]) => {
    for (let step=0; step<=8; step++) {
      const angle=(start+step*90/8)*Math.PI/180;
      points.push([x+radius*Math.cos(angle),y+radius*Math.sin(angle)]);
    }
  });
  if (polygon) points.splice(0, points.length, ...polygon);
  faces.forEach((face, i) => { face.hidden = i >= points.length; });
  points.forEach(([x,y], i) => {
    const [nextX,nextY]=points[(i+1)%points.length];
    let face=faces[i];
    if (!face) { face=document.createElement('span'); face.className='extrusion-wall'; parent.appendChild(face); faces.push(face); }
    face.hidden = false;
    face.style.left=(x+nextX)/2+'px';
    face.style.top=(y+nextY)/2+'px';
    face.style.width=(Math.hypot(nextX-x,nextY-y)+.3)+'px';
    face.style.height=depth+'px';
    face.style.backgroundColor=color;
    face.style.transform=`translate(-50%, -50%) translateZ(${z}px) rotateZ(${Math.atan2(nextY-y,nextX-x)}rad) rotateX(90deg)`;
  });
}
export function initObjectStudio() {
  let currentLayout = 'linear';
  let curBase = BASE_COLORS[0];
  let curCharm = { icon: null, name: 'Tanpa Charm', price: 0 };
  const $ = id => document.getElementById(id);
  const nameInput = $('nameInput'), caseFront = $('caseFront'), casing = $('casingBlock');
  const topEditor = { prefix:'top', colors:[TOP_COLORS[10],TOP_COLORS[1]], dual:false, active:0, assignments:[] };
  const fontEditor = { prefix:'font', colors:[FONT_COLORS[0],FONT_COLORS[8]], dual:false, active:0, assignments:[] };
  const editors = [topEditor, fontEditor];
  const savedLayouts = new Map();
  const depths = [], casingRim = [], keys = [];
  let composing = false;
  for (let z=-11; z<12; z++) {
    const layer=document.createElement('div'); layer.className='case-depth';
    layer.style.transform=`translateZ(${z}px)`; casing.insertBefore(layer,caseFront); depths.push(layer);
  }
  const frontPlate=document.createElement('div'); frontPlate.className='front-plate';
  const layoutButtons=[];
  Object.entries(LAYOUTS).forEach(([id, model]) => {
    const button=document.createElement('button'); button.type='button'; button.className='layout-btn';
    button.dataset.layout=id;
    button.textContent=model.label + (model.count ? ` · ${model.count} kotak · Rp${model.price.toLocaleString('id-ID')}` : ' · 1–6 tombol');
    button.addEventListener('click', () => {
      if (currentLayout === id) return;
      savedLayouts.set(currentLayout,{text:nameInput.value, top:[...topEditor.assignments], font:[...fontEditor.assignments]});
      const prior=savedLayouts.get(id);
      currentLayout=id;
      nameInput.value=prior ? prior.text : (id==='arrow' ? '↑←↓→' : nameInput.value);
      topEditor.assignments=prior ? [...prior.top] : [];
      fontEditor.assignments=prior ? [...prior.font] : [];
      render();
    });
    $('layoutSwitcher').appendChild(button);layoutButtons.push(button);
  });
  function render() {
    const model=LAYOUTS[currentLayout];
    const text=splitCharacters(nameInput.value.toUpperCase()).slice(0,model.max).join('');
    if(nameInput.value!==text) nameInput.value=text;
    const chars=resolveCharacters(nameInput.value,currentLayout);
    const positions=positionsFor(currentLayout,chars.length);
    const rows=currentLayout==='linear'?chars.length:model.rows;
    const width=14+model.cols*60, height=14+rows*60;
    const arrow=currentLayout==='arrow';
    const outline=arrow?[[60,0],[134,0],[134,60],[194,60],[194,134],[0,134],[0,60],[60,60]]:null;
    const clip=arrow?'polygon('+outline.map(([x,y])=>`${x}px ${y}px`).join(',')+')':'';
    casing.style.width=width+'px';casing.style.height=height+'px';
    updateRim(casing,casingRim,width,height,16,24,0,shade(curBase.hex,.78),outline);
    const back=$('caseBack');back.style.backgroundColor=shade(curBase.hex,.65);
    back.style.clipPath=clip;back.style.borderRadius=arrow?'0':'16px';
    depths.forEach((layer,index)=>{
      layer.style.backgroundColor=shade(curBase.hex,.63+index/23*.20);layer.style.clipPath=clip;layer.style.borderRadius=arrow?'0':'16px';
    });
    caseFront.replaceChildren();caseFront.className='case-front layout-positioned';
    frontPlate.style.backgroundColor=curBase.hex;frontPlate.style.clipPath=clip;frontPlate.style.borderRadius=arrow?'0':'16px';
    caseFront.appendChild(frontPlate);keys.length=0;
    chars.forEach((char,index)=>{
      const key=document.createElement('button');key.type='button';key.className='keycap-assembly';
      key.dataset.number=String(index+1);
      key.style.left=12+positions[index][1]*60+'px';key.style.top=12+positions[index][0]*60+'px';
      const label=`${index+1}: ${char===' '?'spasi':char}`;
      key.setAttribute('aria-label',`Tekan kotak ${label}`);key.setAttribute('aria-pressed','false');
      const layers=[];
      for(let z=0;z<10;z++) {
        const layer=document.createElement('span');layer.className='keycap-layer';layer.style.transform=`translateZ(${z}px)`;
        key.appendChild(layer);layers.push(layer);
      }
      const rim=[];updateRim(key,rim,50,50,10,10,5,'#fff');
      const face=document.createElement('span');face.className='keycap-wall keycap-top';face.textContent=char;
      const number=document.createElement('small');number.className='key-number';number.textContent=String(index+1);number.setAttribute('aria-hidden','true');
      face.appendChild(number);key.appendChild(face);caseFront.appendChild(key);
      bindKeyPress(key,label);keys.push({face,layers,rim});
    });
    paintKeys();
    $('charCount').textContent=`${splitCharacters(nameInput.value).length}/${model.max}`;
    nameInput.setAttribute('aria-label',`Teks tombol, maksimal ${model.max} karakter`);
    $('layoutInfo').textContent=arrow?'Arrow: kotak 1 di atas, kotak 2–4 dari kiri ke kanan di bawah.':currentLayout==='linear'?'Baris vertikal, nomor dari atas ke bawah.':`${model.rows} baris × ${model.cols} kolom. Nomor dari kiri ke kanan, lalu baris berikutnya.`;
    layoutButtons.forEach(button=>{const selected=button.dataset.layout===currentLayout;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
    $('labelBase').textContent=curBase.name;
    const {basePrice,desc}=calculatePrice(currentLayout,chars.length);
    $('priceDesc').textContent=desc;$('priceBaseVal').textContent='Rp '+basePrice.toLocaleString('id-ID');
    $('priceCharmVal').textContent='Free';$('priceTotalVal').textContent='Rp '+basePrice.toLocaleString('id-ID');
    editors.forEach(editor=>renderEditor(editor,positions));
  }
  function paintKeys() {
    keys.forEach(({face,layers,rim},index)=>{
      const top=assignedColor(topEditor,index),font=assignedColor(fontEditor,index);
      face.style.backgroundColor=top.hex;face.style.color=font.hex;
      layers.forEach((layer,z)=>{layer.style.backgroundColor=shade(top.hex,.60+z*.025);});
      rim.forEach(layer=>{layer.style.backgroundColor=shade(top.hex,.78);});
    });
  }
  function renderEditor(editor, positions = positionsFor(currentLayout,keys.length)) {
    const p=editor.prefix;
    $(p+'Single').setAttribute('aria-pressed',String(!editor.dual));
    $(p+'Dual').setAttribute('aria-pressed',String(editor.dual));
    $(p+'SlotB').hidden=!editor.dual;$(p+'Assignment').hidden=!editor.dual;
    ['A','B'].forEach((slot,index)=>{
      const b=$(p+'Slot'+slot);b.textContent=`Warna ${slot}: ${editor.colors[index].name}`;
      b.style.borderBottomColor=editor.colors[index].hex;b.setAttribute('aria-pressed',String(editor.active===index));
    });
    $('label'+(p==='top'?'Top':'Font')).textContent=editor.dual?editor.colors.map(c=>c.name).join(' + '):editor.colors[0].name;
    $(p+'Swatches').querySelectorAll('button').forEach(button=>{
      const selected=button.dataset.color===editor.colors[editor.active].hex;
      button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
    });
    const map=$(p+'Map');map.replaceChildren();map.style.gridTemplateColumns=`repeat(${LAYOUTS[currentLayout].cols}, minmax(0, 1fr))`;
    positions.forEach(([row,col],index)=>{
      const button=document.createElement('button');button.type='button';button.className='number-cell';
      button.style.gridRow=String(row+1);button.style.gridColumn=String(col+1);
      function refresh(){
        const slot=editor.dual&&editor.assignments[index]===1?1:0;
        button.textContent=`${index+1} · ${slot?'B':'A'}`;
        button.style.borderTopColor=editor.colors[slot].hex;
        button.setAttribute('aria-pressed',String(slot===1));
        button.setAttribute('aria-label',`Kotak ${index+1}: warna ${slot?'B':'A'}, ${editor.colors[slot].name}. Klik untuk mengganti.`);
      }
      refresh();button.addEventListener('click',()=>{
        editor.assignments[index]=editor.assignments[index]===1?0:1;refresh();paintKeys();
        $(p+'Summary').textContent=describeAssignments(editor,keys.length);
      });
      map.appendChild(button);
    });
    $(p+'Summary').textContent=describeAssignments(editor,keys.length);
  }
  function palette(id,items,onSelect) {
    const container=$(id);
    items.forEach(item=>{
      const b=document.createElement('button');b.type='button';b.className='swatch-item';b.dataset.color=item.hex;
      b.style.backgroundColor=item.hex;b.title=item.name;b.setAttribute('aria-label',item.name);
      b.addEventListener('click',()=>onSelect(item,b));container.appendChild(b);
    });
  }
  palette('baseSwatches',BASE_COLORS,(item)=>{
    curBase=item;$('baseSwatches').querySelectorAll('button').forEach(b=>{const active=b.dataset.color===item.hex;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});render();
  });
  $('baseSwatches').querySelectorAll('button').forEach(b=>{const active=b.dataset.color===curBase.hex;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  editors.forEach(editor=>{
    const p=editor.prefix;
    palette(p+'Swatches',p==='top'?TOP_COLORS:FONT_COLORS,item=>{editor.colors[editor.active]=item;paintKeys();renderEditor(editor);});
    ['Single','Dual'].forEach(mode=>$(p+mode).addEventListener('click',()=>{editor.dual=mode==='Dual';if(!editor.dual)editor.active=0;paintKeys();renderEditor(editor);}));
    ['A','B'].forEach((slot,index)=>$(p+'Slot'+slot).addEventListener('click',()=>{editor.active=index;renderEditor(editor);}));
  });
  nameInput.addEventListener('compositionstart',()=>{composing=true;});
  nameInput.addEventListener('compositionend',()=>{composing=false;render();});
  nameInput.addEventListener('input',()=>{if(!composing)render();});
  document.querySelectorAll('.glyph-btn').forEach(button=>button.addEventListener('click',()=>{
    if(splitCharacters(nameInput.value).length<LAYOUTS[currentLayout].max){nameInput.value+=button.dataset.glyph;render();}
  }));
  document.querySelectorAll('.charm-card').forEach(card=>{
    card.setAttribute('aria-pressed',String(card.classList.contains('selected')));
    card.addEventListener('click',()=>{
      document.querySelectorAll('.charm-card').forEach(other=>{other.classList.toggle('selected',other===card);other.setAttribute('aria-pressed',String(other===card));});
      curCharm={icon:card.dataset.icon||null,name:card.dataset.name,price:0};
      $('attachedCharm').textContent=curCharm.icon||'';$('attachedCharm').style.display=curCharm.icon?'block':'none';
    });
  });
  $('orderWAFun').addEventListener('click',()=>{
    const chars=resolveCharacters(nameInput.value,currentLayout);
    sendWhatsAppOrder(currentLayout,chars.join(''),curBase,
      {name:describeAssignments(topEditor,chars.length)}, {name:describeAssignments(fontEditor,chars.length)},
      curCharm,$('priceTotalVal').textContent);
  });
  render();
}
