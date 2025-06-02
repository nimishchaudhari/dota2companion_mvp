// frontend/src/components/ChakraDemo.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Input,
  Badge,
  Text,
  Heading,
  VStack,
  HStack,
  Grid,
  GridItem,
} from '@chakra-ui/react';

const ChakraDemo = () => {
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2} color="dota.text.primary">
            Dota 2 Companion - Chakra UI Demo
          </Heading>
          <Text color="dota.text.secondary" fontSize="lg">
            Custom theme with Dota 2 colors and responsive design
          </Text>
        </Box>

        {/* Button Variants Demo */}
        <Card variant="elevated" p={6}>
          <Heading size="md" mb={4}>Button Variants</Heading>
          <HStack spacing={4} wrap="wrap">
            <Button variant="solid">
              Primary Button
            </Button>
            <Button variant="primary">
              Purple Button
            </Button>
            <Button variant="secondary">
              Dark Blue Button
            </Button>
            <Button variant="outline">
              Outline Button
            </Button>
            <Button variant="ghost">
              Ghost Button
            </Button>
          </HStack>
        </Card>

        {/* Card Variants Demo */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
          <GridItem>
            <Card p={6}>
              <Heading size="sm" mb={2}>Default Card</Heading>
              <Text mb={4}>This is a standard card with default styling.</Text>
              <Badge>Standard</Badge>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card variant="elevated" p={6}>
              <Heading size="sm" mb={2}>Elevated Card</Heading>
              <Text mb={4}>This card has an elevated shadow effect.</Text>
              <Badge variant="hero">Elevated</Badge>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card variant="hero" p={6}>
              <Heading size="sm" mb={2}>Hero Card</Heading>
              <Text mb={4}>Special hero card with gradient background.</Text>
              <Badge variant="match">Hero</Badge>
            </Card>
          </GridItem>
        </Grid>

        {/* Input Demo */}
        <Card p={6}>
          <Heading size="md" mb={4}>Form Elements</Heading>
          <VStack spacing={4} align="stretch">
            <Input 
              placeholder="Search for players..." 
              size="lg"
            />
            <Input 
              placeholder="Hero name" 
              variant="filled"
            />
            <HStack>
              <Button onClick={() => setModalOpen(true)}>
                Test Button
              </Button>
              <Button variant="outline">
                Toggle Theme
              </Button>
            </HStack>
          </VStack>
        </Card>

        {/* Responsive Grid Demo */}
        <Card p={6}>
          <Heading size="md" mb={2}>Responsive Grid</Heading>
          <Text color="dota.text.muted" fontSize="sm" mb={4}>
            Resize window to see responsive behavior
          </Text>
          <Grid 
            templateColumns={{ 
              base: "1fr", 
              sm: "repeat(2, 1fr)", 
              md: "repeat(3, 1fr)", 
              lg: "repeat(4, 1fr)" 
            }} 
            gap={4}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <GridItem key={num}>
                <Box 
                  bg="dota.bg.tertiary" 
                  p={4} 
                  borderRadius="md" 
                  textAlign="center"
                  _hover={{
                    bg: "dota.bg.hover",
                    transform: "translateY(-2px)",
                    boxShadow: "dota-glow"
                  }}
                  transition="all 0.2s"
                >
                  <Text fontWeight="bold">Item {num}</Text>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </Card>

        {/* Color Palette Demo */}
        <Card p={6}>
          <Heading size="md" mb={4}>Dota 2 Color Palette</Heading>
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
            <Box textAlign="center">
              <Box bg="dota.teal.500" h="60px" borderRadius="md" mb={2}></Box>
              <Text fontSize="sm">Teal Primary</Text>
            </Box>
            <Box textAlign="center">
              <Box bg="dota.purple.500" h="60px" borderRadius="md" mb={2}></Box>
              <Text fontSize="sm">Purple Primary</Text>
            </Box>
            <Box textAlign="center">
              <Box bg="dota.darkBlue.500" h="60px" borderRadius="md" mb={2}></Box>
              <Text fontSize="sm">Dark Blue</Text>
            </Box>
            <Box textAlign="center">
              <Box bg="dota.text.accent" h="60px" borderRadius="md" mb={2}></Box>
              <Text fontSize="sm">Accent</Text>
            </Box>
          </Grid>
        </Card>

        {/* Status Message */}
        {modalOpen && (
          <Card p={6} borderColor="dota.teal.500">
            <Text>Chakra UI v3 is successfully integrated! 🎉</Text>
            <Button mt={2} size="sm" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default ChakraDemo;