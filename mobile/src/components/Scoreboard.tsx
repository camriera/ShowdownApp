import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface ScoreboardProps {
  inning: number;
  isTopOfInning: boolean;
  outs: number;
  homeScore: number;
  awayScore: number;
  homeTeamName: string;
  awayTeamName: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  inning,
  isTopOfInning,
  outs,
  homeScore,
  awayScore,
  homeTeamName,
  awayTeamName,
}) => {
  const awayIsBatting = isTopOfInning;
  const homeIsBatting = !isTopOfInning;

  return (
    <View style={styles.container}>
      <View style={styles.teamsRow}>
        <View style={[styles.teamColumn, awayIsBatting && styles.battingTeamColumn]}>
          {awayIsBatting && (
            <View style={styles.atBatBadge}>
              <Text style={styles.atBatText}>AT BAT</Text>
            </View>
          )}
          {!awayIsBatting && (
            <View style={styles.pitchingBadge}>
              <Text style={styles.pitchingText}>FIELD</Text>
            </View>
          )}
          <Text style={styles.teamName}>{awayTeamName}</Text>
          <Text style={[styles.score, awayIsBatting && styles.activeScore]}>
            {awayScore}
          </Text>
        </View>
        
        <View style={styles.inningColumn}>
          <Text style={styles.inningLabel}>INNING</Text>
          <Text style={styles.inningValue}>{inning}</Text>
          <Text style={styles.halfInning}>
            {isTopOfInning ? '▲ TOP' : '▼ BOT'}
          </Text>
        </View>
        
        <View style={[styles.teamColumn, homeIsBatting && styles.battingTeamColumn]}>
          {homeIsBatting && (
            <View style={styles.atBatBadge}>
              <Text style={styles.atBatText}>AT BAT</Text>
            </View>
          )}
          {!homeIsBatting && (
            <View style={styles.pitchingBadge}>
              <Text style={styles.pitchingText}>FIELD</Text>
            </View>
          )}
          <Text style={styles.teamName}>{homeTeamName}</Text>
          <Text style={[styles.score, homeIsBatting && styles.activeScore]}>
            {homeScore}
          </Text>
        </View>
      </View>
      
      <View style={styles.outsRow}>
        <Text style={styles.outsLabel}>OUTS</Text>
        <View style={styles.outsDots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.outDot,
                i < outs && styles.outDotFilled,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.fieldGreen,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    margin: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  battingTeamColumn: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: BORDER_RADIUS.sm,
  },
  inningColumn: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: SPACING.xs,
  },
  atBatBadge: {
    backgroundColor: COLORS.batting,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  atBatText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 1,
  },
  pitchingBadge: {
    backgroundColor: COLORS.pitching,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  pitchingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  score: {
    fontSize: FONT_SIZES.display,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  activeScore: {
    color: COLORS.textGold,
  },
  inningLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textPrimary,
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 2,
  },
  inningValue: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  halfInning: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textGold,
    fontWeight: '600',
  },
  outsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  outsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginRight: SPACING.sm,
    letterSpacing: 1,
  },
  outsDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  outDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
    backgroundColor: 'transparent',
  },
  outDotFilled: {
    backgroundColor: COLORS.error,
  },
});
