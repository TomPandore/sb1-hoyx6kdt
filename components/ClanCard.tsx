import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ImageBackground 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  Extrapolate 
} from 'react-native-reanimated';
import { Check, Shield } from 'lucide-react-native';
import { Clan } from '@/types';
import { COLORS } from '@/constants/Colors';
import { BORDER_RADIUS, FONTS, SPACING } from '@/constants/Layout';

interface ClanCardProps {
  clan: Clan;
  title: string;
  description: string;
  objectives: string[];
  imageUrl: string;
  isSelected: boolean;
  onSelect: () => void;
  position: number;
  scrollPosition: Animated.SharedValue<number>;
  cardWidth: number;
}

export default function ClanCard({
  clan,
  title,
  description,
  objectives,
  imageUrl,
  isSelected,
  onSelect,
  position,
  scrollPosition,
  cardWidth,
}: ClanCardProps) {
  const getClanColor = () => {
    return COLORS.clan[clan];
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollPosition.value,
      [(position - 1) * cardWidth, position * cardWidth, (position + 1) * cardWidth],
      [0.9, 1, 0.9],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      scrollPosition.value,
      [(position - 1) * cardWidth, position * cardWidth, (position + 1) * cardWidth],
      [0.7, 1, 0.7],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onSelect}
        style={[
          styles.touchable,
          isSelected && { borderColor: getClanColor(), borderWidth: 3 }
        ]}
      >
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
            style={styles.gradient}
          >
            {isSelected && (
              <View style={[styles.selectedBadge, { backgroundColor: getClanColor() }]}>
                <Shield size={24} color={COLORS.text} />
                <Check size={16} color={COLORS.text} style={styles.checkIcon} />
              </View>
            )}
            
            <View style={styles.contentContainer}>
              <View style={[styles.clanBadge, { backgroundColor: getClanColor() }]}>
                <Text style={styles.clanName}>{title}</Text>
              </View>
              
              <Text style={styles.clanDescription}>{description}</Text>
              
              <View style={styles.objectivesContainer}>
                <Text style={styles.objectivesTitle}>💥 Objectif:</Text>
                <Text style={styles.objectivesText}>{objectives.join(', ')}</Text>
              </View>
              
              {isSelected && (
                <View style={[styles.selectedIndicator, { borderColor: getClanColor() }]}>
                  <Text style={[styles.selectedText, { color: getClanColor() }]}>Sélectionné</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 450,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
  },
  imageBackground: {
    flex: 1,
  },
  imageStyle: {
    borderRadius: BORDER_RADIUS.lg,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  selectedBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  contentContainer: {
    alignItems: 'flex-start',
  },
  clanBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  clanName: {
    ...FONTS.heading,
    color: COLORS.text,
    fontFamily: 'Rajdhani-Bold',
  },
  clanDescription: {
    ...FONTS.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  objectivesContainer: {
    marginBottom: SPACING.lg,
  },
  objectivesTitle: {
    ...FONTS.subheading,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  objectivesText: {
    ...FONTS.body,
    color: COLORS.text,
  },
  selectedIndicator: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: SPACING.md,
  },
  selectedText: {
    ...FONTS.button,
  },
});