import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface PassDevicePromptProps {
  nextTeam: 'home' | 'away';
  nextTeamName: string;
  onReady: () => void;
}

export const PassDevicePrompt: React.FC<PassDevicePromptProps> = ({
  nextTeam,
  nextTeamName,
  onReady,
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const teamColor = nextTeam === 'home' ? COLORS.homeTeam : COLORS.awayTeam;

  useEffect(() => {
    setShowPrompt(false);
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.passDeviceOverlay}>
      {showPrompt && (
        <TouchableOpacity onPress={onReady} activeOpacity={0.9}>
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
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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