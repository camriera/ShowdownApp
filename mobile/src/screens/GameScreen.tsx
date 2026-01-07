import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { GameEngine } from '../engine/GameEngine';
import { GameState } from '../models/Game';
import { ChartResult } from '../models/Card';
import { Scoreboard } from '../components/Scoreboard';
import { BaseballDiamond } from '../components/BaseballDiamond';
import { DiceRoller } from '../components/DiceRoller';
import { PlayerCardView } from '../components/PlayerCardView';
import { SAMPLE_TEAMS } from '../utils/sampleData';

export const GameScreen: React.FC = () => {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showPlayerCard, setShowPlayerCard] = useState<'pitcher' | 'batter' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');

  useEffect(() => {
    const engine = new GameEngine(SAMPLE_TEAMS.home, SAMPLE_TEAMS.away);
    setGameEngine(engine);
    setGameState(engine.getState());
  }, []);

  const handleDiceRoll = (roll: number) => {
    if (!gameEngine || !gameState) return;

    try {
      if (gameState.currentPhase === 'PITCH') {
        const { pitchResult, advantage } = gameEngine.executePitchPhase(roll);
        setGameState(gameEngine.getState());
        setResultMessage(
          `Pitch: ${roll} + Control = ${pitchResult}\n${advantage} has advantage!`
        );
      } else if (gameState.currentPhase === 'SWING') {
        const { chartResult } = gameEngine.executeSwingPhase(roll);
        const result = gameEngine.resolveResult(chartResult);
        setGameState(gameEngine.getState());
        
        let message = `${chartResult}: ${result.description}`;
        if (result.runsScored > 0) {
          message += `\n${result.runsScored} run(s) scored!`;
        }
        setResultMessage(message);
        
        if (gameEngine.getState().isGameOver) {
          const winner = gameEngine.getState().winner === 'home' 
            ? SAMPLE_TEAMS.home.name 
            : SAMPLE_TEAMS.away.name;
          Alert.alert('Game Over!', `${winner} wins!`);
        }
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  if (!gameState || !gameEngine) {
    return (
      <View style={styles.container}>
        <Text>Loading game...</Text>
      </View>
    );
  }

  const currentPitcher = gameState.isTopOfInning 
    ? gameState.homeTeam.pitcher 
    : gameState.awayTeam.pitcher;
    
  const currentBatter = gameState.isTopOfInning
    ? gameState.awayTeam.lineup[gameState.currentBatterIndex % gameState.awayTeam.lineup.length]
    : gameState.homeTeam.lineup[gameState.currentBatterIndex % gameState.homeTeam.lineup.length];

  return (
    <ScrollView style={styles.container}>
      <Scoreboard
        inning={gameState.inning}
        isTopOfInning={gameState.isTopOfInning}
        outs={gameState.outs}
        homeScore={gameState.score.home}
        awayScore={gameState.score.away}
        homeTeamName={gameState.homeTeam.name}
        awayTeamName={gameState.awayTeam.name}
      />

      <BaseballDiamond bases={gameState.bases} />

      <View style={styles.matchupSection}>
        <Text style={styles.matchupTitle}>Current Matchup</Text>
        
        <View style={styles.matchupRow}>
          <TouchableOpacity
            style={styles.playerButton}
            onPress={() => setShowPlayerCard(showPlayerCard === 'pitcher' ? null : 'pitcher')}
          >
            <Text style={styles.playerLabel}>Pitcher</Text>
            <Text style={styles.playerName}>{currentPitcher.name}</Text>
            <Text style={styles.playerStat}>Control: {currentPitcher.command}</Text>
          </TouchableOpacity>
          
          <Text style={styles.vs}>VS</Text>
          
          <TouchableOpacity
            style={styles.playerButton}
            onPress={() => setShowPlayerCard(showPlayerCard === 'batter' ? null : 'batter')}
          >
            <Text style={styles.playerLabel}>Batter</Text>
            <Text style={styles.playerName}>{currentBatter.name}</Text>
            <Text style={styles.playerStat}>On-Base: {currentBatter.command}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPlayerCard && (
        <PlayerCardView 
          card={showPlayerCard === 'pitcher' ? currentPitcher : currentBatter} 
        />
      )}

      <View style={styles.phaseSection}>
        <Text style={styles.phaseTitle}>
          {gameState.currentPhase === 'PITCH' ? 'Roll for Pitch' : 'Roll for Swing'}
        </Text>
        <Text style={styles.phaseHint}>
          {gameState.currentPhase === 'PITCH'
            ? 'Pitcher rolls to determine advantage'
            : `${gameState.currentAdvantage} rolls on their chart`}
        </Text>
      </View>

      <DiceRoller 
        onRoll={handleDiceRoll} 
        disabled={gameState.isGameOver}
      />

      {resultMessage !== '' && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>{resultMessage}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  matchupSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  matchupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  matchupRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playerButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    minWidth: 120,
  },
  playerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  playerStat: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC143C',
  },
  vs: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  phaseSection: {
    padding: 16,
    alignItems: 'center',
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  phaseHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: '#1a472a',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
});
