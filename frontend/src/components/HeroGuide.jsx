import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBook,
  FaBolt,
  FaUsers,
  FaTarget,
  FaCrosshairs,
  FaShieldAlt,
  FaStar,
  FaChevronRight,
  FaPlay,
  FaClock,
  FaLightbulb,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle
} from 'react-icons/fa';
import { heroGuides } from '../services/heroGuides';
import { enhancedApi } from '../services/enhancedApiWithSync';

const MotionBox = motion.div;
const MotionCard = motion.div;

const HeroGuide = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHero, setSelectedHero] = useState(null);
  const [heroGuide, setHeroGuide] = useState(null);
  const [selectedSkillBuild, setSelectedSkillBuild] = useState(null);
  const [heroLevel, setHeroLevel] = useState(1);
  const [gamePhase, setGamePhase] = useState('early');
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Custom toast function to replace Chakra useToast
  const toast = (options) => {
    console.log('Toast:', options.title, options.description);
    // You could implement a custom toast system here or use a library like react-toastify
  };

  useEffect(() => {
    loadHeroes();
  }, []);

  useEffect(() => {
    if (selectedHero) {
      loadHeroGuide();
    }
  }, [selectedHero]);

  const loadHeroes = async () => {
    try {
      setLoading(true);
      const heroData = await enhancedApi.getHeroes();
      const availableHeroes = heroData.filter(hero => 
        heroGuides.getAvailableHeroes().some(gh => gh.id === hero.id)
      );
      setHeroes(availableHeroes);
    } catch (error) {
      console.error('Error loading heroes:', error);
      toast({
        title: 'Error loading heroes',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHeroGuide = () => {
    if (!selectedHero) return;
    
    const guide = heroGuides.getHeroGuide(selectedHero.id);
    if (guide) {
      setHeroGuide(guide);
      if (guide.skillBuilds.length > 0) {
        setSelectedSkillBuild(guide.skillBuilds[0]);
      }
    }
  };

  const handleHeroSelect = (hero) => {
    setSelectedHero(hero);
    setHeroLevel(1);
    setSelectedSkillBuild(null);
  };

  const getSkillAtLevel = (skillBuild, level) => {
    if (!skillBuild || !skillBuild.skillOrder || level < 1 || level > 25) {
      return null;
    }
    return skillBuild.skillOrder[level - 1] || null;
  };

  const getSkillLevels = (skillBuild, heroLevel) => {
    const skillLevels = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (!skillBuild || !skillBuild.skillOrder) return skillLevels;
    
    for (let i = 0; i < Math.min(heroLevel, skillBuild.skillOrder.length); i++) {
      const skill = skillBuild.skillOrder[i];
      if (skill && skillLevels[skill] !== undefined) {
        skillLevels[skill]++;
      }
    }
    
    return skillLevels;
  };

  const getAbilityKey = (index) => {
    const keys = ['Q', 'W', 'E', 'R', 'D', 'F'];
    return keys[index - 1] || index.toString();
  };

  const getAbilityColor = (abilityType) => {
    switch (abilityType) {
      case 'active': return 'blue';
      case 'passive': return 'green';
      case 'toggle': return 'purple';
      case 'ultimate': return 'red';
      default: return 'gray';
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Carry': 'red',
      'Support': 'blue',
      'Initiator': 'orange',
      'Disabler': 'purple',
      'Nuker': 'yellow',
      'Durable': 'green',
      'Escape': 'teal',
      'Pusher': 'pink'
    };
    return colors[role] || 'gray';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const formatCooldown = (cooldown) => {
    if (Array.isArray(cooldown)) {
      return cooldown.join('/');
    }
    return cooldown.toString();
  };

  const formatManaCost = (manaCost) => {
    if (Array.isArray(manaCost)) {
      return manaCost.join('/');
    }
    return manaCost.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <FaBook size={60} className="text-teal-500" />
          <div className="text-slate-400">Loading Hero Guides...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            📚 Hero Guide System
          </h1>
          <div className="text-slate-400">
            Comprehensive guides with skill builds, positioning, and power spikes
          </div>
        </div>

        {/* Hero Selection */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg">
          <div className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex w-full justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Select Hero</h2>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Advanced</span>
                    <input
                      type="checkbox"
                      checked={showAdvanced}
                      onChange={(e) => setShowAdvanced(e.target.checked)}
                      className="rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                    />
                  </label>
                  <select
                    value={gamePhase}
                    onChange={(e) => setGamePhase(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white text-sm px-3 py-1 rounded max-w-[120px] focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    <option value="early">Early Game</option>
                    <option value="mid">Mid Game</option>
                    <option value="late">Late Game</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3 w-full">
                {heroes.map(hero => (
                  <MotionBox
                    key={hero.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={`flex flex-col items-center space-y-2 p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedHero?.id === hero.id 
                          ? 'bg-teal-900 border-teal-500' 
                          : 'bg-slate-700 border-slate-600 hover:border-teal-400'
                      }`}
                      onClick={() => handleHeroSelect(hero)}
                    >
                      <div
                        className="w-[60px] h-[60px] rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url(${hero.icon})` }}
                      />
                      <div className="text-xs text-white text-center leading-tight">
                        {hero.localized_name}
                      </div>
                      <div className="flex items-center space-x-1">
                        {heroGuides.getHero(hero.id)?.roles?.slice(0, 2).map(role => {
                          const colorClass = {
                            'Carry': 'bg-red-600',
                            'Support': 'bg-blue-600',
                            'Initiator': 'bg-orange-600',
                            'Disabler': 'bg-purple-600',
                            'Nuker': 'bg-yellow-600',
                            'Durable': 'bg-green-600',
                            'Escape': 'bg-teal-600',
                            'Pusher': 'bg-pink-600'
                          }[role] || 'bg-gray-600';
                          return (
                            <span key={role} className={`${colorClass} text-white px-1 py-0.5 text-xs rounded`}>
                              {role[0]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </MotionBox>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedHero && heroGuide && (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
            {/* Hero Overview */}
            <VStack spacing={4} align="stretch">
              {/* Hero Info */}
              <Card bg="dota.bg.card" borderColor="dota.bg.tertiary">
                <CardHeader>
                  <HStack>
                    <Box
                      w="60px"
                      h="60px"
                      borderRadius="lg"
                      backgroundImage={`url(${selectedHero.icon})`}
                      backgroundSize="cover"
                    />
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color="dota.text.primary">
                        {selectedHero.localized_name}
                      </Heading>
                      <HStack spacing={2}>
                        <Badge colorScheme="blue">{heroGuide.hero.primary_attr}</Badge>
                        <Badge colorScheme="orange">{heroGuide.hero.attack_type}</Badge>
                        <Badge colorScheme="purple">Complexity: {heroGuide.hero.complexity}/3</Badge>
                      </HStack>
                      <HStack spacing={1} wrap="wrap">
                        {heroGuide.hero.roles?.map(role => (
                          <Badge key={role} colorScheme={getRoleColor(role)} size="sm">
                            {role}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  </HStack>
                </CardHeader>
              </Card>

              {/* Abilities */}
              <Card bg="dota.bg.card" borderColor="dota.bg.tertiary">
                <CardHeader>
                  <Heading size="md" color="dota.text.primary">
                    <FaBolt /> Abilities
                  </Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {Object.entries(heroGuide.abilities).map(([key, ability]) => (
                      <MotionCard
                        key={key}
                        size="sm"
                        bg="dota.bg.secondary"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: parseInt(key) * 0.1 }}
                      >
                        <CardBody>
                          <HStack spacing={3}>
                            <VStack spacing={1}>
                              <Box
                                w="40px"
                                h="40px"
                                bg={`${getAbilityColor(ability.type)}.500`}
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontWeight="bold"
                                color="white"
                              >
                                {getAbilityKey(parseInt(key))}
                              </Box>
                              <Badge colorScheme={getAbilityColor(ability.type)} size="xs">
                                {ability.type}
                              </Badge>
                            </VStack>
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="bold" color="dota.text.primary">
                                {ability.name}
                              </Text>
                              <Text fontSize="sm" color="dota.text.secondary">
                                {ability.description}
                              </Text>
                              <HStack spacing={4} fontSize="xs" color="dota.text.secondary">
                                {ability.manaCost > 0 && (
                                  <HStack>
                                    <Text>Mana:</Text>
                                    <Badge colorScheme="blue" size="xs">
                                      {formatManaCost(ability.manaCost)}
                                    </Badge>
                                  </HStack>
                                )}
                                {ability.cooldown > 0 && (
                                  <HStack>
                                    <Text>CD:</Text>
                                    <Badge colorScheme="yellow" size="xs">
                                      {formatCooldown(ability.cooldown)}s
                                    </Badge>
                                  </HStack>
                                )}
                                <HStack>
                                  <Text>Max:</Text>
                                  <Badge colorScheme="green" size="xs">
                                    {ability.maxLevel}
                                  </Badge>
                                </HStack>
                              </HStack>
                            </VStack>
                          </HStack>
                        </CardBody>
                      </MotionCard>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              {/* Skill Builds */}
              <Card bg="dota.bg.card" borderColor="dota.bg.tertiary">
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md" color="dota.text.primary">
                      <FaTarget /> Skill Builds
                    </Heading>
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="dota.text.secondary">Level:</Text>
                      <Select
                        value={heroLevel}
                        onChange={(e) => setHeroLevel(parseInt(e.target.value))}
                        bg="dota.bg.secondary"
                        size="sm"
                        maxW="80px"
                      >
                        {Array.from({ length: 25 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </Select>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Build Selection */}
                    <VStack spacing={2} align="stretch">
                      {heroGuide.skillBuilds.map((build, index) => (
                        <MotionCard
                          key={build.id}
                          size="sm"
                          bg={selectedSkillBuild?.id === build.id ? 'dota.teal.900' : 'dota.bg.primary'}
                          cursor="pointer"
                          onClick={() => setSelectedSkillBuild(build)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          _hover={{ transform: 'scale(1.02)' }}
                          borderColor={selectedSkillBuild?.id === build.id ? 'dota.teal.500' : 'transparent'}
                          borderWidth="2px"
                        >
                          <CardBody>
                            <VStack align="start" spacing={2}>
                              <HStack justify="space-between" w="full">
                                <Text fontWeight="bold" color="dota.text.primary">
                                  {build.name}
                                </Text>
                                <Badge colorScheme="teal">
                                  Level {heroLevel}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="dota.text.secondary">
                                {build.description}
                              </Text>
                              
                              {selectedSkillBuild?.id === build.id && (
                                <MotionBox
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  w="full"
                                >
                                  <VStack spacing={3} w="full">
                                    {/* Current Skill Levels */}
                                    <Box w="full">
                                      <Text fontSize="sm" fontWeight="bold" color="dota.text.primary" mb={2}>
                                        Current Skill Levels:
                                      </Text>
                                      <Grid templateColumns="repeat(auto-fit, minmax(80px, 1fr))" gap={2}>
                                        {Object.entries(getSkillLevels(build, heroLevel)).map(([skillIndex, level]) => {
                                          const ability = heroGuide.abilities[skillIndex];
                                          if (!ability) return null;
                                          
                                          return (
                                            <VStack key={skillIndex} spacing={1}>
                                              <Box
                                                w="30px"
                                                h="30px"
                                                bg={level > 0 ? `${getAbilityColor(ability.type)}.500` : 'gray.600'}
                                                borderRadius="md"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                fontWeight="bold"
                                                color="white"
                                                fontSize="sm"
                                              >
                                                {getAbilityKey(parseInt(skillIndex))}
                                              </Box>
                                              <Text fontSize="xs" color="dota.text.secondary">
                                                {level}/{ability.maxLevel}
                                              </Text>
                                            </VStack>
                                          );
                                        })}
                                      </Grid>
                                    </Box>

                                    {/* Skill Order Display */}
                                    <Box w="full">
                                      <Text fontSize="sm" fontWeight="bold" color="dota.text.primary" mb={2}>
                                        Skill Order:
                                      </Text>
                                      <Grid templateColumns="repeat(auto-fill, minmax(30px, 1fr))" gap={1}>
                                        {build.skillOrder.slice(0, 25).map((skill, levelIndex) => {
                                          const ability = heroGuide.abilities[skill];
                                          const isCurrentLevel = levelIndex === heroLevel - 1;
                                          const isLearned = levelIndex < heroLevel;
                                          
                                          return (
                                            <Tooltip
                                              key={levelIndex}
                                              label={`Level ${levelIndex + 1}: ${ability?.name || 'Unknown'}`}
                                            >
                                              <Box
                                                w="25px"
                                                h="25px"
                                                bg={
                                                  isCurrentLevel ? 'dota.teal.500' :
                                                  isLearned ? `${getAbilityColor(ability?.type)}.500` :
                                                  'gray.600'
                                                }
                                                borderRadius="sm"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                fontWeight="bold"
                                                color="white"
                                                fontSize="xs"
                                                border={isCurrentLevel ? '2px solid' : 'none'}
                                                borderColor={isCurrentLevel ? 'white' : 'transparent'}
                                                opacity={isLearned ? 1 : 0.5}
                                              >
                                                {getAbilityKey(skill)}
                                              </Box>
                                            </Tooltip>
                                          );
                                        })}
                                      </Grid>
                                    </Box>

                                    {/* Build Notes */}
                                    <Box w="full">
                                      <Text fontSize="sm" fontWeight="bold" color="dota.text.primary" mb={1}>
                                        Priority:
                                      </Text>
                                      <UnorderedList spacing={1}>
                                        {build.priority?.map((note, i) => (
                                          <ListItem key={i} fontSize="sm" color="dota.text.secondary">
                                            {note}
                                          </ListItem>
                                        ))}
                                      </UnorderedList>
                                    </Box>

                                    {build.situational && (
                                      <Box w="full">
                                        <Text fontSize="sm" fontWeight="bold" color="yellow.400" mb={1}>
                                          <FaExclamationTriangle /> Situational:
                                        </Text>
                                        <Text fontSize="sm" color="dota.text.secondary">
                                          {build.situational}
                                        </Text>
                                      </Box>
                                    )}
                                  </VStack>
                                </MotionBox>
                              )}
                            </VStack>
                          </CardBody>
                        </MotionCard>
                      ))}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>

            {/* Guides and Analysis */}
            <VStack spacing={4} align="stretch">
              <Tabs variant="enclosed" colorScheme="teal">
                <TabList>
                  <Tab>Positioning</Tab>
                  <Tab>Power Spikes</Tab>
                  <Tab>Combos</Tab>
                  <Tab>Tips</Tab>
                </TabList>
                <TabPanels>
                  {/* Positioning Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {heroGuide.positioning && (
                        <>
                          {/* Laning Positioning */}
                          <Card bg="dota.bg.secondary" size="sm">
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                <Text fontWeight="bold" color="dota.text.primary">
                                  <FaUsers /> Laning Phase
                                </Text>
                                {Object.entries(heroGuide.positioning.laning).map(([phase, guide]) => (
                                  <Box key={phase}>
                                    <Text fontSize="sm" fontWeight="bold" color="dota.text.primary" mb={1}>
                                      {phase.charAt(0).toUpperCase() + phase.slice(1)} Game:
                                    </Text>
                                    <Text fontSize="sm" color="dota.text.secondary">
                                      {guide}
                                    </Text>
                                  </Box>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Team Fight Positioning */}
                          <Card bg="dota.bg.secondary" size="sm">
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                <Text fontWeight="bold" color="dota.text.primary">
                                  <FaCrosshairs /> Team Fights
                                </Text>
                                {Object.entries(heroGuide.positioning.teamfight).map(([aspect, guide]) => (
                                  <Box key={aspect}>
                                    <Text fontSize="sm" fontWeight="bold" color="dota.text.primary" mb={1}>
                                      {aspect.charAt(0).toUpperCase() + aspect.slice(1)}:
                                    </Text>
                                    <Text fontSize="sm" color="dota.text.secondary">
                                      {guide}
                                    </Text>
                                  </Box>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Warding */}
                          <Card bg="dota.bg.secondary" size="sm">
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                <Text fontWeight="bold" color="dota.text.primary">
                                  <FaShieldAlt /> Warding Tips
                                </Text>
                                <Text fontSize="sm" color="dota.text.secondary">
                                  {heroGuide.positioning.warding}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        </>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Power Spikes Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {heroGuide.powerSpikes && (
                        <>
                          {/* Level Spikes */}
                          <Card bg="dota.bg.secondary" size="sm">
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                <Text fontWeight="bold" color="dota.text.primary">
                                  <FaBolt /> Level Power Spikes
                                </Text>
                                {heroGuide.powerSpikes.levels.map((spike, index) => (
                                  <MotionBox
                                    key={spike.level}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <HStack spacing={3} p={2} bg="dota.bg.primary" borderRadius="md">
                                      <Badge colorScheme="blue" fontSize="sm">
                                        Level {spike.level}
                                      </Badge>
                                      <Text fontSize="sm" color="dota.text.secondary" flex={1}>
                                        {spike.description}
                                      </Text>
                                      {heroLevel >= spike.level && (
                                        <FaCheckCircle color="var(--chakra-colors-green-400)" />
                                      )}
                                    </HStack>
                                  </MotionBox>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Item Spikes */}
                          <Card bg="dota.bg.secondary" size="sm">
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                <Text fontWeight="bold" color="dota.text.primary">
                                  <FaClock /> Item Power Spikes
                                </Text>
                                {heroGuide.powerSpikes.items.map((spike, index) => (
                                  <MotionBox
                                    key={spike.item}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <VStack align="start" spacing={1} p={2} bg="dota.bg.primary" borderRadius="md">
                                      <HStack justify="space-between" w="full">
                                        <Text fontWeight="bold" color="dota.text.primary">
                                          {spike.item}
                                        </Text>
                                        <Badge colorScheme="yellow">{spike.timing}</Badge>
                                      </HStack>
                                      <Text fontSize="sm" color="dota.text.secondary">
                                        {spike.description}
                                      </Text>
                                    </VStack>
                                  </MotionBox>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Timing Summary */}
                          <Card bg="dota.bg.secondary" size="sm">
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                <Text fontWeight="bold" color="dota.text.primary">
                                  <FaInfoCircle /> Overall Timing
                                </Text>
                                <Text fontSize="sm" color="dota.text.secondary">
                                  {heroGuide.powerSpikes.timing}
                                </Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        </>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Combos Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {heroGuide.combos && (
                        <>
                          {/* Basic Combos */}
                          <Card bg="dota.bg.secondary" size="sm">
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                <Text fontWeight="bold" color="dota.text.primary">
                                  <FaPlay /> Basic Combos
                                </Text>
                                {heroGuide.combos.basic?.map((combo, index) => (
                                  <MotionCard
                                    key={combo.name}
                                    size="sm"
                                    bg="dota.bg.primary"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <CardBody>
                                      <VStack align="start" spacing={2}>
                                        <HStack justify="space-between" w="full">
                                          <Text fontWeight="bold" color="dota.text.primary">
                                            {combo.name}
                                          </Text>
                                          <Badge colorScheme={getDifficultyColor(combo.difficulty)}>
                                            {combo.difficulty}
                                          </Badge>
                                        </HStack>
                                        <Text fontSize="sm" color="dota.text.secondary">
                                          {combo.description}
                                        </Text>
                                        <Box>
                                          <Text fontSize="sm" fontWeight="bold" color="dota.text.primary" mb={1}>
                                            Sequence:
                                          </Text>
                                          <HStack spacing={2} wrap="wrap">
                                            {combo.sequence.map((step, i) => (
                                              <React.Fragment key={i}>
                                                <Badge colorScheme="blue" size="sm">
                                                  {step}
                                                </Badge>
                                                {i < combo.sequence.length - 1 && (
                                                  <FaChevronRight size={12} color="gray" />
                                                )}
                                              </React.Fragment>
                                            ))}
                                          </HStack>
                                        </Box>
                                      </VStack>
                                    </CardBody>
                                  </MotionCard>
                                ))}
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Advanced Combos */}
                          {showAdvanced && heroGuide.combos.advanced && (
                            <Card bg="dota.bg.secondary" size="sm">
                              <CardBody>
                                <VStack spacing={3} align="stretch">
                                  <Text fontWeight="bold" color="dota.text.primary">
                                    <FaStar /> Advanced Combos
                                  </Text>
                                  {heroGuide.combos.advanced.map((combo, index) => (
                                    <MotionCard
                                      key={combo.name}
                                      size="sm"
                                      bg="dota.bg.primary"
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                    >
                                      <CardBody>
                                        <VStack align="start" spacing={2}>
                                          <HStack justify="space-between" w="full">
                                            <Text fontWeight="bold" color="dota.text.primary">
                                              {combo.name}
                                            </Text>
                                            <Badge colorScheme={getDifficultyColor(combo.difficulty)}>
                                              {combo.difficulty}
                                            </Badge>
                                          </HStack>
                                          <Text fontSize="sm" color="dota.text.secondary">
                                            {combo.description}
                                          </Text>
                                          <Box>
                                            <Text fontSize="sm" fontWeight="bold" color="dota.text.primary" mb={1}>
                                              Sequence:
                                            </Text>
                                            <HStack spacing={2} wrap="wrap">
                                              {combo.sequence.map((step, i) => (
                                                <React.Fragment key={i}>
                                                  <Badge colorScheme="purple" size="sm">
                                                    {step}
                                                  </Badge>
                                                  {i < combo.sequence.length - 1 && (
                                                    <FaChevronRight size={12} color="gray" />
                                                  )}
                                                </React.Fragment>
                                              ))}
                                            </HStack>
                                          </Box>
                                        </VStack>
                                      </CardBody>
                                    </MotionCard>
                                  ))}
                                </VStack>
                              </CardBody>
                            </Card>
                          )}
                        </>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Tips Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {/* Hero Tips */}
                      <Card bg="dota.bg.secondary" size="sm">
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <Text fontWeight="bold" color="dota.text.primary">
                              <FaLightbulb /> Playing Tips
                            </Text>
                            <UnorderedList spacing={2}>
                              {heroGuide.tips.map((tip, index) => (
                                <ListItem key={index} fontSize="sm" color="dota.text.secondary">
                                  {tip}
                                </ListItem>
                              ))}
                            </UnorderedList>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Counters */}
                      <Card bg="dota.bg.secondary" size="sm">
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <Text fontWeight="bold" color="dota.text.primary">
                              <FaTimesCircle /> Counters to Watch
                            </Text>
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" color="red.400" mb={1}>
                                Hard Counters:
                              </Text>
                              <HStack spacing={2} wrap="wrap">
                                {heroGuide.counters.hardCounters.map(counter => (
                                  <Badge key={counter} colorScheme="red" size="sm">
                                    {counter}
                                  </Badge>
                                ))}
                              </HStack>
                            </Box>
                            <Box>
                              <Text fontSize="sm" fontWeight="bold" color="orange.400" mb={1}>
                                Soft Counters:
                              </Text>
                              <HStack spacing={2} wrap="wrap">
                                {heroGuide.counters.softCounters.map(counter => (
                                  <Badge key={counter} colorScheme="orange" size="sm">
                                    {counter}
                                  </Badge>
                                ))}
                              </HStack>
                            </Box>
                            <Text fontSize="sm" color="dota.text.secondary">
                              {heroGuide.counters.reasoning}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Synergies */}
                      <Card bg="dota.bg.secondary" size="sm">
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <Text fontWeight="bold" color="dota.text.primary">
                              <FaCheckCircle /> Strong Synergies
                            </Text>
                            <HStack spacing={2} wrap="wrap">
                              {heroGuide.synergies.strongWith.map(synergy => (
                                <Badge key={synergy} colorScheme="green" size="sm">
                                  {synergy}
                                </Badge>
                              ))}
                            </HStack>
                            <Text fontSize="sm" color="dota.text.secondary">
                              {heroGuide.synergies.reasoning}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </Grid>
        )}
      </VStack>
    </Box>
  );
};

export default HeroGuide;