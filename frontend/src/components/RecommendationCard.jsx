// frontend/src/components/RecommendationCard.jsx
import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Image,
  Text,
  HStack,
  VStack,
  Badge,
  Avatar,
  Flex,
  Progress,
  Wrap,
  WrapItem,
  Tooltip,
  useToken,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import FavoritesButton from './FavoritesButton';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const RecommendationCard = ({ 
  type, // 'hero', 'item', 'build', 'combo'
  data,
  onClick,
  showFavorites = true,
  showDetails = true,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const [cardHover] = useToken('shadows', ['card-hover']);
  const [heroGlow] = useToken('shadows', ['hero-glow']);
  
  const sizeConfig = {
    small: { padding: 3, imageSize: '48px', spacing: 2 },
    medium: { padding: 4, imageSize: '64px', spacing: 3 },
    large: { padding: 6, imageSize: '80px', spacing: 4 }
  };
  
  const config = sizeConfig[size];

  // Attribute color mapping
  const getAttributeColor = (attr) => {
    switch (attr) {
      case 'str': return 'red.400';
      case 'agi': return 'green.400';
      case 'int': return 'blue.400';
      default: return 'purple.400';
    }
  };

  // Attribute icon mapping
  const getAttributeIcon = (attr) => {
    switch (attr) {
      case 'str': return 'S';
      case 'agi': return 'A';
      case 'int': return 'I';
      default: return 'U';
    }
  };

  const renderHeroCard = () => (
    <HStack spacing={config.spacing} align="flex-start">
      <Box position="relative" flexShrink={0}>
        <MotionBox
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Image
            src={data.icon || data.image}
            alt={data.localized_name || data.name}
            boxSize={config.imageSize}
            borderRadius="md"
            objectFit="cover"
            border="2px solid"
            borderColor="dota.bg.tertiary"
            _hover={{
              borderColor: "dota.teal.500",
              boxShadow: heroGlow,
            }}
            transition="all 0.3s ease"
          />
        </MotionBox>
        {data.primary_attr && (
          <Box
            position="absolute"
            bottom="-2px"
            right="-2px"
            w="18px"
            h="18px"
            borderRadius="full"
            bg={getAttributeColor(data.primary_attr)}
            color="white"
            fontSize="xs"
            fontWeight="bold"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="2px solid"
            borderColor="dota.bg.primary"
            boxShadow="sm"
          >
            {getAttributeIcon(data.primary_attr)}
          </Box>
        )}
      </Box>

      <VStack flex={1} align="flex-start" spacing={1} minW={0}>
        <Text
          fontSize="lg"
          fontWeight="semibold"
          color="dota.text.primary"
          isTruncated
          w="full"
        >
          {data.localized_name || data.name}
        </Text>

        {showDetails && (
          <VStack spacing={1} align="flex-start" w="full">
            {data.roles && (
              <Box>
                <Text fontSize="sm" color="dota.text.muted" display="inline">
                  Roles: 
                </Text>
                <Wrap spacing={1} ml={1} display="inline-flex">
                  {data.roles.slice(0, 2).map((role, index) => (
                    <WrapItem key={index}>
                      <Badge
                        size="sm"
                        colorScheme="teal"
                        variant="subtle"
                        bg="dota.teal.500"
                        color="white"
                        fontSize="xs"
                      >
                        {role}
                      </Badge>
                    </WrapItem>
                  ))}
                  {data.roles.length > 2 && (
                    <WrapItem>
                      <Badge
                        size="sm"
                        variant="outline"
                        borderColor="dota.text.muted"
                        color="dota.text.muted"
                        fontSize="xs"
                      >
                        +{data.roles.length - 2}
                      </Badge>
                    </WrapItem>
                  )}
                </Wrap>
              </Box>
            )}

            {data.difficulty && (
              <HStack spacing={2}>
                <Text fontSize="sm" color="dota.text.muted">
                  Difficulty:
                </Text>
                <HStack spacing={1}>
                  {[...Array(3)].map((_, i) => (
                    <Box
                      key={i}
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={i < data.difficulty ? "yellow.400" : "dota.bg.tertiary"}
                      border="1px solid"
                      borderColor={i < data.difficulty ? "yellow.500" : "dota.bg.hover"}
                    />
                  ))}
                </HStack>
              </HStack>
            )}

            {data.winrate && (
              <HStack spacing={2}>
                <Text fontSize="sm" color="dota.text.muted">
                  Win Rate:
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={data.winrate >= 50 ? "dota.status.success" : "dota.status.error"}
                >
                  {data.winrate.toFixed(1)}%
                </Text>
                <Progress
                  value={data.winrate}
                  size="sm"
                  colorScheme={data.winrate >= 50 ? "green" : "red"}
                  bg="dota.bg.tertiary"
                  w="50px"
                  borderRadius="full"
                />
              </HStack>
            )}

            {data.reason && (
              <Text
                fontSize="sm"
                color="dota.teal.300"
                fontStyle="italic"
                bg="rgba(39, 174, 158, 0.1)"
                px={2}
                py={1}
                borderRadius="md"
                border="1px solid"
                borderColor="dota.teal.500"
              >
                {data.reason}
              </Text>
            )}
          </VStack>
        )}
      </VStack>

      {showFavorites && (
        <Box alignSelf="flex-start">
          <FavoritesButton
            type="hero"
            id={data.id || data.hero_id}
            name={data.localized_name || data.name}
            role={data.roles?.[0]}
          />
        </Box>
      )}
    </HStack>
  );

  const renderItemCard = () => (
    <HStack spacing={config.spacing} align="flex-start">
      <Box position="relative" flexShrink={0}>
        <MotionBox
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Image
            src={data.icon || data.image}
            alt={data.dname || data.name}
            boxSize={config.imageSize}
            borderRadius="md"
            objectFit="cover"
            bg="dota.bg.hover"
            border="2px solid"
            borderColor="dota.bg.tertiary"
            _hover={{
              borderColor: "yellow.400",
              boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)",
            }}
            transition="all 0.3s ease"
          />
        </MotionBox>
      </Box>

      <VStack flex={1} align="flex-start" spacing={1} minW={0}>
        <Text
          fontSize="lg"
          fontWeight="semibold"
          color="dota.text.primary"
          isTruncated
          w="full"
        >
          {data.dname || data.name}
        </Text>

        {showDetails && (
          <VStack spacing={1} align="flex-start" w="full">
            {data.cost && (
              <HStack spacing={1}>
                <Text fontSize="sm" color="yellow.400" fontWeight="medium">
                  Cost:
                </Text>
                <Text fontSize="sm" color="yellow.300" fontWeight="bold">
                  {data.cost}
                </Text>
                <Text fontSize="xs" color="yellow.500">
                  gold
                </Text>
              </HStack>
            )}

            {data.category && (
              <HStack spacing={2}>
                <Text fontSize="sm" color="dota.text.muted">
                  Category:
                </Text>
                <Badge
                  size="sm"
                  bg="dota.purple.500"
                  color="white"
                  fontSize="xs"
                  borderRadius="md"
                >
                  {data.category}
                </Badge>
              </HStack>
            )}

            {data.description && (
              <Text
                fontSize="xs"
                color="dota.text.muted"
                noOfLines={2}
                bg="dota.bg.hover"
                p={2}
                borderRadius="md"
                border="1px solid"
                borderColor="dota.bg.tertiary"
              >
                {data.description}
              </Text>
            )}

            {data.reason && (
              <Text
                fontSize="sm"
                color="dota.teal.300"
                fontStyle="italic"
                bg="rgba(39, 174, 158, 0.1)"
                px={2}
                py={1}
                borderRadius="md"
                border="1px solid"
                borderColor="dota.teal.500"
              >
                {data.reason}
              </Text>
            )}
          </VStack>
        )}
      </VStack>

      {showFavorites && (
        <Box alignSelf="flex-start">
          <FavoritesButton
            type="item"
            id={data.id || data.item_id}
            name={data.dname || data.name}
            category={data.category}
          />
        </Box>
      )}
    </HStack>
  );

  const renderBuildCard = () => (
    <VStack spacing={config.spacing} align="stretch">
      <Flex justify="space-between" align="center">
        <Text
          fontSize="lg"
          fontWeight="semibold"
          color="dota.text.primary"
          isTruncated
        >
          {data.name || 'Item Build'}
        </Text>
        {data.situation && (
          <Badge
            bg="dota.darkBlue.500"
            color="white"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
          >
            {data.situation}
          </Badge>
        )}
      </Flex>

      {showDetails && (
        <VStack spacing={2} align="stretch">
          {data.items && (
            <Box>
              <Wrap spacing={1}>
                {data.items.slice(0, 6).map((item, index) => (
                  <WrapItem key={index}>
                    <Tooltip label={item.name} placement="top">
                      <MotionBox
                        whileHover={{ scale: 1.1, y: -2 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Image
                          src={item.icon}
                          alt={item.name}
                          boxSize="32px"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="dota.bg.tertiary"
                          _hover={{
                            borderColor: "yellow.400",
                            boxShadow: "0 0 10px rgba(251, 191, 36, 0.4)",
                          }}
                          transition="all 0.2s ease"
                        />
                      </MotionBox>
                    </Tooltip>
                  </WrapItem>
                ))}
                {data.items.length > 6 && (
                  <WrapItem>
                    <Box
                      boxSize="32px"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="dota.bg.tertiary"
                      bg="dota.bg.hover"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                      color="dota.text.muted"
                      fontWeight="medium"
                    >
                      +{data.items.length - 6}
                    </Box>
                  </WrapItem>
                )}
              </Wrap>
            </Box>
          )}

          {data.total_cost && (
            <HStack spacing={1}>
              <Text fontSize="sm" color="yellow.400" fontWeight="medium">
                Total Cost:
              </Text>
              <Text fontSize="sm" color="yellow.300" fontWeight="bold">
                {data.total_cost}
              </Text>
              <Text fontSize="xs" color="yellow.500">
                gold
              </Text>
            </HStack>
          )}

          {data.description && (
            <Text
              fontSize="sm"
              color="dota.text.muted"
              bg="dota.bg.hover"
              p={2}
              borderRadius="md"
              border="1px solid"
              borderColor="dota.bg.tertiary"
            >
              {data.description}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );

  const renderComboCard = () => (
    <VStack spacing={config.spacing} align="stretch">
      <Text
        fontSize="lg"
        fontWeight="semibold"
        color="dota.text.primary"
      >
        {data.name || 'Hero Combo'}
      </Text>

      {showDetails && (
        <VStack spacing={2} align="stretch">
          {data.heroes && (
            <HStack spacing={2} flexWrap="wrap">
              {data.heroes.map((hero, index) => (
                <React.Fragment key={index}>
                  <Tooltip label={hero.name} placement="top">
                    <MotionBox
                      whileHover={{ scale: 1.1, y: -2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Avatar
                        src={hero.icon}
                        name={hero.name}
                        size="sm"
                        border="2px solid"
                        borderColor="dota.bg.tertiary"
                        _hover={{
                          borderColor: "dota.teal.500",
                          boxShadow: heroGlow,
                        }}
                        transition="all 0.2s ease"
                      />
                    </MotionBox>
                  </Tooltip>
                  {index < data.heroes.length - 1 && (
                    <Text color="dota.text.muted" fontSize="lg" fontWeight="bold">
                      +
                    </Text>
                  )}
                </React.Fragment>
              ))}
            </HStack>
          )}

          {data.synergy_rating && (
            <HStack spacing={2}>
              <Text fontSize="sm" color="dota.text.muted">
                Synergy:
              </Text>
              <HStack spacing={1}>
                {[...Array(5)].map((_, i) => (
                  <Box
                    key={i}
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={i < data.synergy_rating ? "dota.status.success" : "dota.bg.tertiary"}
                    border="1px solid"
                    borderColor={i < data.synergy_rating ? "green.500" : "dota.bg.hover"}
                    boxShadow={i < data.synergy_rating ? "0 0 4px rgba(74, 222, 128, 0.4)" : "none"}
                  />
                ))}
              </HStack>
              <Text fontSize="sm" color="dota.status.success" fontWeight="medium">
                {data.synergy_rating}/5
              </Text>
            </HStack>
          )}

          {data.description && (
            <Text
              fontSize="sm"
              color="dota.text.muted"
              bg="dota.bg.hover"
              p={2}
              borderRadius="md"
              border="1px solid"
              borderColor="dota.bg.tertiary"
            >
              {data.description}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );

  const renderContent = () => {
    switch (type) {
      case 'hero':
        return renderHeroCard();
      case 'item':
        return renderItemCard();
      case 'build':
        return renderBuildCard();
      case 'combo':
        return renderComboCard();
      default:
        return <div>Unknown recommendation type</div>;
    }
  };

  return (
    <MotionCard
      bg="dota.bg.card"
      borderWidth="2px"
      borderColor="dota.bg.tertiary"
      borderRadius="lg"
      overflow="hidden"
      cursor={onClick ? "pointer" : "default"}
      _hover={{
        borderColor: "dota.teal.500",
        boxShadow: cardHover,
        transform: "translateY(-2px)",
      }}
      _active={{
        transform: "translateY(0)",
      }}
      onClick={onClick}
      transition="all 0.3s ease"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: cardHover,
      }}
      whileTap={{ scale: 0.98 }}
      position="relative"
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : undefined}
      _focus={{
        outline: "none",
        ring: "2px",
        ringColor: "dota.teal.500",
        ringOffset: "2px",
        ringOffsetColor: "dota.bg.primary",
      }}
      background={`linear-gradient(135deg, 
        rgba(30, 30, 30, 0.9) 0%, 
        rgba(26, 26, 26, 0.95) 50%, 
        rgba(45, 45, 45, 0.9) 100%)`}
      backdropFilter="blur(10px)"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(39, 174, 158, 0.6), transparent)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
          opacity: 1,
        },
      }}
    >
      <CardBody p={config.padding}>
        {renderContent()}
      </CardBody>
    </MotionCard>
  );
};

export default RecommendationCard;