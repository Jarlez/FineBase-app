/**
 * Formata data no padrão brasileiro (DD/MM/YYYY).
 * @param {string} val - Data em YYYY-MM-DD
 * @returns {string} Data formatada (ex.: "28/02/2025")
 */
export const formatDateBR = (val) => {
  if (!val) return "";
  const [y, m, d] = String(val).split("-");
  return d && m && y ? `${d}/${m}/${y}` : val;
};
