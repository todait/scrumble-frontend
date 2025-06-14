import { cn } from '@/shared/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ isVisible, message, className }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
        className
      )}
    >
      <LoadingSpinner size="lg" className="text-[#9747FF]" />
      {message && (
        <p className="mt-4 text-sm font-medium text-[#222222] opacity-80">{message}</p>
      )}
    </div>
  );
}