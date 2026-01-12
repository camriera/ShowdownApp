import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image, Dimensions, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate, 
  Extrapolate,
  runOnJS,
  withTiming,
  useDerivedValue
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { PlayerCard } from '../models/Card';
import { COLORS, BORDER_RADIUS } from '../constants/theme';

interface PlayerCardViewProps {
  card: PlayerCard;
  onClose?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 350);
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.7, 500);
const DISMISS_THRESHOLD = 100;
const FLIP_THRESHOLD = 80;

export const PlayerCardView: React.FC<PlayerCardViewProps> = ({ card, onClose }) => {
  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);
  const rotation = useSharedValue(0);
  const baseRotation = useSharedValue(0); // Stores the snapped angle (0 or 180)
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    setImageLoadFailed(false); // Reset image error when card changes
  }, [card]);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
      // Map horizontal translation to rotation. 
      // Moving right (+X) adds rotation, Left (-X) subtracts.
      // Sensitivity: 1 pixel = 0.4 degrees
      rotation.value = baseRotation.value + (event.translationX * 0.4);
    })
    .onEnd((event) => {
      // 1. Check Dismissal (Vertical)
      if (Math.abs(event.translationY) > DISMISS_THRESHOLD || Math.abs(event.velocityY) > 800) {
        translateY.value = withTiming(
          event.translationY > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT, 
          { duration: 250 }, 
          () => runOnJS(handleClose)()
        );
        return; 
      } else {
        translateY.value = withSpring(0);
      }

      // 2. Check Flip (Horizontal)
      // We determine direction based on drag distance or velocity
      const rotatedAmount = event.translationX * 0.4;
      const velocityFlip = Math.abs(event.velocityX) > 800;
      const distanceFlip = Math.abs(rotatedAmount) > 45; // 45 degrees threshold

      if (velocityFlip || distanceFlip) {
        // Toggle state
        // If we dragged Right (+) or had positive velocity, generally we want to increase angle
        // But simpler: just swap to the "other" side from where we started.
        // If base is 0, we go to 180. If base is 180, we go to 0 (or 360).
        
        // Let's just toggle between 0 and 180 for simplicity
        const target = baseRotation.value === 0 ? 180 : 0;
        baseRotation.value = target;
        rotation.value = withSpring(target, { damping: 15, stiffness: 90 });
      } else {
        // Snap back to original
        rotation.value = withSpring(baseRotation.value, { damping: 15, stiffness: 90 });
      }
    });

  // Tap to flip fallback (optional, but good for accessibility/ease)
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      const target = baseRotation.value === 0 ? 180 : 0;
      baseRotation.value = target;
      rotation.value = withSpring(target, { damping: 15, stiffness: 90 });
    });

  const composedGestures = Gesture.Exclusive(panGesture, tapGesture);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value }
    ]
  }));

  // We use modulo or normalized rotation for the styles to ensure 0-360 logic works if we went crazy
  // But with 0/180 toggle, simple interpolation works nicely.
  
  const frontAnimatedStyle = useAnimatedStyle(() => {
    // Normalize rotation to 0-360 range ideally, but here we just use raw value
    // Front is visible when rotation is near 0, 360, -360...
    // Or simpler: Front is visible when cos(deg) > 0?
    // Let's stick to the 0-180 logic logic we had, but handle the continuous gesture value.
    
    // We need to hide the face when it's rotated > 90 or < -90 relative to its facing.
    // 0 deg = Front. 180 deg = Back.
    
    // Check if showing front: absolute difference from 0 (or 360 multiples) is < 90
    // Actually, just use backfaceVisibility if we can rely on it.
    // But Opacity trick is smoother for cross-platform.
    
    // Simple logic:
    // Front is at 0. Back is at 180.
    // If angle % 360 is between -90 and 90, Front is visible.
    
    // Helper to normalize angle to -180...180
    let angle = rotation.value % 360;
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    
    const isFrontVisible = Math.abs(angle) < 90;

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotation.value}deg` },
      ],
      opacity: isFrontVisible ? 1 : 0,
      zIndex: isFrontVisible ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    // Back is at 180.
    // It rotates WITH the card.
    // The content of the back should be rotated 180 initially so it's "behind" the front.
    // Then we rotate the whole container.
    
    // Wait, the previous logic animated TWO views separately.
    // `front` rotated 0 -> 180. `back` rotated 180 -> 360.
    // Here we share `rotation.value`.
    
    // Standard approach:
    // View 1 (Front): rotateY: rotation
    // View 2 (Back): rotateY: rotation + 180
    
    // Visibility:
    // Front visible if cos(rotation) > 0
    // Back visible if cos(rotation) < 0
    
    let angle = rotation.value % 360;
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    
    const isBackVisible = Math.abs(angle) >= 90;

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotation.value + 180}deg` },
      ],
      opacity: isBackVisible ? 1 : 0,
      zIndex: isBackVisible ? 1 : 0,
    };
  });

  const isPitcher = card.playerType === 'Pitcher';

  // Content Components
  const CardFront = () => {
    // If we have a card image and it hasn't failed to load, show just the image
    if (card.imageUrl && !imageLoadFailed) {
      return (
        <View style={[styles.cardFace, styles.frontFace]}>
          <Image
            source={{ uri: card.imageUrl }}
            style={styles.fullCardImage}
            resizeMode="cover"
            onError={() => setImageLoadFailed(true)}
          />
          <Text style={styles.flipHint}>Swipe L/R to Flip • Swipe Up to Close</Text>
        </View>
      );
    }

    // Fallback to stats view if no image
    return (
      <View style={[styles.cardFace, styles.frontFace]}>
        <View style={styles.foilHeader}>
          <Text style={styles.teamName}>{card.team.toUpperCase()}</Text>
          <Text style={styles.yearBadge}>{card.year}</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/blankplayer-2004-dark.png')}
            style={styles.playerImage}
            resizeMode="cover"
          />
          <View style={styles.nameOverlay}>
             <Text style={styles.playerName}>{card.name}</Text>
             <Text style={styles.playerPosition}>
               {isPitcher ? `P • ${card.hand}` : `${Object.keys(card.positions || {})[0] || 'POS'}`}
             </Text>
          </View>
        </View>
        <View style={styles.statBadgeContainer}>
          <View style={styles.statBadge}>
            <Text style={styles.statLabel}>{isPitcher ? 'CONTROL' : 'ON-BASE'}</Text>
            <Text style={styles.statValue}>{card.command}</Text>
          </View>
          <View style={styles.pointsContainer}>
             <Text style={styles.pointsValue}>{card.points} PTS</Text>
          </View>
        </View>
        <Text style={styles.flipHint}>Swipe L/R to Flip • Swipe Up to Close</Text>
      </View>
    );
  };

  const CardBack = () => (
    <View style={[styles.cardFace, styles.backFace]}>
      <View style={styles.backHeader}>
        <Text style={styles.backTitle}>{card.name}</Text>
        <View style={styles.secondaryStatsRow}>
           <Text style={styles.secStat}>{card.team.toUpperCase()} • {card.year}</Text>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartHeader}>D20 CHART</Text>
        <View style={styles.scrollArea}>
          {card.chart.map((entry, index) => (
             <View key={index} style={[styles.chartRow, index % 2 === 0 && styles.rowAlt]}>
               <Text style={styles.rangeText}>
                 {entry.range[0] === entry.range[1] ? entry.range[0] : `${entry.range[0]}-${entry.range[1]}`}
               </Text>
               <Text style={[styles.resultText, getResultStyle(entry.result)]}>{entry.result}</Text>
             </View>
          ))}
        </View>
      </View>
      <View style={styles.backFooter}>
        <View style={styles.backFooterStat}>
          <Text style={styles.backFooterLabel}>{isPitcher ? 'CONTROL' : 'ON-BASE'}</Text>
          <Text style={styles.backFooterValue}>{card.command}</Text>
        </View>
        <View style={styles.backFooterStat}>
          <Text style={styles.backFooterLabel}>POINTS</Text>
          <Text style={styles.backFooterValue}>{card.points}</Text>
        </View>
      </View>
      <Text style={styles.flipHint}>Swipe L/R to Flip • Swipe Up to Close</Text>
    </View>
  );

  return (
    <Modal transparent visible onRequestClose={handleClose} animationType="fade">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          {/* Backdrop Tap to Close */}
          <Pressable 
            style={styles.backdropTouch} 
            onPress={handleClose} 
          />
          
          {/* Close Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.7 }
            ]} 
            onPress={handleClose}
            hitSlop={20}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          <GestureDetector gesture={composedGestures}>
            <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
              {/* Front Face */}
              <Animated.View style={[styles.animatedFace, frontAnimatedStyle]}>
                <CardFront />
              </Animated.View>
              
              {/* Back Face */}
              <Animated.View style={[styles.animatedFace, styles.cardBackPos, backAnimatedStyle]}>
                <CardBack />
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const getResultStyle = (result: string) => {
  switch (result) {
    case 'HR': return styles.resHR;
    case '3B': 
    case '2B': return styles.resHit;
    case '1B': 
    case '1B+': return styles.resHit;
    case 'BB': return styles.resWalk;
    case 'SO': return styles.resOut;
    default: return styles.resOut;
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 50, 
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  animatedFace: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backfaceVisibility: 'hidden',
  },
  cardBackPos: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardFace: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderWidth: 4,
    borderColor: '#444',
  },
  frontFace: { backgroundColor: '#222' },
  backFace: { backgroundColor: '#e0e0e0', padding: 16 },
  
  // Content Styles
  foilHeader: {
    height: 60,
    backgroundColor: COLORS.primaryDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.textGold,
  },
  teamName: { color: '#FFF', fontWeight: '900', fontSize: 20, fontStyle: 'italic', letterSpacing: 2 },
  yearBadge: { color: COLORS.textGold, fontWeight: 'bold', fontSize: 16 },
  imageContainer: { flex: 1, position: 'relative', backgroundColor: '#000' },
  playerImage: { width: '100%', height: '100%', opacity: 0.8 },
  nameOverlay: {
    position: 'absolute', bottom: 20, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, paddingHorizontal: 16,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.textGold,
  },
  playerName: { color: '#FFF', fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', textShadowColor: 'black', textShadowRadius: 4 },
  playerPosition: { color: COLORS.textGold, fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  statBadgeContainer: {
    height: 80, backgroundColor: '#333', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 24, borderTopWidth: 2, borderTopColor: '#555',
  },
  statBadge: { alignItems: 'center' },
  statLabel: { color: COLORS.textSecondary, fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  statValue: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  pointsContainer: { backgroundColor: COLORS.cardFrame, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  pointsValue: { color: COLORS.textGold, fontWeight: 'bold', fontSize: 14 },

  backHeader: { borderBottomWidth: 2, borderBottomColor: '#333', paddingBottom: 12, marginBottom: 12 },
  backTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', textTransform: 'uppercase' },
  secondaryStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  secStat: { fontSize: 14, fontWeight: '600', color: '#444' },
  chartContainer: { flex: 1, backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#CCC' },
  chartHeader: { backgroundColor: '#333', color: '#FFF', textAlign: 'center', padding: 8, fontWeight: 'bold', letterSpacing: 1 },
  scrollArea: { flex: 1 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  rowAlt: { backgroundColor: '#F5F5F5' },
  rangeText: { fontSize: 16, fontWeight: 'bold', color: '#333', fontVariant: ['tabular-nums'] },
  resultText: { fontSize: 16, fontWeight: 'bold' },
  resHR: { color: '#B8860B' },
  resHit: { color: '#228B22' },
  resWalk: { color: '#1E90FF' },
  resOut: { color: '#DC143C' },
  flipHint: { textAlign: 'center', color: '#999', fontSize: 12, fontStyle: 'italic', marginTop: 8, position: 'absolute', bottom: 4, width: '100%' },

  // Front full card image
  fullCardImage: { width: '100%', height: '100%' },

  // Back footer
  backFooter: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 2, borderTopColor: '#333', marginTop: 12 },
  backFooterStat: { alignItems: 'center' },
  backFooterLabel: { fontSize: 11, fontWeight: '600', color: '#666', letterSpacing: 0.5, marginBottom: 4 },
  backFooterValue: { fontSize: 24, fontWeight: 'bold', color: '#111' },
});
