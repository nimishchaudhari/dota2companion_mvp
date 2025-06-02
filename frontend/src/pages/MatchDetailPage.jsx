// frontend/src/pages/MatchDetailPage.jsx
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
  Flex,
  Image,
  Table,
  Spinner,
  Alert
} from '@chakra-ui/react';
import { FaTrophy, FaClock, FaGamepad } from 'react-icons/fa';
import { api } from '../services/api.js';

// Simple game mode mapping (can be expanded)
const gameModeMap = {
    0: 'Unknown', 1: 'All Pick', 2: 'Captains Mode', 3: 'Random Draft', 4: 'Single Draft', 
    5: 'All Random', 22: 'Ranked All Pick', 23: 'Turbo' 
};

const MatchDetailPage = () => {
    const { matchId } = useParams();
    const [matchData, setMatchData] = useState(null);
    const [heroesData, setHeroesData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatchAndHeroes = async () => {
            setLoading(true);
            setError(null);
            try {
                if (Object.keys(heroesData).length === 0) {
                    const heroes = await api.getHeroes();
                    const heroesMap = heroes.reduce((map, hero) => {
                        map[hero.id] = hero;
                        return map;
                    }, {});
                    setHeroesData(heroesMap);
                }
                const matchData = await api.getMatchDetails(matchId);
                setMatchData(matchData);
            } catch (err) {
                console.error("Failed to fetch match or hero details", err);
                setError(err.message || 'Failed to load data.');
            } finally {
                setLoading(false);
            }
        };
        fetchMatchAndHeroes();
    }, [matchId, heroesData]);

    const getHeroInfo = (heroId) => {
        return heroesData[heroId] || { localized_name: `Hero ID: ${heroId}`, icon: '', img: '' };
    };

    if (loading) {
        return (
            <Container maxW="7xl" py={8} centerContent>
                <VStack spacing={4}>
                    <Spinner size="xl" color="dota.teal.500" thickness="4px" />
                    <Text color="dota.text.secondary">Loading match details...</Text>
                </VStack>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container maxW="7xl" py={8}>
                <Alert.Root status="error" bg="dota.bg.card" borderColor="dota.status.error">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>
                            <Text color="dota.text.primary">Error: {error}</Text>
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            </Container>
        );
    }
    
    if (!matchData) {
        return (
            <Container maxW="7xl" py={8}>
                <Alert.Root status="warning" bg="dota.bg.card" borderColor="dota.status.warning">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>
                            <Text color="dota.text.primary">
                                No match data found for Match ID: {matchId}.
                            </Text>
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            </Container>
        );
    }

    const { radiant_win, duration, radiant_score, dire_score, players, start_time, game_mode } = matchData;

    const radiantPlayers = players.filter(p => p.player_slot < 128);
    const direPlayers = players.filter(p => p.player_slot >= 128);
    
    const renderPlayerRow = (player, teamColor) => {
        const heroInfo = getHeroInfo(player.hero_id);
        return (
            <Table.Row key={player.player_slot} _hover={{ bg: "dota.bg.hover" }}>
                <Table.Cell py={3} px={4} color="dota.text.primary">
                    {player.account_id && player.account_id !== 0 ? (
                        <Button
                            as={Link}
                            to={`/player/${player.account_id}`}
                            variant="ghost"
                            size="sm"
                            color="dota.teal.500"
                            fontWeight="medium"
                            p={0}
                            h="auto"
                            _hover={{ textDecoration: "underline" }}
                        >
                            {player.personaname || `Player ${player.player_slot}`}
                        </Button>
                    ) : (
                        <Text color="dota.text.muted">
                            {player.personaname || `Anonymous`}
                        </Text>
                    )}
                </Table.Cell>
                <Table.Cell py={3} px={4}>
                    <HStack spacing={2}>
                        {heroInfo.icon && (
                            <Image 
                                src={heroInfo.icon} 
                                alt={heroInfo.localized_name} 
                                w={8} 
                                h="auto" 
                                borderRadius="sm"
                            />
                        )}
                        <Text color="dota.text.primary" fontSize="sm">
                            {heroInfo.localized_name}
                        </Text>
                    </HStack>
                </Table.Cell>
                <Table.Cell py={3} px={4} textAlign="center">
                    <Text 
                        fontWeight="medium" 
                        color={teamColor === 'green' ? 'dota.status.success' : 'dota.status.error'}
                        fontSize="sm"
                    >
                        {player.kills}/{player.deaths}/{player.assists}
                    </Text>
                </Table.Cell>
            </Table.Row>
        );
    };

    return (
        <Container maxW="7xl" py={6}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
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
                    <VStack spacing={6} align="stretch">
                        <Heading 
                            size="lg" 
                            color="dota.text.primary"
                            textAlign="center"
                        >
                            Match Details:{' '}
                            <Text as="span" color="dota.teal.500">
                                {matchId}
                            </Text>
                        </Heading>
                        
                        {/* Match Stats */}
                        <Grid 
                            templateColumns={{ 
                                base: "repeat(2, 1fr)", 
                                md: "repeat(3, 1fr)", 
                                lg: "repeat(5, 1fr)" 
                            }} 
                            gap={4}
                            p={4}
                            bg="dota.bg.secondary"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="dota.bg.tertiary"
                        >
                            <GridItem>
                                <VStack spacing={1} align="start">
                                    <Text color="dota.text.muted" fontSize="xs">
                                        Date
                                    </Text>
                                    <Text color="dota.text.primary" fontSize="sm" fontWeight="medium">
                                        {new Date(start_time * 1000).toLocaleDateString()}
                                    </Text>
                                </VStack>
                            </GridItem>
                            
                            <GridItem>
                                <VStack spacing={1} align="start">
                                    <Text color="dota.text.muted" fontSize="xs">
                                        Winner
                                    </Text>
                                    <Text 
                                        color={radiant_win ? 'dota.status.success' : 'dota.status.error'}
                                        fontSize="sm"
                                        fontWeight="bold"
                                    >
                                        {radiant_win ? 'Radiant' : 'Dire'}
                                    </Text>
                                </VStack>
                            </GridItem>
                            
                            <GridItem>
                                <VStack spacing={1} align="start">
                                    <Text color="dota.text.muted" fontSize="xs">
                                        Score
                                    </Text>
                                    <Text fontSize="sm" fontWeight="medium">
                                        <Text as="span" color="dota.status.success">{radiant_score}</Text>
                                        <Text as="span" color="dota.text.secondary"> - </Text>
                                        <Text as="span" color="dota.status.error">{dire_score}</Text>
                                    </Text>
                                </VStack>
                            </GridItem>
                            
                            <GridItem>
                                <VStack spacing={1} align="start">
                                    <Text color="dota.text.muted" fontSize="xs">
                                        Duration
                                    </Text>
                                    <Text color="dota.text.primary" fontSize="sm" fontWeight="medium">
                                        {Math.floor(duration / 60)}m {duration % 60}s
                                    </Text>
                                </VStack>
                            </GridItem>
                            
                            <GridItem>
                                <VStack spacing={1} align="start">
                                    <Text color="dota.text.muted" fontSize="xs">
                                        Game Mode
                                    </Text>
                                    <Text color="dota.text.primary" fontSize="sm" fontWeight="medium">
                                        {gameModeMap[game_mode] || `Mode ID: ${game_mode}`}
                                    </Text>
                                </VStack>
                            </GridItem>
                        </Grid>
                    </VStack>
                </Card>

                {/* Teams */}
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                    {/* Radiant Team */}
                    <GridItem>
                        <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.status.success" p={0} overflow="hidden">
                            <Box bg="green.50" p={4} borderTopRadius="md">
                                <HStack spacing={3}>
                                    <FaTrophy color="green" />
                                    <Heading size="md" color={radiant_win ? "dota.status.success" : "dota.text.secondary"}>
                                        Radiant {radiant_win ? "Victory" : "Defeat"}: {radiant_score}
                                    </Heading>
                                </HStack>
                            </Box>
                            
                            <Table.Root variant="simple" size="sm">
                                <Table.Header bg="green.50">
                                    <Table.Row>
                                        <Table.ColumnHeader color="green.700" fontSize="xs" textTransform="uppercase">
                                            Player
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="green.700" fontSize="xs" textTransform="uppercase">
                                            Hero
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="green.700" fontSize="xs" textTransform="uppercase" textAlign="center">
                                            K/D/A
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body bg="dota.bg.card">
                                    {radiantPlayers.map(p => renderPlayerRow(p, 'green'))}
                                </Table.Body>
                            </Table.Root>
                        </Card>
                    </GridItem>

                    {/* Dire Team */}
                    <GridItem>
                        <Card bg="dota.bg.card" borderWidth={1} borderColor="dota.status.error" p={0} overflow="hidden">
                            <Box bg="red.50" p={4} borderTopRadius="md">
                                <HStack spacing={3}>
                                    <FaTrophy color="red" />
                                    <Heading size="md" color={!radiant_win ? "dota.status.error" : "dota.text.secondary"}>
                                        Dire {!radiant_win ? "Victory" : "Defeat"}: {dire_score}
                                    </Heading>
                                </HStack>
                            </Box>
                            
                            <Table.Root variant="simple" size="sm">
                                <Table.Header bg="red.50">
                                    <Table.Row>
                                        <Table.ColumnHeader color="red.700" fontSize="xs" textTransform="uppercase">
                                            Player
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="red.700" fontSize="xs" textTransform="uppercase">
                                            Hero
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader color="red.700" fontSize="xs" textTransform="uppercase" textAlign="center">
                                            K/D/A
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body bg="dota.bg.card">
                                    {direPlayers.map(p => renderPlayerRow(p, 'red'))}
                                </Table.Body>
                            </Table.Root>
                        </Card>
                    </GridItem>
                </Grid>
            </VStack>
        </Container>
    );
};

export default MatchDetailPage;
