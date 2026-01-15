import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FireworksEffect } from '../components/CelebrationEffects';
import { GameEngine } from '../engine/GameEngine';
import { GameState } from '../models/Game';
import { PlayerCard } from '../models/Card';
import { Scoreboard } from '../components/Scoreboard';
import { BaseballDiamond } from '../components/BaseballDiamond';
import { DiceRoller } from '../components/DiceRoller';
import { PlayerCardView } from '../components/PlayerCardView';
import { GameOverOverlay } from '../components/GameOverOverlay';
import { PassDevicePrompt } from '../components/TurnIndicator';
import { ShowdownCard } from '../components/ShowdownCard';
import { GameEventToast } from '../components/GameEventToast';
import { SAMPLE_TEAMS } from '../utils/sampleData';
import { loadDefaultTeams, Team } from '../utils/teamLoader';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Layout Constants
const HEADER_HEIGHT = 100; // Scoreboard + Last Play
const BOTTOM_HEIGHT = 180; // Matchup Section approx height
const SAFE_MARGIN = 100;
const DIAMOND_TARGET_HEIGHT = 360;

// Dynamic Scale Calculationr
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - BOTTOM_HEIGHT - SAFE_MARGIN;
const DIAMOND_SCALE = Math.min(1, Math.max(0.6, AVAILABLE_HEIGHT / DIAMOND_TARGET_HEIGHT));

export const GameScreen: React.FC = () => {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(null);
  const [lastPlayMessage, setLastPlayMessage] = useState<string>('');
  const [showGameOver, setShowGameOver] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'advantage' | 'batting-safe' | 'batting-out' | 'pitching-safe' | 'pitching-out' | 'score' | 'positive' | 'negative' | 'neutral'>('neutral');

  const [showPassDevice, setShowPassDevice] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const prevIsTopOfInning = useRef<boolean | null>(null);

  useEffect(() => {
    console.log('🎆 showFireworks state changed:', showFireworks);
  }, [showFireworks]);

  useEffect(() => {
    async function initializeGame() {
      try {
        setIsLoadingTeams(true);
        setLoadError(null);
        
        const teams = await loadDefaultTeams();

        // Log lineups at game start
        console.log('🎮 GAME INITIALIZED');
        console.log('\n📍 HOME TEAM:', teams.home.name);
        console.log('  Pitcher:', teams.home.pitcher.name, `(${teams.home.pitcher.year}) Control:`, teams.home.pitcher.command);
        console.log('  Lineup:');
        teams.home.lineup.forEach((card, i) => {
          console.log(`    ${i}: ${card.name} (${card.year}) - OnBase: ${card.command}, Speed: ${card.speed}`);
        });

        console.log('\n📍 AWAY TEAM:', teams.away.name);
        console.log('  Pitcher:', teams.away.pitcher.name, `(${teams.away.pitcher.year}) Control:`, teams.away.pitcher.command);
        console.log('  Lineup:');
        teams.away.lineup.forEach((card, i) => {
          console.log(`    ${i}: ${card.name} (${card.year}) - OnBase: ${card.command}, Speed: ${card.speed}`);
        });
        console.log('\n');

        const engine = new GameEngine(teams.home, teams.away);
        setGameEngine(engine);
        setGameState(engine.getState());
        prevIsTopOfInning.current = true;
      } catch (error) {
        console.error('Failed to load teams, falling back to sample data:', error);
        setLoadError('Could not load real teams from database. Using sample data.');
        
        const engine = new GameEngine(SAMPLE_TEAMS.home, SAMPLE_TEAMS.away);
        setGameEngine(engine);
        setGameState(engine.getState());
        prevIsTopOfInning.current = true;
      } finally {
        setIsLoadingTeams(false);
      }
    }

    initializeGame();
  }, []);

  useEffect(() => {
    if (gameState && prevIsTopOfInning.current !== null) {
      if (gameState.isTopOfInning !== prevIsTopOfInning.current) {
        setShowPassDevice(true);
        prevIsTopOfInning.current = gameState.isTopOfInning;
      }
    }
  }, [gameState]);

  const triggerToast = (
    message: string, 
    type: 'advantage' | 'batting-safe' | 'batting-out' | 'pitching-safe' | 'pitching-out' | 'score' | 'positive' | 'negative' | 'neutral' = 'neutral'
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleDiceRoll = (roll: number) => {
    if (!gameEngine || !gameState) return;

    try {
      if (gameState.currentPhase === 'PITCH') {
        const pitcher = currentPitcher;
        const batter = currentBatter;

        console.log('\n🎲 PITCH PHASE ROLL');
        console.log(`  Pitcher: ${pitcher?.name} (Control: ${pitcher?.command})`);
        console.log(`  Batter: ${batter?.name} (OnBase: ${batter?.command})`);
        console.log(`  📍 Roll: ${roll}`);
        console.log(`  ✓ Pitcher passes on: ${pitcher?.command || 0} + (roll ${roll})`);
        console.log(`  ✓ Batter passes on: ${batter?.command || 0} + (roll ${roll})`);

        const { pitchResult, advantage } = gameEngine.executePitchPhase(roll);
        setGameState(gameEngine.getState());

        console.log(`  🏆 Result: ${advantage} ADVANTAGE`);

        const message = `Roll: ${roll} -> ${advantage} ADVANTAGE!`;
        setLastPlayMessage(message);
        triggerToast(
          message,
          'advantage'
        );

      } else if (gameState.currentPhase === 'SWING') {
        const pitcher = currentPitcher;
        const batter = currentBatter;

        console.log('\n🎲 SWING PHASE ROLL');
        console.log(`  Pitcher: ${pitcher?.name} (Control: ${pitcher?.command})`);
        console.log(`  Batter: ${batter?.name} (OnBase: ${batter?.command})`);
        console.log(`  📍 Roll: ${roll}`);
        console.log(`  ✓ Looking up chart on: ${roll}`);

        const { chartResult } = gameEngine.executeSwingPhase(roll);
        const result = gameEngine.resolveResult(chartResult);
        setGameState(gameEngine.getState());

        console.log(`  📊 Chart Result: ${chartResult}`);
        console.log(`  📈 Outcome: ${result.description}`);
        if (result.runsScored > 0) {
          console.log(`  🏃 Runners score: ${result.runsScored}`);
        }

        let message = `${chartResult}: ${result.description}`;
        let type: 'advantage' | 'batting-safe' | 'batting-out' | 'pitching-safe' | 'pitching-out' | 'score' | 'positive' | 'negative' | 'neutral' = 'neutral';

        if (chartResult === 'HR') {
          console.log('🎆 HOME RUN! Triggering fireworks...');
          setShowFireworks(true);
          setTimeout(() => {
            console.log('🎆 Hiding fireworks');
            setShowFireworks(false);
          }, 3000);
        }

        if (result.runsScored > 0) {
          message += ` (${result.runsScored} RUNS!)`;
          type = 'score';
        } else {
          const isOut = ['SO', 'GB', 'FB', 'PU'].includes(chartResult);
          const isSafe = ['1B', '1B+', '2B', '3B', 'HR', 'BB'].includes(chartResult);
          
          // We need this to be based on the "user" if it's the users advantage, but right now we are just simulated games on a single phone
          if (gameState.currentAdvantage === 'BATTER') {
            type = isOut ? 'batting-out' : isSafe ? 'batting-safe' : 'neutral';
          } else {
            type = isOut ? 'pitching-out' : isSafe ? 'pitching-safe' : 'neutral';
          }
        }

        setLastPlayMessage(message);
        triggerToast(message, type);

        if (gameEngine.getState().isGameOver) {
          setShowGameOver(true);
        }
      }
    } catch (error) {
      console.error('❌ Dice roll error:', error);
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

  if (isLoadingTeams || !gameState || !gameEngine) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {isLoadingTeams ? 'Loading teams...' : 'Initializing game...'}
        </Text>
        {loadError && (
          <Text style={styles.errorText}>{loadError}</Text>
        )}
      </View>
    );
  }

  const currentPitcher = gameState.isTopOfInning
    ? gameState.homeTeam.pitcher
    : gameState.awayTeam.pitcher;

  const currentBatter = gameState.isTopOfInning
    ? gameState.awayTeam.lineup[gameState.currentBatterIndex % gameState.awayTeam.lineup.length]
    : gameState.homeTeam.lineup[gameState.currentBatterIndex % gameState.homeTeam.lineup.length];

  // Log when currentBatter is undefined
  if (!currentBatter) {
    const team = gameState.isTopOfInning ? gameState.awayTeam : gameState.homeTeam;
    const index = gameState.currentBatterIndex % team.lineup.length;
    console.warn(
      `⚠️  currentBatter is undefined!`,
      {
        currentBatterIndex: gameState.currentBatterIndex,
        lineupLength: team.lineup.length,
        calculatedIndex: index,
        lineup: team.lineup.map((c, i) => ({ index: i, name: c?.name || 'MISSING' })),
      }
    );
  }

  if (!currentPitcher) {
    console.warn(`⚠️  currentPitcher is undefined!`);
  }

  const pitchingTeamName = gameState.isTopOfInning 
    ? gameState.homeTeam.name 
    : gameState.awayTeam.name;

  const battingTeamName = gameState.isTopOfInning 
    ? gameState.awayTeam.name 
    : gameState.homeTeam.name;

  const fatigueInfo = gameEngine.getPitcherFatigueInfo();
  
  const showAdvantage = gameState.currentPhase === 'SWING';

  return (
    <SafeAreaView style={styles.container}>
      <FireworksEffect show={showFireworks} />

      <GameEventToast 
        message={toastMessage}
        isVisible={showToast}
        type={toastType}
        onAnimationComplete={() => setShowToast(false)}
      />

      {/* Top Section: Scoreboard + Last Play */}
      <View style={styles.topSection}>
        <Scoreboard
          inning={gameState.inning}
          isTopOfInning={gameState.isTopOfInning}
          outs={gameState.outs}
          homeScore={gameState.score.home}
          awayScore={gameState.score.away}
          homeTeamName={gameState.homeTeam.name}
          awayTeamName={gameState.awayTeam.name}
        />
        
        <View style={styles.lastPlayContainer}>
          <Text style={styles.lastPlayLabel}>LAST PLAY:</Text>
          <Text style={styles.lastPlayText}>
            {lastPlayMessage || 'Game Start'}
          </Text>
        </View>
      </View>

      {/* Middle Section: Field (Scaled Responsively) */}
      <View style={styles.middleSection}>
        <BaseballDiamond 
          bases={gameState.bases} 
          onBaseClick={(card) => setSelectedCard(card)}
          scale={DIAMOND_SCALE}
        />
      </View>

      {/* Bottom Section: Dice + Matchup */}
      <View style={styles.bottomSection}>
        <View style={styles.diceContainer}>
          <DiceRoller 
            onRoll={handleDiceRoll} 
            disabled={gameState.isGameOver}
            scale={Math.max(0.8, DIAMOND_SCALE)}
          />
        </View>

        <View style={styles.matchupSection}>
          <View style={styles.phaseSection}>
            <Text style={styles.phaseTitle}>
              {gameState.currentPhase === 'PITCH' ? 'PITCH PHASE' : 'SWING PHASE'}
            </Text>
            <Text style={styles.phaseHint}>
              {gameState.currentPhase === 'PITCH'
                ? `${pitchingTeamName} - Roll for Advantage`
                : `${gameState.currentAdvantage === 'PITCHER' ? pitchingTeamName : battingTeamName} - Roll on Chart`}
            </Text>
          </View>
          
          <View style={styles.matchupRow}>
            <TouchableOpacity onPress={() => setSelectedCard(currentPitcher)}>
              <ShowdownCard 
                card={currentPitcher}
                hasAdvantage={showAdvantage && gameState.currentAdvantage === 'PITCHER'}
                fatiguedControl={fatigueInfo.currentControl}
                compact
              />
            </TouchableOpacity>
            
            <View style={styles.vsContainer}>
               <Text style={styles.vs}>VS</Text>
            </View>
            
            <TouchableOpacity onPress={() => setSelectedCard(currentBatter)}>
              <ShowdownCard 
                card={currentBatter}
                hasAdvantage={showAdvantage && gameState.currentAdvantage === 'BATTER'}
                compact
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {selectedCard && (
        <PlayerCardView 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)}
        />
      )}

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  
  // Layout Sections
  topSection: {
    zIndex: 10,
    backgroundColor: COLORS.background,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative',
  },
  bottomSection: {
    backgroundColor: COLORS.background,
    paddingBottom: SPACING.xs,
  },

  // Components
  lastPlayContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
  diceContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm, // Spacing between dice and matchup
    zIndex: 20, 
  },
  
  matchupSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderColor: '#444',
  },
  phaseSection: {
    marginBottom: SPACING.xs,
    alignItems: 'center',
  },
  phaseTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textGold,
    marginBottom: 2,
    letterSpacing: 1,
  },
  phaseHint: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});