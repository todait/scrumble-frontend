import { LoadingSpinner } from './LoadingSpinner';

interface PageLoadingSpinnerProps {
  message?: string;
}

export function PageLoadingSpinner({ message }: PageLoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" className="text-[#9747FF]" />
        {message && (
          <p className="text-sm text-gray-500">{message}</p>
        )}
      </div>
    </div>
  );
}