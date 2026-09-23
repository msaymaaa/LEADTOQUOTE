/**
 * Application Currency Configuration
 * LeadToQuote operates in Pakistan with Pakistani Rupee (PKR).
 * ALL monetary values throughout the application and database use PKR, never USD ($).
 */

export const CURRENCY = 'PKR';

export interface FormatCurrencyOptions {
  decimals?: boolean;
  showPrefix?: boolean;
}

/**
 * Reusable currency formatter ensuring consistent display throughout the application:
 * e.g., "PKR 25,000" or "PKR 150,000.00"
 */
export function formatPKR(
  amount: number | string | null | undefined,
  options?: FormatCurrencyOptions
): string {
  if (amount === null || amount === undefined || amount === '') {
    return options?.showPrefix === false ? '0' : `${CURRENCY} 0`;
  }

  const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericValue)) {
    return options?.showPrefix === false ? '0' : `${CURRENCY} 0`;
  }

  const formattedNumber = options?.decimals
    ? numericValue.toLocaleString('en-PK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : numericValue.toLocaleString('en-PK');

  if (options?.showPrefix === false) {
    return formattedNumber;
  }

  return `${CURRENCY} ${formattedNumber}`;
}

export const formatCurrency = formatPKR;
