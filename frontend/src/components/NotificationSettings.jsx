import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Icon,
  useToast,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid
} from '@chakra-ui/react';
import { 
  FiBell, 
  FiBellOff, 
  FiCheck, 
  FiX, 
  FiSettings,
  FiGamepad2,
  FiTrendingUp,
  FiCalendar,
  FiAlertCircle
} from 'react-icons/fi';
import { usePushNotifications } from '../services/pushNotifications';

const NotificationSettings = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    showDemo
  } = usePushNotifications();

  const [preferences, setPreferences] = useState({
    matchUpdates: true,
    heroUpdates: true,
    metaChanges: false,
    weeklyDigest: true,
    majorUpdates: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handlePermissionRequest = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        toast({
          title: 'Permission Granted',
          description: 'You can now receive push notifications',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Push notifications are disabled',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request notification permission',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await subscribe();
      if (success) {
        toast({
          title: 'Subscribed!',
          description: 'You will now receive push notifications',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      toast({
        title: 'Subscription Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribe();
      if (success) {
        toast({
          title: 'Unsubscribed',
          description: 'You will no longer receive push notifications',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
  };

  const handleDemoNotification = async (type) => {
    try {
      await showDemo(type);
      toast({
        title: 'Demo Sent',
        description: 'Check your notifications!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Demo Failed',
        description: 'Please enable notifications first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusIcon = () => {
    if (!isSupported) return FiBellOff;
    if (permission === 'denied') return FiX;
    if (isSubscribed) return FiCheck;
    return FiBell;
  };

  const getStatusColor = () => {
    if (!isSupported) return 'gray';
    if (permission === 'denied') return 'red';
    if (isSubscribed) return 'green';
    return 'orange';
  };

  const getStatusText = () => {
    if (!isSupported) return 'Not Supported';
    if (permission === 'denied') return 'Denied';
    if (isSubscribed) return 'Active';
    if (permission === 'granted') return 'Ready';
    return 'Disabled';
  };

  const notificationTypes = [
    {
      key: 'matchUpdates',
      label: 'Match Updates',
      description: 'Get notified when match analysis is ready',
      icon: FiGamepad2,
      color: 'blue'
    },
    {
      key: 'heroUpdates',
      label: 'Hero Recommendations',
      description: 'New hero suggestions based on your play',
      icon: FiTrendingUp,
      color: 'green'
    },
    {
      key: 'metaChanges',
      label: 'Meta Changes',
      description: 'Important patch and meta updates',
      icon: FiAlertCircle,
      color: 'orange'
    },
    {
      key: 'weeklyDigest',
      label: 'Weekly Digest',
      description: 'Your weekly performance summary',
      icon: FiCalendar,
      color: 'purple'
    },
    {
      key: 'majorUpdates',
      label: 'Major Updates',
      description: 'App updates and new features',
      icon: FiSettings,
      color: 'cyan'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <HStack spacing={3}>
          <Icon as={FiBell} boxSize="24px" color="blue.500" />
          <VStack spacing={0} align="start">
            <Heading size="md">Push Notifications</Heading>
            <HStack spacing={2}>
              <Badge colorScheme={getStatusColor()} variant="subtle">
                <HStack spacing={1}>
                  <Icon as={getStatusIcon()} boxSize="12px" />
                  <Text>{getStatusText()}</Text>
                </HStack>
              </Badge>
            </HStack>
          </VStack>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Support Check */}
          {!isSupported && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Not Supported</AlertTitle>
                <AlertDescription>
                  Push notifications are not supported in your browser.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Permission Status */}
          {isSupported && (
            <Box>
              <Text fontWeight="semibold" mb={3}>Notification Status</Text>
              
              {permission === 'default' && (
                <Alert status="info" borderRadius="md" mb={3}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Enable Notifications</AlertTitle>
                    <AlertDescription>
                      Allow notifications to stay updated with your Dota 2 data.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {permission === 'denied' && (
                <Alert status="warning" borderRadius="md" mb={3}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Notifications Blocked</AlertTitle>
                    <AlertDescription>
                      Please enable notifications in your browser settings.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              <HStack spacing={3}>
                {permission === 'default' && (
                  <Button
                    leftIcon={<FiBell />}
                    colorScheme="blue"
                    onClick={handlePermissionRequest}
                    isLoading={isLoading}
                    loadingText="Requesting..."
                  >
                    Enable Notifications
                  </Button>
                )}

                {permission === 'granted' && !isSubscribed && (
                  <Button
                    leftIcon={<FiBell />}
                    colorScheme="green"
                    onClick={handleSubscribe}
                    isLoading={isLoading}
                    loadingText="Subscribing..."
                  >
                    Subscribe
                  </Button>
                )}

                {isSubscribed && (
                  <Button
                    leftIcon={<FiBellOff />}
                    variant="outline"
                    colorScheme="red"
                    onClick={handleUnsubscribe}
                    isLoading={isLoading}
                    loadingText="Unsubscribing..."
                  >
                    Unsubscribe
                  </Button>
                )}
              </HStack>
            </Box>
          )}

          {/* Notification Preferences */}
          {isSupported && permission === 'granted' && (
            <>
              <Divider />
              <Box>
                <Text fontWeight="semibold" mb={4}>Notification Types</Text>
                <VStack spacing={4} align="stretch">
                  {notificationTypes.map((type) => (
                    <HStack key={type.key} justify="space-between" p={3} borderRadius="md" bg="gray.50" _dark={{ bg: "gray.700" }}>
                      <HStack spacing={3}>
                        <Icon as={type.icon} color={`${type.color}.500`} boxSize="20px" />
                        <VStack spacing={0} align="start">
                          <Text fontWeight="medium">{type.label}</Text>
                          <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                            {type.description}
                          </Text>
                        </VStack>
                      </HStack>
                      <Switch
                        isChecked={preferences[type.key]}
                        onChange={(e) => handlePreferenceChange(type.key, e.target.checked)}
                        colorScheme={type.color}
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </>
          )}

          {/* Demo Notifications */}
          {isSubscribed && (
            <>
              <Divider />
              <Box>
                <Text fontWeight="semibold" mb={4}>Test Notifications</Text>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDemoNotification('match')}
                  >
                    Match
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDemoNotification('hero')}
                  >
                    Hero
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDemoNotification('meta')}
                  >
                    Meta
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDemoNotification('weekly')}
                  >
                    Weekly
                  </Button>
                </SimpleGrid>
              </Box>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default NotificationSettings;