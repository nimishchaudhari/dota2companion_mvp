// frontend/src/components/AnimatedLoaders.jsx
import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Box, HStack, VStack, Text, Flex } from '@chakra-ui/react';

// Spinning loader with Dota-inspired styling
export const DotaSpinner = ({ size = 'md', color = 'dota.teal.500' }) => {
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
export const PulsingDots = ({ count = 3, color = 'dota.teal.500', size = 'sm' }) => {
  const dotSizes = {
    sm: '8px',
    md: '12px',
    lg: '16px'
  };

  return (
    <HStack spacing={2}>
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
    </HStack>
  );
};

// Ripple loading effect
export const RippleLoader = ({ size = 'md', color = 'dota.teal.500' }) => {
  const sizes = {
    sm: '32px',
    md: '48px',
    lg: '64px'
  };

  return (
    <Box position="relative" width={sizes[size]} height={sizes[size]}>
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
    </Box>
  );
};

// Hero portrait loading with shimmer effect
export const HeroPortraitLoader = ({ count = 1 }) => (
  <HStack spacing={3}>
    {Array.from({ length: count }, (_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <Box
          width="64px"
          height="64px"
          borderRadius="md"
          bg="dota.bg.tertiary"
          position="relative"
          overflow="hidden"
        >
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
        </Box>
      </motion.div>
    ))}
  </HStack>
);

// Bouncing loader with game-like feel
export const BouncingLoader = ({ text = "Loading...", color = 'dota.teal.500' }) => (
  <VStack spacing={4}>
    <HStack spacing={1}>
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
    </HStack>
    {text && (
      <Text color="dota.text.secondary" fontSize="sm">
        {text}
      </Text>
    )}
  </VStack>
);

// Progress bar loader with glow effect
export const GlowProgressLoader = ({ 
  progress = 0, 
  color = 'dota.teal.500',
  showText = true,
  text = "Loading..."
}) => (
  <VStack spacing={3} width="full">
    {showText && (
      <Text color="dota.text.primary" fontSize="sm" fontWeight="medium">
        {text}
      </Text>
    )}
    <Box width="full" height="4px" bg="dota.bg.tertiary" borderRadius="full" overflow="hidden">
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
    </Box>
    {showText && (
      <Text color="dota.text.muted" fontSize="xs">
        {progress}%
      </Text>
    )}
  </VStack>
);

// Circular progress with animated stroke
export const CircularProgress = ({ 
  progress = 0, 
  size = 'md',
  color = 'dota.teal.500',
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
    <Box position="relative" width={`${sizes[size]}px`} height={`${sizes[size]}px`}>
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
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
      >
        <Text
          fontSize={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}
          fontWeight="bold"
          color="dota.text.primary"
        >
          {Math.round(progress)}%
        </Text>
      </Box>
    </Box>
  );
};

// Floating particles loader
export const ParticleLoader = ({ particleCount = 8, color = 'dota.teal.500' }) => (
  <Box position="relative" width="80px" height="80px">
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
  </Box>
);

// Text typing animation
export const TypingLoader = ({ 
  texts = ["Loading...", "Fetching data...", "Almost ready..."],
  speed = 100,
  color = 'dota.text.primary'
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
    <Flex align="center" minHeight="24px">
      <Text color={color} fontSize="sm" fontFamily="monospace">
        {displayText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ color }}
        >
          |
        </motion.span>
      </Text>
    </Flex>
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <VStack spacing={8} maxWidth="500px" width="90%" textAlign="center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Text fontSize="2xl" fontWeight="bold" color="dota.text.primary" mb={2}>
            {title}
          </Text>
          <Text fontSize="md" color="dota.text.secondary">
            {subtitle}
          </Text>
        </motion.div>

        <Box width="full">
          <CircularProgress progress={progress} size="xl" />
        </Box>

        <motion.div
          key={currentTip}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Text
            fontSize="sm"
            color="dota.teal.300"
            fontStyle="italic"
            px={4}
            py={2}
            bg="rgba(39, 174, 158, 0.1)"
            borderRadius="lg"
            border="1px solid"
            borderColor="dota.teal.500"
          >
            {tips[currentTip]}
          </Text>
        </motion.div>

        <ParticleLoader />
      </VStack>
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