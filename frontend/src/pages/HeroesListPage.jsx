// frontend/src/pages/HeroesListPage.jsx
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
  Input,
  Select,
  Checkbox,
  Flex,
  Image,
  Icon,
  Spinner,
  Alert,
  Tooltip,
  Stack
} from '@chakra-ui/react';
import { FaList, FaFilter, FaStar } from 'react-icons/fa';
import { FaGripVertical as FaGrid3X3 } from 'react-icons/fa';
import { api } from '../services/api.js';
import { fileBackend } from '../services/fileBackend.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import FavoritesButton from '../components/FavoritesButton.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';

const HeroesListPage = () => {
    const { user } = useAuth();
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterName, setFilterName] = useState('');
    const [filterAttr, setFilterAttr] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [selectedHero, setSelectedHero] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [favoriteHeroes, setFavoriteHeroes] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        loadData();
    }, [loadData]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Load heroes from API
            const heroesData = await api.getHeroes();
            setHeroes(heroesData);

            // Load user favorites if logged in
            if (user) {
                try {
                    const favorites = await fileBackend.getFavoriteHeroes();
                    setFavoriteHeroes(favorites);

                    // Load beginner-friendly recommendations
                    const recs = await fileBackend.getBeginnerFriendlyHeroes();
                    setRecommendations(recs.slice(0, 6)); // Show top 6 recommendations
                } catch (backendError) {
                    console.warn('Failed to load user data:', backendError);
                    // Continue without user-specific data
                }
            }
        } catch (err) {
            console.error("Failed to fetch heroes", err);
            setError(err.message || 'Failed to load hero data.');
        } finally {
            setLoading(false);
        }
    }, [user]);


    const filteredHeroes = heroes.filter(hero => {
        const matchesName = hero.localized_name.toLowerCase().includes(filterName.toLowerCase());
        const matchesAttr = filterAttr === '' || hero.primary_attr === filterAttr;
        const matchesRole = filterRole === '' || (hero.roles && hero.roles.includes(filterRole));
        
        if (showFavoritesOnly) {
            const isFavorite = favoriteHeroes.some(fav => fav.hero_id === hero.id);
            return matchesName && matchesAttr && matchesRole && isFavorite;
        }
        
        return matchesName && matchesAttr && matchesRole;
    });

    const uniqueRoles = [...new Set(heroes.flatMap(hero => hero.roles || []))].sort();

    if (loading) {
        return (
            <Container maxW="7xl" py={8} centerContent>
                <VStack spacing={4}>
                    <Spinner size="xl" color="dota.teal.500" thickness="4px" />
                    <Text color="dota.text.secondary">Loading heroes...</Text>
                </VStack>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container maxW="7xl" py={8}>
                <Box bg="dota.bg.card" borderColor="dota.status.error" borderWidth={1} borderRadius="md" p={4}>
                    <Flex align="center">
                        <Icon as={FaStar} color="dota.status.error" mr={3} />
                        <Text color="dota.text.primary">Error: {error}</Text>
                    </Flex>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxW="7xl" py={6}>
            <VStack spacing={8} align="stretch">
                {/* Header Section */}
                <Box>
                    <VStack spacing={4} align="start">
                        <Heading 
                            as="h1" 
                            size="xl" 
                            color="dota.text.primary"
                            textShadow="0 0 10px rgba(39, 174, 158, 0.3)"
                        >
                            Dota 2 Heroes
                        </Heading>
                        {user && (
                            <HStack spacing={6} wrap="wrap">
                                <HStack spacing={2}>
                                    <Icon as={FaStar} color="dota.teal.500" />
                                    <Text color="dota.text.secondary" fontSize="sm">
                                        Favorites: {favoriteHeroes.length}
                                    </Text>
                                </HStack>
                                <Button
                                    as={Link}
                                    to="/recommendations"
                                    variant="ghost"
                                    size="sm"
                                    color="dota.teal.500"
                                    _hover={{ color: "dota.teal.400" }}
                                >
                                    Get Personalized Recommendations →
                                </Button>
                            </HStack>
                        )}
                    </VStack>
                </Box>

                {/* Recommendations Section */}
                {user && recommendations.length > 0 && (
                    <Card
                        bg="dota.bg.card"
                        borderWidth={1}
                        borderColor="dota.teal.500"
                        p={6}
                        position="relative"
                        overflow="hidden"
                        _before={{
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            bgGradient: 'linear(to-r, dota.teal.500, dota.purple.500)'
                        }}
                    >
                        <VStack spacing={6} align="stretch">
                            <Flex justify="space-between" align="center">
                                <Heading size="md" color="dota.text.primary">
                                    Recommended for You
                                </Heading>
                                <Button
                                    as={Link}
                                    to="/recommendations"
                                    variant="outline"
                                    size="sm"
                                    colorScheme="teal"
                                >
                                    View All
                                </Button>
                            </Flex>
                            <Grid 
                                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
                                gap={4}
                            >
                                {recommendations.map(hero => (
                                    <RecommendationCard
                                        key={hero.id || hero.hero_id}
                                        type="hero"
                                        data={hero}
                                        size="small"
                                        onClick={() => setSelectedHero(hero)}
                                    />
                                ))}
                            </Grid>
                        </VStack>
                    </Card>
                )}

                {/* Filter and Controls */}
                <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6}>
                    <VStack spacing={6} align="stretch">
                        <Flex 
                            direction={{ base: "column", lg: "row" }} 
                            gap={4} 
                            align={{ base: "stretch", lg: "center" }} 
                            justify="space-between"
                        >
                            <Stack 
                                direction={{ base: "column", sm: "row" }} 
                                spacing={4} 
                                flex={1}
                            >
                                <Input 
                                    placeholder="Filter by name..." 
                                    value={filterName} 
                                    onChange={e => setFilterName(e.target.value)}
                                    bg="dota.bg.secondary"
                                    borderColor="dota.bg.tertiary"
                                    color="dota.text.primary"
                                    _placeholder={{ color: "dota.text.muted" }}
                                    _focus={{
                                        borderColor: "dota.teal.500",
                                        boxShadow: "0 0 0 1px var(--chakra-colors-dota-teal-500)"
                                    }}
                                    size="md"
                                />
                                <Select 
                                    value={filterAttr} 
                                    onChange={e => setFilterAttr(e.target.value)}
                                    bg="dota.bg.secondary"
                                    borderColor="dota.bg.tertiary"
                                    color="dota.text.primary"
                                    _focus={{
                                        borderColor: "dota.teal.500",
                                        boxShadow: "0 0 0 1px var(--chakra-colors-dota-teal-500)"
                                    }}
                                    size="md"
                                    minW="180px"
                                >
                                    <option value="">All Attributes</option>
                                    <option value="str">Strength</option>
                                    <option value="agi">Agility</option>
                                    <option value="int">Intelligence</option>
                                    <option value="all">Universal</option>
                                </Select>
                                <Select 
                                    value={filterRole} 
                                    onChange={e => setFilterRole(e.target.value)}
                                    bg="dota.bg.secondary"
                                    borderColor="dota.bg.tertiary"
                                    color="dota.text.primary"
                                    _focus={{
                                        borderColor: "dota.teal.500",
                                        boxShadow: "0 0 0 1px var(--chakra-colors-dota-teal-500)"
                                    }}
                                    size="md"
                                    minW="140px"
                                >
                                    <option value="">All Roles</option>
                                    {uniqueRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </Select>
                            </Stack>
                            
                            <HStack spacing={4} justify={{ base: "space-between", lg: "flex-end" }}>
                                {user && (
                                    <Checkbox
                                        isChecked={showFavoritesOnly}
                                        onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                                        colorScheme="teal"
                                        size="sm"
                                        color="dota.text.secondary"
                                    >
                                        Favorites only
                                    </Checkbox>
                                )}
                                
                                <HStack spacing={0} borderWidth={1} borderColor="dota.bg.tertiary" borderRadius="md">
                                    <Tooltip label="Grid view">
                                        <Button
                                            onClick={() => setViewMode('grid')}
                                            variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                                            size="sm"
                                            borderRadius="none"
                                            borderLeftRadius="md"
                                            colorScheme={viewMode === 'grid' ? 'teal' : 'gray'}
                                        >
                                            <Icon as={FaGrid3X3} />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip label="List view">
                                        <Button
                                            onClick={() => setViewMode('list')}
                                            variant={viewMode === 'list' ? 'solid' : 'ghost'}
                                            size="sm"
                                            borderRadius="none"
                                            borderRightRadius="md"
                                            colorScheme={viewMode === 'list' ? 'teal' : 'gray'}
                                        >
                                            <Icon as={FaList} />
                                        </Button>
                                    </Tooltip>
                                </HStack>
                            </HStack>
                        </Flex>
                        
                        <Text fontSize="sm" color="dota.text.muted">
                            Showing {filteredHeroes.length} of {heroes.length} heroes
                        </Text>
                    </VStack>
                </Card>

                {/* Hero Detail Card (replaces modal) */}
                {selectedHero && (
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
                        <VStack spacing={6}>
                            <Flex justify="space-between" align="center" w="full">
                                <Heading size="lg" color="dota.text.primary">
                                    {selectedHero.localized_name}
                                </Heading>
                                <HStack spacing={2}>
                                    {user && (
                                        <FavoritesButton
                                            type="hero"
                                            id={selectedHero.id}
                                            name={selectedHero.localized_name}
                                            role={selectedHero.roles?.[0]}
                                        />
                                    )}
                                    <Button
                                        onClick={() => setSelectedHero(null)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </HStack>
                            </Flex>
                            
                            <Grid templateColumns={{ base: "1fr", md: "auto 1fr" }} gap={6} w="full">
                                <Box>
                                    <Image 
                                        src={selectedHero.img} 
                                        alt={selectedHero.localized_name} 
                                        w="full" 
                                        maxW="200px" 
                                        borderRadius="lg"
                                        boxShadow="lg"
                                    />
                                </Box>
                                
                                <VStack spacing={3} align="stretch">
                                    <HStack>
                                        <Text fontWeight="semibold" color="dota.text.secondary">Attribute:</Text>
                                        <Badge 
                                            colorScheme={
                                                selectedHero.primary_attr === 'str' ? 'red' :
                                                selectedHero.primary_attr === 'agi' ? 'green' :
                                                selectedHero.primary_attr === 'int' ? 'blue' : 'purple'
                                            }
                                            variant="solid"
                                        >
                                            {selectedHero.primary_attr?.toUpperCase()}
                                        </Badge>
                                    </HStack>
                                    
                                    <HStack>
                                        <Text fontWeight="semibold" color="dota.text.secondary">Attack Type:</Text>
                                        <Text color="dota.text.primary">{selectedHero.attack_type}</Text>
                                    </HStack>
                                    
                                    <VStack align="start" spacing={2}>
                                        <Text fontWeight="semibold" color="dota.text.secondary">Roles:</Text>
                                        <HStack wrap="wrap">
                                            {selectedHero.roles?.map(role => (
                                                <Badge key={role} variant="outline" colorScheme="teal">
                                                    {role}
                                                </Badge>
                                            ))}
                                        </HStack>
                                    </VStack>
                                    
                                    {selectedHero.reason && (
                                        <Box 
                                            p={3} 
                                            bg="dota.bg.secondary" 
                                            borderRadius="md" 
                                            borderLeftWidth={3} 
                                            borderColor="dota.teal.500"
                                        >
                                            <Text fontSize="sm" color="dota.text.secondary" fontStyle="italic">
                                                {selectedHero.reason}
                                            </Text>
                                        </Box>
                                    )}
                                    
                                    <HStack spacing={3} pt={4}>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setSelectedHero(null)}
                                            flex={1}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            as={Link}
                                            to={`/recommendations?hero=${selectedHero.id}`}
                                            variant="primary"
                                            onClick={() => setSelectedHero(null)}
                                            flex={1}
                                        >
                                            View Counters
                                        </Button>
                                    </HStack>
                                </VStack>
                            </Grid>
                        </VStack>
                    </Card>
                )}
            
                {/* Heroes Grid/List */}
                <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.bg.tertiary" p={6}>
                    {viewMode === 'grid' ? (
                        <Grid 
                            templateColumns={{
                                base: "repeat(2, 1fr)",
                                sm: "repeat(3, 1fr)",
                                md: "repeat(4, 1fr)",
                                lg: "repeat(5, 1fr)",
                                xl: "repeat(6, 1fr)"
                            }} 
                            gap={4}
                        >
                            {filteredHeroes.map(hero => (
                                    <GridItem key={hero.id}>
                                        <Card
                                            position="relative"
                                            bg="dota.bg.secondary"
                                            borderWidth={1}
                                            borderColor="dota.bg.tertiary"
                                            p={3}
                                            textAlign="center"
                                            cursor="pointer"
                                            transition="all 0.2s ease"
                                            _hover={{
                                                transform: "translateY(-4px) scale(1.02)",
                                                boxShadow: "card-hover",
                                                borderColor: "dota.teal.500"
                                            }}
                                            onClick={() => setSelectedHero(hero)}
                                        >
                                            {user && (
                                                <Box 
                                                    position="absolute" 
                                                    top={1} 
                                                    right={1} 
                                                    onClick={(e) => e.stopPropagation()}
                                                    zIndex={2}
                                                >
                                                    <FavoritesButton
                                                        type="hero"
                                                        id={hero.id}
                                                        name={hero.localized_name}
                                                        role={hero.roles?.[0]}
                                                        className="!p-1"
                                                    />
                                                </Box>
                                            )}
                                            
                                            <VStack spacing={2}>
                                                <Box position="relative">
                                                    <Image 
                                                        src={hero.icon} 
                                                        alt={hero.localized_name} 
                                                        w="full" 
                                                        maxW="80px" 
                                                        mx="auto"
                                                        borderRadius="md"
                                                        border="2px solid"
                                                        borderColor="dota.bg.tertiary"
                                                    />
                                                </Box>
                                                
                                                <Text 
                                                    fontSize="xs" 
                                                    fontWeight="medium" 
                                                    color="dota.text.primary"
                                                    lineHeight="1.2"
                                                    noOfLines={2}
                                                >
                                                    {hero.localized_name}
                                                </Text>
                                                
                                                {hero.primary_attr && (
                                                    <Badge
                                                        size="sm"
                                                        variant="solid"
                                                        colorScheme={
                                                            hero.primary_attr === 'str' ? 'red' :
                                                            hero.primary_attr === 'agi' ? 'green' :
                                                            hero.primary_attr === 'int' ? 'blue' : 'purple'
                                                        }
                                                        fontSize="xs"
                                                    >
                                                        {hero.primary_attr === 'str' ? 'STR' :
                                                         hero.primary_attr === 'agi' ? 'AGI' :
                                                         hero.primary_attr === 'int' ? 'INT' : 'UNI'}
                                                    </Badge>
                                                )}
                                            </VStack>
                                        </Card>
                                    </GridItem>
                            ))}
                        </Grid>
                    ) : (
                        <VStack spacing={3} align="stretch">
                            {filteredHeroes.map(hero => (
                                    <Card
                                        key={hero.id}
                                        bg="dota.bg.secondary"
                                        borderWidth={1}
                                        borderColor="dota.bg.tertiary"
                                        p={4}
                                        cursor="pointer"
                                        transition="all 0.2s ease"
                                        _hover={{
                                            boxShadow: "md",
                                            borderColor: "dota.teal.500",
                                            transform: "translateY(-1px)"
                                        }}
                                        onClick={() => setSelectedHero(hero)}
                                    >
                                        <Flex justify="space-between" align="center">
                                            <HStack spacing={4} flex={1}>
                                                <Image 
                                                    src={hero.icon} 
                                                    alt={hero.localized_name} 
                                                    w={12} 
                                                    h={12} 
                                                    borderRadius="md"
                                                    border="2px solid"
                                                    borderColor="dota.bg.tertiary"
                                                />
                                                
                                                <VStack align="start" spacing={1}>
                                                    <Heading size="sm" color="dota.text.primary">
                                                        {hero.localized_name}
                                                    </Heading>
                                                    <HStack spacing={4}>
                                                        <Badge
                                                            variant="solid"
                                                            colorScheme={
                                                                hero.primary_attr === 'str' ? 'red' :
                                                                hero.primary_attr === 'agi' ? 'green' :
                                                                hero.primary_attr === 'int' ? 'blue' : 'purple'
                                                            }
                                                            fontSize="xs"
                                                        >
                                                            {hero.primary_attr?.toUpperCase() || 'UNI'}
                                                        </Badge>
                                                        <Text fontSize="sm" color="dota.text.secondary">
                                                            {hero.roles?.slice(0, 2).join(', ')}
                                                        </Text>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                            
                                            {user && (
                                                <Box onClick={(e) => e.stopPropagation()}>
                                                    <FavoritesButton
                                                        type="hero"
                                                        id={hero.id}
                                                        name={hero.localized_name}
                                                        role={hero.roles?.[0]}
                                                    />
                                                </Box>
                                            )}
                                        </Flex>
                                    </Card>
                            ))}
                        </VStack>
                    )}
                    
                    {filteredHeroes.length === 0 && !loading && (
                        <VStack spacing={4} py={12} textAlign="center">
                            <Text color="dota.text.secondary" fontSize="lg">
                                {showFavoritesOnly 
                                    ? 'No favorite heroes match your filters.' 
                                    : 'No heroes match your filters.'
                                }
                            </Text>
                            {showFavoritesOnly && (
                                <Button
                                    onClick={() => setShowFavoritesOnly(false)}
                                    variant="outline"
                                    colorScheme="teal"
                                    size="sm"
                                >
                                    Show all heroes
                                </Button>
                            )}
                        </VStack>
                    )}
                </Card>
            </VStack>
        </Container>
    );
};

export default HeroesListPage;
