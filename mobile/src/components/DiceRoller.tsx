import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Accelerometer } from 'expo-sensors';

interface DiceRollerProps {
  onRoll: (value: number) => void;
  disabled?: boolean;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll, disabled = false }) => {
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
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

  const rollD20 = (): number => {
    return Math.floor(Math.random() * 20) + 1;
  };

  const handleRoll = () => {
    if (disabled || isRolling) return;
    
    setIsRolling(true);
    
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotateAnim.setValue(0);
    });

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setCurrentValue(rollD20());
      rollCount++;
      
      if (rollCount >= 8) {
        clearInterval(rollInterval);
        const finalValue = rollD20();
        setCurrentValue(finalValue);
        setIsRolling(false);
        onRoll(finalValue);
      }
    }, 50);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleRoll}
        disabled={disabled || isRolling}
        style={[
          styles.diceContainer,
          disabled && styles.disabled,
        ]}
      >
        <Animated.View
          style={[
            styles.dice,
            {
              transform: [
                { rotate: spin },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Text style={styles.diceText}>
            {currentValue !== null ? currentValue : 'd20'}
          </Text>
        </Animated.View>
      </TouchableOpacity>
      
      <Text style={styles.hint}>
        {isRolling ? 'Rolling...' : 'Tap or shake to roll'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  diceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dice: {
    width: 100,
    height: 100,
    backgroundColor: '#DC143C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  diceText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
  hint: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
