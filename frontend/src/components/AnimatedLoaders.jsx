// frontend/src/components/AnimatedLoaders.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Spinning loader with Dota-inspired styling
export const DotaSpinner = ({ size = 'md', color = '#14b8a6' }) => {
  const sizes = {
    sm: '24px',
    md: '32px',
    lg: '48px',
    xl: '64px'
  };

  return (
    <motion.div
      style={{
        width: sizes[size],
        height: sizes[size],
        border: '3px solid transparent',
        borderTopColor: color,
        borderRightColor: color,
        borderRadius: '50%'
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

// Pulsing dots loader
export const PulsingDots = ({ count = 3, color = '#14b8a6', size = 'sm' }) => {
  const dotSizes = {
    sm: '8px',
    md: '12px',
    lg: '16px'
  };

  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          style={{
            width: dotSizes[size],
            height: dotSizes[size],
            backgroundColor: color,
            borderRadius: '50%'
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Ripple loading effect
export const RippleLoader = ({ size = 'md', color = '#14b8a6' }) => {
  const sizes = {
    sm: '32px',
    md: '48px',
    lg: '64px'
  };

  return (
    <div className="relative" style={{ width: sizes[size], height: sizes[size] }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: `2px solid ${color}`,
            borderRadius: '50%',
            opacity: 0
          }}
          animate={{
            scale: [0, 1.5],
            opacity: [1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.6,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Hero portrait loading with shimmer effect
export const HeroPortraitLoader = ({ count = 1 }) => (
  <div className="flex items-center space-x-3">
    {Array.from({ length: count }, (_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="w-16 h-16 rounded-md bg-slate-700 relative overflow-hidden">
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
            }}
            animate={{
              left: ['100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
    ))}
  </div>
);

// Bouncing loader with game-like feel
export const BouncingLoader = ({ text = "Loading...", color = '#14b8a6' }) => (
  <div className="flex flex-col items-center space-y-4">
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: color,
            borderRadius: '50%'
          }}
          animate={{
            y: [0, -20, 0]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
    {text && (
      <div className="text-slate-300 text-sm">
        {text}
      </div>
    )}
  </div>
);

// Progress bar loader with glow effect
export const GlowProgressLoader = ({ 
  progress = 0, 
  color = '#14b8a6',
  showText = true,
  text = "Loading..."
}) => (
  <div className="flex flex-col items-center space-y-3 w-full">
    {showText && (
      <div className="text-white text-sm font-medium">
        {text}
      </div>
    )}
    <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
      <motion.div
        style={{
          height: '100%',
          backgroundColor: color,
          borderRadius: '4px',
          boxShadow: `0 0 10px ${color}`,
          width: `${progress}%`
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
    {showText && (
      <div className="text-slate-400 text-xs">
        {progress}%
      </div>
    )}
  </div>
);

// Circular progress with animated stroke
export const CircularProgress = ({ 
  progress = 0, 
  size = 'md',
  color = '#14b8a6',
  strokeWidth = 3
}) => {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80
  };

  const radius = (sizes[size] - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: `${sizes[size]}px`, height: `${sizes[size]}px` }}>
      <motion.svg
        width={sizes[size]}
        height={sizes[size]}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={sizes[size] / 2}
          cy={sizes[size] / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={sizes[size] / 2}
          cy={sizes[size] / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`
          }}
        />
      </motion.svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`font-bold text-white ${
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        }`}>
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};

// Floating particles loader
export const ParticleLoader = ({ particleCount = 8, color = '#14b8a6' }) => (
  <div className="relative w-20 h-20">
    {Array.from({ length: particleCount }, (_, index) => {
      const angle = (index / particleCount) * Math.PI * 2;
      const radius = 30;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '6px',
            height: '6px',
            backgroundColor: color,
            borderRadius: '50%'
          }}
          animate={{
            x: [0, x, 0],
            y: [0, y, 0],
            scale: [1, 0.5, 1],
            opacity: [1, 0.3, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      );
    })}
  </div>
);

// Text typing animation
export const TypingLoader = ({ 
  texts = ["Loading...", "Fetching data...", "Almost ready..."],
  speed = 100,
  color = '#ffffff'
}) => {
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0);
  const [displayText, setDisplayText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(true);

  React.useEffect(() => {
    const currentText = texts[currentTextIndex];
    let timeoutId;

    if (isTyping) {
      if (displayText.length < currentText.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, speed);
      } else {
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 1000);
      }
    } else {
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, speed / 2);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isTyping, currentTextIndex, texts, speed]);

  return (
    <div className="flex items-center min-h-6">
      <div className="text-sm font-mono" style={{ color }}>
        {displayText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ color }}
        >
          |
        </motion.span>
      </div>
    </div>
  );
};

// Comprehensive loading screen
export const GameLoadingScreen = ({ 
  title = "Loading Game Data...",
  subtitle = "Please wait while we prepare your experience",
  progress = 0,
  tips = [
    "Tip: Check the minimap frequently for enemy movement",
    "Tip: Last-hitting creeps is crucial for gold income", 
    "Tip: Ward key areas to gain vision advantage"
  ]
}) => {
  const [currentTip, setCurrentTip] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
      }}
    >
      <div className="flex flex-col items-center space-y-8 max-w-md w-[90%] text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-2xl font-bold text-white mb-2">
            {title}
          </div>
          <div className="text-base text-slate-300">
            {subtitle}
          </div>
        </motion.div>

        <div className="w-full">
          <CircularProgress progress={progress} size="xl" />
        </div>

        <motion.div
          key={currentTip}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-sm text-teal-300 italic px-4 py-2 bg-teal-500/10 rounded-lg border border-teal-500">
            {tips[currentTip]}
          </div>
        </motion.div>

        <ParticleLoader />
      </div>
    </motion.div>
  );
};

export default {
  DotaSpinner,
  PulsingDots,
  RippleLoader,
  HeroPortraitLoader,
  BouncingLoader,
  GlowProgressLoader,
  CircularProgress,
  ParticleLoader,
  TypingLoader,
  GameLoadingScreen
};