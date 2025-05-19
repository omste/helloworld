import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

export const log = {
  info: (msg: string, obj = {}) => logger.info(obj, msg),
  error: (msg: string, obj = {}) => logger.error(obj, msg),
  warn: (msg: string, obj = {}) => logger.warn(obj, msg),
  debug: (msg: string, obj = {}) => logger.debug(obj, msg),
};

export default logger; 