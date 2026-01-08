import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { PlayerCard } from '../models/Card';
import { COLORS, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface ShowdownCardProps {
  card: PlayerCard;
  isActive?: boolean;
  hasAdvantage?: boolean;
  onPress?: () => void;
  compact?: boolean;
  style?: ViewStyle;
  fatiguedControl?: number; // New prop for fatigue
}

export const ShowdownCard: React.FC<ShowdownCardProps> = ({
  card,
  isActive = false,
  hasAdvantage = false,
  compact = false,
  style,
  fatiguedControl,
}) => {
  const glowOpacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (hasAdvantage) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0.2, { duration: 800 })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0);
      scale.value = withSpring(1);
    }
  }, [hasAdvantage]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: hasAdvantage ? COLORS.advantage : COLORS.cardBorder,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const isPitcher = card.playerType === 'Pitcher';
  const mainStatLabel = isPitcher ? 'Control' : 'On-Base';
  let mainStatValue = card.command;
  const isFatigued = isPitcher && fatiguedControl !== undefined && fatiguedControl < mainStatValue;
  
  // If fatigued, we display the fatigued value.
  const displayValue = isFatigued ? fatiguedControl : mainStatValue;

  return (
    <Animated.View style={[styles.container, compact && styles.compactContainer, animatedStyle, style]}>
      {/* Animated Glow Background */}
      <Animated.View style={[styles.glow, glowStyle]} />

      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.playerName} numberOfLines={1}>{card.name}</Text>
          <Text style={styles.teamName}>{card.team} • {card.year}</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{card.points}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{mainStatLabel}</Text>
          <View style={styles.statValueContainer}>
             <Text style={[
               styles.statValue, 
               isFatigued && styles.fatiguedValue
             ]}>
               {displayValue}
             </Text>
             {isFatigued && (
               <View style={styles.fatigueBadge}>
                 <Text style={styles.fatigueText}>TIRED</Text>
               </View>
             )}
          </View>
          {isFatigued && (
             <Text style={styles.originalStat}>
               (Base: {mainStatValue})
             </Text>
          )}
        </View>
        
        {!compact && (
          <View style={styles.secondaryStats}>
             {isPitcher ? (
               <Text style={styles.secondaryStatText}>IP: {card.ip}</Text>
             ) : (
               <Text style={styles.secondaryStatText}>SPD: {card.speed}</Text>
             )}
             <Text style={styles.positionText}>{card.position}</Text>
          </View>
        )}
      </View>

      {hasAdvantage && (
        <View style={styles.advantageBanner}>
          <Text style={styles.advantageText}>ADVANTAGE</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222',
    borderRadius: BORDER_RADIUS.card,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    width: 150,
    ...SHADOWS.medium,
  },
  compactContainer: {
    width: 130,
    height: 160,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.advantage,
    zIndex: -1,
  },
  cardHeader: {
    backgroundColor: '#333',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
    marginRight: 4,
  },
  playerName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: FONT_SIZES.sm,
  },
  teamName: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  pointsBadge: {
    backgroundColor: COLORS.cardFrame,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  pointsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  cardBody: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statBox: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
    includeFontPadding: false,
  },
  fatiguedValue: {
    color: COLORS.error, // Red for fatigue
  },
  fatigueBadge: {
    marginLeft: 6,
    backgroundColor: COLORS.error,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fatigueText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  originalStat: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
    textDecorationLine: 'line-through',
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  secondaryStatText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  positionText: {
    color: COLORS.textGold,
    fontSize: 11,
    fontWeight: 'bold',
  },
  advantageBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.advantage,
    paddingVertical: 4,
    alignItems: 'center',
  },
  advantageText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 2,
  },
});