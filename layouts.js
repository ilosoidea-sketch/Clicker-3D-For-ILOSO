export const LAYOUTS = {
  linear: { label: 'Baris vertikal', rows: 6, cols: 1, count: null, max: 6 },
  grid: { label: 'Kotak 2×2', rows: 2, cols: 2, count: 4, max: 4, price: 40000 },
  grid23: { label: 'Kotak 2×3', rows: 2, cols: 3, count: 6, max: 6, price: 48000 },
  grid24: { label: 'Kotak 2×4', rows: 2, cols: 4, count: 8, max: 8, price: 56000 },
  grid33: { label: 'Kotak 3×3', rows: 3, cols: 3, count: 9, max: 9, price: 60000 },
  grid34: { label: 'Kotak 3×4', rows: 3, cols: 4, count: 12, max: 12, price: 72000 },
  arrow: { label: 'Arrow', rows: 2, cols: 3, count: 4, max: 4, price: 40000 }
};
export function positionsFor(layout, count) {
  if (layout === 'arrow') return [[0,1],[1,0],[1,1],[1,2]];
  const columns = LAYOUTS[layout].cols;
  return Array.from({ length: count }, (_, i) => [Math.floor(i / columns), i % columns]);
}
