import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseRunners } from '../models/Game';
import { COLORS, SHADOWS } from '../constants/theme';

interface BaseballDiamondProps {
  bases: BaseRunners;
}

// Precise Geometry Constants
const FIELD_SIZE = 220;
const INFIELD_SIDE = 124; // Side length of the square
const CORNER_DIST = (INFIELD_SIDE / 2) * Math.sqrt(2); // ~87.7px from center
const BASE_SIZE = 14;
const CENTER = FIELD_SIZE / 2;

export const BaseballDiamond: React.FC<BaseballDiamondProps> = ({ bases }) => {
  const getRunnerName = (runner: { name: string } | null) => {
    if (!runner) return '';
    const parts = runner.name.split(' ');
    return parts[parts.length - 1].toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.fieldArea}>
        
        {/* Infield Dirt */}
        <View style={styles.infieldDirt}>
           <View style={styles.infieldGrass} />
        </View>

        {/* Pitcher's Mound */}
        <View style={styles.mound}>
           <View style={styles.rubber} />
        </View>

        {/* Bases */}
        {/* 2nd Base (Top) */}
        <View style={[styles.baseContainer, styles.posSecond]}>
          <View style={[styles.base, bases.second && styles.baseOccupied]} />
          {bases.second && (
            <View style={styles.runnerTag}>
              <Text style={styles.runnerName}>{getRunnerName(bases.second)}</Text>
            </View>
          )}
        </View>

        {/* 3rd Base (Left) */}
        <View style={[styles.baseContainer, styles.posThird]}>
          <View style={[styles.base, bases.third && styles.baseOccupied]} />
          {bases.third && (
            <View style={[styles.runnerTag, styles.tagLeft]}>
              <Text style={styles.runnerName}>{getRunnerName(bases.third)}</Text>
            </View>
          )}
        </View>

        {/* 1st Base (Right) */}
        <View style={[styles.baseContainer, styles.posFirst]}>
          <View style={[styles.base, bases.first && styles.baseOccupied]} />
          {bases.first && (
            <View style={[styles.runnerTag, styles.tagRight]}>
              <Text style={styles.runnerName}>{getRunnerName(bases.first)}</Text>
            </View>
          )}
        </View>

        {/* Home Plate (Bottom) */}
        <View style={[styles.baseContainer, styles.posHome]}>
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
    marginVertical: 10,
    height: 240,
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
    width: INFIELD_SIDE - 24,
    height: INFIELD_SIDE - 24,
    backgroundColor: COLORS.fieldGreen,
    borderRadius: 2,
  },
  mound: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.dirt,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  rubber: {
    width: 6,
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
    width: BASE_SIZE * 0.707, // Side of square to match BASE_SIZE width when rotated 45deg
    height: BASE_SIZE * 0.707,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
    marginTop: -BASE_SIZE * 0.35, // Pull up to overlap
  },
  // Precise Positioning
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
    top: -20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    minWidth: 35,
    alignItems: 'center',
  },
  tagLeft: {
    left: -35,
    top: 0,
  },
  tagRight: {
    right: -35,
    top: 0,
  },
  runnerName: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
