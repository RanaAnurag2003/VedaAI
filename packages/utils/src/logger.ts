export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  assignmentId?: string;
  jobId?: string;
  [key: string]: unknown;
}

export function createLogger(namespace: string) {
  const log = (level: LogLevel, message: string, context?: LogContext) => {
    const payload = {
      ts: new Date().toISOString(),
      level,
      namespace,
      message,
      ...context,
    };
    const line = JSON.stringify(payload);
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  };

  return {
    debug: (message: string, context?: LogContext) => log('debug', message, context),
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
    error: (message: string, context?: LogContext) => log('error', message, context),
  };
}
