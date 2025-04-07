import * as signalR from '@microsoft/signalr';

let connection = null;

export const startConnection = () => {
  // For development/mock, you can use a mock connection
  const useMockConnection = true;
  
  if (useMockConnection) {
    console.log('Using mock SignalR connection');
    // Create a mock connection object that mimics the SignalR connection
    const mockConnection = {
      on: (methodName, callback) => {
        console.log(`Registered mock handler for ${methodName}`);
        // Store the callback for later simulation
        if (!mockConnection.handlers[methodName]) {
          mockConnection.handlers[methodName] = [];
        }
        mockConnection.handlers[methodName].push(callback);
        return mockConnection;
      },
      invoke: (methodName, ...args) => {
        console.log(`Mock invoke: ${methodName}`, args);
        return Promise.resolve();
      },
      start: () => {
        console.log('Mock connection started');
        return Promise.resolve();
      },
      stop: () => {
        console.log('Mock connection stopped');
        return Promise.resolve();
      },
      state: 'Connected',
      handlers: {}
    };
    
    // Set the mocked connection
    connection = mockConnection;
    return Promise.resolve(mockConnection);
  } else {
    // Real SignalR connection for when backend is ready
    connection = new signalR.HubConnectionBuilder()
      .withUrl('/notificationHub') // Update with your real hub URL
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    return connection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error: ', err));
  }
};

export const getConnection = () => {
  if (!connection) {
    throw new Error('SignalR connection not initialized. Call startConnection first.');
  }
  return connection;
};

export const stopConnection = () => {
  if (connection) {
    return connection.stop();
  }
  return Promise.resolve();
};