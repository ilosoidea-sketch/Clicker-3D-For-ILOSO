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
  const text = nameInputVal.trim() || (currentLayout === "grid" ? "LOVE" : "ILOSO");
  const layoutStr = currentLayout === "grid" ? "Kotak 2x2 (Grid 4 Tombol)" : "Baris Vertikal";

  const msg = 
    `Halo kak, saya ingin pesan *Keychain Klicker 3D Custom*:\n\n` +
    `📐 *Model Casing:* ${layoutStr}\n` +
    `📝 *Teks / Simbol:* *${text.toUpperCase()}*\n` +
    `🎨 *Warna Base:* ${curBase.name}\n` +
    `🔘 *Warna Tombol (Top):* ${curTop.name}\n` +
    `✍️ *Warna Tulisan:* ${curFont.name}\n` +
    `✨ *Charm / Bunga Tambahan:* ${curCharm.name} (Free)\n\n` +
    `💰 *Total Biaya: ${totalValText}*\n\n` +
    `Mohon konfirmasi ketersediaan stok & metode pembayaran ya kak. Terima kasih!`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
}
