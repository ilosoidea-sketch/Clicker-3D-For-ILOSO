import { bindKeyPress } from './animation.js';
import { calculatePrice, sendWhatsAppOrder } from './upgrade.js';

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
  const value = text.trim().toUpperCase() || (layout === 'grid' ? 'LOVE' : 'ILOSO');
  const chars = splitCharacters(value).slice(0, layout === 'grid' ? 4 : 6);
  if (layout === 'grid') while (chars.length < 4) chars.push('★');
  return chars;
}
function shade(hex, factor) {
  const values = hex.match(/[a-f0-9]{2}/gi).map(value => Math.round(parseInt(value, 16) * factor));
  return `rgb(${values.join(',')})`;
}
// Tangent faces close the perimeter even when viewed at exactly 90 degrees.
function updateRim(parent, faces, width, height, radius, depth, z, color) {
  const points = [];
  const corners = [[width-radius,radius,-90], [width-radius,height-radius,0], [radius,height-radius,90], [radius,radius,180]];
  corners.forEach(([x,y,start]) => {
    for (let step=0; step<=8; step++) {
      const angle=(start+step*90/8)*Math.PI/180;
      points.push([x+radius*Math.cos(angle),y+radius*Math.sin(angle)]);
    }
  });
  points.forEach(([x,y], i) => {
    const [nextX,nextY]=points[(i+1)%points.length];
    let face=faces[i];
    if (!face) { face=document.createElement('span'); face.className='extrusion-wall'; parent.appendChild(face); faces.push(face); }
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
  let curBase = BASE_COLORS[0], curTop = TOP_COLORS[10], curFont = FONT_COLORS[0];
  let curCharm = { icon: null, name: 'Tanpa Charm', price: 0 };
  const nameInput = document.getElementById('nameInput');
  const caseFront = document.getElementById('caseFront');
  const casing = document.getElementById('casingBlock');
  const attachedCharm = document.getElementById('attachedCharm');
  let composing = false;
  const depths = [];
  const casingRim = [];
  // Matching rounded cross-sections close the original open/inconsistent side walls.
  for (let z = -11; z < 12; z++) {
    const layer = document.createElement('div');
    layer.className = 'case-depth';
    layer.style.transform = `translateZ(${z}px)`;
    casing.insertBefore(layer, caseFront);
    depths.push(layer);
  }
  function update3D() {
    const max = currentLayout === 'grid' ? 4 : 6;
    const cleaned = splitCharacters(nameInput.value.toUpperCase()).slice(0, max).join('');
    if (nameInput.value !== cleaned) nameInput.value = cleaned;
    const chars = resolveCharacters(nameInput.value, currentLayout);
    casing.style.width = (currentLayout === 'grid' ? 134 : 74) + 'px';
    casing.style.height = (currentLayout === 'grid' ? 134 : 24 + chars.length * 50 + (chars.length - 1) * 10) + 'px';
    updateRim(casing, casingRim, currentLayout === 'grid' ? 134 : 74, currentLayout === 'grid' ? 134 : 24 + chars.length * 50 + (chars.length - 1) * 10, 16, 24, 0, shade(curBase.hex, .78));
    caseFront.style.backgroundColor = curBase.hex;
    document.getElementById('caseBack').style.backgroundColor = shade(curBase.hex, .65);
    depths.forEach((layer, index) => { layer.style.backgroundColor = shade(curBase.hex, .63 + index / 23 * .20); });
    caseFront.replaceChildren();
    caseFront.className = 'case-front ' + (currentLayout === 'grid' ? 'layout-grid' : 'layout-linear');
    chars.forEach(char => {
      const key = document.createElement('button');
      key.type = 'button';
      key.className = 'keycap-assembly';
      const label = char === ' ' ? 'spasi' : char;
      key.setAttribute('aria-label', `Tekan tombol ${label}`);
      key.setAttribute('aria-pressed', 'false');
      for (let z = 0; z < 10; z++) {
        const layer = document.createElement('span');
        layer.className = 'keycap-layer';
        layer.style.transform = `translateZ(${z}px)`;
        layer.style.backgroundColor = shade(curTop.hex, .60 + z * .025);
        key.appendChild(layer);
      }
      updateRim(key, [], 50, 50, 10, 10, 5, shade(curTop.hex, .78));
      const top = document.createElement('span');
      top.className = 'keycap-wall keycap-top';
      top.style.backgroundColor = curTop.hex;
      top.style.color = curFont.hex;
      top.textContent = char;
      key.appendChild(top);
      bindKeyPress(key, label);
      caseFront.appendChild(key);
    });
    document.getElementById('charCount').textContent = `${splitCharacters(nameInput.value).length}/${max}`;
    nameInput.setAttribute('aria-label', `Teks pada tombol, maksimal ${max} karakter`);
    document.getElementById('labelBase').textContent = curBase.name;
    document.getElementById('labelTop').textContent = curTop.name;
    document.getElementById('labelFont').textContent = curFont.name;
    const { basePrice, desc } = calculatePrice(currentLayout, chars.length);
    document.getElementById('priceDesc').textContent = desc;
    document.getElementById('priceBaseVal').textContent = 'Rp ' + basePrice.toLocaleString('id-ID');
    document.getElementById('priceCharmVal').textContent = 'Free';
    document.getElementById('priceTotalVal').textContent = 'Rp ' + basePrice.toLocaleString('id-ID');
  }
  for (const [id, layout] of [['btnLinear', 'linear'], ['btnGrid', 'grid']]) {
    document.getElementById(id).addEventListener('click', () => {
      currentLayout = layout;
      for (const [btn, target] of [['btnLinear', 'linear'], ['btnGrid', 'grid']]) {
        const selected = currentLayout === target;
        document.getElementById(btn).classList.toggle('active', selected);
        document.getElementById(btn).setAttribute('aria-pressed', String(selected));
      }
      update3D();
    });
  }
  nameInput.addEventListener('compositionstart', () => { composing = true; });
  nameInput.addEventListener('compositionend', () => { composing = false; update3D(); });
  nameInput.addEventListener('input', () => { if (!composing) update3D(); });
  document.querySelectorAll('.glyph-btn').forEach(button => {
    button.addEventListener('click', () => {
      if (splitCharacters(nameInput.value).length < (currentLayout === 'grid' ? 4 : 6)) {
        nameInput.value += button.dataset.glyph;
        update3D();
      }
    });
  });
  document.querySelectorAll('.charm-card').forEach(card => {
    card.setAttribute('aria-pressed', String(card.classList.contains('selected')));
    card.addEventListener('click', () => {
      document.querySelectorAll('.charm-card').forEach(other => {
        other.classList.toggle('selected', other === card);
        other.setAttribute('aria-pressed', String(other === card));
      });
      curCharm = { icon: card.dataset.icon || null, name: card.dataset.name, price: 0 };
      attachedCharm.textContent = curCharm.icon || '';
      attachedCharm.style.display = curCharm.icon ? 'block' : 'none';
      update3D();
    });
  });
  function palette(id, items, selected, onSelect) {
    const container = document.getElementById(id);
    items.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch-item' + (item === selected ? ' selected' : '');
      button.style.backgroundColor = item.hex;
      button.title = item.name;
      button.setAttribute('aria-label', item.name);
      button.setAttribute('aria-pressed', String(item === selected));
      button.addEventListener('click', () => {
        container.querySelectorAll('button').forEach(other => {
          other.classList.toggle('selected', other === button);
          other.setAttribute('aria-pressed', String(other === button));
        });
        onSelect(item); update3D();
      });
      container.appendChild(button);
    });
  }
  palette('baseSwatches', BASE_COLORS, curBase, item => { curBase = item; });
  palette('topSwatches', TOP_COLORS, curTop, item => { curTop = item; });
  palette('fontSwatches', FONT_COLORS, curFont, item => { curFont = item; });
  document.getElementById('orderWAFun').addEventListener('click', () => {
    const text = resolveCharacters(nameInput.value, currentLayout).join('');
    sendWhatsAppOrder(currentLayout, text, curBase, curTop, curFont, curCharm, document.getElementById('priceTotalVal').textContent);
  });
  update3D();
}
