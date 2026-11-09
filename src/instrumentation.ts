export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
  ) {
    try {
      const { server } = await import('@/mocks/node');
      server.listen({ onUnhandledFrame: 'bypass' });
    } catch (err) {
      console.error('[Instrumentation] Failed to start mock server:', err);
    }
  }
}
