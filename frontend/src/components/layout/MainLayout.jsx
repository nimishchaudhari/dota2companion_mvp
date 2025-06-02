// frontend/src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
    return (
        <Flex
            direction="column"
            minH="100vh"
            bg="dota.bg.primary"
            color="dota.text.primary"
        >
            <Header />
            <Box
                as="main"
                flex="1"
                maxW="7xl"
                mx="auto"
                px={{ base: 4, sm: 6, lg: 8 }}
                py={{ base: 4, sm: 6, lg: 8 }}
                w="full"
            >
                <Outlet /> {/* Child routes will render here */}
            </Box>
            <Footer />
        </Flex>
    );
};
export default MainLayout;
