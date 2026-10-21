export function createUsdConverter(symbolsResponse, ratesResponse) {
  const symbols = symbolsResponse?.currencySymbols;
  const rates = ratesResponse?.rates;
  if (!symbols || typeof symbols !== 'object' || Array.isArray(symbols) ||
      !Object.hasOwn(symbols, 'USD')) {
    throw new Error('Некорректный справочник валют.');
  }
  if (ratesResponse?.base !== 'USD' || !rates || typeof rates !== 'object' || Array.isArray(rates)) {
    throw new Error('Некорректный ответ сервиса курсов: ожидается база USD.');
  }

  function validateCurrency(currency) {
    const code = typeof currency === 'string' ? currency.trim().toUpperCase() : '';
    if (!code || !Object.hasOwn(symbols, code)) {
      throw new Error('Валюта указана не верно');
    }
    return code;
  }

  function convertToUsd(amount, currency) {
    const code = validateCurrency(currency);
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      throw new Error('Сумма должна быть конечным неотрицательным числом.');
    }
    if (code === 'USD') return amount;
    const raw = Object.hasOwn(rates, code) ? rates[code] : undefined;
    const rate = (typeof raw === 'string' && raw.trim() !== '') || typeof raw === 'number'
      ? Number(raw) : NaN;
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`Не удалось получить курс ${code}.`);
    }
    // USD base: rate is units of foreign currency per 1 USD.
    const result = amount / rate;
    if (!Number.isFinite(result)) throw new Error('Результат конвертации слишком велик.');
    return result;
  }

  return { validateCurrency, convertToUsd };
}

// Normalize both source formats before the existing USD adapter/calculation.
export function convertSourceToUsd(source, converter) {
  if (Array.isArray(source)) {
    const transactions = [];
    for (const item of source) {
      const match = typeof item === 'string'
        ? item.trim().match(/^(\d+(?:\.\d+)?)\s+(\S+)$/) : null;
      if (!match || !Number.isFinite(Number(match[1]))) {
        console.error('Invalid Source 2 item: expected "<amount> <currency>".', item);
        continue;
      }
      transactions.push({
        type: 'paid', amount: converter.convertToUsd(Number(match[1]), match[2]), currency: 'USD',
      });
    }
    return { transactions };
  }
  if (!source || typeof source !== 'object' || !Array.isArray(source.transactions)) return source;
  return {
    ...source,
    transactions: source.transactions.map(transaction => {
      if (!transaction || typeof transaction !== 'object' || Array.isArray(transaction)) return transaction;
      const currency = converter.validateCurrency(transaction.currency);
      const validAmount = typeof transaction.amount === 'number' &&
        Number.isFinite(transaction.amount) && transaction.amount >= 0;
      return {
        ...transaction,
        amount: transaction.type === 'paid' && validAmount
          ? converter.convertToUsd(transaction.amount, currency) : transaction.amount,
        currency: 'USD',
      };
    }),
  };
}
