import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Logger } from '@/lib/logger';

const logger = Logger.getInstance();

export async function middleware(request: NextRequest) {
  // Log every request in Cloud Run
  if (process.env.K_SERVICE) {
    logger.info('Incoming request', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      cloudRunService: process.env.K_SERVICE,
      cloudRunRevision: process.env.K_REVISION,
      cloudRunConfiguration: process.env.K_CONFIGURATION,
    });
  }

  const response = NextResponse.next();

  // Add correlation ID for request tracing
  const correlationId = crypto.randomUUID();
  response.headers.set('x-correlation-id', correlationId);

  return response;
}

// Configure which paths to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 