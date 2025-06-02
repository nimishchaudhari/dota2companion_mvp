// frontend/src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  Badge,
  Grid,
  GridItem,
  Icon,
  Flex
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaSearch, FaUsers, FaChartLine } from 'react-icons/fa';
import { FaShieldAlt as FaShield } from 'react-icons/fa';
import PlayerSearch from '../components/PlayerSearch';
import { useAuth } from '../contexts/AuthContext';
import { listAnimations, getReducedMotionVariant } from '../utils/animations-lite';

// Create motion components
const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionVStack = motion.create(VStack);
const MotionGridItem = motion.create(GridItem);

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const features = [
        {
            icon: FaSearch,
            title: "Player Analytics",
            description: "Deep dive into player statistics and match history",
            color: "dota.teal.500",
            bgGradient: "linear(to-br, dota.teal.500, dota.teal.700)"
        },
        {
            icon: FaShield,
            title: "Hero Mastery",
            description: "Track your hero performance and get recommendations",
            color: "dota.purple.500",
            bgGradient: "linear(to-br, dota.purple.500, dota.purple.700)"
        },
        {
            icon: FaChartLine,
            title: "Match Analysis",
            description: "Detailed breakdown of your recent matches",
            color: "dota.darkBlue.500",
            bgGradient: "linear(to-br, dota.darkBlue.500, dota.darkBlue.700)"
        }
    ];

    return (
        <Container maxW="7xl" py={8}>
            <MotionVStack 
                spacing={12} 
                align="stretch"
                initial="initial"
                animate="animate"
                variants={listAnimations.container}
            >
                {/* Hero Section */}
                <MotionBox
                    position="relative"
                    overflow="hidden"
                    borderRadius="xl"
                    bgGradient="linear(135deg, dota.bg.secondary 0%, dota.bg.tertiary 50%, dota.bg.card 100%)"
                    p={8}
                    variants={getReducedMotionVariant({
                        initial: { opacity: 0, y: 30 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.6, ease: "easeOut" }
                    })}
                    whileHover={{
                        scale: 1.01,
                        transition: { duration: 0.2 }
                    }}
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgGradient: 'linear(45deg, transparent 30%, dota.teal.500 50%, transparent 70%)',
                        opacity: 0.1,
                        zIndex: 0
                    }}
                >
                    <VStack spacing={6} position="relative" zIndex={1}>
                        <Box textAlign="center">
                            <Badge 
                                variant="solid" 
                                colorScheme="teal" 
                                fontSize="sm" 
                                px={3} 
                                py={1} 
                                borderRadius="full"
                                mb={4}
                            >
                                Welcome to the Arena
                            </Badge>
                            <Heading 
                                as="h1" 
                                size={{ base: "xl", md: "2xl" }} 
                                color="dota.text.primary"
                                mb={4}
                                fontWeight="bold"
                                textShadow="0 0 20px rgba(39, 174, 158, 0.3)"
                            >
                                Dota 2 Companion
                            </Heading>
                            <Text 
                                fontSize={{ base: "lg", md: "xl" }} 
                                color="dota.text.secondary"
                                maxW="600px"
                                mx="auto"
                                lineHeight="1.6"
                            >
                                Unlock your true potential with advanced analytics, personalized hero recommendations, and detailed match insights.
                            </Text>
                        </Box>

                        {/* Search Section */}
                        <MotionCard 
                            variant="elevated" 
                            p={6}
                            bg="dota.bg.card"
                            borderWidth={1}
                            borderColor="dota.bg.tertiary"
                            maxW="500px"
                            w="full"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            whileHover={{
                                y: -4,
                                boxShadow: "dota-glow",
                                scale: 1.02,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <VStack spacing={4}>
                                <Flex align="center" gap={3}>
                                    <Icon as={FaSearch} color="dota.teal.500" boxSize={5} />
                                    <Heading size="md" color="dota.text.primary">
                                        Player Search
                                    </Heading>
                                </Flex>
                                <Text 
                                    color="dota.text.secondary" 
                                    textAlign="center"
                                    fontSize="sm"
                                >
                                    Search for a Dota 2 player by Steam ID, Dota 2 ID, or persona name
                                </Text>
                                <PlayerSearch onResult={(players) => {
                                    if (players && players.length === 1) {
                                        navigate(`/player/${players[0].steamId}`);
                                    }
                                }} />
                            </VStack>
                        </MotionCard>
                    </VStack>
                </MotionBox>

                {/* Features Grid */}
                <MotionBox
                    variants={getReducedMotionVariant({
                        initial: { opacity: 0, y: 30 },
                        animate: { opacity: 1, y: 0 },
                        transition: { delay: 0.4, duration: 0.5 }
                    })}
                >
                    <VStack spacing={8}>
                        <Box textAlign="center">
                            <Heading 
                                size="lg" 
                                color="dota.text.primary" 
                                mb={4}
                            >
                                Powerful Features
                            </Heading>
                            <Text color="dota.text.secondary">
                                Everything you need to dominate the battlefield
                            </Text>
                        </Box>
                        
                        <Grid 
                            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
                            gap={6}
                            w="full"
                        >
                            {features.map((feature, index) => (
                                <MotionGridItem 
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        delay: 0.6 + (index * 0.1), 
                                        duration: 0.4,
                                        ease: "easeOut"
                                    }}
                                >
                                    <MotionCard
                                        bg="dota.bg.card"
                                        borderWidth={1}
                                        borderColor="dota.bg.tertiary"
                                        p={6}
                                        position="relative"
                                        overflow="hidden"
                                        h="full"
                                        whileHover={{
                                            y: -8,
                                            scale: 1.02,
                                            boxShadow: "card-hover",
                                            borderColor: feature.color,
                                            transition: { duration: 0.2 }
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        _before={{
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            bgGradient: feature.bgGradient
                                        }}
                                    >
                                        <VStack spacing={4} align="start">
                                            <Box
                                                p={3}
                                                borderRadius="lg"
                                                bg={feature.color}
                                                color="white"
                                                boxShadow={`0 0 20px ${feature.color}40`}
                                            >
                                                <Icon as={feature.icon} boxSize={6} />
                                            </Box>
                                            <VStack spacing={2} align="start">
                                                <Heading 
                                                    size="md" 
                                                    color="dota.text.primary"
                                                >
                                                    {feature.title}
                                                </Heading>
                                                <Text 
                                                    color="dota.text.secondary" 
                                                    fontSize="sm"
                                                    lineHeight="1.5"
                                                >
                                                    {feature.description}
                                                </Text>
                                            </VStack>
                                        </VStack>
                                    </MotionCard>
                                </MotionGridItem>
                            ))}
                        </Grid>
                    </VStack>
                </MotionBox>

                {/* Call to Action */}
                {!user && (
                    <MotionCard 
                        bg="dota.bg.card"
                        borderWidth={1}
                        borderColor="dota.teal.500"
                        p={8}
                        textAlign="center"
                        bgGradient="linear(to-r, dota.bg.card, dota.bg.secondary)"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "hero-glow",
                            borderColor: "dota.teal.400",
                            transition: { duration: 0.2 }
                        }}
                    >
                        <VStack spacing={4}>
                            <Heading size="lg" color="dota.text.primary">
                                Ready to Elevate Your Game?
                            </Heading>
                            <Text color="dota.text.secondary" maxW="400px">
                                Join thousands of players already using Dota 2 Companion to improve their gameplay
                            </Text>
                            <HStack spacing={4}>
                                <Button 
                                    variant="primary" 
                                    size="lg"
                                    onClick={() => navigate('/login')}
                                    _hover={{
                                        transform: "scale(1.05)",
                                        boxShadow: "hero-glow"
                                    }}
                                >
                                    Get Started
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="lg"
                                    onClick={() => navigate('/heroes')}
                                >
                                    Browse Heroes
                                </Button>
                            </HStack>
                        </VStack>
                    </MotionCard>
                )}
            </MotionVStack>
        </Container>
    );
};

export default HomePage;
