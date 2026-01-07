import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  return (
    <View style={styles.container}>
      <View style={styles.teamsRow}>
        <View style={styles.teamColumn}>
          <Text style={styles.teamLabel}>Away</Text>
          <Text style={styles.teamName}>{awayTeamName}</Text>
          <Text style={[styles.score, !isTopOfInning && styles.inactiveScore]}>
            {awayScore}
          </Text>
        </View>
        
        <View style={styles.inningColumn}>
          <Text style={styles.inningLabel}>Inning</Text>
          <Text style={styles.inningValue}>{inning}</Text>
          <Text style={styles.halfInning}>
            {isTopOfInning ? '▲ Top' : '▼ Bottom'}
          </Text>
        </View>
        
        <View style={styles.teamColumn}>
          <Text style={styles.teamLabel}>Home</Text>
          <Text style={styles.teamName}>{homeTeamName}</Text>
          <Text style={[styles.score, isTopOfInning && styles.inactiveScore]}>
            {homeScore}
          </Text>
        </View>
      </View>
      
      <View style={styles.outsRow}>
        <Text style={styles.outsLabel}>Outs: </Text>
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
    backgroundColor: '#1a472a',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
  },
  inningColumn: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  teamLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 4,
  },
  teamName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  inactiveScore: {
    opacity: 0.5,
  },
  inningLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 4,
  },
  inningValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  halfInning: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  outsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  outsLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  outsDots: {
    flexDirection: 'row',
    gap: 8,
  },
  outDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  outDotFilled: {
    backgroundColor: '#DC143C',
  },
});
