import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Alert,
  AlertIcon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Avatar,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import { 
  FiWifiOff, 
  FiDatabase, 
  FiUsers, 
  FiTarget, 
  FiTrendingUp,
  FiRefreshCw,
  FiHome,
  FiClock
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { enhancedApi } from '../services/enhancedApiWithSync';

const OfflinePage = () => {
  const navigate = useNavigate();
  const [offlineData, setOfflineData] = useState({
    heroes: [],
    players: [],
    matches: [],
    stats: null
  });
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    loadOfflineData();
    
    // Set up online detection
    const handleOnline = () => {
      if (navigator.onLine) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [navigate]);

  const loadOfflineData = async () => {
    setLoading(true);
    try {
      const [heroes, stats] = await Promise.all([
        enhancedApi.getOfflineHeroes(),
        enhancedApi.getOfflineStats()
      ]);

      setOfflineData({
        heroes: heroes.slice(0, 12), // Show only first 12 heroes
        stats
      });
    } catch (error) {
      console.error('Failed to load offline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleRetryConnection = () => {
    if (navigator.onLine) {
      navigate('/', { replace: true });
    } else {
      // Force a connection check
      fetch('/favicon.svg', { mode: 'no-cors' })
        .then(() => {
          if (navigator.onLine) {
            navigate('/', { replace: true });
          }
        })
        .catch(() => {
          // Still offline
        });
    }
  };

  const formatCacheAge = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const age = Date.now() - timestamp;
    const minutes = Math.floor(age / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Icon as={FiWifiOff} boxSize="60px" color="orange.400" />
            <Heading size="xl" color="orange.400">
              You're Offline
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="md">
              No internet connection detected. Browse your cached Dota 2 data below.
            </Text>
            
            <HStack spacing={4}>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={handleRetryConnection}
                colorScheme="blue"
                variant="outline"
              >
                Retry Connection
              </Button>
              <Button
                leftIcon={<FiHome />}
                onClick={handleGoHome}
                colorScheme="orange"
              >
                Go to App
              </Button>
            </HStack>
          </VStack>

          {/* Offline Stats */}
          {offlineData.stats && (
            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={4}>
                  <Heading size="md">Offline Data Available</Heading>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
                    <Stat textAlign="center">
                      <StatLabel>
                        <HStack justify="center" spacing={1}>
                          <Icon as={FiTarget} />
                          <Text>Heroes</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber>{offlineData.stats.heroes}</StatNumber>
                      <StatHelpText>Cached locally</StatHelpText>
                    </Stat>
                    
                    <Stat textAlign="center">
                      <StatLabel>
                        <HStack justify="center" spacing={1}>
                          <Icon as={FiUsers} />
                          <Text>Players</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber>{offlineData.stats.players}</StatNumber>
                      <StatHelpText>Recently viewed</StatHelpText>
                    </Stat>
                    
                    <Stat textAlign="center">
                      <StatLabel>
                        <HStack justify="center" spacing={1}>
                          <Icon as={FiTrendingUp} />
                          <Text>Matches</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber>{offlineData.stats.matches}</StatNumber>
                      <StatHelpText>Match details</StatHelpText>
                    </Stat>
                    
                    <Stat textAlign="center">
                      <StatLabel>
                        <HStack justify="center" spacing={1}>
                          <Icon as={FiClock} />
                          <Text>Pending</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber color="orange.400">
                        {offlineData.stats.pendingSync}
                      </StatNumber>
                      <StatHelpText>To sync</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Offline Data Tabs */}
          <Card bg={cardBg}>
            <CardBody>
              <Tabs variant="enclosed" isLazy>
                <TabList>
                  <Tab>
                    <HStack spacing={2}>
                      <Icon as={FiTarget} />
                      <Text>Heroes ({offlineData.heroes.length})</Text>
                    </HStack>
                  </Tab>
                  <Tab isDisabled>
                    <HStack spacing={2}>
                      <Icon as={FiUsers} />
                      <Text>Players</Text>
                    </HStack>
                  </Tab>
                  <Tab isDisabled>
                    <HStack spacing={2}>
                      <Icon as={FiTrendingUp} />
                      <Text>Matches</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Heroes Tab */}
                  <TabPanel>
                    {offlineData.heroes.length > 0 ? (
                      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                        {offlineData.heroes.map((hero) => (
                          <Card key={hero.id} size="sm" variant="outline">
                            <CardBody>
                              <VStack spacing={3}>
                                <Image
                                  src={hero.icon}
                                  alt={hero.localized_name}
                                  boxSize="50px"
                                  borderRadius="md"
                                  fallbackSrc="/placeholder-hero.svg"
                                />
                                <VStack spacing={1}>
                                  <Text fontWeight="semibold" fontSize="sm" textAlign="center">
                                    {hero.localized_name}
                                  </Text>
                                  <Badge
                                    colorScheme={
                                      hero.primary_attr === 'str' ? 'red' :
                                      hero.primary_attr === 'agi' ? 'green' : 'blue'
                                    }
                                    size="sm"
                                  >
                                    {hero.primary_attr?.toUpperCase()}
                                  </Badge>
                                  {hero.cached_at && (
                                    <Text fontSize="xs" color={textColor}>
                                      {formatCacheAge(hero.cached_at)}
                                    </Text>
                                  )}
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        No heroes cached offline. Visit the heroes page while online to cache data.
                      </Alert>
                    )}
                  </TabPanel>

                  {/* Players Tab */}
                  <TabPanel>
                    <Alert status="info">
                      <AlertIcon />
                      Player data will be available here once you visit player profiles while online.
                    </Alert>
                  </TabPanel>

                  {/* Matches Tab */}
                  <TabPanel>
                    <Alert status="info">
                      <AlertIcon />
                      Match data will be available here once you view match details while online.
                    </Alert>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>

          {/* Instructions */}
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={4}>
                <Heading size="md">How Offline Mode Works</Heading>
                <VStack spacing={2} align="start" w="full">
                  <Text color={textColor}>
                    • <strong>Cached Data:</strong> Previously viewed heroes, players, and matches are stored locally
                  </Text>
                  <Text color={textColor}>
                    • <strong>Background Sync:</strong> Failed requests are queued and retried when you're back online
                  </Text>
                  <Text color={textColor}>
                    • <strong>Smart Caching:</strong> Fresh data is prioritized, but stale data is shown when offline
                  </Text>
                  <Text color={textColor}>
                    • <strong>Automatic Updates:</strong> The app will sync automatically when your connection returns
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default OfflinePage;