// frontend/src/components/LoadingSkeleton.jsx
import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

// Base skeleton component with shimmer effect
const SkeletonBase = ({ className, ...props }) => (
  <motion.div
    className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
    style={{
      backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
    }}
    animate={{
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    }}
    {...props}
  />
);

// Card skeleton for RecommendationCard components
export const CardSkeleton = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4', 
    large: 'p-6'
  };
  
  const imageClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  return (
    <motion.div 
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${sizeClasses[size]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar/Image skeleton */}
        <SkeletonBase className={`${imageClasses[size]} rounded-md flex-shrink-0`} />
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          {/* Title */}
          <SkeletonBase className="h-5 w-3/4 rounded" />
          
          {/* Subtitle lines */}
          <SkeletonBase className="h-3 w-1/2 rounded" />
          <SkeletonBase className="h-3 w-2/3 rounded" />
          
          {size !== 'small' && (
            <SkeletonBase className="h-3 w-1/3 rounded" />
          )}
        </div>
        
        {/* Action button skeleton */}
        <SkeletonBase className="w-8 h-8 rounded-full flex-shrink-0" />
      </div>
    </motion.div>
  );
};

// List skeleton for multiple cards
export const CardListSkeleton = ({ count = 3, size = 'medium' }) => (
  <motion.div 
    className="space-y-4"
    variants={{
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }}
    initial="initial"
    animate="animate"
  >
    {Array.from({ length: count }, (_, index) => (
      <motion.div
        key={index}
        variants={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 }
        }}
      >
        <CardSkeleton size={size} />
      </motion.div>
    ))}
  </motion.div>
);

// Player profile skeleton
export const PlayerProfileSkeleton = () => (
  <motion.div 
    className="bg-white p-6 rounded-lg shadow-lg space-y-6"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    {/* Header section */}
    <div className="flex items-center space-x-4">
      <SkeletonBase className="w-20 h-20 rounded-full" />
      <div className="space-y-2 flex-1">
        <SkeletonBase className="h-6 w-1/3 rounded" />
        <SkeletonBase className="h-4 w-1/4 rounded" />
        <SkeletonBase className="h-4 w-1/2 rounded" />
      </div>
    </div>
    
    {/* Stats section */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="text-center space-y-2">
          <SkeletonBase className="h-8 w-full rounded" />
          <SkeletonBase className="h-4 w-3/4 mx-auto rounded" />
        </div>
      ))}
    </div>
    
    {/* Recent matches section */}
    <div className="space-y-3">
      <SkeletonBase className="h-6 w-1/4 rounded" />
      <div className="space-y-2">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonBase key={index} className="h-16 w-full rounded" />
        ))}
      </div>
    </div>
  </motion.div>
);

// Search results skeleton
export const SearchResultsSkeleton = () => (
  <motion.div 
    className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <SkeletonBase className="h-5 w-1/3 rounded" />
    <div className="space-y-2">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex items-center space-x-3 p-2">
          <SkeletonBase className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <SkeletonBase className="h-4 w-2/3 rounded" />
            <SkeletonBase className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// Hero grid skeleton
export const HeroGridSkeleton = ({ columns = 4 }) => (
  <motion.div 
    className={`grid grid-cols-2 md:grid-cols-${columns} gap-4`}
    variants={{
      animate: {
        transition: {
          staggerChildren: 0.05
        }
      }
    }}
    initial="initial"
    animate="animate"
  >
    {Array.from({ length: 12 }, (_, index) => (
      <motion.div
        key={index}
        variants={{
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 }
        }}
        className="bg-white p-3 rounded-lg border border-gray-200 space-y-2"
      >
        <SkeletonBase className="w-full h-24 rounded" />
        <SkeletonBase className="h-4 w-3/4 rounded" />
        <SkeletonBase className="h-3 w-1/2 rounded" />
      </motion.div>
    ))}
  </motion.div>
);

// Match details skeleton
export const MatchDetailSkeleton = () => (
  <motion.div 
    className="bg-white p-6 rounded-lg shadow-lg space-y-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {/* Match header */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <SkeletonBase className="h-6 w-32 rounded" />
        <SkeletonBase className="h-4 w-24 rounded" />
      </div>
      <SkeletonBase className="h-8 w-20 rounded" />
    </div>
    
    {/* Teams */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 2 }, (_, teamIndex) => (
        <div key={teamIndex} className="space-y-3">
          <SkeletonBase className="h-5 w-20 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, playerIndex) => (
              <div key={playerIndex} className="flex items-center space-x-3">
                <SkeletonBase className="w-8 h-8 rounded" />
                <SkeletonBase className="h-4 flex-1 rounded" />
                <SkeletonBase className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// Table skeleton for data tables
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <motion.div 
    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {/* Table header */}
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, index) => (
          <SkeletonBase key={index} className="h-4 rounded" />
        ))}
      </div>
    </div>
    
    {/* Table rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <motion.div 
          key={rowIndex}
          className="p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rowIndex * 0.05 }}
        >
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <SkeletonBase key={colIndex} className="h-4 rounded" />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Text content skeleton
export const TextSkeleton = ({ lines = 3, className = "" }) => (
  <motion.div 
    className={`space-y-2 ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {Array.from({ length: lines }, (_, index) => (
      <SkeletonBase 
        key={index}
        className={`h-4 rounded ${
          index === lines - 1 ? 'w-2/3' : 'w-full'
        }`}
      />
    ))}
  </motion.div>
);

// Button skeleton
export const ButtonSkeleton = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-8 w-20',
    medium: 'h-10 w-24',
    large: 'h-12 w-32'
  };
  
  return (
    <SkeletonBase className={`${sizeClasses[size]} rounded-lg`} />
  );
};

export default {
  CardSkeleton,
  CardListSkeleton,
  PlayerProfileSkeleton,
  SearchResultsSkeleton,
  HeroGridSkeleton,
  MatchDetailSkeleton,
  TableSkeleton,
  TextSkeleton,
  ButtonSkeleton
};