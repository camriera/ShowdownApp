import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  withRepeat, 
  withSpring,
  Easing,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../constants/theme';
import { LAYOUT } from '../constants/layout';

interface DiceRollerProps {
  onRoll: (value: number) => void;
  disabled?: boolean;
  compact?: boolean;
}

const D20_SIZE = LAYOUT.diceSize;
const D20_COLOR = COLORS.primary;

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll, disabled = false, compact = false }) => {
  const [displayValue, setDisplayValue] = useState<string>('d20');
  const [isRolling, setIsRolling] = useState(false);
  
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const lastShakeTime = useRef(0);
  const SHAKE_THRESHOLD = 2.5;
  const SHAKE_COOLDOWN = 1000;

  useEffect(() => {
    let subscription: any;
    const setupAccelerometer = async () => {
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();
        if (
          acceleration > SHAKE_THRESHOLD &&
          now - lastShakeTime.current > SHAKE_COOLDOWN &&
          !disabled &&
          !isRolling
        ) {
          lastShakeTime.current = now;
          handleRoll();
        }
      });
      Accelerometer.setUpdateInterval(100);
    };
    setupAccelerometer();
    return () => {
      subscription && subscription.remove();
    };
  }, [disabled, isRolling]);

  const rollLogic = () => {
    // Number shuffling logic
    let ticks = 0;
    const maxTicks = 12; // How many numbers to flash
    
    const interval = setInterval(() => {
      ticks++;
      // Random intermediate number
      const randomVal = Math.floor(Math.random() * 20) + 1;
      setDisplayValue(randomVal.toString());

      if (ticks >= maxTicks) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 20) + 1;
        setDisplayValue(finalValue.toString());
        onRoll(finalValue);
        setIsRolling(false);
      }
    }, 60); // Speed of number shuffle
  };

  const handleRoll = () => {
    if (disabled || isRolling) return;
    setIsRolling(true);

    // Trigger logical roll
    rollLogic();

    // Reset rotation to 0 for a fresh spin
    rotation.value = 0;
    
    // Animate
    rotation.value = withSequence(
      withTiming(360 * 2, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1.2, { duration: 200 }),
      withSpring(1)
    );
    
    translateY.value = withSequence(
      withTiming(-20, { duration: 200, easing: Easing.out(Easing.quad) }), // Jump up
      withSpring(0) // Land
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
        { translateY: translateY.value }
      ],
    };
  });

  return (
    <View style={compact ? styles.compactContainer : styles.container}>
      <TouchableOpacity
        onPress={handleRoll}
        disabled={disabled || isRolling}
        activeOpacity={0.9}
        style={[styles.touchable, disabled && styles.disabled]}
      >
        <Animated.View style={[styles.diceContainer, animatedStyle]}>
          <View style={[styles.hexPart, styles.vertical]} />
          <View style={[styles.hexPart, styles.rotated60]} />
          <View style={[styles.hexPart, styles.rotatedNeg60]} />
          
          <View style={styles.innerTriangle} />
          
          <Text style={styles.diceText}>{displayValue}</Text>
        </Animated.View>
      </TouchableOpacity>
      
      {!compact && (
        <Text style={styles.hint}>
          {isRolling ? 'Rolling...' : 'Tap or shake to roll'}
        </Text>
      )}
    </View>
  );
};

// Hexagon math
// Height of flat-topped hexagon = sqrt(3) * side
// We want overall size ~D20_SIZE.
// Let's approximate.
const HEX_WIDTH = D20_SIZE * 0.58; // Width of the rectangles
const HEX_HEIGHT = D20_SIZE; 

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 5,
  },
  compactContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    zIndex: 5,
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceContainer: {
    width: D20_SIZE,
    height: D20_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...SHADOWS.medium,
  },
  hexPart: {
    position: 'absolute',
    width: HEX_WIDTH,
    height: HEX_HEIGHT,
    backgroundColor: D20_COLOR,
    borderRadius: 8, // Softens the corners
  },
  vertical: {
    transform: [{ rotate: '0deg' }],
  },
  rotated60: {
    transform: [{ rotate: '60deg' }],
  },
  rotatedNeg60: {
    transform: [{ rotate: '-60deg' }],
  },
  innerTriangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: D20_SIZE * 0.35,
    borderRightWidth: D20_SIZE * 0.35,
    borderBottomWidth: D20_SIZE * 0.6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.15)', // Subtle highlight for the face
    transform: [{ rotate: '180deg' }], // Point down
    top: D20_SIZE * 0.2,
  },
  diceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    zIndex: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontVariant: ['tabular-nums'],
  },
  disabled: {
    opacity: 0.5,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});