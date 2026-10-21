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


export { source1, source2 };
