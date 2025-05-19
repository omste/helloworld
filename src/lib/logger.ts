import pino from 'pino';

export class Logger {
  private static instance: Logger;
  private logger: pino.Logger;

  private constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(msg: string, obj: Record<string, unknown> = {}): void {
    this.logger.info(obj, msg);
  }

  public error(msg: string, error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(
        {
          err: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        msg
      );
    } else {
      this.logger.error({ err: error }, msg);
    }
  }

  public warn(msg: string, obj: Record<string, unknown> = {}): void {
    this.logger.warn(obj, msg);
  }

  public debug(msg: string, obj: Record<string, unknown> = {}): void {
    this.logger.debug(obj, msg);
  }
}

// Export a default instance for convenience
export const log = {
  info: (msg: string, obj = {}) => Logger.getInstance().info(msg, obj),
  error: (msg: string, obj = {}) => Logger.getInstance().error(msg, obj),
  warn: (msg: string, obj = {}) => Logger.getInstance().warn(msg, obj),
  debug: (msg: string, obj = {}) => Logger.getInstance().debug(msg, obj),
}; 