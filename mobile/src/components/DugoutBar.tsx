import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PlayerCard } from '../models/Card';
import { ShowdownCard } from './ShowdownCard';
import { COLORS, SPACING } from '../constants/theme';
import { LAYOUT, moderateScale, verticalScale } from '../constants/layout';

interface DugoutBarProps {
  mode: 'batting' | 'pitching';
  lineup?: PlayerCard[];
  currentBatterIndex?: number;
  onCardPress?: (card: PlayerCard) => void;
}

export const DugoutBar: React.FC<DugoutBarProps> = ({
  mode,
  lineup = [],
  currentBatterIndex = 0,
  onCardPress,
}) => {
  if (mode === 'batting' && lineup.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.sectionLabel}>LINEUP</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {lineup.map((card, index) => {
              const isCurrent = index === currentBatterIndex % lineup.length;
              return (
                <TouchableOpacity
                  key={`${card.id}-${index}`}
                  onPress={() => onCardPress?.(card)}
                  style={[styles.miniCardContainer, isCurrent && styles.currentBatter]}
                >
                  <ShowdownCard card={card} mini />
                  {isCurrent && <View style={styles.currentIndicator} />}
                  <Text style={styles.positionNumber}>{index + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        
        <View style={styles.rightSection}>
          <Text style={styles.sectionLabel}>STRATEGY</Text>
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderText}>Coming Soon</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.fullWidth}>
        <Text style={styles.sectionLabel}>PITCHING MODE</Text>
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderText}>Bullpen management coming soon</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#444',
    height: LAYOUT.dugoutBarHeight,
    paddingVertical: moderateScale(4),
  },
  leftSection: {
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: '#444',
    paddingRight: moderateScale(4),
  },
  rightSection: {
    flex: 1,
    paddingLeft: moderateScale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: moderateScale(8),
    fontWeight: 'bold',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: moderateScale(2),
    marginLeft: moderateScale(4),
  },
  scrollContent: {
    paddingHorizontal: moderateScale(4),
    alignItems: 'center',
  },
  miniCardContainer: {
    marginRight: moderateScale(6),
    position: 'relative',
    alignItems: 'center',
  },
  currentBatter: {
    borderWidth: 2,
    borderColor: COLORS.textGold,
    borderRadius: 4,
    padding: 2,
  },
  currentIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  positionNumber: {
    fontSize: moderateScale(8),
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: moderateScale(9),
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
