import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay, 
  withTiming, 
  useSharedValue, 
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../constants/theme';

type ToastType = 
  // New types for game outcomes
  | 'advantage'           // Yellow - both pitcher and batter advantage
  | 'batting-safe'        // Green - batting perspective, got on base (hit, walk)
  | 'batting-out'         // Red - batting perspective, made an out (SO, GB, FB)
  | 'pitching-safe'       // Red - pitching perspective, batter got on base
  | 'pitching-out'        // Green - pitching perspective, batter made an out
  | 'score'               // Gold - runs scored
  // Legacy types (backward compatibility)
  | 'positive'
  | 'negative'
  | 'neutral';

interface GameEventToastProps {
  message: string;
  isVisible: boolean;
  onAnimationComplete?: () => void;
  type?: ToastType;
}

export const GameEventToast: React.FC<GameEventToastProps> = ({
  message,
  isVisible,
  onAnimationComplete,
  type = 'neutral',
}) => {
  // Start slightly lower for a "rise" effect or just center pop
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (isVisible) {
      // RESET
      translateY.value = 20;
      opacity.value = 0;
      scale.value = 0.8;

      // ENTER - Tight and Fast
      // Parallel-ish execution via state updates
      translateY.value = withSpring(0, { 
        damping: 15, 
        stiffness: 400, 
        mass: 0.5 
      });

      scale.value = withSpring(1, { 
        damping: 15, 
        stiffness: 400, 
        mass: 0.5 
      });

      opacity.value = withSequence(
        withTiming(1, { duration: 100 }), // Fast fade in
        withDelay(1000, withTiming(0, { duration: 150 }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        }))
      );
    }
  }, [isVisible, message]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const getBackgroundColor = () => {
    switch (type) {
      case 'advantage': return COLORS.advantage + 'b0';
      case 'batting-safe': return COLORS.success + 'b0';
      case 'batting-out': return COLORS.error + 'b0';
      case 'pitching-safe': return COLORS.error + 'b0';
      case 'pitching-out': return COLORS.success + 'b0';
      case 'score': return COLORS.success + 'b0';
      case 'positive': return COLORS.success + 'b0';
      case 'negative': return COLORS.error + 'b0';
      default: return '#333333b0';
    }
  };

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View 
        style={[
          styles.container, 
          animatedStyle, 
          { backgroundColor: getBackgroundColor() }
        ]}
      >
        <Text style={[styles.text, { color: COLORS.textPrimary }]}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center', // Vertically centered
    zIndex: 999,
    elevation: 100,
  },
  container: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.large,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 240,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  text: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
