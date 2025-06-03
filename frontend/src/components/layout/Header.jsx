// frontend/src/components/layout/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  Avatar,
  Text,
  Badge,
  IconButton,
  HStack,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import PlayerSearch from '../PlayerSearch';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handlePlayerSearchResult = (players) => {
        if (players && players.length === 1) {
            navigate(`/player/${players[0].steamId}`);
        }
    };

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Heroes', path: '/heroes' },
        { label: 'Recommendations', path: '/recommendations' },
    ];

    return (
        <MotionBox
            as="header"
            bg="dota.bg.primary"
            borderBottom="1px solid"
            borderColor="dota.bg.tertiary"
            position="sticky"
            top="0"
            zIndex="sticky"
            backdropFilter="blur(10px)"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Flex
                maxW="7xl"
                mx="auto"
                px={{ base: 4, md: 6 }}
                py={4}
                align="center"
                justify="space-between"
            >
                {/* Logo/Brand */}
                <MotionBox
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link to="/">
                        <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="dota.teal.400"
                            textShadow="0 0 10px rgba(39, 174, 158, 0.5)"
                        >
                            Dota 2 Companion
                        </Text>
                    </Link>
                </MotionBox>

                {/* Desktop Navigation */}
                <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                        >
                            <Button
                                as={Link}
                                to={item.path}
                                variant="ghost"
                                color="dota.text.secondary"
                                _hover={{
                                    color: "dota.teal.400",
                                    transform: "translateY(-2px)",
                                    textShadow: "0 0 8px rgba(39, 174, 158, 0.6)",
                                }}
                                transition="all 0.2s ease"
                            >
                                {item.label}
                            </Button>
                        </motion.div>
                    ))}
                </HStack>

                {/* Right side - Search and User */}
                <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
                    <Box maxW="300px">
                        <PlayerSearch onResult={handlePlayerSearchResult} />
                    </Box>
                    
                    {user ? (
                        <HStack spacing={3}>
                            {user.avatarUrl && (
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Avatar
                                        src={user.avatarUrl}
                                        alt={user.personaName}
                                        size="sm"
                                        border="2px"
                                        borderColor="dota.teal.500"
                                        boxShadow="0 0 10px rgba(39, 174, 158, 0.3)"
                                    />
                                </motion.div>
                            )}
                            <Text 
                                color="dota.text.primary" 
                                fontSize="sm" 
                                fontWeight="medium"
                                maxW="120px"
                                isTruncated
                            >
                                {user.personaName}
                            </Text>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                color="red.400"
                                _hover={{
                                    bg: "red.500",
                                    color: "white",
                                    transform: "translateY(-2px)",
                                }}
                                transition="all 0.2s ease"
                            >
                                Logout
                            </Button>
                        </HStack>
                    ) : (
                        <Button
                            as={Link}
                            to="/login"
                            variant="solid"
                            bg="dota.teal.500"
                            color="white"
                            _hover={{
                                bg: "dota.teal.600",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(39, 174, 158, 0.4)",
                            }}
                            transition="all 0.2s ease"
                        >
                            Login
                        </Button>
                    )}
                </HStack>

                {/* Mobile menu button */}
                <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    variant="ghost"
                    color="dota.text.primary"
                    _hover={{
                        bg: "dota.bg.hover",
                        color: "dota.teal.400",
                    }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    icon={<Icon as={isMenuOpen ? FaTimes : FaBars} boxSize={4} />}
                    aria-label="Toggle navigation menu"
                />
            </Flex>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <MotionBox
                    bg="dota.bg.secondary"
                    px={4}
                    py={4}
                    borderTop="1px solid"
                    borderColor="dota.bg.tertiary"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <VStack spacing={4} align="stretch">
                        {/* Mobile Search */}
                        <Box>
                            <PlayerSearch onResult={handlePlayerSearchResult} />
                        </Box>

                        {/* Mobile Nav Items */}
                        {navItems.map((item) => (
                            <Button
                                key={item.path}
                                as={Link}
                                to={item.path}
                                variant="ghost"
                                justifyContent="flex-start"
                                color="dota.text.secondary"
                                _hover={{
                                    color: "dota.teal.400",
                                    bg: "dota.bg.hover",
                                }}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Button>
                        ))}

                        {/* Mobile User Section */}
                        {user ? (
                            <VStack spacing={3} pt={4} borderTop="1px solid" borderColor="dota.bg.tertiary">
                                <HStack spacing={3}>
                                    {user.avatarUrl && (
                                        <Avatar
                                            src={user.avatarUrl}
                                            alt={user.personaName}
                                            size="sm"
                                            border="2px"
                                            borderColor="dota.teal.500"
                                        />
                                    )}
                                    <Text 
                                        color="dota.text.primary" 
                                        fontSize="sm" 
                                        fontWeight="medium"
                                    >
                                        {user.personaName}
                                    </Text>
                                </HStack>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    color="red.400"
                                    _hover={{
                                        bg: "red.500",
                                        color: "white",
                                    }}
                                    w="full"
                                >
                                    Logout
                                </Button>
                            </VStack>
                        ) : (
                            <Button
                                as={Link}
                                to="/login"
                                variant="solid"
                                bg="dota.teal.500"
                                color="white"
                                _hover={{
                                    bg: "dota.teal.600",
                                }}
                                onClick={() => setIsMenuOpen(false)}
                                w="full"
                            >
                                Login
                            </Button>
                        )}
                    </VStack>
                </MotionBox>
            )}
        </MotionBox>
    );
};

export default Header;