const WHATSAPP_NUMBER = "6285748977307";
const PRICE_PER_KEYS = { 1: 21500, 2: 24500, 3: 28500, 4: 32500, 5: 36500, 6: 40500 };
const PRICE_GRID_4 = 40000;

export function calculatePrice(currentLayout, len) {
  if (currentLayout === "grid") {
    return {
      basePrice: PRICE_GRID_4,
      desc: "Keychain Klicker Kotak 2x2 (4 Tombol):"
    };
  } else {
    const l = Math.min(Math.max(len, 1), 6);
    const basePrice = PRICE_PER_KEYS[l] || 28500;
    return {
      basePrice,
      desc: `Keychain Klicker Baris (${l} Huruf):`
    };
  }
}

export function sendWhatsAppOrder(currentLayout, nameInputVal, curBase, curTop, curFont, curCharm, totalValText) {
  const text = nameInputVal.trim() || "ILOSO";
  const layoutStr = currentLayout === "grid" ? "Kotak 2x2 (Grid 4 Tombol)" : "Baris Vertikal";

  const msg = 
    `Halo kak, saya ingin pesan *Keychain Klicker 3D Custom*:%0A%0A` +
    `📐 *Model Casing:* ${layoutStr}%0A` +
    `📝 *Teks / Simbol:* *${text.toUpperCase()}*%0A` +
    `🎨 *Warna Base:* ${curBase.name}%0A` +
    `🔘 *Warna Tombol (Top):* ${curTop.name}%0A` +
    `✍️ *Warna Tulisan:* ${curFont.name}%0A` +
    `✨ *Charm / Bunga Tambahan:* ${curCharm.name} (Free)%0A%0A` +
    `💰 *Total Biaya: ${totalValText}*%0A%0A` +
    `Mohon konfirmasi ketersediaan stok & metode pembayaran ya kak. Terima kasih!`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
