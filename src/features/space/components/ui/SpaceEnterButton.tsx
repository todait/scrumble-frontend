'use client';

interface SpaceEnterButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export function SpaceEnterButton({
  onClick,
  isLoading = false,
  disabled = false,
  size = 'md',
  variant = 'primary'
}: SpaceEnterButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#FF7800] text-white hover:bg-[#E86A00]';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      default:
        return 'bg-[#FF7800] text-white hover:bg-[#E86A00]';
    }
  };

  const baseClasses = 'flex items-center justify-center rounded-xl font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50';
  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses}`}
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          입장 중...
        </>
      ) : (
        '입장'
      )}
    </button>
  );
}