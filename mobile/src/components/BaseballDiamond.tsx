import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BaseRunners, HitterCard } from '../models/Game';
import { ShowdownCard } from './ShowdownCard';
import { COLORS, SHADOWS, SPACING } from '../constants/theme';

interface BaseballDiamondProps {
  bases: BaseRunners;
  onBaseClick?: (card: HitterCard) => void;
  scale?: number;
}

// Precise Geometry Constants
const FIELD_SIZE = 260; 
const INFIELD_SIDE = 146;
const CORNER_DIST = (INFIELD_SIDE / 2) * Math.sqrt(2);
const BASE_SIZE = 16;
const CENTER = FIELD_SIZE / 2;

// Card Slot Constants (20% larger)
const SLOT_WIDTH = 36;
const SLOT_HEIGHT = 50;

export const BaseballDiamond: React.FC<BaseballDiamondProps> = ({ bases, onBaseClick, scale = 1 }) => {
  const getRunnerName = (runner: { name: string } | null) => {
    if (!runner) return '';
    const parts = runner.name.split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '';

    const firstInitial = parts[0][0].toUpperCase();

    // Determine last name, skipping suffixes like Jr, Sr, III, etc.
    let lastNameIndex = parts.length - 1;
    const suffixRegex = /^(Jr|Sr|III?|IV|II|V|VI?)\.?$/i;
    if (suffixRegex.test(parts[lastNameIndex])) {
      lastNameIndex = Math.max(0, lastNameIndex - 1);
    }

    const lastName = parts[lastNameIndex].toUpperCase();
    const nameDisplay = `${firstInitial} ${lastName}`;

    // Truncate if too long to fit in the space
    return nameDisplay.length > 10 ? nameDisplay.substring(0, 10) : nameDisplay;
  };

  const handleBasePress = (runner: HitterCard | null) => {
    if (runner && onBaseClick) {
      onBaseClick(runner);
    }
  };

  return (
    <View style={[styles.container, { transform: [{ scale }], height: 360 * scale }]}>
      <View style={styles.fieldArea}>
        
        {/* Card Slots - 2nd Base */}
        <View style={[styles.cardSlotContainer, styles.slotSecond]}>
          <TouchableOpacity
            style={styles.cardSlot}
            onPress={() => handleBasePress(bases.second)}
            disabled={!bases.second}
          />
          {bases.second && (
            <View style={styles.cardOverlay} pointerEvents="none">
              <ShowdownCard card={bases.second} imageOnly={true} />
            </View>
          )}
        </View>

        {/* Card Slots - 3rd Base */}
        <View style={[styles.cardSlotContainer, styles.slotThird]}>
          <TouchableOpacity
            style={styles.cardSlot}
            onPress={() => handleBasePress(bases.third)}
            disabled={!bases.third}
          />
          {bases.third && (
            <View style={styles.cardOverlay} pointerEvents="none">
              <ShowdownCard card={bases.third} imageOnly={true} />
            </View>
          )}
        </View>

        {/* Card Slots - 1st Base */}
        <View style={[styles.cardSlotContainer, styles.slotFirst]}>
          <TouchableOpacity
            style={styles.cardSlot}
            onPress={() => handleBasePress(bases.first)}
            disabled={!bases.first}
          />
          {bases.first && (
            <View style={styles.cardOverlay} pointerEvents="none">
              <ShowdownCard card={bases.first} imageOnly={true} />
            </View>
          )}
        </View>

        {/* Infield Dirt */}
        <View style={styles.infieldDirt} pointerEvents="none">
           <View style={styles.infieldGrass} />
        </View>

        {/* Pitcher's Mound */}
        <View style={styles.mound} pointerEvents="none">
           <View style={styles.rubber} />
        </View>

        {/* Bases */}
        
        {/* 2nd Base (Top) */}
        <TouchableOpacity 
          style={[styles.baseContainer, styles.posSecond]}
          onPress={() => handleBasePress(bases.second)}
          disabled={!bases.second}
        >
          <View style={[styles.base, bases.second && styles.baseOccupied]} />
          {bases.second && (
            <View style={styles.runnerTag}>
              <Text style={styles.runnerName}>{getRunnerName(bases.second)}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 3rd Base (Left) */}
        <TouchableOpacity 
          style={[styles.baseContainer, styles.posThird]}
          onPress={() => handleBasePress(bases.third)}
          disabled={!bases.third}
        >
          <View style={[styles.base, bases.third && styles.baseOccupied]} />
          {bases.third && (
            <View style={[styles.runnerTag, styles.tagLeft]}>
              <Text style={styles.runnerName}>{getRunnerName(bases.third)}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 1st Base (Right) */}
        <TouchableOpacity 
          style={[styles.baseContainer, styles.posFirst]}
          onPress={() => handleBasePress(bases.first)}
          disabled={!bases.first}
        >
          <View style={[styles.base, bases.first && styles.baseOccupied]} />
          {bases.first && (
            <View style={[styles.runnerTag, styles.tagRight]}>
              <Text style={styles.runnerName}>{getRunnerName(bases.first)}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Home Plate (Bottom) */}
        <View style={[styles.baseContainer, styles.posHome]} pointerEvents="none">
          <View style={styles.homePlateContainer}>
            <View style={styles.homePlateTop} />
            <View style={styles.homePlateBottom} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    height: 360,
    zIndex: 1,
  },
  fieldArea: {
    width: FIELD_SIZE,
    height: FIELD_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infieldDirt: {
    position: 'absolute',
    width: INFIELD_SIDE,
    height: INFIELD_SIDE,
    backgroundColor: COLORS.dirt,
    transform: [{ rotate: '45deg' }],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
    zIndex: 1,
  },
  infieldGrass: {
    width: INFIELD_SIDE - 28,
    height: INFIELD_SIDE - 28,
    backgroundColor: COLORS.fieldGreen,
    borderRadius: 2,
  },
  mound: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.dirt,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  rubber: {
    width: 8,
    height: 2,
    backgroundColor: 'white',
    opacity: 0.8,
  },
  baseContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  base: {
    width: BASE_SIZE,
    height: BASE_SIZE,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
  },
  baseOccupied: {
    backgroundColor: COLORS.textGold,
    borderColor: '#FFF',
    borderWidth: 1.5,
  },
  homePlateContainer: {
    width: BASE_SIZE,
    height: BASE_SIZE,
    alignItems: 'center',
  },
  homePlateTop: {
    width: BASE_SIZE,
    height: BASE_SIZE * 0.6,
    backgroundColor: 'white',
  },
  homePlateBottom: {
    width: BASE_SIZE * 0.707, 
    height: BASE_SIZE * 0.707,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
    marginTop: -BASE_SIZE * 0.35, 
  },
  
  cardSlotContainer: {
    position: 'absolute',
    width: SLOT_WIDTH,
    height: SLOT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSlot: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderStyle: 'dashed',
    zIndex: 5,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
    transform: [{ scale: SLOT_WIDTH / 130 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSecond: {
    top: CENTER - CORNER_DIST - BASE_SIZE - SLOT_HEIGHT + 10,
    left: CENTER - (SLOT_WIDTH / 2),
  },
  slotFirst: {
    top: CENTER - (SLOT_HEIGHT / 2),
    right: CENTER - CORNER_DIST - BASE_SIZE - SLOT_WIDTH + 10,
  },
  slotThird: {
    top: CENTER - (SLOT_HEIGHT / 2),
    left: CENTER - CORNER_DIST - BASE_SIZE - SLOT_WIDTH + 10,
  },

  // Base Positioning
  posSecond: {
    top: CENTER - CORNER_DIST - (BASE_SIZE / 2),
    left: CENTER - (BASE_SIZE / 2),
  },
  posFirst: {
    right: CENTER - CORNER_DIST - (BASE_SIZE / 2),
    top: CENTER - (BASE_SIZE / 2),
  },
  posThird: {
    left: CENTER - CORNER_DIST - (BASE_SIZE / 2),
    top: CENTER - (BASE_SIZE / 2),
  },
  posHome: {
    bottom: CENTER - CORNER_DIST - (BASE_SIZE / 2),
    left: CENTER - (BASE_SIZE / 2),
  },
  
  runnerTag: {
    position: 'absolute',
    top: -22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    minWidth: 38,
    alignItems: 'center',
  },
  tagLeft: {
    left: -38,
    top: 0,
  },
  tagRight: {
    right: -38,
    top: 0,
  },
  runnerName: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});