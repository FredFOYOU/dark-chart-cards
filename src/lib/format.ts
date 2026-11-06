const LOCALE = "en-US";

const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const currency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const percent = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  maximumFractionDigits: 0,
});
const signedPercent = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "always",
});

const compactCurrency = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const compact = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentOneDecimal = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export type ValueFormatter = (value: number) => string;

export const formatCompactCurrency: ValueFormatter = (value) => compactCurrency.format(value);
export const formatCompact: ValueFormatter = (value) => compact.format(value);
/** `value` est exprimé en points de pourcentage : 3.7 → « 3.7% ». */
export const formatPercentOneDecimal: ValueFormatter = (value) =>
  percentOneDecimal.format(value / 100);

export const formatNumber: ValueFormatter = (value) => integer.format(value);
export const formatCurrency: ValueFormatter = (value) => currency.format(value);
export const formatHours: ValueFormatter = (value) => `${integer.format(value)}h`;
/** `value` est exprimé en points de pourcentage : 47 → « 47% ». */
export const formatPercent: ValueFormatter = (value) => percent.format(value / 100);
/** `value` est exprimé en points de pourcentage : 3.4 → « +3.4% ». */
export const formatDelta: ValueFormatter = (value) => signedPercent.format(value / 100);
