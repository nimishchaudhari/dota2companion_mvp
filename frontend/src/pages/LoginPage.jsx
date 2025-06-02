// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  Button,
  Input,
  Alert,
  Flex,
  Icon
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaGamepad, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

const LoginPage = () => {
    const [username, setUsername] = useState('testuser');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <Container maxW="md" py={12}>
            <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <Box textAlign="center">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                repeatDelay: 3,
                                ease: "easeInOut" 
                            }}
                        >
                            <Icon 
                                as={FaGamepad} 
                                boxSize={12} 
                                color="dota.teal.500" 
                                mb={4}
                                filter="drop-shadow(0 0 10px rgba(39, 174, 158, 0.5))"
                            />
                        </motion.div>
                        <Heading 
                            size="xl" 
                            color="dota.text.primary" 
                            mb={2}
                            textShadow="0 0 15px rgba(39, 174, 158, 0.3)"
                        >
                            Welcome Back
                        </Heading>
                        <Text color="dota.text.secondary">
                            Enter your credentials to access the arena
                        </Text>
                    </Box>

                    {/* Login Form */}
                    <MotionCard
                        bg="dota.bg.card"
                        borderWidth={1}
                        borderColor="dota.bg.tertiary"
                        p={8}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        whileHover={{
                            boxShadow: "dota-glow",
                            borderColor: "dota.teal.500",
                            transition: { duration: 0.2 }
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={6}>
                                <Box w="full">
                                    <Text 
                                        fontSize="sm" 
                                        fontWeight="medium" 
                                        color="dota.text.primary" 
                                        mb={2}
                                    >
                                        Username
                                    </Text>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        bg="dota.bg.primary"
                                        borderColor="dota.bg.tertiary"
                                        color="dota.text.primary"
                                        _hover={{
                                            borderColor: "dota.teal.600",
                                        }}
                                        _focus={{
                                            borderColor: "dota.teal.500",
                                            boxShadow: "0 0 0 1px rgba(39, 174, 158, 0.3)",
                                        }}
                                        size="lg"
                                        borderRadius="lg"
                                    />
                                    <Text 
                                        fontSize="xs" 
                                        color="dota.text.muted" 
                                        mt={1}
                                    >
                                        Demo mode - use any username to continue
                                    </Text>
                                </Box>

                                <Button
                                    type="submit"
                                    variant="solid"
                                    bg="dota.teal.500"
                                    color="white"
                                    size="lg"
                                    w="full"
                                    _hover={{
                                        bg: "dota.teal.600",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 8px 25px rgba(39, 174, 158, 0.4)",
                                    }}
                                    _active={{
                                        transform: "translateY(0)",
                                    }}
                                    transition="all 0.2s ease"
                                    leftIcon={<Icon as={FaUser} />}
                                >
                                    Enter Arena
                                </Button>
                            </VStack>
                        </form>
                    </MotionCard>

                    {/* Demo Info */}
                    <Alert.Root
                        bg="rgba(39, 174, 158, 0.1)"
                        color="dota.text.secondary"
                        borderColor="dota.teal.500"
                        borderWidth={1}
                        borderRadius="md"
                        p={4}
                    >
                        <Alert.Indicator as={FaUser} color="dota.teal.500" mr={3} />
                        <Alert.Content>
                            <Alert.Description>
                                <Box>
                                    <Text fontSize="sm" fontWeight="medium" color="dota.text.primary">
                                        Demo Mode Active
                                    </Text>
                                    <Text fontSize="xs" color="dota.text.secondary">
                                        This is a demonstration version. Use "testuser" or any username to login.
                                    </Text>
                                </Box>
                            </Alert.Description>
                        </Alert.Content>
                    </Alert.Root>
                </VStack>
            </MotionBox>
        </Container>
    );
};

export default LoginPage;