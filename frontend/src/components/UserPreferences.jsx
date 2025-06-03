// frontend/src/components/UserPreferences.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Heading,
  VStack,
  HStack,
  Select,
  Checkbox,
  Button,
  Text,
  Spinner,
  Grid,
  GridItem,
  Switch,
  Badge,
  useToken,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { fileBackend } from '../services/fileBackend.js';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const UserPreferences = ({ onSave, onCancel, showTitle = true }) => {
  const [preferences, setPreferences] = useState({
    skill_level: 'beginner',
    preferred_roles: [],
    playstyle: 'balanced',
    game_mode_preference: 'all_pick',
    hero_complexity_preference: 'simple',
    communication_style: 'friendly',
    meta_focus: true,
    experimental_builds: false,
    show_beginner_tips: true,
    auto_save_builds: true,
    notification_preferences: {
      patch_updates: true,
      meta_changes: true,
      favorite_hero_updates: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      const profile = await fileBackend.getCurrentUserProfile();
      if (profile?.preferences) {
        setPreferences(profile.preferences);
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await fileBackend.updateUserProfile({ preferences });
      
      if (onSave) {
        onSave(preferences);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = (role) => {
    setPreferences(prev => ({
      ...prev,
      preferred_roles: prev.preferred_roles.includes(role)
        ? prev.preferred_roles.filter(r => r !== role)
        : [...prev.preferred_roles, role]
    }));
  };

  const handleNotificationChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
    }));
  };

  const [cardHover] = useToken('shadows', ['card-hover']);

  if (loading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        p={8}
        bg="dota.bg.card"
        borderRadius="lg"
        border="2px solid"
        borderColor="dota.bg.tertiary"
      >
        <VStack spacing={4}>
          <Spinner 
            size="xl" 
            color="dota.teal.500" 
            thickness="4px"
            speed="0.8s"
          />
          <Text color="dota.text.muted" fontSize="sm">
            Loading preferences...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <MotionCard
      bg="dota.bg.card"
      borderWidth="2px"
      borderColor="dota.bg.tertiary"
      borderRadius="lg"
      boxShadow={cardHover}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      background={`linear-gradient(135deg, 
        rgba(30, 30, 30, 0.9) 0%, 
        rgba(26, 26, 26, 0.95) 50%, 
        rgba(45, 45, 45, 0.9) 100%)`}
      backdropFilter="blur(10px)"
    >
      {showTitle && (
        <Box pb={0} p={6}>
          <Heading 
            size="xl" 
            color="dota.text.primary"
            textAlign="center"
            background="linear-gradient(45deg, #27ae9e, #64ffda)"
            backgroundClip="text"
            textShadow="0 0 20px rgba(39, 174, 158, 0.3)"
          >
            User Preferences
          </Heading>
        </Box>
      )}

      <Box p={6}>
        {error && (
          <Box 
            borderRadius="lg" 
            mb={6}
            bg="dota.status.error"
            color="white"
            border="1px solid"
            borderColor="red.400"
            p={4}
          >
            <Text>{error}</Text>
          </Box>
        )}

        <VStack spacing={8} align="stretch">
          {/* Skill Level */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Field.Root>
              <Field.Label color="dota.text.primary" fontWeight="semibold" mb={3}>
                <HStack spacing={2}>
                  <Text>Skill Level</Text>
                  <Badge 
                    bg="dota.teal.500" 
                    color="white" 
                    fontSize="xs"
                    borderRadius="full"
                  >
                    {preferences.skill_level}
                  </Badge>
                </HStack>
              </Field.Label>
              <Select
                value={preferences.skill_level}
                onChange={(e) => setPreferences(prev => ({ ...prev, skill_level: e.target.value }))}
                bg="dota.bg.hover"
                borderColor="dota.bg.tertiary"
                color="dota.text.primary"
                _hover={{ borderColor: "dota.teal.500" }}
                _focus={{
                  borderColor: "dota.teal.500",
                  boxShadow: "0 0 0 1px rgba(39, 174, 158, 0.6)",
                }}
                size="lg"
                borderRadius="md"
              >
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">📈 Intermediate</option>
                <option value="advanced">⚡ Advanced</option>
                <option value="expert">🏆 Expert</option>
              </Select>
            </Field.Root>
          </MotionBox>

          {/* Preferred Roles */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Field.Root>
              <Field.Label color="dota.text.primary" fontWeight="semibold" mb={3}>
                <HStack spacing={2}>
                  <Text>Preferred Roles</Text>
                  <Badge 
                    bg="dota.purple.500" 
                    color="white" 
                    fontSize="xs"
                    borderRadius="full"
                  >
                    {preferences.preferred_roles.length} selected
                  </Badge>
                </HStack>
              </Field.Label>
              <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                {['Carry', 'Support', 'Nuker', 'Disabler', 'Initiator', 'Durable', 'Escape', 'Pusher'].map(role => (
                  <GridItem key={role}>
                    <MotionBox
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <HStack
                        as="label"
                        spacing={3}
                        cursor="pointer"
                        p={3}
                        borderRadius="md"
                        bg={preferences.preferred_roles.includes(role) ? "dota.teal.500" : "dota.bg.hover"}
                        color={preferences.preferred_roles.includes(role) ? "white" : "dota.text.primary"}
                        border="2px solid"
                        borderColor={preferences.preferred_roles.includes(role) ? "dota.teal.500" : "dota.bg.tertiary"}
                        _hover={{
                          borderColor: "dota.teal.500",
                          bg: preferences.preferred_roles.includes(role) ? "dota.teal.600" : "dota.bg.tertiary",
                        }}
                        transition="all 0.2s ease"
                      >
                        <Checkbox
                          isChecked={preferences.preferred_roles.includes(role)}
                          onChange={() => handleRoleToggle(role)}
                          colorScheme="teal"
                          size="lg"
                        />
                        <Text fontWeight="medium" fontSize="sm">
                          {role}
                        </Text>
                      </HStack>
                    </MotionBox>
                  </GridItem>
                ))}
              </Grid>
            </Field.Root>
          </MotionBox>

          {/* Playstyle */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Field.Root>
              <Field.Label color="dota.text.primary" fontWeight="semibold" mb={3}>
                Playstyle
              </Field.Label>
              <Select
                value={preferences.playstyle}
                onChange={(e) => setPreferences(prev => ({ ...prev, playstyle: e.target.value }))}
                bg="dota.bg.hover"
                borderColor="dota.bg.tertiary"
                color="dota.text.primary"
                _hover={{ borderColor: "dota.teal.500" }}
                _focus={{ borderColor: "dota.teal.500", boxShadow: "0 0 0 1px rgba(39, 174, 158, 0.6)" }}
                size="lg"
              >
                <option value="aggressive">⚔️ Aggressive</option>
                <option value="defensive">🛡️ Defensive</option>
                <option value="balanced">⚖️ Balanced</option>
                <option value="farming">🌾 Farming-focused</option>
                <option value="fighting">👊 Fighting-focused</option>
              </Select>
            </Field.Root>
          </MotionBox>

          {/* Game Mode & Hero Complexity */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <GridItem>
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Field.Root>
                  <Field.Label color="dota.text.primary" fontWeight="semibold" mb={3}>
                    Game Mode Preference
                  </Field.Label>
                  <Select
                    value={preferences.game_mode_preference}
                    onChange={(e) => setPreferences(prev => ({ ...prev, game_mode_preference: e.target.value }))}
                    bg="dota.bg.hover"
                    borderColor="dota.bg.tertiary"
                    color="dota.text.primary"
                    _hover={{ borderColor: "dota.teal.500" }}
                    _focus={{ borderColor: "dota.teal.500", boxShadow: "0 0 0 1px rgba(39, 174, 158, 0.6)" }}
                    size="lg"
                  >
                    <option value="all_pick">All Pick</option>
                    <option value="ranked_matchmaking">Ranked Matchmaking</option>
                    <option value="single_draft">Single Draft</option>
                    <option value="random_draft">Random Draft</option>
                    <option value="captain_mode">Captain's Mode</option>
                  </Select>
                </Field.Root>
              </MotionBox>
            </GridItem>

            <GridItem>
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Field.Root>
                  <Field.Label color="dota.text.primary" fontWeight="semibold" mb={3}>
                    Hero Complexity
                  </Field.Label>
                  <Select
                    value={preferences.hero_complexity_preference}
                    onChange={(e) => setPreferences(prev => ({ ...prev, hero_complexity_preference: e.target.value }))}
                    bg="dota.bg.hover"
                    borderColor="dota.bg.tertiary"
                    color="dota.text.primary"
                    _hover={{ borderColor: "dota.teal.500" }}
                    _focus={{ borderColor: "dota.teal.500", boxShadow: "0 0 0 1px rgba(39, 174, 158, 0.6)" }}
                    size="lg"
                  >
                    <option value="simple">🟢 Simple heroes</option>
                    <option value="moderate">🟡 Moderate complexity</option>
                    <option value="complex">🔴 Complex heroes</option>
                    <option value="any">🌈 Any complexity</option>
                  </Select>
                </Field.Root>
              </MotionBox>
            </GridItem>
          </Grid>

          {/* Game Preferences */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Box bg="dota.bg.hover" p={4} borderRadius="lg" border="2px solid" borderColor="dota.bg.tertiary">
              <Heading size="md" color="dota.text.primary" mb={4}>
                🎮 Game Preferences
              </Heading>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <VStack align="flex-start" spacing={1}>
                    <Text color="dota.text.primary" fontWeight="medium">Focus on meta heroes</Text>
                    <Text color="dota.text.muted" fontSize="sm">Prioritize currently strong heroes</Text>
                  </VStack>
                  <Switch
                    isChecked={preferences.meta_focus}
                    onChange={(e) => setPreferences(prev => ({ ...prev, meta_focus: e.target.checked }))}
                    colorScheme="teal"
                    size="lg"
                  />
                </HStack>

                <Box height="1px" bg="dota.bg.tertiary" />

                <HStack justify="space-between" align="center">
                  <VStack align="flex-start" spacing={1}>
                    <Text color="dota.text.primary" fontWeight="medium">Experimental builds</Text>
                    <Text color="dota.text.muted" fontSize="sm">Include unconventional strategies</Text>
                  </VStack>
                  <Switch
                    isChecked={preferences.experimental_builds}
                    onChange={(e) => setPreferences(prev => ({ ...prev, experimental_builds: e.target.checked }))}
                    colorScheme="purple"
                    size="lg"
                  />
                </HStack>

                <Box height="1px" bg="dota.bg.tertiary" />

                <HStack justify="space-between" align="center">
                  <VStack align="flex-start" spacing={1}>
                    <Text color="dota.text.primary" fontWeight="medium">Show beginner tips</Text>
                    <Text color="dota.text.muted" fontSize="sm">Display helpful explanations</Text>
                  </VStack>
                  <Switch
                    isChecked={preferences.show_beginner_tips}
                    onChange={(e) => setPreferences(prev => ({ ...prev, show_beginner_tips: e.target.checked }))}
                    colorScheme="blue"
                    size="lg"
                  />
                </HStack>

                <Box height="1px" bg="dota.bg.tertiary" />

                <HStack justify="space-between" align="center">
                  <VStack align="flex-start" spacing={1}>
                    <Text color="dota.text.primary" fontWeight="medium">Auto-save builds</Text>
                    <Text color="dota.text.muted" fontSize="sm">Automatically save custom builds</Text>
                  </VStack>
                  <Switch
                    isChecked={preferences.auto_save_builds}
                    onChange={(e) => setPreferences(prev => ({ ...prev, auto_save_builds: e.target.checked }))}
                    colorScheme="green"
                    size="lg"
                  />
                </HStack>
              </VStack>
            </Box>
          </MotionBox>

          {/* Notifications */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Box bg="dota.bg.hover" p={4} borderRadius="lg" border="2px solid" borderColor="dota.bg.tertiary">
              <Heading size="md" color="dota.text.primary" mb={4}>
                🔔 Notifications
              </Heading>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Text color="dota.text.primary" fontWeight="medium">Patch updates</Text>
                  <Switch
                    isChecked={preferences.notification_preferences.patch_updates}
                    onChange={(e) => handleNotificationChange('patch_updates', e.target.checked)}
                    colorScheme="orange"
                    size="lg"
                  />
                </HStack>

                <Box height="1px" bg="dota.bg.tertiary" />

                <HStack justify="space-between" align="center">
                  <Text color="dota.text.primary" fontWeight="medium">Meta changes</Text>
                  <Switch
                    isChecked={preferences.notification_preferences.meta_changes}
                    onChange={(e) => handleNotificationChange('meta_changes', e.target.checked)}
                    colorScheme="red"
                    size="lg"
                  />
                </HStack>

                <Box height="1px" bg="dota.bg.tertiary" />

                <HStack justify="space-between" align="center">
                  <Text color="dota.text.primary" fontWeight="medium">Favorite hero updates</Text>
                  <Switch
                    isChecked={preferences.notification_preferences.favorite_hero_updates}
                    onChange={(e) => handleNotificationChange('favorite_hero_updates', e.target.checked)}
                    colorScheme="pink"
                    size="lg"
                  />
                </HStack>
              </VStack>
            </Box>
          </MotionBox>
        </VStack>

        {/* Action Buttons */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          mt={8}
        >
          <HStack justify="flex-end" spacing={4}>
            {onCancel && (
              <Button
                onClick={onCancel}
                disabled={saving}
                variant="outline"
                size="lg"
                borderColor="dota.bg.tertiary"
                color="dota.text.primary"
                _hover={{
                  borderColor: "dota.teal.500",
                  bg: "dota.bg.hover",
                }}
                _disabled={{ opacity: 0.5 }}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="solid"
              size="lg"
              bg="linear-gradient(45deg, #27ae9e, #64ffda)"
              color="white"
              _hover={{
                bg: "linear-gradient(45deg, #1f9186, #4fd1c7)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(39, 174, 158, 0.4)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              _disabled={{ opacity: 0.5, _hover: { transform: "none" } }}
              isLoading={saving}
              loadingText="Saving..."
              spinner={<Spinner size="sm" color="white" />}
              leftIcon={saving ? undefined : <Text>💾</Text>}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </HStack>
        </MotionBox>
      </Box>
    </MotionCard>
  );
};

export default UserPreferences;