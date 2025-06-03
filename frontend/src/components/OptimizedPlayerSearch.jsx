// Optimized PlayerSearch component with performance enhancements
import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Avatar,
  Text,
  Card,
  CardBody,
  Spinner
} from '@chakra-ui/react';
import { useDebounce } from '../utils/performance';
import optimizedApi from '../services/optimizedApi';
import webWorkerManager from '../utils/webWorkerManager';

const OptimizedPlayerSearch = memo(({ onResult }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const navigate = useNavigate();
  
  // Debounce search query for auto-search
  const debouncedQuery = useDebounce(query, 400);

  // Memoized search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Use optimized API with caching
      const data = await optimizedApi.searchPlayers(searchQuery);
      
      if (data.error) {
        setError(data.error);
        setResults(null);
      } else if (data.players && data.players.length === 0) {
        setError('No players found.');
        setResults(null);
      } else {
        // Use Web Worker for additional processing if many results
        let processedResults = data.players;
        
        if (data.players.length > 10) {
          try {
            processedResults = await webWorkerManager.searchPlayers(
              data.players, 
              searchQuery, 
              20
            );
          } catch (workerError) {
            console.warn('Worker failed, using original results:', workerError);
          }
        }
        
        setResults(processedResults);
        setError('');
        
        if (onResult) onResult(processedResults);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  // Auto-search on debounced query change
  React.useEffect(() => {
    if (debouncedQuery.trim() && debouncedQuery.length > 2) {
      performSearch(debouncedQuery);
    } else {
      setResults(null);
      setError('');
    }
  }, [debouncedQuery, performSearch]);

  // Manual search handler
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a Steam ID, Dota 2 ID, or persona name.');
      return;
    }
    performSearch(query);
  }, [query, performSearch]);

  // Input change handler
  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
    setError(''); // Clear error on typing
  }, []);

  // Player selection handler
  const handleSelectPlayer = useCallback((player) => {
    navigate(`/player/${player.steamId}`);
    setResults(null);
    setQuery('');
  }, [navigate]);

  // Memoized player list component
  const PlayerList = useMemo(() => {
    if (!results || results.length === 0) return null;

    const title = results.length === 1 ? 'Player found:' : 'Multiple players found. Please select:';

    return (
      <Card
        position="absolute"
        zIndex={20}
        w="full"
        mt={1}
        maxH="320px"
        overflowY="auto"
        bg="dota.bg.card"
        borderColor="dota.bg.tertiary"
        boxShadow="card-hover"
      >
        <CardBody p={4}>
          <Text fontWeight="semibold" color="dota.text.primary" mb={3}>
            {title}
          </Text>
          <VStack spacing={2} align="stretch">
            {results.map((player) => (
              <PlayerResultItem
                key={player.steamId}
                player={player}
                onSelect={handleSelectPlayer}
              />
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  }, [results, handleSelectPlayer]);

  // Memoized error component
  const ErrorMessage = useMemo(() => {
    if (!error) return null;

    return (
      <Box
        p={3}
        bg="red.500"
        color="white"
        borderRadius="lg"
        mb={4}
        border="1px solid"
        borderColor="red.400"
      >
        ⚠️ {error}
      </Box>
    );
  }, [error]);

  // Memoized loading component  
  const LoadingIndicator = useMemo(() => {
    if (!loading) return null;

    return (
      <Box
        position="absolute"
        top="60px"
        left={0}
        right={0}
        bg="dota.bg.card"
        borderRadius="lg"
        p={4}
        border="1px solid"
        borderColor="dota.bg.tertiary"
        boxShadow="card-hover"
        textAlign="center"
      >
        <Spinner size="sm" color="blue.500" />
        <Text fontSize="sm" color="dota.text.muted" mt={2}>
          Searching...
        </Text>
      </Box>
    );
  }, [loading]);

  return (
    <Box w="full" maxW="md" mx="auto" position="relative">
      <VStack as="form" onSubmit={handleSearch} spacing={4} mb={4}>
        <HStack w="full" spacing={3}>
          <Input
            placeholder="Search by Steam ID, Dota 2 ID, or persona name"
            value={query}
            onChange={handleInputChange}
            bg="dota.bg.card"
            border="2px solid"
            borderColor="dota.bg.tertiary"
            color="dota.text.primary"
            _placeholder={{ color: "dota.text.muted" }}
            _focus={{
              borderColor: "dota.teal.500",
              transform: "translateY(-1px)",
            }}
            _hover={{
              borderColor: "dota.teal.600",
            }}
            size="lg"
            borderRadius="lg"
            transition="all 0.3s ease"
            disabled={loading}
            autoComplete="off"
            spellCheck="false"
          />
          
          <Button
            type="submit"
            variant="solid"
            size="lg"
            minW="120px"
            isLoading={loading}
            loadingText="Searching..."
            disabled={loading}
          >
            Search
          </Button>
        </HStack>
      </VStack>
      
      {ErrorMessage}
      {LoadingIndicator}
      {PlayerList}
    </Box>
  );
});

// Optimized player result item
const PlayerResultItem = memo(({ player, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(player);
  }, [player, onSelect]);

  return (
    <Box
      as="button"
      w="full"
      p={3}
      borderRadius="md"
      bg="transparent"
      border="1px solid transparent"
      _hover={{
        bg: "dota.bg.hover",
        borderColor: "dota.teal.500",
        transform: "translateY(-1px)",
      }}
      _focus={{
        bg: "dota.bg.hover",
        borderColor: "dota.teal.500",
        outline: "none",
      }}
      onClick={handleClick}
      transition="all 0.2s ease"
      textAlign="left"
    >
      <HStack spacing={3}>
        <Avatar
          src={player.avatar}
          name={player.personaName}
          size="sm"
          border="2px solid"
          borderColor="dota.bg.tertiary"
          loading="lazy"
        />
        <Box flex={1} minW={0}>
          <Text 
            fontWeight="medium" 
            color="dota.text.primary" 
            isTruncated
          >
            {player.personaName}
          </Text>
          <Text 
            fontSize="sm" 
            color="dota.text.muted" 
            isTruncated
          >
            Steam ID: {player.steamId}
          </Text>
          {player.matchScore !== undefined && (
            <Text fontSize="xs" color="dota.teal.400">
              Match: {player.matchScore}%
            </Text>
          )}
        </Box>
      </HStack>
    </Box>
  );
});

PlayerResultItem.displayName = 'PlayerResultItem';
OptimizedPlayerSearch.displayName = 'OptimizedPlayerSearch';

export default OptimizedPlayerSearch;