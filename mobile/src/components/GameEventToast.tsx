import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay, 
  withTiming, 
  useSharedValue, 
  runOnJS 
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../constants/theme';

interface GameEventToastProps {
  message: string;
  isVisible: boolean;
  onAnimationComplete?: () => void;
  type?: 'positive' | 'negative' | 'neutral' | 'score';
}

export const GameEventToast: React.FC<GameEventToastProps> = ({
  message,
  isVisible,
  onAnimationComplete,
  type = 'neutral',
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSequence(
        withSpring(20, { damping: 12 }), // Drop down
        withDelay(2000, withTiming(-100, { duration: 300 }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        }))
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(2000, withTiming(0, { duration: 300 }))
      );
    }
  }, [isVisible, message]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getBackgroundColor = () => {
    switch (type) {
      case 'positive': return COLORS.success;
      case 'negative': return COLORS.error;
      case 'score': return COLORS.textGold;
      default: return COLORS.surface;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'score': return '#000';
      default: return '#FFF';
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
        <Text style={[styles.text, { color: getTextColor() }]}>
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
    justifyContent: 'flex-start',
    zIndex: 999, // Ensure it sits on top of everything
    top: 100, // Position it below the turn banner
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.large,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 200,
    alignItems: 'center',
  },
  text: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
