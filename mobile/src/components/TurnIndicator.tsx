import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface TurnIndicatorProps {
  currentTeam: 'home' | 'away';
  teamName: string;
  isBatting: boolean;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentTeam,
  teamName,
  isBatting,
}) => {
  const teamColor = currentTeam === 'home' ? COLORS.homeTeam : COLORS.awayTeam;
  const actionText = isBatting ? 'AT BAT' : 'PITCHING';
  const actionColor = isBatting ? COLORS.batting : COLORS.pitching;

  return (
    <View style={[styles.container, { borderLeftColor: teamColor }]}>
      <View style={styles.teamSection}>
        <Text style={[styles.teamLabel, { color: teamColor }]}>
          {currentTeam.toUpperCase()} TEAM
        </Text>
        <Text style={styles.teamName}>{teamName}</Text>
      </View>
      
      <View style={[styles.actionBadge, { backgroundColor: actionColor }]}>
        <Text style={styles.actionText}>{actionText}</Text>
      </View>
    </View>
  );
};

interface TurnBannerProps {
  battingTeam: 'home' | 'away';
  battingTeamName: string;
  pitchingTeamName: string;
  message?: string;
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  battingTeam,
  battingTeamName,
  message,
}) => {
  const teamColor = battingTeam === 'home' ? COLORS.homeTeam : COLORS.awayTeam;

  return (
    <View style={[styles.banner, { backgroundColor: teamColor }]}>
      <Text style={styles.bannerText}>
        {battingTeamName.toUpperCase()} AT BAT
      </Text>
      {message && (
        <Text style={styles.bannerSubtext}>{message}</Text>
      )}
    </View>
  );
};

interface PassDevicePromptProps {
  nextTeam: 'home' | 'away';
  nextTeamName: string;
  onReady: () => void;
}

export const PassDevicePrompt: React.FC<PassDevicePromptProps> = ({
  nextTeam,
  nextTeamName,
}) => {
  const teamColor = nextTeam === 'home' ? COLORS.homeTeam : COLORS.awayTeam;

  return (
    <View style={styles.passDeviceOverlay}>
      <View style={styles.passDeviceCard}>
        <Text style={styles.passDeviceTitle}>PASS THE DEVICE</Text>
        <View style={[styles.passDeviceTeamBadge, { backgroundColor: teamColor }]}>
          <Text style={styles.passDeviceTeamText}>
            {nextTeamName.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.passDeviceSubtext}>
          Tap when {nextTeamName} is ready
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
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderLeftWidth: 4,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  teamSection: {
    flex: 1,
  },
  teamLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  teamName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  actionBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  banner: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  bannerSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    opacity: 0.9,
    marginTop: 2,
  },
  passDeviceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  passDeviceCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minWidth: 280,
  },
  passDeviceTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: SPACING.lg,
  },
  passDeviceTeamBadge: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  passDeviceTeamText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  passDeviceSubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
