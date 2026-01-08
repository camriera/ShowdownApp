import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { BaseRunners } from '../models/Game';

interface SituationBannerProps {
  inning: number;
  isTopOfInning: boolean;
  outs: number;
  bases: BaseRunners;
  battingTeamName: string;
  homeScore: number;
  awayScore: number;
}

export const SituationBanner: React.FC<SituationBannerProps> = ({
  inning,
  isTopOfInning,
  outs,
  bases,
  battingTeamName,
  homeScore,
  awayScore,
}) => {
  const inningText = `${isTopOfInning ? 'TOP' : 'BOT'} ${inning}`;
  const outsText = `${outs} ${outs === 1 ? 'OUT' : 'OUTS'}`;
  const runnersText = getRunnersText(bases);
  const scoreText = getScoreText(homeScore, awayScore);

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <View style={styles.inningBadge}>
          <Text style={styles.inningText}>{inningText}</Text>
        </View>
        
        <Text style={styles.battingTeam}>{battingTeamName} AT BAT</Text>
        
        <View style={styles.outsBadge}>
          <Text style={styles.outsText}>{outsText}</Text>
        </View>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailText}>{runnersText}</Text>
        <Text style={styles.scoreDetail}>{scoreText}</Text>
      </View>
    </View>
  );
};

function getRunnersText(bases: BaseRunners): string {
  const occupied: string[] = [];
  if (bases.first) occupied.push('1st');
  if (bases.second) occupied.push('2nd');
  if (bases.third) occupied.push('3rd');
  
  if (occupied.length === 0) return 'Bases Empty';
  if (occupied.length === 3) return 'Bases Loaded';
  return `Runner${occupied.length > 1 ? 's' : ''} on ${occupied.join(' & ')}`;
}

function getScoreText(homeScore: number, awayScore: number): string {
  if (homeScore === awayScore) return `Tied ${homeScore}-${awayScore}`;
  if (homeScore > awayScore) return `Home leads ${homeScore}-${awayScore}`;
  return `Away leads ${awayScore}-${homeScore}`;
}

interface PitcherFatigueIndicatorProps {
  pitcherName: string;
  baseControl: number;
  currentControl: number;
  inningsPitched: number;
  ipRating: number;
}

export const PitcherFatigueIndicator: React.FC<PitcherFatigueIndicatorProps> = ({
  pitcherName,
  baseControl,
  currentControl,
  inningsPitched,
  ipRating,
}) => {
  const isFatigued = currentControl < baseControl;
  const fatigueAmount = baseControl - currentControl;
  const isOverworked = inningsPitched > ipRating;

  return (
    <View style={[styles.fatigueContainer, isFatigued && styles.fatiguedContainer]}>
      <View style={styles.fatigueHeader}>
        <Text style={styles.pitcherName}>{pitcherName}</Text>
        {isOverworked && (
          <View style={styles.fatigueWarning}>
            <Text style={styles.fatigueWarningText}>TIRED</Text>
          </View>
        )}
      </View>
      
      <View style={styles.fatigueStats}>
        <Text style={styles.fatigueLabel}>Control:</Text>
        {isFatigued ? (
          <View style={styles.controlChange}>
            <Text style={styles.originalControl}>{baseControl}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.reducedControl}>{currentControl}</Text>
            <Text style={styles.penalty}>(-{fatigueAmount})</Text>
          </View>
        ) : (
          <Text style={styles.controlValue}>{currentControl}</Text>
        )}
      </View>
      
      <Text style={styles.ipText}>
        IP: {inningsPitched.toFixed(1)} / {ipRating}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.fieldGreen,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inningBadge: {
    backgroundColor: COLORS.textGold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  inningText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 1,
  },
  battingTeam: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  outsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  outsText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textPrimary,
    opacity: 0.8,
  },
  scoreDetail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textGold,
    fontWeight: '600',
  },
  fatigueContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  fatiguedContainer: {
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  fatigueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  pitcherName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  fatigueWarning: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  fatigueWarningText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  fatigueStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fatigueLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  controlChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalControl: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  arrow: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.xs,
  },
  reducedControl: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  penalty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  controlValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  ipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
