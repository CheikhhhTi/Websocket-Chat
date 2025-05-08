const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8088 });
const winston = require('winston');

const clients = new Set();

const logger = winston.createLogger({
  level: 'info', 
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'chat.log' })
  ],
});


server.on('connection', socket => {
  clients.add(socket);
  logger.info('A user connected.');

  socket.on('message', message => {
    // Send it to all other clients
    for (const client of clients) {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
    logger.info('A user disconnected.');
  });
});
