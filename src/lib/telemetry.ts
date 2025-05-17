import { diag, DiagLogLevel, DiagLogger } from '@opentelemetry/api';

// Create a logger that implements the DiagLogger interface
const logger: DiagLogger = {
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  info: (...args: unknown[]) => console.info(...args),
  debug: (...args: unknown[]) => console.debug(...args),
  verbose: (...args: unknown[]) => console.debug(...args), // Map verbose to debug since console doesn't have verbose
};

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(logger, DiagLogLevel.INFO);

export async function setupTelemetry(): Promise<void> {
  try {
    if (!process.env.GRAFANA_CLOUD_KEY) {
      console.log('Skipping telemetry setup - GRAFANA_CLOUD_KEY not found');
      return;
    }

    // The auto-instrumentation will be loaded via NODE_OPTIONS
    // This is already set in the Dockerfile:
    // NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
    console.log('Telemetry initialized via auto-instrumentation');
  } catch (error) {
    console.error('Error during telemetry setup:', error instanceof Error ? error.message : String(error));
  }
} 