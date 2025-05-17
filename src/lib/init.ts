import { setupTelemetry } from './telemetry';

export function initializeServices() {
  // Only initialize telemetry in production
  if (process.env.NODE_ENV === 'production' && process.env.GRAFANA_CLOUD_KEY) {
    setupTelemetry();
  }
} 