import { LAYOUTS } from './layouts.js';
const WHATSAPP_NUMBER = "6285748977307";
const PRICE_PER_KEYS = { 1: 21500, 2: 24500, 3: 28500, 4: 32500, 5: 36500, 6: 40500 };

export function calculatePrice(currentLayout, len) {
  const model = LAYOUTS[currentLayout];
  if (!model) throw new Error('Model casing tidak dikenal');
  if (model.count) return {basePrice:model.price, desc:`Keychain Klicker ${model.label} (${model.count} Tombol):`};
  const count=Math.min(Math.max(len,1),6);
  return {basePrice:PRICE_PER_KEYS[count],desc:`Keychain Klicker Baris (${count} Huruf):`};
}

export function sendWhatsAppOrder(currentLayout, nameInputVal, curBase, curTop, curFont, curCharm, totalValText) {
  const text = nameInputVal.trim() || (currentLayout === "grid" ? "LOVE" : "ILOSO");
  const model=LAYOUTS[currentLayout];
  const layoutStr=model.label+(model.count?` (${model.count} tombol)`:"");

  const msg = 
    `Halo kak, saya ingin pesan *Keychain Klicker 3D Custom*:\n\n` +
    `📐 *Model Casing:* ${layoutStr}\n` +
    `📝 *Teks / Simbol:* *${text.toUpperCase()}*\n` +
    `🎨 *Warna Base:* ${curBase.name}\n` +
    `🔘 *Warna Tombol (Top):* ${curTop.name}\n` +
    `✍️ *Warna Tulisan:* ${curFont.name}\n` +
    `📍 *Urutan nomor:* ${currentLayout === "arrow" ? "1 di atas; 2, 3, 4 dari kiri ke kanan di bawah" : currentLayout === "linear" ? "dari atas ke bawah" : "kiri ke kanan, lalu baris berikutnya"}\n` +
    `✨ *Charm / Bunga Tambahan:* ${curCharm.name} (Free)\n\n` +
    `💰 *Total Biaya: ${totalValText}*\n\n` +
    `Mohon konfirmasi ketersediaan stok & metode pembayaran ya kak. Terima kasih!`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
}
