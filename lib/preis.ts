/** Schweizer Preisdarstellung: 18 → «18.–», 18.5 → «18.50». */
export function preisText(preis: number): string {
  return Number.isInteger(preis) ? `${preis}.–` : preis.toFixed(2);
}
