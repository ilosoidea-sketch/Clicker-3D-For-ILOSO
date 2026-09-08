import { playClickSound } from './animation.js';
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

export function initObjectStudio() {
  let currentLayout = "linear";
  let curBase = BASE_COLORS[0];
  let curTop = TOP_COLORS[10];
  let curFont = FONT_COLORS[0];
  let curCharm = { icon: null, name: "Tanpa Charm", price: 0 };

  const nameInput = document.getElementById("nameInput");
  const caseFront = document.getElementById("caseFront");
  const casingBlock = document.getElementById("casingBlock");
  const attachedCharm = document.getElementById("attachedCharm");

  function update3D() {
    let rawText = nameInput.value;
    if (!rawText || rawText.length === 0) {
      rawText = currentLayout === "grid" ? "LOVE" : "ILOSO";
    }

    let chars = Array.from(rawText);
    if (currentLayout === "grid") {
      while (chars.length < 4) chars.push("★");
    }

    let caseW, caseH;
    if (currentLayout === "grid") {
      caseW = 130; caseH = 130;
    } else {
      const count = chars.length;
      caseW = 72; caseH = (count * 60) + 20;
    }

    // Mengatur ukuran bodi balok 3D secara presisi
    casingBlock.style.width = caseW + "px";
    casingBlock.style.height = caseH + "px";

    const caseBack = document.getElementById("caseBack");
    const wallTop = document.getElementById("wallTop");
    const wallBottom = document.getElementById("wallBottom");
    const wallLeft = document.getElementById("wallLeft");
    const wallRight = document.getElementById("wallRight");

    // Menyamakan warna dasar keenam sisi kubus agar menyatu padat
    [caseFront, caseBack, wallTop, wallBottom, wallLeft, wallRight].forEach(el => {
      if (el) el.style.backgroundColor = curBase.hex;
    });

    caseFront.innerHTML = "";
    caseFront.className = "case-front " + (currentLayout === "grid" ? "layout-grid" : "layout-linear");

    chars.forEach((char) => {
      const keycapWrapper = document.createElement("div");
      keycapWrapper.className = "keycap-assembly";

      const topFace = document.createElement("div");
      topFace.className = "keycap-wall keycap-top";
      topFace.style.backgroundColor = curTop.hex;
      topFace.style.color = curFont.hex;
      topFace.textContent = (char === " " ? " " : char.toUpperCase());

      const skirtF = document.createElement("div"); skirtF.className = "keycap-wall keycap-skirt-front"; skirtF.style.backgroundColor = curTop.hex;
      const skirtB = document.createElement("div"); skirtB.className = "keycap-wall keycap-skirt-back"; skirtB.style.backgroundColor = curTop.hex;
      const skirtL = document.createElement("div"); skirtL.className = "keycap-wall keycap-skirt-left"; skirtL.style.backgroundColor = curTop.hex;
      const skirtR = document.createElement("div"); skirtR.className = "keycap-wall keycap-skirt-right"; skirtR.style.backgroundColor = curTop.hex;

      keycapWrapper.appendChild(skirtF);
      keycapWrapper.appendChild(skirtB);
      keycapWrapper.appendChild(skirtL);
      keycapWrapper.appendChild(skirtR);
      keycapWrapper.appendChild(topFace);

      // MEMPERBAIKI ANIMASI KLIK TOMBOL (TERTEKAN KE DALAM)
      keycapWrapper.addEventListener("click", () => {
        playClickSound();
        // Bergeser ke dalam (translateZ lebih kecil) saat ditekan
        topFace.style.transform = "translateZ(3px)";
        keycapWrapper.style.transform = "translateZ(2px)";
        
        setTimeout(() => {
          topFace.style.transform = "translateZ(10px)";
          keycapWrapper.style.transform = "translateZ(8px)";
        }, 120);
      });

      caseFront.appendChild(keycapWrapper);
    });

    updateLabelsAndPrice(chars.length);
  }

  function updateLabelsAndPrice(len) {
    const maxL = currentLayout === "grid" ? 4 : 6;
    document.getElementById("labelBase").textContent = curBase.name;
    document.getElementById("labelTop").textContent = curTop.name;
    document.getElementById("labelFont").textContent = curFont.name;
    document.getElementById("charCount").textContent = `${nameInput.value.length}/${maxL}`;

    const { basePrice, desc } = calculatePrice(currentLayout, len);

    document.getElementById("priceDesc").textContent = desc;
    document.getElementById("priceBaseVal").textContent = "Rp " + basePrice.toLocaleString("id-ID");
    document.getElementById("priceCharmVal").textContent = "Free";
    document.getElementById("priceTotalVal").textContent = "Rp " + basePrice.toLocaleString("id-ID");
  }

  document.getElementById("btnLinear").addEventListener("click", () => {
    currentLayout = "linear";
    document.getElementById("btnLinear").classList.add("active");
    document.getElementById("btnGrid").classList.remove("active");
    nameInput.maxLength = 6;
    update3D();
  });

  document.getElementById("btnGrid").addEventListener("click", () => {
    currentLayout = "grid";
    document.getElementById("btnGrid").classList.add("active");
    document.getElementById("btnLinear").classList.remove("active");
    nameInput.maxLength = 4;
    if (nameInput.value.length > 4) nameInput.value = nameInput.value.slice(0, 4);
    update3D();
  });

  nameInput.addEventListener("input", update3D);

  document.querySelectorAll(".glyph-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const g = btn.getAttribute("data-glyph");
      if (nameInput.value.length < nameInput.maxLength) {
        nameInput.value += g;
        update3D();
      }
    });
  });

  document.querySelectorAll(".charm-card").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".charm-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      const icon = card.getAttribute("data-icon");
      const name = card.getAttribute("data-name");
      const price = parseInt(card.getAttribute("data-price") || 0);

      curCharm = { icon: icon ? icon : null, name, price };
      if (icon) {
        attachedCharm.textContent = icon;
        attachedCharm.style.display = "block";
      } else {
        attachedCharm.style.display = "none";
      }
      updateLabelsAndPrice(nameInput.value.length || 5);
    });
  });

  function renderPalettes(containerId, list, activeItem, onSelect) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";
    list.forEach(item => {
      const d = document.createElement("div");
      d.className = "swatch-item" + (item.hex === activeItem.hex ? " selected" : "");
      d.style.backgroundColor = item.hex;
      d.title = item.name;
      if (item.border) d.setAttribute("data-border", "true");

      d.onclick = () => {
        el.querySelectorAll(".swatch-item").forEach(s => s.classList.remove("selected"));
        d.classList.add("selected");
        onSelect(item);
      };
      el.appendChild(d);
    });
  }

  renderPalettes("baseSwatches", BASE_COLORS, curBase, item => { curBase = item; update3D(); });
  renderPalettes("topSwatches", TOP_COLORS, curTop, item => { curTop = item; update3D(); });
  renderPalettes("fontSwatches", FONT_COLORS, curFont, item => { curFont = item; update3D(); });

  const orderBtn = document.getElementById("orderWAFun");
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      const totalValText = document.getElementById("priceTotalVal").textContent;
      sendWhatsAppOrder(currentLayout, nameInput.value, curBase, curTop, curFont, curCharm, totalValText);
    });
  }

  update3D();
}
