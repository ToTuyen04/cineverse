// Simulated delay for mock API calls
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Process payment
export const processPayment = async (paymentData) => {
  // Simulate API delay
  await delay(2000);
  
  // Simulate error in 10% of cases
  if (Math.random() < 0.1) {
    throw new Error('Payment processing failed. Please try again.');
  }
  
  // Generate mock transaction ID and receipt
  const transactionId = 'TXN-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  return {
    success: true,
    transactionId,
    timestamp: new Date().toISOString(),
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    message: 'Payment processed successfully'
  };
};

// Validate payment card
export const validateCardDetails = (cardDetails) => {
  const errors = {};
  
  // Check card number (simple validation for mock)
  if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
    errors.cardNumber = 'Please enter a valid 16-digit card number';
  }
  
  // Check expiration date
  if (!cardDetails.expiryDate || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardDetails.expiryDate)) {
    errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
  } else {
    // Check if card is expired
    const [month, year] = cardDetails.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    if (expiryDate < today) {
      errors.expiryDate = 'Card has expired';
    }
  }
  
  // Check CVV
  if (!cardDetails.cvv || !/^[0-9]{3,4}$/.test(cardDetails.cvv)) {
    errors.cvv = 'Please enter a valid CVV code';
  }
  
  // Check cardholder name
  if (!cardDetails.cardholderName || cardDetails.cardholderName.trim() === '') {
    errors.cardholderName = 'Please enter the cardholder name';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Get available payment methods
export const getPaymentMethods = async () => {
  await delay(500);
  
  return [
    { id: 'credit', name: 'Credit Card', icon: 'credit-card' },
    { id: 'debit', name: 'Debit Card', icon: 'credit-card' },
    { id: 'paypal', name: 'PayPal', icon: 'paypal' },
    { id: 'applepay', name: 'Apple Pay', icon: 'apple' },
    { id: 'googlepay', name: 'Google Pay', icon: 'google' }
  ];
};

// Save payment method for future use (mock implementation)
export const savePaymentMethod = async (paymentMethod) => {
  await delay(1000);
  
  return {
    success: true,
    message: 'Payment method saved successfully',
    savedMethodId: 'PM-' + Math.floor(Math.random() * 100000)
  };
};

// Get saved payment methods for a user (mock implementation)
export const getSavedPaymentMethods = async (userId) => {
  await delay(800);
  
  // Mock saved payment methods
  return [
    {
      id: 'PM-12345',
      type: 'credit',
      cardNumber: '•••• •••• •••• 4242',
      cardholderName: 'John Doe',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: 'PM-67890',
      type: 'debit',
      cardNumber: '•••• •••• •••• 8888',
      cardholderName: 'John Doe',
      expiryDate: '09/24',
      isDefault: false
    }
  ];
};

// Generate receipt data after successful payment
export const generateReceipt = async (paymentDetails) => {
  await delay(500);
  
  const receiptId = 'RCP-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  return {
    receiptId,
    transactionId: paymentDetails.transactionId,
    date: new Date().toISOString(),
    customerName: paymentDetails.customerName || 'Guest User',
    items: paymentDetails.items || [],
    subtotal: paymentDetails.subtotal || paymentDetails.amount,
    tax: paymentDetails.tax || (paymentDetails.amount * 0.1), // Assuming 10% tax
    total: paymentDetails.amount,
    paymentMethod: paymentDetails.paymentMethod,
    refundPolicy: 'Tickets are non-refundable once purchased.',
    theaterId: paymentDetails.theaterId,
    theaterName: paymentDetails.theaterName
  };
};