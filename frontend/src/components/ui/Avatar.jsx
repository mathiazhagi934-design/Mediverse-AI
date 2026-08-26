import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { User } from 'lucide-react';

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className = '',
  status,
  statusPosition = 'bottom-right',
  animated = true,
}) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  const statusPositions = {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorFromName = (name) => {
    if (!name) return 'bg-gray-500';
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
      'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
      'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
      'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('relative inline-flex shrink-0', className)}
    >
      <div className={cn('relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700', sizes[size])}>
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn('w-full h-full flex items-center justify-center font-medium text-white', getColorFromName(name))}
            aria-label={name ? `Avatar for ${name}` : 'User avatar'}
          >
            {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
          </div>
        )}
      </div>
      {status && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className={cn(
            'absolute rounded-full border-2 border-white dark:border-gray-900',
            statusSizes[size],
            statusColors[status],
            statusPositions[statusPosition]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </motion.div>
  );
}

export function AvatarGroup({ avatars = [], max = 5, size = 'md', className = '', ...props }) {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <motion.div
          key={avatar.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative z-10"
          style={{ zIndex: max - index }}
        >
          <Avatar {...avatar} size={size} />
        </motion.div>
      ))}
      {remaining > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'relative z-0 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-medium text-gray-600 dark:text-gray-400 border-2 border-white dark:border-gray-900',
            sizes[size]
          )}
        >
          +{remaining}
        </motion.div>
      )}
    </div>
  );
}