import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PlayerCard } from '../models/Card';
import { ShowdownCard } from './ShowdownCard';
import { DiceRoller } from './DiceRoller';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { moderateScale, verticalScale } from '../constants/layout';

interface MatchupPanelProps {
  pitcher: PlayerCard;
  batter: PlayerCard;
  phase: 'PITCH' | 'SWING';
  advantage: 'PITCHER' | 'BATTER' | null;
  onDiceRoll: (value: number) => void;
  disabled?: boolean;
  pitchingTeamName: string;
  battingTeamName: string;
  fatiguedControl?: number;
  onCardPress?: (card: PlayerCard) => void;
}

export const MatchupPanel: React.FC<MatchupPanelProps> = ({
  pitcher,
  batter,
  phase,
  advantage,
  onDiceRoll,
  disabled = false,
  pitchingTeamName,
  battingTeamName,
  fatiguedControl,
  onCardPress,
}) => {
  const showAdvantage = phase === 'SWING';
  
  const phaseTitle = phase === 'PITCH' ? 'PITCH PHASE' : 'SWING PHASE';
  const phaseHint = phase === 'PITCH'
    ? `${pitchingTeamName} - Roll for Advantage`
    : `${advantage === 'PITCHER' ? pitchingTeamName : battingTeamName} - Roll on Chart`;

  return (
    <View style={styles.container}>
      <View style={styles.matchupRow}>
        <TouchableOpacity onPress={() => onCardPress?.(pitcher)}>
          <ShowdownCard 
            card={pitcher}
            hasAdvantage={showAdvantage && advantage === 'PITCHER'}
            fatiguedControl={fatiguedControl}
            compact
          />
        </TouchableOpacity>
        
        <View style={styles.diceContainer}>
          <DiceRoller 
            onRoll={onDiceRoll} 
            disabled={disabled}
            compact
          />
        </View>
        
        <TouchableOpacity onPress={() => onCardPress?.(batter)}>
          <ShowdownCard 
            card={batter}
            hasAdvantage={showAdvantage && advantage === 'BATTER'}
            compact
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.phaseSection}>
        <Text style={styles.phaseTitle}>{phaseTitle}</Text>
        <Text style={styles.phaseHint}>{phaseHint}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(8),
    borderTopWidth: 1,
    borderColor: '#444',
  },
  matchupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  diceContainer: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(4),
  },
  phaseSection: {
    alignItems: 'center',
  },
  phaseTitle: {
    fontSize: moderateScale(13),
    fontWeight: 'bold',
    color: COLORS.textGold,
    marginBottom: 2,
    letterSpacing: 1,
  },
  phaseHint: {
    fontSize: moderateScale(9),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
