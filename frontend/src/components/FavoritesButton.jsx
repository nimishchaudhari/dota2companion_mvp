// frontend/src/components/FavoritesButton.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Tooltip,
  Alert,
  Spinner,
  Box,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { fileBackend } from '../services/fileBackend.js';

const MotionIconButton = motion.create(IconButton);

// Heart icon component
const HeartIcon = ({ filled = false, ...props }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Animation variants for Framer Motion
const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};


const FavoritesButton = ({ 
  type, // 'hero' or 'item'
  id, 
  name, 
  role = null, // for heroes
  category = null, // for items
  className = ''
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      if (type === 'hero') {
        const favorites = await fileBackend.getFavoriteHeroes();
        setIsFavorite(favorites.some(fav => fav.hero_id === id));
      } else if (type === 'item') {
        const favorites = await fileBackend.getFavoriteItems();
        setIsFavorite(favorites.some(fav => fav.item_id === id));
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setError('Failed to check favorite status');
    }
  }, [type, id]);

  const toggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    setLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        // Remove from favorites
        if (type === 'hero') {
          await fileBackend.removeFavoriteHero(id);
        } else if (type === 'item') {
          await fileBackend.removeFavoriteItem(id);
        }
        setIsFavorite(false);
      } else {
        // Add to favorites
        if (type === 'hero') {
          await fileBackend.addFavoriteHero(id, name, role);
        } else if (type === 'item') {
          await fileBackend.addFavoriteItem(id, name, category);
        }
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite');
      // Revert the optimistic update
      checkFavoriteStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box position="relative">
      <Tooltip
        label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        placement="top"
        hasArrow
        bg="dota.bg.tertiary"
        color="dota.text.primary"
        fontSize="sm"
        borderRadius="md"
      >
        <MotionIconButton
          onClick={toggleFavorite}
          disabled={loading}
          variant="ghost"
          size="sm"
          aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
          bg={isFavorite ? "rgba(244, 63, 94, 0.1)" : "dota.bg.hover"}
          color={isFavorite ? "red.400" : "dota.text.muted"}
          border="1px solid"
          borderColor={isFavorite ? "red.400" : "transparent"}
          _hover={{
            bg: isFavorite ? "rgba(244, 63, 94, 0.2)" : "rgba(244, 63, 94, 0.1)",
            color: "red.400",
            borderColor: "red.400",
            transform: "translateY(-1px)",
            filter: isFavorite ? "drop-shadow(0 0 8px rgba(244, 63, 94, 0.6))" : "none",
          }}
          _active={{
            transform: "scale(0.9)",
          }}
          _focus={{
            outline: "none",
            ring: "2px",
            ringColor: "red.400",
            ringOffset: "2px",
            ringOffsetColor: "dota.bg.primary",
          }}
          transition="all 0.2s ease"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={className}
          sx={{
            ...(isFavorite && {
              transform: "scale(1.1)",
            }),
          }}
        >
          {loading ? (
            <Spinner size="sm" color="red.400" />
          ) : (
            <Box position="relative">
              <HeartIcon
                filled={isFavorite}
                style={{
                  transition: "all 0.3s ease",
                  transform: isFavorite ? "scale(1.1)" : "scale(1)",
                }}
              />
              {isFavorite && (
                <Box
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  w="6px"
                  h="6px"
                  bg="red.500"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="dota.bg.primary"
                  variants={pulseVariants}
                  animate="animate"
                />
              )}
            </Box>
          )}
        </MotionIconButton>
      </Tooltip>
      
      {error && (
        <Alert.Root
          status="error"
          position="absolute"
          top="100%"
          left="0"
          mt={1}
          fontSize="xs"
          borderRadius="md"
          boxShadow="lg"
          whiteSpace="nowrap"
          zIndex={10}
          maxW="200px"
          bg="dota.status.error"
          color="white"
        >
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              ⚠️ {error}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </Box>
  );
};

export default FavoritesButton;