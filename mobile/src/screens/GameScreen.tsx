import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GameEngine } from '../engine/GameEngine';
import { GameState } from '../models/Game';
import { ChartResult } from '../models/Card';
import { Scoreboard } from '../components/Scoreboard';
import { BaseballDiamond } from '../components/BaseballDiamond';
import { DiceRoller } from '../components/DiceRoller';
import { PlayerCardView } from '../components/PlayerCardView';
import { GameOverOverlay } from '../components/GameOverOverlay';
import { SituationBanner, PitcherFatigueIndicator } from '../components/SituationBanner';
import { TurnBanner } from '../components/TurnIndicator';
import { SAMPLE_TEAMS } from '../utils/sampleData';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export const GameScreen: React.FC = () => {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showPlayerCard, setShowPlayerCard] = useState<'pitcher' | 'batter' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [showGameOver, setShowGameOver] = useState(false);

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
          `Roll: ${roll} + Control = ${pitchResult}\n${advantage === 'PITCHER' ? 'Pitcher' : 'Batter'} has advantage!`
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
          setShowGameOver(true);
        }
      }
    } catch (error) {
      setResultMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handlePlayAgain = () => {
    if (gameEngine) {
      gameEngine.resetGame();
      setGameState(gameEngine.getState());
      setShowGameOver(false);
      setResultMessage('');
    }
  };

  const handleExit = () => {
    setShowGameOver(false);
  };

  if (!gameState || !gameEngine) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const currentPitcher = gameState.isTopOfInning 
    ? gameState.homeTeam.pitcher 
    : gameState.awayTeam.pitcher;
    
  const currentBatter = gameState.isTopOfInning
    ? gameState.awayTeam.lineup[gameState.currentBatterIndex % gameState.awayTeam.lineup.length]
    : gameState.homeTeam.lineup[gameState.currentBatterIndex % gameState.homeTeam.lineup.length];

  const battingTeamName = gameState.isTopOfInning 
    ? gameState.awayTeam.name 
    : gameState.homeTeam.name;

  const pitchingTeamName = gameState.isTopOfInning 
    ? gameState.homeTeam.name 
    : gameState.awayTeam.name;

  const fatigueInfo = gameEngine.getPitcherFatigueInfo();

  return (
    <View style={styles.container}>
      <TurnBanner
        battingTeam={gameState.isTopOfInning ? 'away' : 'home'}
        battingTeamName={battingTeamName}
        pitchingTeamName={pitchingTeamName}
      />

      <ScrollView style={styles.scrollContainer}>
        <Scoreboard
          inning={gameState.inning}
          isTopOfInning={gameState.isTopOfInning}
          outs={gameState.outs}
          homeScore={gameState.score.home}
          awayScore={gameState.score.away}
          homeTeamName={gameState.homeTeam.name}
          awayTeamName={gameState.awayTeam.name}
        />

        <SituationBanner
          inning={gameState.inning}
          isTopOfInning={gameState.isTopOfInning}
          outs={gameState.outs}
          bases={gameState.bases}
          battingTeamName={battingTeamName}
          homeScore={gameState.score.home}
          awayScore={gameState.score.away}
        />

        <BaseballDiamond bases={gameState.bases} />

        <PitcherFatigueIndicator
          pitcherName={fatigueInfo.pitcher.name}
          baseControl={fatigueInfo.baseControl}
          currentControl={fatigueInfo.currentControl}
          inningsPitched={fatigueInfo.inningsPitched}
          ipRating={fatigueInfo.ipRating}
        />

        <View style={styles.matchupSection}>
          <Text style={styles.matchupTitle}>Current Matchup</Text>
          
          <View style={styles.matchupRow}>
            <TouchableOpacity
              style={[styles.playerButton, gameState.currentAdvantage === 'PITCHER' && styles.advantageButton]}
              onPress={() => setShowPlayerCard(showPlayerCard === 'pitcher' ? null : 'pitcher')}
            >
              <Text style={styles.playerLabel}>PITCHER</Text>
              <Text style={styles.playerName}>{currentPitcher.name}</Text>
              <Text style={styles.playerStat}>
                Control: {fatigueInfo.isFatigued 
                  ? `${fatigueInfo.currentControl} (was ${fatigueInfo.baseControl})`
                  : fatigueInfo.currentControl}
              </Text>
              {gameState.currentAdvantage === 'PITCHER' && (
                <View style={styles.advantageBadge}>
                  <Text style={styles.advantageText}>ADVANTAGE</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <Text style={styles.vs}>VS</Text>
            
            <TouchableOpacity
              style={[styles.playerButton, gameState.currentAdvantage === 'BATTER' && styles.advantageButton]}
              onPress={() => setShowPlayerCard(showPlayerCard === 'batter' ? null : 'batter')}
            >
              <Text style={styles.playerLabel}>BATTER</Text>
              <Text style={styles.playerName}>{currentBatter.name}</Text>
              <Text style={styles.playerStat}>On-Base: {currentBatter.command}</Text>
              {gameState.currentAdvantage === 'BATTER' && (
                <View style={styles.advantageBadge}>
                  <Text style={styles.advantageText}>ADVANTAGE</Text>
                </View>
              )}
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
            {gameState.currentPhase === 'PITCH' ? 'PITCH PHASE' : 'SWING PHASE'}
          </Text>
          <Text style={styles.phaseHint}>
            {gameState.currentPhase === 'PITCH'
              ? `${pitchingTeamName} - Roll to determine advantage`
              : `${gameState.currentAdvantage === 'PITCHER' ? pitchingTeamName : battingTeamName} - Roll on chart`}
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

        <View style={styles.spacer} />
      </ScrollView>

      {showGameOver && gameState.winner && (
        <GameOverOverlay
          winner={gameState.winner}
          homeTeamName={gameState.homeTeam.name}
          awayTeamName={gameState.awayTeam.name}
          homeScore={gameState.score.home}
          awayScore={gameState.score.away}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  matchupSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  matchupTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  matchupRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playerButton: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 130,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  advantageButton: {
    borderColor: COLORS.advantage,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  playerLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  playerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  playerStat: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  advantageBadge: {
    backgroundColor: COLORS.advantage,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.xs,
  },
  advantageText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.background,
    letterSpacing: 1,
  },
  vs: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  phaseSection: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  phaseTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textGold,
    marginBottom: SPACING.xs,
    letterSpacing: 2,
  },
  phaseHint: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: COLORS.fieldGreen,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  resultText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  spacer: {
    height: 40,
  },
});
