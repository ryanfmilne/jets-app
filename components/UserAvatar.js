import React from 'react';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '', 
  showBorder = true 
}) => {
  const generateInitials = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  const borderClass = showBorder ? 'border-2 border-gray-200' : '';

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={`${user.firstName} ${user.lastName}`}
        className={`${sizeClasses[size]} ${borderClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${borderClass} rounded-full bg-primary-500 flex items-center justify-center ${className}`}
    >
      <span className="text-white font-semibold">
        {generateInitials(user?.firstName, user?.lastName)}
      </span>
    </div>
  );
};

export default UserAvatar;