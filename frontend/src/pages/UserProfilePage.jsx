// frontend/src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  Badge,
  Button,
  Avatar,
  Flex,
  Spinner,
  Icon
} from '@chakra-ui/react';
import { FaUser, FaStar, FaHammer, FaGamepad, FaDownload, FaUpload, FaCog } from 'react-icons/fa';
import { fileBackend } from '../services/fileBackend.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import UserPreferences from '../components/UserPreferences.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';
import FavoritesButton from '../components/FavoritesButton.jsx';

const UserProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // const toast = useToast(); // Temporarily disabled for Chakra UI v3 migration
  const [profile, setProfile] = useState(null);
  const [favoriteHeroes, setFavoriteHeroes] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [customBuilds, setCustomBuilds] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load or create user profile
      let userProfile = await fileBackend.getCurrentUserProfile();
      
      if (!userProfile && user) {
        // Create a new profile if none exists
        userProfile = await fileBackend.createUserProfile(
          user.steamId,
          user.personaName,
          {
            skill_level: 'beginner',
            preferred_roles: [],
            playstyle: 'balanced'
          }
        );
      }

      if (userProfile) {
        setProfile(userProfile);
        
        // Load user's favorites and custom data
        const [heroes, items, builds, matches] = await Promise.all([
          fileBackend.getFavoriteHeroes(),
          fileBackend.getFavoriteItems(),
          fileBackend.getCustomBuilds(),
          fileBackend.getCachedMatches(5)
        ]);

        setFavoriteHeroes(heroes);
        setFavoriteItems(items);
        setCustomBuilds(builds);
        setRecentMatches(matches);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCreateProfile = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const newProfile = await fileBackend.createUserProfile(
        user.steamId,
        user.personaName
      );
      setProfile(newProfile);
      setShowPreferences(true);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile');
    }
  };

  const handlePreferencesSave = (preferences) => {
    setProfile(prev => ({ ...prev, preferences }));
    setShowPreferences(false);
  };

  const handleExportData = async () => {
    try {
      const userData = await fileBackend.exportUserData();
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dota2-companion-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Toast temporarily disabled for Chakra UI v3 migration
      console.log("Data exported successfully");
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
      // Toast temporarily disabled for Chakra UI v3 migration
      console.error("Export failed:", err.message);
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const userData = JSON.parse(text);
      await fileBackend.importUserData(userData);
      await loadUserData(); // Reload data
      
      // Toast temporarily disabled for Chakra UI v3 migration
      console.log("Data imported successfully");
    } catch (err) {
      console.error('Error importing data:', err);
      setError('Failed to import data');
      // Toast temporarily disabled for Chakra UI v3 migration
      console.error("Import failed:", err.message);
    }
  };

  if (loading) {
    return (
      <Container maxW="6xl" py={8} centerContent>
        <VStack spacing={4}>
          <Spinner size="xl" color="dota.teal.500" thickness="4px" />
          <Text color="dota.text.secondary">Loading your profile...</Text>
        </VStack>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxW="md" py={20}>
        <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={8} textAlign="center">
          <VStack spacing={6}>
            <Icon as={FaUser} boxSize={16} color="dota.text.muted" />
            <VStack spacing={2}>
              <Heading size="lg" color="dota.text.primary">
                Login Required
              </Heading>
              <Text color="dota.text.secondary">
                You need to log in to access your profile.
              </Text>
            </VStack>
            <Button
              as={Link}
              to="/login"
              variant="primary"
              size="lg"
              w="full"
            >
              Go to Login
            </Button>
          </VStack>
        </Card>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxW="md" py={20}>
        <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={8} textAlign="center">
          <VStack spacing={6}>
            <Icon as={FaGamepad} boxSize={16} color="dota.teal.500" />
            <VStack spacing={3}>
              <Heading size="lg" color="dota.text.primary">
                Welcome to Dota 2 Companion!
              </Heading>
              <Text color="dota.text.secondary" lineHeight="1.6">
                Create your profile to start tracking favorites, custom builds, and get personalized recommendations.
              </Text>
            </VStack>
            
            {error && (
              <Box bg="dota.bg.secondary" borderColor="dota.status.error" borderWidth={1} borderRadius="md" p={4}>
                <Text color="dota.text.primary">{error}</Text>
              </Box>
            )}
            
            <Button
              onClick={handleCreateProfile}
              variant="primary"
              size="lg"
              w="full"
            >
              Create Profile
            </Button>
          </VStack>
        </Card>
      </Container>
    );
  }

  if (showPreferences) {
    return (
      <UserPreferences
        onSave={handlePreferencesSave}
        onCancel={() => setShowPreferences(false)}
      />
    );
  }

  return (
    <Container maxW="6xl" py={6}>
      <VStack spacing={8} align="stretch">
        {error && (
          <Box bg="dota.bg.card" borderColor="dota.status.error" borderWidth={1} borderRadius="md" p={4}>
            <Flex justify="space-between" align="center">
              <Text color="dota.text.primary" flex={1}>{error}</Text>
              <Button
                onClick={() => setError(null)}
                variant="ghost"
                size="sm"
                color="dota.status.error"
              >
                ×
              </Button>
            </Flex>
          </Box>
        )}

        {/* Profile Header */}
        <Card
          bg="dota.bg.card"
          borderWidth={1}
          borderColor="dota.bg.tertiary"
          p={6}
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgGradient: 'linear(to-r, dota.teal.500, dota.purple.500)'
          }}
        >
          <Flex 
            direction={{ base: "column", lg: "row" }} 
            align={{ base: "center", lg: "start" }} 
            justify="space-between"
            gap={6}
          >
            <HStack spacing={6} align="center">
              <Avatar
                src={user.avatarUrl}
                name={profile.persona_name}
                size="xl"
                border="4px solid"
                borderColor="dota.teal.500"
                boxShadow="dota-glow"
              />
              
              <VStack align={{ base: "center", lg: "start" }} spacing={2}>
                <Heading size="xl" color="dota.text.primary">
                  {profile.persona_name}
                </Heading>
                <VStack align={{ base: "center", lg: "start" }} spacing={1}>
                  <Text color="dota.text.secondary" fontSize="sm">
                    Steam ID: {profile.steam_id}
                  </Text>
                  <Text color="dota.text.muted" fontSize="xs">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </Text>
                </VStack>
              </VStack>
            </HStack>
            
            <HStack spacing={2} wrap="wrap" justify="center">
              <Button
                onClick={() => setShowPreferences(true)}
                variant="primary"
                size="sm"
                leftIcon={<Icon as={FaCog} />}
              >
                Edit Preferences
              </Button>
              
              <Button
                onClick={handleExportData}
                variant="secondary"
                size="sm"
                leftIcon={<Icon as={FaDownload} />}
              >
                Export Data
              </Button>
              
              <Button
                as="label"
                variant="outline"
                size="sm"
                leftIcon={<Icon as={FaUpload} />}
                cursor="pointer"
                _hover={{ bg: "dota.bg.hover" }}
              >
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </Button>
            </HStack>
          </Flex>
        </Card>

        {/* Tab Content */}
        <Box>
          <Box bg="dota.bg.card" borderColor="dota.bg.tertiary" borderWidth={1} borderRadius="md" p={2}>
            <HStack spacing={1} wrap="wrap">
              <Button 
                onClick={() => setActiveTab('profile')}
                variant={activeTab === 'profile' ? "solid" : "ghost"}
                size="sm"
                colorScheme={activeTab === 'profile' ? "teal" : "gray"}
                borderRadius="md"
              >
                <HStack spacing={2}>
                  <Icon as={FaUser} />
                  <Text>Profile Overview</Text>
                </HStack>
              </Button>
              <Button 
                onClick={() => setActiveTab('favorites')}
                variant={activeTab === 'favorites' ? "solid" : "ghost"}
                size="sm"
                colorScheme={activeTab === 'favorites' ? "teal" : "gray"}
                borderRadius="md"
              >
                <HStack spacing={2}>
                  <Icon as={FaStar} />
                  <Text>Favorites ({favoriteHeroes.length + favoriteItems.length})</Text>
                </HStack>
              </Button>
              <Button 
                onClick={() => setActiveTab('builds')}
                variant={activeTab === 'builds' ? "solid" : "ghost"}
                size="sm"
                colorScheme={activeTab === 'builds' ? "teal" : "gray"}
                borderRadius="md"
              >
                <HStack spacing={2}>
                  <Icon as={FaHammer} />
                  <Text>Custom Builds ({customBuilds.length})</Text>
                </HStack>
              </Button>
              <Button 
                onClick={() => setActiveTab('matches')}
                variant={activeTab === 'matches' ? "solid" : "ghost"}
                size="sm"
                colorScheme={activeTab === 'matches' ? "teal" : "gray"}
                borderRadius="md"
              >
                <HStack spacing={2}>
                  <Icon as={FaGamepad} />
                  <Text>Recent Matches</Text>
                </HStack>
              </Button>
            </HStack>
          </Box>
          
          {activeTab === 'profile' && (
              <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="dota.text.primary">
                    Profile Overview
                  </Heading>
                  
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
                    <GridItem>
                      <VStack spacing={4} align="stretch">
                        <Heading size="sm" color="dota.text.secondary">
                          Preferences
                        </Heading>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="dota.text.secondary">Skill Level:</Text>
                            <Badge variant="outline" colorScheme="teal">
                              {profile.preferences?.skill_level || 'Not set'}
                            </Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="dota.text.secondary">Playstyle:</Text>
                            <Badge variant="outline" colorScheme="purple">
                              {profile.preferences?.playstyle || 'Not set'}
                            </Badge>
                          </HStack>
                          <VStack align="stretch" spacing={2}>
                            <Text fontSize="sm" color="dota.text.secondary">Preferred Roles:</Text>
                            <HStack wrap="wrap" spacing={1}>
                              {profile.preferences?.preferred_roles?.length > 0 
                                ? profile.preferences.preferred_roles.map(role => (
                                    <Badge key={role} size="sm" variant="solid" colorScheme="blue">
                                      {role}
                                    </Badge>
                                  ))
                                : <Text fontSize="xs" color="dota.text.muted">None selected</Text>
                              }
                            </HStack>
                          </VStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="dota.text.secondary">Game Mode:</Text>
                            <Badge variant="outline">
                              {profile.preferences?.game_mode_preference || 'Not set'}
                            </Badge>
                          </HStack>
                        </VStack>
                      </VStack>
                    </GridItem>
                    
                    <GridItem>
                      <VStack spacing={4} align="stretch">
                        <Heading size="sm" color="dota.text.secondary">
                          Statistics
                        </Heading>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <VStack spacing={1} align="start">
                            <Text color="dota.text.muted" fontSize="xs">Favorite Heroes</Text>
                            <Text color="dota.teal.500" fontSize="lg" fontWeight="bold">{favoriteHeroes.length}</Text>
                          </VStack>
                          <VStack spacing={1} align="start">
                            <Text color="dota.text.muted" fontSize="xs">Favorite Items</Text>
                            <Text color="dota.purple.500" fontSize="lg" fontWeight="bold">{favoriteItems.length}</Text>
                          </VStack>
                          <VStack spacing={1} align="start">
                            <Text color="dota.text.muted" fontSize="xs">Custom Builds</Text>
                            <Text color="dota.darkBlue.500" fontSize="lg" fontWeight="bold">{customBuilds.length}</Text>
                          </VStack>
                          <VStack spacing={1} align="start">
                            <Text color="dota.text.muted" fontSize="xs">Cached Matches</Text>
                            <Text color="dota.text.accent" fontSize="lg" fontWeight="bold">{recentMatches.length}</Text>
                          </VStack>
                        </Grid>
                      </VStack>
                    </GridItem>
                  </Grid>

                  <VStack spacing={4} align="stretch">
                    <Heading size="sm" color="dota.text.secondary">
                      Quick Actions
                    </Heading>
                    <HStack wrap="wrap" spacing={3}>
                      <Button
                        as={Link}
                        to="/heroes"
                        variant="outline"
                        size="sm"
                        colorScheme="teal"
                      >
                        Browse Heroes
                      </Button>
                      <Button
                        as={Link}
                        to="/recommendations"
                        variant="outline"
                        size="sm"
                        colorScheme="green"
                      >
                        Get Recommendations
                      </Button>
                      <Button
                        onClick={() => setActiveTab('favorites')}
                        variant="outline"
                        size="sm"
                        colorScheme="purple"
                      >
                        View Favorites
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>
              </Card>
          )}

          {activeTab === 'favorites' && (
              <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="dota.text.primary">
                    Your Favorites
                  </Heading>
                  
                  {favoriteHeroes.length === 0 && favoriteItems.length === 0 ? (
                    <VStack spacing={4} py={12} textAlign="center">
                      <Icon as={FaStar} boxSize={16} color="dota.text.muted" />
                      <Text color="dota.text.secondary">
                        You haven't added any favorites yet.
                      </Text>
                      <Button
                        as={Link}
                        to="/heroes"
                        variant="primary"
                        size="lg"
                      >
                        Browse Heroes to Add Favorites
                      </Button>
                    </VStack>
                  ) : (
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                      {favoriteHeroes.length > 0 && (
                        <GridItem>
                          <VStack spacing={4} align="stretch">
                            <Heading size="sm" color="dota.text.secondary">
                              Favorite Heroes ({favoriteHeroes.length})
                            </Heading>
                            <VStack spacing={3} align="stretch">
                              {favoriteHeroes.map(hero => (
                                <Card key={hero.hero_id} bg="dota.bg.secondary" borderWidth={1} borderColor="dota.bg.tertiary" p={3}>
                                  <Flex justify="space-between" align="center">
                                    <HStack spacing={3}>
                                      <Box 
                                        w={12} 
                                        h={12} 
                                        bg="dota.bg.tertiary" 
                                        borderRadius="md" 
                                        display="flex" 
                                        alignItems="center" 
                                        justifyContent="center"
                                      >
                                        <Text fontSize="xs" fontWeight="bold" color="dota.text.primary">
                                          {hero.hero_name.substring(0, 2).toUpperCase()}
                                        </Text>
                                      </Box>
                                      <VStack align="start" spacing={1}>
                                        <Text fontWeight="medium" color="dota.text.primary" fontSize="sm">
                                          {hero.hero_name}
                                        </Text>
                                        <Badge size="sm" variant="outline" colorScheme="teal">
                                          {hero.role}
                                        </Badge>
                                        {hero.notes && (
                                          <Text fontSize="xs" color="dota.text.muted" fontStyle="italic">
                                            {hero.notes}
                                          </Text>
                                        )}
                                      </VStack>
                                    </HStack>
                                    <FavoritesButton
                                      type="hero"
                                      id={hero.hero_id}
                                      name={hero.hero_name}
                                      role={hero.role}
                                    />
                                  </Flex>
                                </Card>
                              ))}
                            </VStack>
                          </VStack>
                        </GridItem>
                      )}

                      {favoriteItems.length > 0 && (
                        <GridItem>
                          <VStack spacing={4} align="stretch">
                            <Heading size="sm" color="dota.text.secondary">
                              Favorite Items ({favoriteItems.length})
                            </Heading>
                            <VStack spacing={3} align="stretch">
                              {favoriteItems.map(item => (
                                <Card key={item.item_id} bg="dota.bg.secondary" borderWidth={1} borderColor="dota.bg.tertiary" p={3}>
                                  <Flex justify="space-between" align="center">
                                    <HStack spacing={3}>
                                      <Box 
                                        w={12} 
                                        h={12} 
                                        bg="dota.bg.tertiary" 
                                        borderRadius="md" 
                                        display="flex" 
                                        alignItems="center" 
                                        justifyContent="center"
                                      >
                                        <Text fontSize="xs" fontWeight="bold" color="dota.text.primary">
                                          {item.item_name.substring(0, 2).toUpperCase()}
                                        </Text>
                                      </Box>
                                      <VStack align="start" spacing={1}>
                                        <Text fontWeight="medium" color="dota.text.primary" fontSize="sm">
                                          {item.item_name}
                                        </Text>
                                        <Badge size="sm" variant="outline" colorScheme="purple">
                                          {item.category}
                                        </Badge>
                                        {item.notes && (
                                          <Text fontSize="xs" color="dota.text.muted" fontStyle="italic">
                                            {item.notes}
                                          </Text>
                                        )}
                                      </VStack>
                                    </HStack>
                                    <FavoritesButton
                                      type="item"
                                      id={item.item_id}
                                      name={item.item_name}
                                      category={item.category}
                                    />
                                  </Flex>
                                </Card>
                              ))}
                            </VStack>
                          </VStack>
                        </GridItem>
                      )}
                    </Grid>
                  )}
                </VStack>
              </Card>
          )}

          {activeTab === 'builds' && (
              <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="dota.text.primary">
                    Custom Builds
                  </Heading>
                  
                  {customBuilds.length === 0 ? (
                    <VStack spacing={4} py={12} textAlign="center">
                      <Icon as={FaHammer} boxSize={16} color="dota.text.muted" />
                      <VStack spacing={2}>
                        <Text color="dota.text.secondary">
                          You haven't created any custom builds yet.
                        </Text>
                        <Text fontSize="sm" color="dota.text.muted">
                          Create builds while browsing heroes or items to see them here.
                        </Text>
                      </VStack>
                    </VStack>
                  ) : (
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                      {customBuilds.map(build => (
                        <RecommendationCard
                          key={build.build_id}
                          type="build"
                          data={build}
                          showFavorites={false}
                        />
                      ))}
                    </Grid>
                  )}
                </VStack>
              </Card>
          )}

          {activeTab === 'matches' && (
              <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                <VStack spacing={6} align="stretch">
                  <Heading size="md" color="dota.text.primary">
                    Recent Matches
                  </Heading>
                  
                  {recentMatches.length === 0 ? (
                    <VStack spacing={4} py={12} textAlign="center">
                      <Icon as={FaGamepad} boxSize={16} color="dota.text.muted" />
                      <VStack spacing={2}>
                        <Text color="dota.text.secondary">
                          No recent matches cached.
                        </Text>
                        <Text fontSize="sm" color="dota.text.muted">
                          Matches will be cached automatically when you view player profiles.
                        </Text>
                      </VStack>
                    </VStack>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {recentMatches.map(match => (
                        <Card key={match.match_id} bg="dota.bg.secondary" borderWidth={1} borderColor="dota.bg.tertiary" p={4}>
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="medium" color="dota.text.primary">
                                Match ID: {match.match_id}
                              </Text>
                              <HStack spacing={4}>
                                <Badge
                                  variant="solid"
                                  colorScheme={match.result === 'win' ? 'green' : 'red'}
                                  fontSize="xs"
                                >
                                  {match.result === 'win' ? '✅ WIN' : '❌ LOSS'}
                                </Badge>
                                <Text fontSize="sm" color="dota.text.secondary">
                                  Duration: {match.duration}s
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color="dota.text.secondary">
                                KDA: {match.kda?.kills || 0}/{match.kda?.deaths || 0}/{match.kda?.assists || 0}
                              </Text>
                            </VStack>
                            <Text fontSize="xs" color="dota.text.muted">
                              {new Date(match.cached_at).toLocaleDateString()}
                            </Text>
                          </Flex>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </Card>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default UserProfilePage;