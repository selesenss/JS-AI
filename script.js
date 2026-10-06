const source1 = {
  transactions: [
    { type: 'paid', amount: 100, currency: 'USD' },
    { type: 'pending', amount: 50, currency: 'USD' },
    { type: 'paid', amount: 880, currency: 'USD' },
    { type: 'paid', amount: 130, currency: 'USD' },
    { type: 'rejected', amount: 560, currency: 'USD' },
  ],
  address: {
    city: 'New York',
    street: '5th Avenue',
    houseNumber: 10,
  },
}

const source2 = [
  '300 USD',
  '150 USD',
  '200 USD',
  '400 USD',
]

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

function isValidSource2(source) {
  if (!Array.isArray(source)) {
    console.error('Source 2 must be an array.')
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

function calculateSource1Revenue(transactions) {
  let total = 0

  for (const transaction of transactions) {
    if (!validateTransaction(transaction)) {
      continue
    }

    if (transaction.type === 'paid') {
      total += transaction.amount
    }
  }

  return total
}

function calculateSource2Revenue(items) {
  let total = 0

  for (const item of items) {
    const amount = parseSource2Item(item)

    if (amount === null) {
      continue
    }

    total += amount
  }

  return total
}

function calculateDailyRevenue(firstSource, secondSource) {
  if (!isValidSource1(firstSource) || !isValidSource2(secondSource)) {
    return null
  }

  const source1Total = calculateSource1Revenue(firstSource.transactions)
  const source2Total = calculateSource2Revenue(secondSource)

  return {
    total: source1Total + source2Total,
    currency: 'USD',
  }
}

// Examples

console.log('1. Valid data:')
console.log(calculateDailyRevenue(source1, source2))
// Expected: { total: 2160, currency: 'USD' }

console.log('\n2. Missing Source 1:')
console.log(calculateDailyRevenue(undefined, source2))
// Expected: null

console.log('\n3. Missing Source 2:')
console.log(calculateDailyRevenue(source1, undefined))
// Expected: null

console.log('\n4. Invalid Source 1 structure:')
console.log(calculateDailyRevenue({ transactions: 'not an array' }, source2))
// Expected: null

console.log('\n5. Invalid transaction:')
const sourceWithInvalidTransaction = {
  transactions: [
    { type: 'paid', amount: 100, currency: 'USD' },
    { type: 'paid', amount: '500', currency: 'USD' },
    { type: 'paid', amount: 200, currency: 'USD' },
  ],
}
console.log(calculateDailyRevenue(sourceWithInvalidTransaction, source2))
// Invalid transaction is skipped.
// Expected: { total: 1350, currency: 'USD' }

console.log('\n6. Invalid Source 2 item:')
const source2WithInvalidItem = [
  '300 USD',
  'invalid value',
  '200 USD',
]
console.log(calculateDailyRevenue(source1, source2WithInvalidItem))
// Invalid item is skipped.
// Expected: { total: 1610, currency: 'USD' }

console.log('\n7. Empty transactions:')
console.log(calculateDailyRevenue({ transactions: [] }, source2))
// Expected: { total: 1050, currency: 'USD' }

console.log('\n8. Empty Source 2:')
console.log(calculateDailyRevenue(source1, []))
// Expected: { total: 1110, currency: 'USD' }
