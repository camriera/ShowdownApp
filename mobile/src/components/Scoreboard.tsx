import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

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
      {/* Away Team Section */}
      <View style={[styles.teamContainer, awayIsBatting && styles.activeTeamContainer]}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName} numberOfLines={1}>{awayTeamName}</Text>
          {awayIsBatting && <Text style={styles.battingIndicator}>BAT</Text>}
        </View>
        <Text style={[styles.score, awayIsBatting && styles.activeScore]}>
          {awayScore}
        </Text>
      </View>

      {/* Center Info: Inning & Outs */}
      <View style={styles.centerInfo}>
        <View style={styles.inningBox}>
          <Text style={styles.inningArrow}>{isTopOfInning ? '▲' : '▼'}</Text>
          <Text style={styles.inningNumber}>{inning}</Text>
        </View>
        
        <View style={styles.outsContainer}>
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

      {/* Home Team Section */}
      <View style={[styles.teamContainer, homeIsBatting && styles.activeTeamContainer]}>
        <View style={[styles.teamInfo, { alignItems: 'flex-end' }]}>
          <Text style={styles.teamName} numberOfLines={1}>{homeTeamName}</Text>
          {homeIsBatting && <Text style={styles.battingIndicator}>BAT</Text>}
        </View>
        <Text style={[styles.score, homeIsBatting && styles.activeScore]}>
          {homeScore}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.fieldGreen,
    height: 80, // Constrained height
    ...SHADOWS.medium,
  },
  teamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    height: '100%',
  },
  activeTeamContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.textGold,
  },
  teamInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  battingIndicator: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: 2,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    fontVariant: ['tabular-nums'],
  },
  activeScore: {
    color: COLORS.textGold,
  },
  centerInfo: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: '80%',
  },
  inningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  inningArrow: {
    fontSize: 14,
    color: COLORS.textGold,
    marginRight: 4,
  },
  inningNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  outsContainer: {
    alignItems: 'center',
  },
  outsLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 1,
  },
  outsDots: {
    flexDirection: 'row',
    gap: 4,
  },
  outDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#444',
  },
  outDotFilled: {
    backgroundColor: COLORS.error,
  },
});