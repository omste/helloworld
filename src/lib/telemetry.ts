// OpenTelemetry is configured via environment variables in the Dockerfile
// and auto-instrumentation is loaded via NODE_OPTIONS
export async function setupTelemetry(): Promise<void> {
  try {
    if (!process.env.GRAFANA_CLOUD_KEY) {
      console.log('Skipping telemetry setup - GRAFANA_CLOUD_KEY not found');
      return;
    }
    console.log('OpenTelemetry auto-instrumentation enabled');
  } catch (error) {
    console.error('Error during telemetry setup:', error instanceof Error ? error.message : String(error));
  }
} 