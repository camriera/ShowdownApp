import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface GameOverOverlayProps {
  winner: 'home' | 'away';
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  winner,
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  onPlayAgain,
  onExit,
}) => {
  const winnerName = winner === 'home' ? homeTeamName : awayTeamName;
  const winnerColor = winner === 'home' ? COLORS.homeTeam : COLORS.awayTeam;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.gameOverText}>GAME OVER</Text>
        
        <View style={[styles.winnerBadge, { backgroundColor: winnerColor }]}>
          <Text style={styles.winnerLabel}>WINNER</Text>
          <Text style={styles.winnerName}>{winnerName.toUpperCase()}</Text>
        </View>
        
        <View style={styles.scoreSection}>
          <View style={styles.teamScore}>
            <Text style={[styles.teamName, winner === 'away' && styles.winnerTeamName]}>
              {awayTeamName}
            </Text>
            <Text style={[styles.score, winner === 'away' && styles.winnerScore]}>
              {awayScore}
            </Text>
          </View>
          
          <Text style={styles.scoreDivider}>-</Text>
          
          <View style={styles.teamScore}>
            <Text style={[styles.teamName, winner === 'home' && styles.winnerTeamName]}>
              {homeTeamName}
            </Text>
            <Text style={[styles.score, winner === 'home' && styles.winnerScore]}>
              {homeScore}
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
            <Text style={styles.playAgainText}>PLAY AGAIN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitText}>EXIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minWidth: 300,
    ...SHADOWS.large,
  },
  gameOverText: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 4,
    marginBottom: SPACING.lg,
  },
  winnerBadge: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  winnerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    letterSpacing: 2,
    opacity: 0.8,
  },
  winnerName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  teamScore: {
    alignItems: 'center',
    minWidth: 100,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  winnerTeamName: {
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  score: {
    fontSize: FONT_SIZES.display,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  winnerScore: {
    color: COLORS.textGold,
  },
  scoreDivider: {
    fontSize: FONT_SIZES.display,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.md,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  playAgainButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  playAgainText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  exitButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  exitText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
});
