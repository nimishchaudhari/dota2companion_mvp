// frontend/src/components/layout/Footer.jsx
import React from 'react';
import { Box, Text, Flex, HStack } from '@chakra-ui/react';

const Footer = () => {
    return (
        <Box
            as="footer"
            bg="dota.bg.secondary"
            borderTop="1px"
            borderColor="dota.bg.tertiary"
            mt="auto"
            py={6}
            px={4}
        >
            <Box maxW="7xl" mx="auto">
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align="center"
                    gap={4}
                >
                    {/* Copyright */}
                    <Text
                        color="dota.text.secondary"
                        fontSize="sm"
                        textAlign="center"
                    >
                        &copy; {new Date().getFullYear()} Dota 2 Companion
                    </Text>

                    {/* Dota 2 Branding */}
                    <HStack spacing={2}>
                        <Text
                            color="dota.text.muted"
                            fontSize="xs"
                            textAlign="center"
                        >
                            Powered by
                        </Text>
                        <Text
                            color="dota.teal.400"
                            fontSize="xs"
                            fontWeight="semibold"
                            textShadow="0 0 8px rgba(39, 174, 158, 0.3)"
                        >
                            OpenDota API
                        </Text>
                        <Text
                            color="dota.text.muted"
                            fontSize="xs"
                        >
                            •
                        </Text>
                        <Text
                            color="dota.purple.400"
                            fontSize="xs"
                            fontWeight="semibold"
                            textShadow="0 0 8px rgba(72, 48, 140, 0.3)"
                        >
                            Steam API
                        </Text>
                    </HStack>

                    {/* Additional Info */}
                    <Text
                        color="dota.text.muted"
                        fontSize="xs"
                        textAlign="center"
                    >
                        Not affiliated with Valve Corporation
                    </Text>
                </Flex>

                <Box
                    mt={4}
                    height="1px"
                    bg="dota.bg.tertiary"
                    opacity={0.6}
                />

                <Text
                    color="dota.text.muted"
                    fontSize="xs"
                    textAlign="center"
                    mt={3}
                    fontStyle="italic"
                >
                    "The battle begins..."
                </Text>
            </Box>
        </Box>
    );
};
export default Footer;
