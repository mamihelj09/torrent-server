const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.simple(),
  ),
  transports: [
    new winston.transports.File({ filename: 'debug.log' })
  ]
});

module.exports = logger;
