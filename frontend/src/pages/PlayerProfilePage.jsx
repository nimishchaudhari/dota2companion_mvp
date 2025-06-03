// frontend/src/pages/PlayerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Image,
  Spinner
} from '@chakra-ui/react';
import { FaUser, FaTrophy, FaGamepad, FaStar } from 'react-icons/fa';
import { api } from '../services/api.js';
import { fileBackend } from '../services/fileBackend.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import FavoritesButton from '../components/FavoritesButton.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';

const PlayerProfilePage = () => {
    const { playerId } = useParams(); 
    const { user } = useAuth();
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Simple hero data store for this page, ideally this comes from a context or is fetched more globally
    const [heroesData, setHeroesData] = useState({});
    const [heroRecommendations, setHeroRecommendations] = useState([]);
    const [_userProfile, setUserProfile] = useState(null);
    const [showAnalysisTab, setShowAnalysisTab] = useState(false); 

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch heroes data if not already available - simplified for POC
                if (Object.keys(heroesData).length === 0) {
                    const heroes = await api.getHeroes();
                    const heroesMap = heroes.reduce((map, hero) => {
                        map[hero.id] = hero;
                        return map;
                    }, {});
                    setHeroesData(heroesMap);
                }

                const playerData = await api.getPlayerSummary(playerId);
                setPlayerData(playerData);

                // Load user profile and recommendations if logged in
                if (user) {
                    try {
                        const profile = await fileBackend.getCurrentUserProfile();
                        setUserProfile(profile);

                        // Get hero recommendations based on player's most played heroes
                        if (playerData?.recentMatches?.length > 0) {
                            const playedHeroes = [...new Set(playerData.recentMatches.map(m => m.hero_id))];
                            const recommendations = await fileBackend.getHeroRecommendations({
                                exclude_heroes: playedHeroes.slice(0, 5) // Exclude recently played
                            });
                            
                            // Get beginner friendly or role-based recommendations
                            const recsList = recommendations.beginner_friendly || 
                                           Object.values(recommendations.role_based || {})[0] || [];
                            setHeroRecommendations(recsList.slice(0, 4));
                        }

                        // Cache this match data if it's the user's own profile
                        if (profile && playerData?.recentMatches?.length > 0) {
                            for (const match of playerData.recentMatches.slice(0, 3)) {
                                await fileBackend.cacheMatchData({
                                    match_id: match.match_id,
                                    hero_id: match.hero_id,
                                    result: (match.radiant_win && match.player_slot < 128) || 
                                           (!match.radiant_win && match.player_slot >= 128) ? 'win' : 'loss',
                                    duration: match.duration,
                                    kda: {
                                        kills: match.kills,
                                        deaths: match.deaths,
                                        assists: match.assists
                                    },
                                    items: [] // Could extract item data if available
                                });
                            }
                        }
                    } catch (backendError) {
                        console.warn('Failed to load user recommendations:', backendError);
                        // Continue without recommendations
                    }
                }
            } catch (err) {
                console.error("Failed to fetch player summary", err);
                setError(err.message || 'Failed to load player data.');
                setPlayerData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [playerId, user, heroesData]);

    const getHeroInfo = (heroId) => {
        return heroesData[heroId] || { localized_name: `Hero ID: ${heroId}`, icon: '' };
    };

    if (loading && !playerData) {
        return (
            <Container maxW="7xl" py={8} centerContent>
                <VStack spacing={4}>
                    <Spinner size="xl" color="dota.teal.500" thickness="4px" />
                    <Text color="dota.text.secondary">Loading player profile...</Text>
                </VStack>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container maxW="7xl" py={8}>
                <Box bg="dota.bg.card" borderColor="dota.status.error" borderWidth={1} borderRadius="md" p={4}>
                    <Text color="dota.text.primary">Error: {error}</Text>
                </Box>
            </Container>
        );
    }
    
    if (!playerData && !loading) {
        return (
            <Container maxW="7xl" py={8}>
                <Box bg="dota.bg.card" borderColor="dota.status.warning" borderWidth={1} borderRadius="md" p={4}>
                    <Text color="dota.text.primary">
                        No player data found for Account ID: {playerId}. It might be a private profile or an invalid ID.
                    </Text>
                </Box>
            </Container>
        );
    }

    const { profile, mmr_estimate, winLoss, recentMatches } = playerData || {}; // Destructure safely

    return (
        <Container maxW="6xl" py={6}>
            <VStack spacing={8} align="stretch">
                {/* Profile Header */}
                <Card
                    bg="dota.bg.card"
                    borderWidth={1}
                    borderColor="dota.bg.tertiary"
                    p={{ base: 4, sm: 6 }}
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
                    {profile ? (
                        <VStack spacing={6}>
                            <Flex 
                                direction={{ base: "column", sm: "row" }} 
                                align="center" 
                                w="full"
                                gap={6}
                            >
                                <Avatar
                                    src={profile.avatarfull}
                                    name={profile.personaname}
                                    size={{ base: "xl", sm: "2xl" }}
                                    border="4px solid"
                                    borderColor="dota.teal.500"
                                    boxShadow="dota-glow"
                                />
                                
                                <VStack 
                                    align={{ base: "center", sm: "start" }} 
                                    flex={1} 
                                    spacing={3}
                                >
                                    <VStack align={{ base: "center", sm: "start" }} spacing={2}>
                                        <Heading 
                                            size={{ base: "lg", sm: "xl" }} 
                                            color="dota.text.primary"
                                            textAlign={{ base: "center", sm: "left" }}
                                        >
                                            {profile.personaname}
                                        </Heading>
                                        <VStack align={{ base: "center", sm: "start" }} spacing={1}>
                                            <Text color="dota.text.secondary" fontSize="sm">
                                                Account ID: {profile.account_id}
                                            </Text>
                                            {profile.steamid && (
                                                <Text color="dota.text.muted" fontSize="xs">
                                                    Steam ID: {profile.steamid}
                                                </Text>
                                            )}
                                        </VStack>
                                    </VStack>
                                    
                                    {mmr_estimate?.estimate && (
                                        <Badge 
                                            variant="solid" 
                                            colorScheme="teal" 
                                            fontSize="md" 
                                            px={3} 
                                            py={1}
                                            borderRadius="full"
                                        >
                                            MMR: {mmr_estimate.estimate}
                                        </Badge>
                                    )}
                                </VStack>
                                
                                {user && (
                                    <VStack spacing={2}>
                                        <Button
                                            as={Link}
                                            to="/profile"
                                            variant="primary"
                                            size="sm"
                                            leftIcon={<FaUser />}
                                        >
                                            My Profile
                                        </Button>
                                        <Button
                                            as={Link}
                                            to="/recommendations"
                                            variant="secondary"
                                            size="sm"
                                            leftIcon={<FaStar />}
                                        >
                                            Get Recommendations
                                        </Button>
                                    </VStack>
                                )}
                            </Flex>
                        </VStack>
                    ) : (
                        <Text color="dota.text.muted" textAlign="center">
                            Core profile data not available.
                        </Text>
                    )}
                    
                    {/* Win/Loss Statistics */}
                    {winLoss && (
                        <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={6}>
                            <GridItem textAlign={{ base: "center", sm: "left" }}>
                                <VStack spacing={1}>
                                    <Text color="dota.text.secondary" fontSize="sm">Wins</Text>
                                    <Text color="dota.status.success" fontSize="2xl" fontWeight="bold">
                                        {winLoss.win}
                                    </Text>
                                </VStack>
                            </GridItem>
                            
                            <GridItem textAlign={{ base: "center", sm: "left" }}>
                                <VStack spacing={1}>
                                    <Text color="dota.text.secondary" fontSize="sm">Losses</Text>
                                    <Text color="dota.status.error" fontSize="2xl" fontWeight="bold">
                                        {winLoss.lose}
                                    </Text>
                                </VStack>
                            </GridItem>
                            
                            <GridItem textAlign={{ base: "center", sm: "left" }}>
                                <VStack spacing={1}>
                                    <Text color="dota.text.secondary" fontSize="sm">Win Rate</Text>
                                    <Text 
                                        color={winLoss.win / (winLoss.win + winLoss.lose) >= 0.5 ? 'dota.status.success' : 'dota.status.error'}
                                        fontSize="2xl"
                                        fontWeight="bold"
                                    >
                                        {((winLoss.win / (winLoss.win + winLoss.lose)) * 100).toFixed(1)}%
                                    </Text>
                                </VStack>
                            </GridItem>
                        </Grid>
                    )}
                </Card>

                {/* Tab Content */}
                <Box>
                    <Box bg="dota.bg.card" borderColor="dota.bg.tertiary" borderWidth={1} borderRadius="md" p={2}>
                        <HStack spacing={1}>
                            <Button 
                                onClick={() => setShowAnalysisTab(false)}
                                variant={!showAnalysisTab ? "solid" : "ghost"}
                                size="sm"
                                colorScheme={!showAnalysisTab ? "teal" : "gray"}
                                borderRadius="md"
                            >
                                <HStack spacing={2}>
                                    <FaGamepad />
                                    <Text>Recent Matches</Text>
                                </HStack>
                            </Button>
                            {user && heroRecommendations.length > 0 && (
                                <Button 
                                    onClick={() => setShowAnalysisTab(true)}
                                    variant={showAnalysisTab ? "solid" : "ghost"}
                                    size="sm"
                                    colorScheme={showAnalysisTab ? "teal" : "gray"}
                                    borderRadius="md"
                                >
                                    <HStack spacing={2}>
                                        <FaStar />
                                        <Text>Recommendations ({heroRecommendations.length})</Text>
                                    </HStack>
                                </Button>
                            )}
                        </HStack>
                    </Box>
                    
                    {!showAnalysisTab && (

                            <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md" color="dota.text.primary">
                                        Recent Matches (Last 5)
                                    </Heading>
                                    
                                    {recentMatches && recentMatches.length > 0 ? (
                                        <VStack spacing={4} align="stretch">
                                            {recentMatches.map(match => {
                                                const heroInfo = getHeroInfo(match.hero_id);
                                                const playerWon = (match.radiant_win && match.player_slot < 128) || (!match.radiant_win && match.player_slot >= 128);
                                                return (
                                                    <Card
                                                        key={match.match_id}
                                                        bg={playerWon ? 'green.50' : 'red.50'}
                                                        borderWidth={2}
                                                        borderColor={playerWon ? 'dota.status.success' : 'dota.status.error'}
                                                        p={4}
                                                        transition="all 0.2s ease"
                                                        _hover={{
                                                            transform: "translateY(-2px)",
                                                            boxShadow: "md"
                                                        }}
                                                    >
                                                        <Flex 
                                                            direction={{ base: "column", sm: "row" }} 
                                                            justify="space-between" 
                                                            align={{ base: "start", sm: "center" }}
                                                            gap={4}
                                                        >
                                                            <HStack spacing={4} flex={1}>
                                                                {heroInfo.icon && (
                                                                    <Image 
                                                                        src={heroInfo.icon} 
                                                                        alt={heroInfo.localized_name} 
                                                                        w={10} 
                                                                        h={6} 
                                                                        borderRadius="sm"
                                                                    />
                                                                )}
                                                                
                                                                <VStack align="start" spacing={1} flex={1}>
                                                                    <Button
                                                                        as={Link}
                                                                        to={`/matches/${match.match_id}`}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        color="dota.teal.500"
                                                                        fontWeight="semibold"
                                                                        p={0}
                                                                        h="auto"
                                                                        _hover={{ textDecoration: "underline" }}
                                                                    >
                                                                        Match ID: {match.match_id}
                                                                    </Button>
                                                                    
                                                                    <HStack spacing={2}>
                                                                        <Badge
                                                                            variant="solid"
                                                                            colorScheme={playerWon ? 'green' : 'red'}
                                                                            fontSize="xs"
                                                                        >
                                                                            {playerWon ? 'WIN' : 'LOSS'}
                                                                        </Badge>
                                                                        <Text 
                                                                            fontSize="sm" 
                                                                            color="dota.text.primary"
                                                                            fontWeight="medium"
                                                                        >
                                                                            {heroInfo.localized_name}
                                                                        </Text>
                                                                    </HStack>
                                                                </VStack>
                                                                
                                                                {user && (
                                                                    <FavoritesButton
                                                                        type="hero"
                                                                        id={match.hero_id}
                                                                        name={heroInfo.localized_name}
                                                                        role={heroInfo.roles?.[0]}
                                                                    />
                                                                )}
                                                            </HStack>
                                                            
                                                            <VStack 
                                                                align={{ base: "start", sm: "end" }} 
                                                                spacing={1}
                                                                fontSize="sm"
                                                                color="dota.text.secondary"
                                                            >
                                                                <Text fontWeight="medium">
                                                                    KDA: {match.kills}/{match.deaths}/{match.assists}
                                                                </Text>
                                                                <Text>
                                                                    Duration: {Math.floor(match.duration / 60)}m {match.duration % 60}s
                                                                </Text>
                                                                <Text fontSize="xs">
                                                                    {new Date(match.start_time * 1000).toLocaleDateString()}
                                                                </Text>
                                                            </VStack>
                                                        </Flex>
                                                    </Card>
                                                );
                                            })}
                                        </VStack>
                                    ) : (
                                        <Text color="dota.text.secondary" textAlign="center" py={8}>
                                            No recent matches found or data is not public.
                                        </Text>
                                    )}
                                </VStack>
                            </Card>
                    )}
                        
                    {showAnalysisTab && (
                            <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6} mt={6}>
                                <VStack spacing={6} align="stretch">
                                    <VStack spacing={3} align="start">
                                        <Heading size="md" color="dota.text.primary">
                                            Recommended Heroes for You
                                        </Heading>
                                        <Text color="dota.text.secondary" fontSize="sm">
                                            Based on your profile preferences and excluding recently played heroes.
                                        </Text>
                                    </VStack>
                                    
                                    {heroRecommendations.length > 0 ? (
                                        <VStack spacing={6}>
                                            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4} w="full">
                                                {heroRecommendations.map(hero => {
                                                    const heroInfo = getHeroInfo(hero.id || hero.hero_id);
                                                    const cardData = {
                                                        ...heroInfo,
                                                        ...hero,
                                                        reason: hero.reason || `Recommended based on your preferences`
                                                    };
                                                    return (
                                                        <RecommendationCard
                                                            key={hero.id || hero.hero_id}
                                                            type="hero"
                                                            data={cardData}
                                                            onClick={() => {
                                                                console.log('Hero selected:', cardData);
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Grid>
                                            
                                            <Box textAlign="center">
                                                <Button
                                                    as={Link}
                                                    to="/recommendations"
                                                    variant="primary"
                                                    size="lg"
                                                >
                                                    View All Recommendations
                                                </Button>
                                            </Box>
                                        </VStack>
                                    ) : (
                                        <VStack spacing={4} py={8} textAlign="center">
                                            <Text color="dota.text.secondary">
                                                No recommendations available.
                                            </Text>
                                            <Button
                                                as={Link}
                                                to="/profile"
                                                variant="primary"
                                            >
                                                Set Up Your Profile
                                            </Button>
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

export default PlayerProfilePage;
