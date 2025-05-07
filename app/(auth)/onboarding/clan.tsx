import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { BORDER_RADIUS, FONTS, SPACING } from '@/constants/Layout';
import { CLAN_DATA } from '@/assets/images/clans';
import Button from '@/components/Button';
import ClanCard from '@/components/ClanCard';
import { Clan } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Animated, { 
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.lg * 2;

export default function ClanSelectionScreen() {
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const scrollX = useSharedValue(0);
  const { user, setCurrentOnboardingData } = useAuth();
  
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleSelectClan = (clan: Clan) => {
    setSelectedClan(clan);
  };

  const handleNext = () => {
    if (!selectedClan) return;
    
    setCurrentOnboardingData({ 
      ...user, 
      clan: selectedClan 
    });
    router.push('/(app)/(tabs)/totem');
  };

  const renderPaginationDots = () => {
    return CLAN_DATA.map((_, i) => {
      const dotStyle = useAnimatedStyle(() => {
        const inputRange = [
          (i - 1) * CARD_WIDTH,
          i * CARD_WIDTH,
          (i + 1) * CARD_WIDTH,
        ];
        
        const scale = interpolate(
          scrollX.value,
          inputRange,
          [0.8, 1.2, 0.8],
          'clamp'
        );
        
        const opacity = interpolate(
          scrollX.value,
          inputRange,
          [0.4, 1, 0.4],
          'clamp'
        );
        
        return {
          transform: [{ scale }],
          opacity,
          backgroundColor: selectedClan === CLAN_DATA[i].id ? COLORS.clan[CLAN_DATA[i].id as Clan] : COLORS.textSecondary,
        };
      });

      return (
        <Animated.View
          key={`dot-${i}`}
          style={[styles.paginationDot, dotStyle]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MOHERO</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>DERNIÈRE ÉTAPE</Text>
          <Text style={styles.questionText}>
            Choisissez votre clan
          </Text>
        </View>

        <Animated.FlatList
          data={CLAN_DATA}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + SPACING.md}
          decelerationRate="fast"
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carouselContainer}
          onScroll={handleScroll}
          renderItem={({ item, index }) => (
            <View style={{ width: CARD_WIDTH, marginRight: SPACING.md }}>
              <ClanCard
                clan={item.id as Clan}
                title={item.title}
                description={item.description}
                objectives={item.objectives}
                imageUrl={item.imageUrl}
                isSelected={selectedClan === item.id}
                onSelect={() => handleSelectClan(item.id as Clan)}
                position={index}
                scrollPosition={scrollX}
                cardWidth={CARD_WIDTH + SPACING.md}
              />
            </View>
          )}
        />

        <View style={styles.paginationContainer}>
          {renderPaginationDots()}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Continuer"
            onPress={handleNext}
            disabled={!selectedClan}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  title: {
    ...FONTS.heading,
    fontSize: 28,
    fontFamily: 'Rajdhani-Bold',
    color: COLORS.text,
    letterSpacing: 5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  stepContainer: {
    marginBottom: SPACING.lg,
  },
  stepText: {
    ...FONTS.caption,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    letterSpacing: 1,
  },
  questionText: {
    ...FONTS.heading,
    color: COLORS.text,
  },
  carouselContainer: {
    paddingVertical: SPACING.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    marginVertical: SPACING.lg,
  },
});