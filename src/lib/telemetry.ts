import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const GRAFANA_OTLP_ENDPOINT = 'https://otlp-gateway-prod-gb-south-1.grafana.net/otlp';

export function setupTelemetry() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'my-app',
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'my-application-group',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      url: GRAFANA_OTLP_ENDPOINT,
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.GRAFANA_CLOUD_KEY || '').toString('base64')}`,
      },
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          requestHook: (span, request) => {
            if (request.url?.includes(GRAFANA_OTLP_ENDPOINT)) {
              span.updateName('Telemetry Export');
              span.setAttribute('telemetry.export', true);
            }
          }
        },
      }),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.error('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
} 