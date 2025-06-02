import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Input,
  Button,
  Alert,
  Spinner,
  VStack,
  HStack,
  Avatar,
  Text,
  Card,
  CardBody,
  useToken,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const PlayerSearch = ({ onResult }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const navigate = useNavigate();
  
  const [tealGlow] = useToken('shadows', ['dota-glow']);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);
    if (!query.trim()) {
      setError('Please enter a Steam ID, Dota 2 ID, or persona name.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchPlayers(query);
      if (data.error) {
        setError(data.error);
      } else if (data.players && data.players.length === 0) {
        setError('No players found.');
      } else {
        setResults(data.players);
        if (onResult) onResult(data.players);
      }
    } catch {
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlayer = (player) => {
    navigate(`/player/${player.steamId}`);
    setResults(null);
    setQuery('');
  };

  return (
    <MotionBox 
      w="full" 
      maxW="md" 
      mx="auto" 
      position="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack as="form" onSubmit={handleSearch} spacing={4} mb={4}>
        <HStack w="full" spacing={3}>
          <MotionBox 
            flex={1}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Input
              placeholder="Search by Steam ID, Dota 2 ID, or persona name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              bg="dota.bg.card"
              border="2px solid"
              borderColor="dota.bg.tertiary"
              color="dota.text.primary"
              _placeholder={{ color: "dota.text.muted" }}
              _focus={{
                borderColor: "dota.teal.500",
                boxShadow: tealGlow,
                transform: "translateY(-1px)",
              }}
              _hover={{
                borderColor: "dota.teal.600",
              }}
              size="lg"
              borderRadius="lg"
              transition="all 0.3s ease"
              disabled={loading}
            />
          </MotionBox>
          
          <Button
            type="submit"
            variant="solid"
            size="lg"
            minW="120px"
            isLoading={loading}
            loadingText="Searching..."
            spinner={<Spinner size="sm" color="white" />}
            disabled={loading}
            _loading={{
              _hover: { transform: "none" },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            Search
          </Button>
        </HStack>
      </VStack>
      
      <AnimatePresence>
        {error && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Alert.Root 
              status="error" 
              borderRadius="lg" 
              mb={4}
              bg="dota.status.error"
              color="white"
              border="1px solid"
              borderColor="red.400"
            >
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  ⚠️ {error}
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          </MotionBox>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {results && results.length > 1 && (
          <MotionCard
            position="absolute"
            zIndex={20}
            w="full"
            mt={1}
            maxH="320px"
            overflowY="auto"
            bg="dota.bg.card"
            borderColor="dota.bg.tertiary"
            boxShadow="card-hover"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CardBody p={4}>
              <Text 
                fontWeight="semibold" 
                color="dota.text.primary" 
                mb={3}
              >
                Multiple players found. Please select:
              </Text>
              <VStack spacing={2} align="stretch">
                {results.map((player, index) => (
                  <MotionBox
                    key={player.steamId}
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
                    onClick={() => handleSelectPlayer(player)}
                    transition="all 0.2s ease"
                    textAlign="left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ transition: `opacity 0.3s ease ${index * 0.1}s, transform 0.3s ease ${index * 0.1}s` }}
                  >
                    <HStack spacing={3}>
                      <Avatar
                        src={player.avatar}
                        name={player.personaName}
                        size="sm"
                        border="2px solid"
                        borderColor="dota.bg.tertiary"
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
                      </Box>
                    </HStack>
                  </MotionBox>
                ))}
              </VStack>
            </CardBody>
          </MotionCard>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {results && results.length === 1 && (
          <MotionCard
            position="absolute"
            zIndex={20}
            w="full"
            mt={1}
            bg="dota.bg.card"
            borderColor="dota.bg.tertiary"
            boxShadow="card-hover"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <CardBody p={4}>
              <Text 
                fontWeight="semibold" 
                color="dota.text.primary" 
                mb={3}
              >
                Player found:
              </Text>
              <MotionBox
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
                onClick={() => handleSelectPlayer(results[0])}
                transition="all 0.2s ease"
                textAlign="left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HStack spacing={3}>
                  <Avatar
                    src={results[0].avatar}
                    name={results[0].personaName}
                    size="sm"
                    border="2px solid"
                    borderColor="dota.bg.tertiary"
                  />
                  <Box flex={1} minW={0}>
                    <Text 
                      fontWeight="medium" 
                      color="dota.text.primary" 
                      isTruncated
                    >
                      {results[0].personaName}
                    </Text>
                    <Text 
                      fontSize="sm" 
                      color="dota.text.muted" 
                      isTruncated
                    >
                      Steam ID: {results[0].steamId}
                    </Text>
                  </Box>
                </HStack>
              </MotionBox>
            </CardBody>
          </MotionCard>
        )}
      </AnimatePresence>
      
      {/* Loading skeleton overlay */}
      <AnimatePresence>
        {loading && (
          <MotionBox
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <VStack spacing={3}>
              <HStack w="full" spacing={3}>
                <SkeletonCircle size="10" />
                <Box flex={1}>
                  <SkeletonText noOfLines={2} spacing="2" />
                </Box>
              </HStack>
              <HStack w="full" spacing={3}>
                <SkeletonCircle size="10" />
                <Box flex={1}>
                  <SkeletonText noOfLines={2} spacing="2" />
                </Box>
              </HStack>
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>
    </MotionBox>
  );
};

export default PlayerSearch;
