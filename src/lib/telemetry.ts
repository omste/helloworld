// This file is only used to check if we should enable OpenTelemetry
// If GRAFANA_CLOUD_KEY is not set, OpenTelemetry will not be enabled

export function shouldEnableOpenTelemetry() {
  return !!process.env.GRAFANA_CLOUD_KEY;
} 