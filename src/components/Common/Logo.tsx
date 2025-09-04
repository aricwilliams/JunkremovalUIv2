import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const taglineSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
         <div className="mb-6 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <img
                  src="http://junkremovalappplanner.com/logo.png"
                  alt="Junk Removal App Planner Logo"
                  style={{ width: '232px' }}
                />

              </div>
            </div>

          </div>
      <h2 className={`${textSizes[size]} font-bold text-gray-900 text-center`}>
        Junk Removal Pro
      </h2>
      {showTagline && (
        <p className={`${taglineSizes[size]} text-gray-600 italic text-center`}>
          "Every feature built to drive your bottom line"
        </p>
      )}
    </div>
  );
};

export default Logo;
