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
import { LAYOUT, moderateScale } from '../constants/layout';

interface ShowdownCardProps {
  card: PlayerCard;
  isActive?: boolean;
  hasAdvantage?: boolean;
  onPress?: () => void;
  compact?: boolean;
  mini?: boolean;
  headerOnly?: boolean;
  imageOnly?: boolean;
  style?: ViewStyle;
  fatiguedControl?: number;
  showThumbnail?: boolean;
}

export const ShowdownCard: React.FC<ShowdownCardProps> = ({
  card,
  isActive = false,
  hasAdvantage = false,
  compact = false,
  mini = false,
  headerOnly = false,
  imageOnly = false,
  style,
  fatiguedControl,
  showThumbnail = true,
}) => {
  // Handle undefined/null card
  if (!card) {
    return (
      <View style={[styles.container, styles.compactContainer, style]}>
        <Text style={styles.errorText}>Card data unavailable</Text>
      </View>
    );
  }

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

  // Mini mode: tiny card for dugout lineup (45x60px)
  if (mini) {
    return (
      <View style={[styles.miniContainer, style]}>
        {card.imageUrl && (
          <Image
            source={{ uri: card.imageUrl }}
            style={styles.miniImage}
            resizeMode="cover"
            onError={() => {}}
          />
        )}
        <View style={styles.miniOverlay}>
          <Text style={styles.miniName} numberOfLines={1}>
            {card.name.split(' ').pop()?.substring(0, 6)}
          </Text>
          <Text style={styles.miniStat}>{displayValue}</Text>
        </View>
      </View>
    );
  }

  // Image-only mode: just show the card image as background (for runners on base)
  if (imageOnly) {
    return (
      <Animated.View style={[styles.container, styles.compactContainer, animatedStyle, style]}>
        {/* Card Image as background */}
        {card.imageUrl && (
          <Image
            source={{ uri: card.imageUrl }}
            style={styles.compactImage}
            resizeMode="cover"
            onError={() => {}}
          />
        )}
      </Animated.View>
    );
  }

  // Compact mode: show card image with name and control stat overlaid
  if (compact) {
    // Header-only variant: just show player name above image
    if (headerOnly) {
      return (
        <Animated.View style={[styles.container, styles.compactContainer, animatedStyle, style]}>
          {/* Animated Glow Background */}
          <Animated.View style={[styles.glow, glowStyle]} />

          {/* Card Image as background */}
          {card.imageUrl && (
            <Image
              source={{ uri: card.imageUrl }}
              style={styles.compactImage}
              resizeMode="cover"
              onError={() => {}}
            />
          )}

          {/* Header overlay with player name only */}
          <View style={styles.compactHeaderOverlay}>
            <Text style={styles.compactPlayerName} numberOfLines={1}>{card.name}</Text>
          </View>

          {hasAdvantage && (
            <View style={styles.advantageBanner}>
              <Text style={styles.advantageText}>ADV</Text>
            </View>
          )}
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[styles.container, styles.compactContainer, animatedStyle, style]}>
        {/* Animated Glow Background */}
        <Animated.View style={[styles.glow, glowStyle]} />

        {/* Card Image as background */}
        {card.imageUrl && (
          <Image
            source={{ uri: card.imageUrl }}
            style={styles.compactImage}
            resizeMode="cover"
            onError={() => {}} // Silently fall through to stats view on error
          />
        )}

        {/* Header overlay with player name */}
        <View style={styles.compactHeaderOverlay}>
          <Text style={styles.compactPlayerName} numberOfLines={1}>{card.name}</Text>
        </View>

        {/* Center content overlay */}
        <View style={styles.compactContentOverlay}>
          <Text style={styles.compactStatLabel}>{mainStatLabel}</Text>
          <Text style={[
            styles.compactStatValue,
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

        {hasAdvantage && (
          <View style={styles.advantageBanner}>
            <Text style={styles.advantageText}>ADV</Text>
          </View>
        )}
      </Animated.View>
    );
  }

  // Full card view
  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
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

        <View style={styles.secondaryStats}>
          {isPitcher ? (
            <Text style={styles.secondaryStatText}>IP: {card.ip}</Text>
          ) : (
            <Text style={styles.secondaryStatText}>SPD: {card.speed}</Text>
          )}
          <Text style={styles.positionText}>{card.position}</Text>
        </View>
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
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  miniContainer: {
    width: LAYOUT.miniCardWidth,
    height: LAYOUT.miniCardHeight,
    backgroundColor: '#222',
    borderRadius: moderateScale(4),
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  miniImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  miniOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: moderateScale(2),
    zIndex: 1,
  },
  miniName: {
    color: '#FFF',
    fontSize: moderateScale(7),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  miniStat: {
    color: COLORS.textGold,
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  compactImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  compactHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    zIndex: 2,
  },
  compactPlayerName: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
  compactContentOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  compactStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowRadius: 2,
  },
  compactStatValue: {
    color: COLORS.textPrimary,
    fontSize: 40,
    fontWeight: 'bold',
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowRadius: 3,
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
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
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
  errorText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    padding: 8,
  },
});