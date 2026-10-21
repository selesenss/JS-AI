function isValidSource1(source) {
  if (
    source === null ||
    typeof source !== 'object' ||
    Array.isArray(source)
  ) {
    console.error('Source 1 must be an object.')
    return false
  }

  if (!Array.isArray(source.transactions)) {
    console.error('Source 1 must contain a transactions array.')
    return false
  }

  return true
}

function validateTransaction(transaction) {
  if (
    transaction === null ||
    typeof transaction !== 'object' ||
    Array.isArray(transaction)
  ) {
    console.error('Invalid transaction: transaction must be an object.', transaction)
    return false
  }

  if (typeof transaction.type !== 'string' || transaction.type.trim() === '') {
    console.error('Invalid transaction: type must be a non-empty string.', transaction)
    return false
  }

  if (
    typeof transaction.amount !== 'number' ||
    !Number.isFinite(transaction.amount) ||
    transaction.amount < 0
  ) {
    console.error(
      'Invalid transaction: amount must be a finite non-negative number.',
      transaction,
    )
    return false
  }

  if (transaction.currency !== 'USD') {
    console.error('Invalid transaction: currency must be "USD".', transaction)
    return false
  }

  return true
}

function parseSource2Item(item) {
  if (typeof item !== 'string') {
    console.error('Invalid Source 2 item: value must be a string.', item)
    return null
  }

  const match = item.trim().match(/^(\d+(?:\.\d+)?) USD$/)

  if (!match) {
    console.error(
      'Invalid Source 2 item: expected format "<amount> USD".',
      item,
    )
    return null
  }

  const amount = Number(match[1])

  if (!Number.isFinite(amount)) {
    console.error('Invalid Source 2 item: amount must be a finite number.', item)
    return null
  }

  return amount
}

// Converts supported source formats to an array of "<amount> USD" strings.
function adaptSource(source) {
  if (Array.isArray(source)) {
    return source.filter(item => parseSource2Item(item) !== null)
  }

  if (!isValidSource1(source)) {
    return null
  }

  return source.transactions
    .filter(validateTransaction)
    .filter(transaction => transaction.type === 'paid')
    .map(transaction => `${transaction.amount} ${transaction.currency}`)
}

function calculateDailyRevenue(...sources) {
  let total = 0

  for (const source of sources) {
    const items = adaptSource(source)

    if (items === null) {
      return null
    }

    for (const item of items) {
      total += Number(item.trim().split(' ')[0])
    }
  }

  return { total, currency: 'USD' }
}


export { isValidSource1, validateTransaction, parseSource2Item, adaptSource, calculateDailyRevenue };
