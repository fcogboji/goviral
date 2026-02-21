// Production-safe logger
// Prevents sensitive data from being logged in production

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Sanitize data before logging to prevent sensitive info leakage
   */
  private sanitize(data: unknown): unknown {
    if (!this.isProduction) {
      return data; // In dev, log everything
    }

    if (typeof data === 'string') {
      // Redact potential tokens, keys, passwords
      return data.replace(/(token|key|password|secret|authorization)[\s:=]+[\w-]+/gi, '$1=***REDACTED***');
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        // Redact sensitive fields
        if (/token|key|password|secret|auth|credential/i.test(key)) {
          sanitized[key] = '***REDACTED***';
        } else {
          sanitized[key] = this.sanitize(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Format log message with timestamp and level
   */
  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(this.sanitize(context))}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Debug logs (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.format('debug', message, context));
    }
  }

  /**
   * Info logs
   */
  info(message: string, context?: LogContext): void {
    console.log(this.format('info', message, context));
  }

  /**
   * Warning logs
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.format('warn', message, context));
  }

  /**
   * Error logs
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : error,
    };
    console.error(this.format('error', message, errorContext));
  }

  /**
   * API request logger
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API ${method} ${path}`, this.sanitize(context) as LogContext);
  }

  /**
   * API error logger
   */
  apiError(method: string, path: string, error: Error | unknown, context?: LogContext): void {
    this.error(`API ${method} ${path} failed`, error, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for direct use
export default logger;
