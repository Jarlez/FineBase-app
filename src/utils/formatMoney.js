/**
 * Formata valor numérico como moeda BRL (R$).
 * @param {number|string|null|undefined} value - Valor a formatar
 * @returns {string} Valor formatado (ex.: "R$ 1.234,56")
 */
export function formatMoney(value) {
  const number = Number(value ?? 0);
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
