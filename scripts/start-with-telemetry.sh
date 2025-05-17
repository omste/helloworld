#!/bin/bash

export OTEL_TRACES_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp-gateway-prod-gb-south-1.grafana.net/otlp"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic ${GRAFANA_CLOUD_KEY}"
export OTEL_RESOURCE_ATTRIBUTES="service.name=my-app,service.namespace=my-application-group,deployment.environment=production"
export OTEL_NODE_RESOURCE_DETECTORS="env,host,os"
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"

node .next/server/app/api/trpc/[trpc]/route.js 