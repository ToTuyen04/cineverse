import { getConnection } from './signalRConnection';

export const registerNotificationHandlers = (onNewPromotion, onTicketReminder) => {
  const connection = getConnection();
  
  // Register handlers for different notification types
  connection.on('ReceivePromotion', (promotion) => {
    console.log('Received new promotion:', promotion);
    if (onNewPromotion) onNewPromotion(promotion);
  });
  
  connection.on('TicketReminder', (reminder) => {
    console.log('Received ticket reminder:', reminder);
    if (onTicketReminder) onTicketReminder(reminder);
  });
};

// Function to simulate receiving a new promotion (for testing)
export const simulateNewPromotion = (promotion) => {
  const connection = getConnection();
  if (connection.handlers && connection.handlers.ReceivePromotion) {
    connection.handlers.ReceivePromotion.forEach(handler => {
      handler(promotion);
    });
  }
};

// Function to simulate receiving a ticket reminder (for testing)
export const simulateTicketReminder = (reminder) => {
  const connection = getConnection();
  if (connection.handlers && connection.handlers.TicketReminder) {
    connection.handlers.TicketReminder.forEach(handler => {
      handler(reminder);
    });
  }
};