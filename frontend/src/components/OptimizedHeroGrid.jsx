// Optimized Hero Grid with virtual scrolling and performance enhancements
import React, { memo, useMemo, useCallback, useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  Text,
  Badge,
  Image,
  HStack,
  VStack,
  Button,
  Tooltip,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import { FaStar, FaEye } from 'react-icons/fa';
import { LazyImage, useIntersectionObserver } from '../utils/performance';
import VirtualList from './VirtualList';
import FavoritesButton from './FavoritesButton';

// Memoized hero card component
const HeroCard = memo(({ hero, viewMode = 'grid', onSelect, isFavorite = false }) => {
  const [setRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  const handleClick = useCallback(() => {
    onSelect?.(hero);
  }, [hero, onSelect]);

  // Attribute styling
  const getAttributeColor = useCallback((attr) => {
    switch (attr) {
      case 'str': return 'red.400';
      case 'agi': return 'green.400';
      case 'int': return 'blue.400';
      default: return 'purple.400';
    }
  }, []);

  const attributeIcon = useMemo(() => {
    switch (hero.primary_attr) {
      case 'str': return 'S';
      case 'agi': return 'A';
      case 'int': return 'I';
      default: return 'U';
    }
  }, [hero.primary_attr]);

  if (viewMode === 'list') {
    return (
      <Card
        ref={setRef}
        variant="outline"
        bg="dota.bg.card"
        borderColor="dota.bg.tertiary"
        _hover={{
          borderColor: "dota.teal.500",
          transform: "translateY(-2px)",
          shadow: "lg"
        }}
        transition="all 0.2s"
        cursor="pointer"
        onClick={handleClick}
      >
        <CardBody p={4}>
          <HStack spacing={4}>
            <Box position="relative" flexShrink={0}>
              {isVisible ? (
                <LazyImage
                  src={hero.icon}
                  alt={hero.localized_name}
                  className="w-16 h-16 rounded-md object-cover"
                  placeholder="/placeholder-hero.svg"
                />
              ) : (
                <Skeleton height="64px" width="64px" borderRadius="md" />
              )}
              <Badge
                position="absolute"
                bottom="-2px"
                right="-2px"
                colorScheme={hero.primary_attr === 'str' ? 'red' : hero.primary_attr === 'agi' ? 'green' : 'blue'}
                borderRadius="full"
                fontSize="xs"
                minW="20px"
                textAlign="center"
              >
                {attributeIcon}
              </Badge>
            </Box>

            <VStack align="start" flex={1} spacing={2}>
              <Text fontWeight="bold" color="dota.text.primary" fontSize="lg">
                {hero.localized_name}
              </Text>
              
              <HStack spacing={2} wrap="wrap">
                {hero.roles?.slice(0, 3).map((role) => (
                  <Badge
                    key={role}
                    variant="subtle"
                    colorScheme="teal"
                    fontSize="xs"
                  >
                    {role}
                  </Badge>
                ))}
                {hero.roles?.length > 3 && (
                  <Text fontSize="xs" color="dota.text.muted">
                    +{hero.roles.length - 3} more
                  </Text>
                )}
              </HStack>

              <HStack spacing={2}>
                <Text fontSize="sm" color="dota.text.muted">
                  Complexity:
                </Text>
                <HStack spacing={1}>
                  {[...Array(3)].map((_, i) => (
                    <Box
                      key={i}
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={i < (hero.difficultyScore || 1) ? getAttributeColor(hero.primary_attr) : 'gray.600'}
                    />
                  ))}
                </HStack>
              </HStack>
            </VStack>

            <VStack spacing={2}>
              <FavoritesButton
                type="hero"
                id={hero.id}
                name={hero.localized_name}
                size="sm"
              />
              
              <Tooltip label="View Details">
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  leftIcon={<FaEye />}
                  onClick={handleClick}
                >
                  View
                </Button>
              </Tooltip>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      ref={setRef}
      variant="outline"
      bg="dota.bg.card"
      borderColor="dota.bg.tertiary"
      _hover={{
        borderColor: "dota.teal.500",
        transform: "translateY(-4px)",
        shadow: "xl"
      }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={handleClick}
      height="280px"
    >
      <CardBody p={4}>
        <VStack spacing={3} height="100%">
          <Box position="relative" flexShrink={0}>
            {isVisible ? (
              <LazyImage
                src={hero.img}
                alt={hero.localized_name}
                className="w-24 h-24 rounded-lg object-cover"
                placeholder="/placeholder-hero.svg"
              />
            ) : (
              <Skeleton height="96px" width="96px" borderRadius="lg" />
            )}
            <Badge
              position="absolute"
              bottom="-4px"
              right="-4px"
              colorScheme={hero.primary_attr === 'str' ? 'red' : hero.primary_attr === 'agi' ? 'green' : 'blue'}
              borderRadius="full"
              fontSize="sm"
              minW="24px"
              textAlign="center"
            >
              {attributeIcon}
            </Badge>
            
            {isFavorite && (
              <Box
                position="absolute"
                top="-4px"
                left="-4px"
                bg="yellow.400"
                borderRadius="full"
                p={1}
              >
                <FaStar size={12} color="white" />
              </Box>
            )}
          </Box>

          <VStack spacing={2} flex={1} w="100%">
            <Text
              fontWeight="bold"
              color="dota.text.primary"
              fontSize="md"
              textAlign="center"
              noOfLines={2}
              lineHeight="1.2"
            >
              {hero.localized_name}
            </Text>
            
            <VStack spacing={1} w="100%">
              {hero.roles?.slice(0, 2).map((role) => (
                <Badge
                  key={role}
                  variant="subtle"
                  colorScheme="teal"
                  fontSize="xs"
                  w="100%"
                  textAlign="center"
                >
                  {role}
                </Badge>
              ))}
              {hero.roles?.length > 2 && (
                <Text fontSize="xs" color="dota.text.muted">
                  +{hero.roles.length - 2} more roles
                </Text>
              )}
            </VStack>
          </VStack>

          <HStack spacing={2} w="100%" justify="space-between">
            <FavoritesButton
              type="hero"
              id={hero.id}
              name={hero.localized_name}
              size="sm"
            />
            
            <Tooltip label="View Details">
              <Button
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={handleClick}
              >
                <FaEye />
              </Button>
            </Tooltip>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
});

HeroCard.displayName = 'HeroCard';

// Main optimized hero grid component
const OptimizedHeroGrid = memo(({ 
  heroes = [], 
  viewMode = 'grid', 
  onHeroSelect,
  favoriteHeroes = [],
  loading = false,
  columns = { base: 1, sm: 2, md: 3, lg: 4, xl: 5 }
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  // Memoize favorite hero IDs for quick lookup
  const favoriteHeroIds = useMemo(() => 
    new Set(favoriteHeroes.map(fav => fav.hero_id || fav.id)), 
    [favoriteHeroes]
  );

  // Memoize processed heroes with performance optimizations
  const processedHeroes = useMemo(() => 
    heroes.map(hero => ({
      ...hero,
      isFavorite: favoriteHeroIds.has(hero.id),
      // Pre-calculate search terms for faster filtering
      searchTerms: hero.searchTerms || `${hero.name} ${hero.localized_name} ${(hero.roles || []).join(' ')}`.toLowerCase()
    })), 
    [heroes, favoriteHeroIds]
  );

  // Virtual scrolling for list view
  const renderHeroItem = useCallback((hero, index) => (
    <HeroCard
      key={hero.id}
      hero={hero}
      viewMode={viewMode}
      onSelect={onHeroSelect}
      isFavorite={hero.isFavorite}
    />
  ), [viewMode, onHeroSelect]);

  // Handle scroll for virtual loading
  const handleScroll = useCallback((scrollTop) => {
    const itemHeight = viewMode === 'grid' ? 300 : 120;
    const containerHeight = 600;
    const itemsPerPage = Math.ceil(containerHeight / itemHeight);
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + itemsPerPage * 2, processedHeroes.length);
    
    setVisibleRange({ start: Math.max(0, start), end });
  }, [viewMode, processedHeroes.length]);

  // Loading skeleton
  if (loading) {
    return (
      <Grid templateColumns={`repeat(${Object.values(columns).pop()}, 1fr)`} gap={6}>
        {Array.from({ length: 20 }, (_, i) => (
          <GridItem key={i}>
            <Card height="280px">
              <CardBody p={4}>
                <VStack spacing={3}>
                  <Skeleton height="96px" width="96px" borderRadius="lg" />
                  <SkeletonText noOfLines={2} spacing="2" />
                  <Skeleton height="20px" width="80px" />
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    );
  }

  // List view with virtual scrolling
  if (viewMode === 'list') {
    return (
      <VirtualList
        items={processedHeroes}
        renderItem={renderHeroItem}
        itemHeight={120}
        height={600}
        overscan={5}
        onScroll={handleScroll}
        getItemId={(hero) => hero.id}
      />
    );
  }

  // Grid view with pagination-like loading
  const visibleHeroes = processedHeroes.slice(visibleRange.start, visibleRange.end);

  return (
    <Box>
      <Grid 
        templateColumns={{
          base: `repeat(${columns.base}, 1fr)`,
          sm: `repeat(${columns.sm}, 1fr)`,
          md: `repeat(${columns.md}, 1fr)`,
          lg: `repeat(${columns.lg}, 1fr)`,
          xl: `repeat(${columns.xl}, 1fr)`
        }}
        gap={6}
      >
        {visibleHeroes.map((hero) => (
          <GridItem key={hero.id}>
            <HeroCard
              hero={hero}
              viewMode={viewMode}
              onSelect={onHeroSelect}
              isFavorite={hero.isFavorite}
            />
          </GridItem>
        ))}
      </Grid>

      {/* Load more button for grid view */}
      {visibleRange.end < processedHeroes.length && (
        <Box textAlign="center" mt={8}>
          <Button
            colorScheme="blue"
            onClick={() => setVisibleRange(prev => ({ 
              ...prev, 
              end: Math.min(prev.end + 20, processedHeroes.length) 
            }))}
            size="lg"
          >
            Load More Heroes ({processedHeroes.length - visibleRange.end} remaining)
          </Button>
        </Box>
      )}
    </Box>
  );
});

OptimizedHeroGrid.displayName = 'OptimizedHeroGrid';

export default OptimizedHeroGrid;