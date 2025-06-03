// frontend/src/pages/RecommendationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  Select,
  Checkbox,
  Flex,
  Spinner,
  Icon
} from '@chakra-ui/react';
import { FaUser, FaStar, FaTrophy, FaUsers, FaFilter } from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';
import { fileBackend } from '../services/fileBackend.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';

const RecommendationsPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState({});
  const [heroData, setHeroData] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Carry');
  const [activeTab, setActiveTab] = useState('role_based');
  const [filters, setFilters] = useState({
    skill_level: '',
    complexity: '',
    meta_only: false
  });

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  useEffect(() => {
    if (recommendations.role_based && selectedRole) {
      // Auto-select first available role if current selection doesn't exist
      const availableRoles = Object.keys(recommendations.role_based);
      if (!availableRoles.includes(selectedRole) && availableRoles.length > 0) {
        setSelectedRole(availableRoles[0]);
      }
    }
  }, [recommendations, selectedRole]);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile for personalized recommendations
      const profile = await fileBackend.getCurrentUserProfile();
      setUserProfile(profile);

      // Load recommendations with user preferences
      const recData = await fileBackend.getHeroRecommendations(filters);
      setRecommendations(recData);

      // Load hero data for additional info (optional fallback)
      try {
        const response = await fetch('https://api.opendota.com/api/heroes');
        if (response.ok) {
          const heroes = await response.json();
          const heroMap = heroes.reduce((map, hero) => {
            map[hero.id] = hero;
            return map;
          }, {});
          setHeroData(heroMap);
        }
      } catch (apiError) {
        console.warn('Failed to load additional hero data from OpenDota API:', apiError);
        // Continue without external data
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Reload recommendations with new filters
    loadRecommendations();
  };

  const renderHeroCard = (hero, reason = null) => {
    const heroInfo = heroData[hero.id] || heroData[hero.hero_id] || hero;
    const cardData = {
      ...heroInfo,
      ...hero,
      reason: reason || hero.reason
    };

    return (
      <RecommendationCard
        key={hero.id || hero.hero_id}
        type="hero"
        data={cardData}
        onClick={() => {
          // Optional: Navigate to hero detail page
          console.log('Hero selected:', cardData);
        }}
      />
    );
  };

  const renderComboCard = (combo) => (
    <RecommendationCard
      key={combo.name || combo.id}
      type="combo"
      data={combo}
      showFavorites={false}
    />
  );

  if (loading) {
    return (
      <Container maxW="7xl" py={8} centerContent>
        <VStack spacing={4}>
          <Spinner size="xl" color="dota.teal.500" thickness="4px" />
          <Text color="dota.text.secondary">Loading recommendations...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="md" py={20}>
        <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={8} textAlign="center">
          <VStack spacing={6}>
            <Box bg="dota.bg.secondary" borderColor="dota.status.error" borderWidth={1} borderRadius="md" p={4}>
              <VStack align="start" spacing={2}>
                <Heading size="md" color="dota.text.primary">
                  Error Loading Recommendations
                </Heading>
                <Text color="dota.text.secondary">{error}</Text>
              </VStack>
            </Box>
            <Button
              onClick={loadRecommendations}
              variant="primary"
              size="lg"
            >
              Retry
            </Button>
          </VStack>
        </Card>
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
              <Text color="dota.text.secondary" lineHeight="1.6">
                Please log in to get personalized hero recommendations based on your preferences.
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

  const availableRoles = recommendations.role_based ? Object.keys(recommendations.role_based) : [];

  return (
    <Container maxW="7xl" py={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading 
            size="xl" 
            color="dota.text.primary" 
            mb={4}
            textShadow="0 0 10px rgba(39, 174, 158, 0.3)"
          >
            Hero Recommendations
          </Heading>
          <Text color="dota.text.secondary" fontSize="lg">
            Personalized recommendations based on your skill level and preferences
            {userProfile && (
              <Badge ml={2} variant="solid" colorScheme="teal">
                {userProfile.preferences?.skill_level || 'beginner'} level
              </Badge>
            )}
          </Text>
        </Box>

        {/* Filters */}
        <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={4}>
          <VStack spacing={4}>
            <HStack spacing={3}>
              <Icon as={FaFilter} color="dota.teal.500" />
              <Heading size="sm" color="dota.text.primary">
                Filter Recommendations
              </Heading>
            </HStack>
            
            <Flex wrap="wrap" gap={4} align="center" justify="center">
              <HStack spacing={2}>
                <Text fontSize="sm" fontWeight="medium" color="dota.text.secondary">
                  Skill Level:
                </Text>
                <Select
                  value={filters.skill_level}
                  onChange={(e) => handleFilterChange('skill_level', e.target.value)}
                  size="sm"
                  w="auto"
                  minW="120px"
                  bg="dota.bg.secondary"
                  borderColor="dota.bg.tertiary"
                  color="dota.text.primary"
                  _focus={{
                    borderColor: "dota.teal.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-dota-teal-500)"
                  }}
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </HStack>

              <HStack spacing={2}>
                <Text fontSize="sm" fontWeight="medium" color="dota.text.secondary">
                  Complexity:
                </Text>
                <Select
                  value={filters.complexity}
                  onChange={(e) => handleFilterChange('complexity', e.target.value)}
                  size="sm"
                  w="auto"
                  minW="100px"
                  bg="dota.bg.secondary"
                  borderColor="dota.bg.tertiary"
                  color="dota.text.primary"
                  _focus={{
                    borderColor: "dota.teal.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-dota-teal-500)"
                  }}
                >
                  <option value="">Any</option>
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="complex">Complex</option>
                </Select>
              </HStack>

              <Checkbox
                isChecked={filters.meta_only}
                onChange={(e) => handleFilterChange('meta_only', e.target.checked)}
                colorScheme="teal"
                size="sm"
                color="dota.text.secondary"
              >
                Meta heroes only
              </Checkbox>

              <Button
                onClick={loadRecommendations}
                variant="primary"
                size="sm"
                leftIcon={<Icon as={FaFilter} />}
              >
                Refresh
              </Button>
            </Flex>
          </VStack>
        </Card>

        {/* Category Tabs */}
        <Box>
          <Box bg="dota.bg.card" borderColor="dota.bg.tertiary" borderWidth={1} borderRadius="md" p={2}>
            <HStack spacing={1} wrap="wrap">
              <Button 
                onClick={() => setActiveTab('role_based')}
                variant={activeTab === 'role_based' ? "solid" : "ghost"}
                size="sm"
                colorScheme={activeTab === 'role_based' ? "teal" : "gray"}
                borderRadius="md"
              >
                <HStack spacing={2}>
                  <Icon as={FaShield} />
                  <Text>By Role ({availableRoles.length})</Text>
                </HStack>
              </Button>
              {recommendations.beginner_friendly && (
                <Button 
                  onClick={() => setActiveTab('beginner_friendly')}
                  variant={activeTab === 'beginner_friendly' ? "solid" : "ghost"}
                  size="sm"
                  colorScheme={activeTab === 'beginner_friendly' ? "teal" : "gray"}
                  borderRadius="md"
                >
                  <HStack spacing={2}>
                    <Icon as={FaStar} />
                    <Text>Beginner Friendly ({recommendations.beginner_friendly.length})</Text>
                  </HStack>
                </Button>
              )}
              {recommendations.meta_picks && (
                <Button 
                  onClick={() => setActiveTab('meta_picks')}
                  variant={activeTab === 'meta_picks' ? "solid" : "ghost"}
                  size="sm"
                  colorScheme={activeTab === 'meta_picks' ? "teal" : "gray"}
                  borderRadius="md"
                >
                  <HStack spacing={2}>
                    <Icon as={FaTrophy} />
                    <Text>Meta Picks ({recommendations.meta_picks.length})</Text>
                  </HStack>
                </Button>
              )}
              {recommendations.counter_picks && (
                <Button 
                  onClick={() => setActiveTab('counter_picks')}
                  variant={activeTab === 'counter_picks' ? "solid" : "ghost"}
                  size="sm"
                  colorScheme={activeTab === 'counter_picks' ? "teal" : "gray"}
                  borderRadius="md"
                >
                  <HStack spacing={2}>
                    <Icon as={FaShield} />
                    <Text>Counters</Text>
                  </HStack>
                </Button>
              )}
              {recommendations.synergies?.strong_combos && (
                <Button 
                  onClick={() => setActiveTab('synergies')}
                  variant={activeTab === 'synergies' ? "solid" : "ghost"}
                  size="sm"
                  colorScheme={activeTab === 'synergies' ? "teal" : "gray"}
                  borderRadius="md"
                >
                  <HStack spacing={2}>
                    <Icon as={FaUsers} />
                    <Text>Synergies ({recommendations.synergies.strong_combos.length})</Text>
                  </HStack>
                </Button>
              )}
            </HStack>
          </Box>
          
          {activeTab === 'role_based' && (
              <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                <VStack spacing={6} align="stretch">
                  <HStack wrap="wrap" spacing={2}>
                    {availableRoles.map(role => (
                      <Button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        variant={selectedRole === role ? 'solid' : 'outline'}
                        size="sm"
                        colorScheme={selectedRole === role ? 'teal' : 'gray'}
                        borderRadius="full"
                      >
                        {role} ({recommendations.role_based[role]?.length || 0})
                      </Button>
                    ))}
                  </HStack>

                  {selectedRole && recommendations.role_based[selectedRole] && (
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color="dota.text.primary">
                        Recommended {selectedRole} Heroes
                      </Heading>
                      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                        {recommendations.role_based[selectedRole].map(hero =>
                          renderHeroCard(hero, `Great ${selectedRole.toLowerCase()} for your skill level`)
                        )}
                      </Grid>
                    </VStack>
                  )}
                </VStack>
              </Card>
          )}

          {activeTab === 'beginner_friendly' && (
              <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                <VStack spacing={6} align="stretch">
                  <VStack spacing={3} align="start">
                    <Heading size="md" color="dota.text.primary">
                      Beginner Friendly Heroes
                    </Heading>
                    <Text color="dota.text.secondary">
                      These heroes are great for learning the game with straightforward mechanics and forgiving gameplay.
                    </Text>
                  </VStack>
                  
                  {recommendations.beginner_friendly && (
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                      {recommendations.beginner_friendly.map(hero =>
                        renderHeroCard(hero, 'Perfect for learning the game')
                      )}
                    </Grid>
                  )}
                </VStack>
              </Card>
          )}

          {activeTab === 'meta_picks' && (
              <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                <VStack spacing={6} align="stretch">
                  <VStack spacing={3} align="start">
                    <Heading size="md" color="dota.text.primary">
                      Current Meta Picks
                    </Heading>
                    <Text color="dota.text.secondary">
                      Heroes that are particularly strong in the current meta and ranked matches.
                    </Text>
                  </VStack>
                  
                  {recommendations.meta_picks && (
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                      {recommendations.meta_picks.map(hero =>
                        renderHeroCard(hero, 'Strong in current meta')
                      )}
                    </Grid>
                  )}
                </VStack>
              </Card>
          )}

          {activeTab === 'counter_picks' && (
              <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                <VStack spacing={6} align="stretch">
                  <VStack spacing={3} align="start">
                    <Heading size="md" color="dota.text.primary">
                      Counter Picks
                    </Heading>
                    <Text color="dota.text.secondary">
                      Select a hero to see its counters and who it's effective against.
                    </Text>
                  </VStack>
                  
                  {recommendations.counter_picks && (
                    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
                      {Object.keys(recommendations.counter_picks).slice(0, 12).map(heroId => {
                        const heroName = heroData[heroId]?.localized_name || `Hero ${heroId}`;
                        const counterData = recommendations.counter_picks[heroId];
                        return (
                          <Card key={heroId} bg="dota.bg.secondary" borderWidth={1} borderColor="dota.bg.tertiary" p={3}>
                            <VStack spacing={2} align="start">
                              <Heading size="xs" color="dota.text.primary" noOfLines={1}>
                                {heroName}
                              </Heading>
                              <VStack spacing={1} align="start" fontSize="xs">
                                <Text color="dota.text.secondary">
                                  Counters: {counterData.counters?.length || 0}
                                </Text>
                                <Text color="dota.text.secondary">
                                  Countered by: {counterData.countered_by?.length || 0}
                                </Text>
                              </VStack>
                            </VStack>
                          </Card>
                        );
                      })}
                    </Grid>
                  )}
                </VStack>
              </Card>
          )}

          {activeTab === 'synergies' && (
              <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                <VStack spacing={6} align="stretch">
                  <VStack spacing={3} align="start">
                    <Heading size="md" color="dota.text.primary">
                      Hero Synergies
                    </Heading>
                    <Text color="dota.text.secondary">
                      Powerful hero combinations that work well together.
                    </Text>
                  </VStack>
                  
                  {recommendations.synergies?.strong_combos && (
                    <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                      {recommendations.synergies.strong_combos.map((combo, index) =>
                        renderComboCard({ ...combo, id: index })
                      )}
                    </Grid>
                  )}
                </VStack>
              </Card>
          )}
        </Box>

        {/* No Profile Prompt */}
        {!userProfile && (
          <Card 
            bg="dota.bg.card" 
            borderWidth={1} 
            borderColor="dota.teal.500" 
            p={8} 
            textAlign="center"
            bgGradient="linear(to-r, dota.bg.card, dota.bg.secondary)"
          >
            <VStack spacing={6}>
              <VStack spacing={2}>
                <Heading size="md" color="dota.text.primary">
                  Get Personalized Recommendations
                </Heading>
                <Text color="dota.text.secondary">
                  Create a user profile to get recommendations tailored to your skill level and preferences.
                </Text>
              </VStack>
              <Button
                as={Link}
                to="/profile"
                variant="primary"
                size="lg"
              >
                Create Profile
              </Button>
            </VStack>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default RecommendationsPage;