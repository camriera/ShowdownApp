import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GameEngine } from '../engine/GameEngine';
import { GameState } from '../models/Game';
import { ChartResult } from '../models/Card';
import { Scoreboard } from '../components/Scoreboard';
import { BaseballDiamond } from '../components/BaseballDiamond';
import { DiceRoller } from '../components/DiceRoller';
import { PlayerCardView } from '../components/PlayerCardView';
import { GameOverOverlay } from '../components/GameOverOverlay';
import { PassDevicePrompt } from '../components/TurnIndicator';
import { ShowdownCard } from '../components/ShowdownCard';
import { GameEventToast } from '../components/GameEventToast';
import { SAMPLE_TEAMS } from '../utils/sampleData';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export const GameScreen: React.FC = () => {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showPlayerCard, setShowPlayerCard] = useState<'pitcher' | 'batter' | null>(null);
  const [lastPlayMessage, setLastPlayMessage] = useState<string>('');
  const [showGameOver, setShowGameOver] = useState(false);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'positive' | 'negative' | 'neutral' | 'score'>('neutral');

  // Hot Seat State
  const [showPassDevice, setShowPassDevice] = useState(false);
  const prevIsTopOfInning = useRef<boolean | null>(null);

  useEffect(() => {
    const engine = new GameEngine(SAMPLE_TEAMS.home, SAMPLE_TEAMS.away);
    setGameEngine(engine);
    setGameState(engine.getState());
    prevIsTopOfInning.current = true; // Initial state is top of inning
  }, []);

  useEffect(() => {
    if (gameState && prevIsTopOfInning.current !== null) {
      if (gameState.isTopOfInning !== prevIsTopOfInning.current) {
        setShowPassDevice(true);
        prevIsTopOfInning.current = gameState.isTopOfInning;
      }
    }
  }, [gameState]);

  const triggerToast = (message: string, type: 'positive' | 'negative' | 'neutral' | 'score' = 'neutral') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleDiceRoll = (roll: number) => {
    if (!gameEngine || !gameState) return;

    try {
      if (gameState.currentPhase === 'PITCH') {
        const { pitchResult, advantage } = gameEngine.executePitchPhase(roll);
        setGameState(gameEngine.getState());
        
        const message = `Roll: ${roll} -> ${advantage} ADVANTAGE!`;
        setLastPlayMessage(message);
        triggerToast(
          `${advantage} ADVANTAGE!`,
          advantage === 'PITCHER' ? 'negative' : 'positive'
        );
        
      } else if (gameState.currentPhase === 'SWING') {
        const { chartResult } = gameEngine.executeSwingPhase(roll);
        const result = gameEngine.resolveResult(chartResult);
        setGameState(gameEngine.getState());
        
        let message = `${chartResult}: ${result.description}`;
        let type: 'positive' | 'negative' | 'neutral' | 'score' = 'neutral';
        
        if (result.runsScored > 0) {
          message += ` (${result.runsScored} RUNS!)`;
          type = 'score';
        } else if (result.outs > 0) {
          type = 'negative';
        } else {
          type = 'positive';
        }
        
        setLastPlayMessage(message);
        triggerToast(chartResult, type);
        
        if (gameEngine.getState().isGameOver) {
          setShowGameOver(true);
        }
      }
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : 'Unknown error', 'negative');
    }
  };

  const handlePlayAgain = () => {
    if (gameEngine) {
      gameEngine.resetGame();
      setGameState(gameEngine.getState());
      setShowGameOver(false);
      setLastPlayMessage('');
      prevIsTopOfInning.current = true;
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

  const pitchingTeamName = gameState.isTopOfInning 
    ? gameState.homeTeam.name 
    : gameState.awayTeam.name;

  const battingTeamName = gameState.isTopOfInning 
    ? gameState.awayTeam.name 
    : gameState.homeTeam.name;

  const fatigueInfo = gameEngine.getPitcherFatigueInfo();

  return (
    <View style={styles.container}>
      <GameEventToast 
        message={toastMessage}
        isVisible={showToast}
        type={toastType}
        onAnimationComplete={() => setShowToast(false)}
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
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

          
          <View style={styles.matchupRow}>
            <TouchableOpacity onPress={() => setShowPlayerCard(showPlayerCard === 'pitcher' ? null : 'pitcher')}>
              <ShowdownCard 
                card={currentPitcher}
                hasAdvantage={gameState.currentAdvantage === 'PITCHER'}
                fatiguedControl={fatigueInfo.currentControl}
                compact
              />
            </TouchableOpacity>
            
            <View style={styles.vsContainer}>
               <Text style={styles.vs}>VS</Text>
            </View>
            
            <TouchableOpacity onPress={() => setShowPlayerCard(showPlayerCard === 'batter' ? null : 'batter')}>
              <ShowdownCard 
                card={currentBatter}
                hasAdvantage={gameState.currentAdvantage === 'BATTER'}
                compact
              />
            </TouchableOpacity>
          </View>
        </View>

        {showPlayerCard && (
          <PlayerCardView 
            card={showPlayerCard === 'pitcher' ? currentPitcher : currentBatter} onClose={() => setShowPlayerCard(null)}
          />
        )}



        <DiceRoller 
          onRoll={handleDiceRoll} 
          disabled={gameState.isGameOver}
        />

        {lastPlayMessage !== '' && (
          <View style={styles.lastPlayContainer}>
            <Text style={styles.lastPlayLabel}>LAST PLAY:</Text>
            <Text style={styles.lastPlayText}>{lastPlayMessage}</Text>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {showPassDevice && (
        <PassDevicePrompt
          nextTeam={gameState.isTopOfInning ? 'away' : 'home'}
          nextTeamName={gameState.isTopOfInning ? gameState.awayTeam.name : gameState.homeTeam.name}
          onReady={() => setShowPassDevice(false)}
        />
      )}

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
  scrollContent: {
    paddingBottom: 40,
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
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#444',
  },
  matchupTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textGold,
    marginBottom: SPACING.md,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  matchupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    opacity: 0.5,
  },
  vs: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  phaseSection: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  phaseTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textGold,
    marginBottom: 4,
    letterSpacing: 2,
  },
  phaseHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  lastPlayContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  lastPlayLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginRight: 8,
  },
  lastPlayText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
});
