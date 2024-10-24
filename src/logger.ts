import { GLOBAL_CONFIG } from "./globals";

type LogLevel = {
  LEVEL: number;
  DESCRIPTION: string;
};

const LOG_LEVELS = {
  TRACE: { LEVEL: 1, DESCRIPTION: "TRACE" } as const,
  DEBUG: { LEVEL: 2, DESCRIPTION: "DEBUG" } as const,
  INFO: { LEVEL: 3, DESCRIPTION: "INFO" } as const,
  WARN: { LEVEL: 4, DESCRIPTION: "WARN" } as const,
  ERROR: { LEVEL: 5, DESCRIPTION: "ERROR" } as const,
  FATAL: { LEVEL: 6, DESCRIPTION: "FATAL" } as const,
} as const;

function getLogLevel(level: string): LogLevel {
  switch (level) {
    case "TRACE":
      return LOG_LEVELS.TRACE;
    case "DEBUG":
      return LOG_LEVELS.DEBUG;
    case "WARN":
      return LOG_LEVELS.WARN;
    case "ERROR":
      return LOG_LEVELS.ERROR;
    case "FATAL":
      return LOG_LEVELS.FATAL;
    case "INFO":
    default:
      return LOG_LEVELS.INFO;
  }
}

class Logger {
  static LOG_LEVEL = getLogLevel(GLOBAL_CONFIG.logger.level);

  private constructor() {}

  static trace(...args: string[]): void {
    const message = "TRACE: " + Date.now().toString() + " " + args.join("");

    if (LOG_LEVELS.TRACE.LEVEL < this.LOG_LEVEL.LEVEL) {
      return;
    }
    console.trace(message);
  }

  static debug(...args: string[]): void {
    const message = "DEBUG: " + Date.now().toString() + " " + args.join("");

    if (LOG_LEVELS.DEBUG < this.LOG_LEVEL) {
      return;
    }
    console.debug(message);
  }

  static info(...args: string[]): void {
    const message = "INFO: " + Date.now().toString() + " " + args.join("");

    if (LOG_LEVELS.INFO < this.LOG_LEVEL) {
      return;
    }
    console.info(message);
  }

  static warn(...args: string[]): void {
    const message = "WARN: " + Date.now().toString() + " " + args.join("");

    if (LOG_LEVELS.WARN < this.LOG_LEVEL) {
      return;
    }
    console.warn(message);
  }

  static error(...args: string[]): void {
    const message = "ERROR: " + Date.now().toString() + " " + args.join("");

    if (LOG_LEVELS.ERROR < this.LOG_LEVEL) {
      return;
    }
    console.error(message);
  }

  static fatal(...args: string[]): void {
    const message = "FATAL: " + Date.now().toString() + " " + args.join("");

    if (LOG_LEVELS.FATAL < this.LOG_LEVEL) {
      return;
    }
    console.error(message);
    process.exit(1);
  }
}

export { Logger };
