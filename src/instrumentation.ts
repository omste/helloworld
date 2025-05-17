import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Only initialize instrumentation in production
if (process.env.NODE_ENV === 'production') {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'my-app',
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: process.env.OTEL_SERVICE_NAMESPACE || 'my-application-group',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.OTEL_DEPLOYMENT_ENVIRONMENT || 'production',
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      headers: {
        'Authorization': `Basic ${process.env.GRAFANA_CLOUD_KEY}`,
      },
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start()
    .then(() => console.log('OpenTelemetry instrumentation initialized'))
    .catch((error) => console.error('Error initializing OpenTelemetry:', error));
} 