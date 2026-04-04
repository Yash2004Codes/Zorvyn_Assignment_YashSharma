'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10 font-sans">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
