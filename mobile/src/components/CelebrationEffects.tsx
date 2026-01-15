import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Fireworks, EmojiPopper } from 'react-native-fiesta';

interface FireworksEffectProps {
  show: boolean;
}

interface EmojiPopperEffectProps {
  emojis: string[];
}

export const FireworksEffect: React.FC<FireworksEffectProps> = ({ show }) => {
  useEffect(() => {
    if (show && Platform.OS === 'web') {
      const confetti = require('canvas-confetti').default;
      
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [show]);

  if (Platform.OS === 'web') {
    return null;
  }

  if (!show) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Fireworks autoHide={false} />
    </View>
  );
};

export const EmojiPopperEffect: React.FC<EmojiPopperEffectProps> = ({ emojis }) => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const confetti = require('canvas-confetti').default;

      const scalar = 2;
      const emoji = confetti.shapeFromText({ text: emojis.join(''), scalar });

      const defaults = {
        spread: 360,
        ticks: 60,
        gravity: 0,
        decay: 0.96,
        startVelocity: 20,
        shapes: [emoji],
        scalar
      };

      function shoot() {
        confetti({
          ...defaults,
          particleCount: 30
        });

        confetti({
          ...defaults,
          particleCount: 5,
          flat: true
        });

        confetti({
          ...defaults,
          particleCount: 15,
          scalar: scalar / 2,
          shapes: ['circle']
        });
      }

      setTimeout(shoot, 0);
      setTimeout(shoot, 100);
      setTimeout(shoot, 200);
    }
  }, [emojis]);

  if (Platform.OS === 'web') {
    return null;
  }

  return <EmojiPopper emojis={emojis} />;
};
