'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-white text-xl mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-6 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
