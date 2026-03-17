'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-bold">Application error</h2>
            <p className="text-muted-foreground">
              A critical error occurred. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-muted-foreground">{error.message}</p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Retry
              </button>
              <Link
                href="/"
                className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
