import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used by CI/CD pipelines and monitoring services to verify app status
 */
export async function GET() {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NEXT_PUBLIC_ENV || 'development',
      version: process.env.NEXT_PUBLIC_VERSION || 'unknown',
      uptime: process.uptime(),
      checks: {
        server: 'ok',
        // Add more health checks as needed:
        // database: await checkDatabase(),
        // cache: await checkRedis(),
        // externalServices: await checkExternalAPIs(),
      },
      build: {
        timestamp: process.env.BUILD_TIMESTAMP || 'unknown',
        commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
      }
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NEXT_PUBLIC_ENV || 'development',
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}

// Optional: Add authentication check
export async function POST() {
  return NextResponse.json({
    message: 'Use GET method for health checks'
  }, { status: 405 });
}
