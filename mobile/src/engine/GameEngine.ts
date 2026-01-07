import { HitterCard, PitcherCard, ChartEntry, ChartResult } from '../models/Card';
import { GameState, GamePhase, Advantage, AtBatResult, BaseRunners } from '../models/Game';

export class GameEngine {
  private state: GameState;

  constructor(homeTeam: { name: string; lineup: HitterCard[]; pitcher: PitcherCard }, awayTeam: { name: string; lineup: HitterCard[]; pitcher: PitcherCard }) {
    this.state = {
      gameId: `game_${Date.now()}`,
      homeTeam,
      awayTeam,
      inning: 1,
      isTopOfInning: true,
      outs: 0,
      score: { home: 0, away: 0 },
      currentPhase: 'PITCH' as GamePhase,
      currentBatterIndex: 0,
      currentAdvantage: null,
      lastPitchRoll: null,
      lastPitchResult: null,
      lastSwingRoll: null,
      bases: { first: null, second: null, third: null },
      pitcherBattersFaced: 0,
      isGameOver: false,
      winner: null,
    };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public executePitchPhase(roll: number): { pitchResult: number; advantage: Advantage } {
    const pitcher = this.getCurrentPitcher();
    const batter = this.getCurrentBatter();
    
    const controlPenalty = this.calculateFatiguePenalty(pitcher, this.state.pitcherBattersFaced);
    const effectiveControl = pitcher.command - controlPenalty;
    
    const pitchResult = roll + effectiveControl;
    const advantage: Advantage = pitchResult > batter.command ? 'PITCHER' : 'BATTER';
    
    this.state.lastPitchRoll = roll;
    this.state.lastPitchResult = pitchResult;
    this.state.currentAdvantage = advantage;
    this.state.currentPhase = 'SWING';
    
    return { pitchResult, advantage };
  }

  public executeSwingPhase(roll: number): { chartResult: ChartResult } {
    const advantage = this.state.currentAdvantage;
    if (!advantage) {
      throw new Error('No advantage determined');
    }
    
    const chartOwner = advantage === 'PITCHER' ? this.getCurrentPitcher() : this.getCurrentBatter();
    const chartResult = this.lookupChart(chartOwner.chart, roll);
    
    this.state.lastSwingRoll = roll;
    this.state.currentPhase = 'RESULT';
    
    return { chartResult };
  }

  public resolveResult(chartResult: ChartResult): AtBatResult {
    let result: AtBatResult;
    
    switch (chartResult) {
      case 'SO':
      case 'PU':
        result = this.recordOut(chartResult);
        break;
      case 'GB':
      case 'FB':
        result = this.handleFieldedBall(chartResult);
        break;
      case 'BB':
        result = this.handleWalk();
        break;
      case '1B':
        result = this.handleSingle();
        break;
      case '2B':
        result = this.handleDouble();
        break;
      case '3B':
        result = this.handleTriple();
        break;
      case 'HR':
        result = this.handleHomeRun();
        break;
      default:
        result = this.recordOut('SO');
    }
    
    this.advanceGameState(result);
    
    return result;
  }

  private getCurrentPitcher(): PitcherCard {
    return this.state.isTopOfInning ? this.state.homeTeam.pitcher : this.state.awayTeam.pitcher;
  }

  private getCurrentBatter(): HitterCard {
    const lineup = this.state.isTopOfInning ? this.state.awayTeam.lineup : this.state.homeTeam.lineup;
    return lineup[this.state.currentBatterIndex % lineup.length];
  }

  private calculateFatiguePenalty(pitcher: PitcherCard, battersFaced: number): number {
    const inningsPitched = Math.floor(battersFaced / 3);
    if (inningsPitched <= pitcher.ip) {
      return 0;
    }
    const excessBatters = battersFaced - (pitcher.ip * 3);
    return Math.floor(excessBatters);
  }

  private lookupChart(chart: ChartEntry[], roll: number): ChartResult {
    for (const entry of chart) {
      if (roll >= entry.range[0] && roll <= entry.range[1]) {
        return entry.result;
      }
    }
    return 'SO';
  }

  private recordOut(type: string): AtBatResult {
    return {
      isOut: true,
      outsRecorded: 1,
      runsScored: 0,
      newBaseState: { ...this.state.bases },
      description: type === 'SO' ? 'Strikeout' : 'Pop Up',
    };
  }

  private handleFieldedBall(type: ChartResult): AtBatResult {
    return {
      isOut: true,
      outsRecorded: 1,
      runsScored: 0,
      newBaseState: { ...this.state.bases },
      description: type === 'GB' ? 'Ground Out' : 'Fly Out',
    };
  }

  private handleWalk(): AtBatResult {
    const newBases = { ...this.state.bases };
    const batter = this.getCurrentBatter();
    let runsScored = 0;
    
    if (newBases.first && newBases.second && newBases.third) {
      runsScored = 1;
    }
    
    if (newBases.second && newBases.third) {
      newBases.third = newBases.second;
    }
    if (newBases.first) {
      newBases.second = newBases.first;
    }
    newBases.first = batter;
    
    return {
      isOut: false,
      outsRecorded: 0,
      runsScored,
      newBaseState: newBases,
      description: 'Walk',
    };
  }

  private handleSingle(): AtBatResult {
    const newBases: BaseRunners = { first: null, second: null, third: null };
    const batter = this.getCurrentBatter();
    let runsScored = 0;
    
    if (this.state.bases.third) runsScored++;
    if (this.state.bases.second) runsScored++;
    
    newBases.second = this.state.bases.first;
    newBases.first = batter;
    
    return {
      isOut: false,
      outsRecorded: 0,
      runsScored,
      newBaseState: newBases,
      description: 'Single',
    };
  }

  private handleDouble(): AtBatResult {
    const newBases: BaseRunners = { first: null, second: null, third: null };
    const batter = this.getCurrentBatter();
    let runsScored = 0;
    
    if (this.state.bases.third) runsScored++;
    if (this.state.bases.second) runsScored++;
    if (this.state.bases.first) runsScored++;
    
    newBases.second = batter;
    
    return {
      isOut: false,
      outsRecorded: 0,
      runsScored,
      newBaseState: newBases,
      description: 'Double',
    };
  }

  private handleTriple(): AtBatResult {
    const newBases: BaseRunners = { first: null, second: null, third: null };
    const batter = this.getCurrentBatter();
    let runsScored = 0;
    
    if (this.state.bases.third) runsScored++;
    if (this.state.bases.second) runsScored++;
    if (this.state.bases.first) runsScored++;
    
    newBases.third = batter;
    
    return {
      isOut: false,
      outsRecorded: 0,
      runsScored,
      newBaseState: newBases,
      description: 'Triple',
    };
  }

  private handleHomeRun(): AtBatResult {
    let runsScored = 1;
    
    if (this.state.bases.third) runsScored++;
    if (this.state.bases.second) runsScored++;
    if (this.state.bases.first) runsScored++;
    
    return {
      isOut: false,
      outsRecorded: 0,
      runsScored,
      newBaseState: { first: null, second: null, third: null },
      description: 'Home Run!',
    };
  }

  private advanceGameState(result: AtBatResult): void {
    this.state.bases = result.newBaseState;
    
    if (this.state.isTopOfInning) {
      this.state.score.away += result.runsScored;
    } else {
      this.state.score.home += result.runsScored;
    }
    
    if (result.isOut) {
      this.state.outs += result.outsRecorded;
    }
    
    this.state.pitcherBattersFaced++;
    
    if (this.state.outs >= 3) {
      this.endInning();
    } else {
      this.state.currentBatterIndex = (this.state.currentBatterIndex + 1) % 9;
      this.state.currentPhase = 'PITCH';
    }
  }

  private endInning(): void {
    this.state.outs = 0;
    this.state.bases = { first: null, second: null, third: null };
    this.state.currentBatterIndex = 0;
    this.state.pitcherBattersFaced = 0;
    
    if (this.state.isTopOfInning) {
      this.state.isTopOfInning = false;
    } else {
      this.state.isTopOfInning = true;
      this.state.inning++;
      
      if (this.state.inning > 9 && this.state.score.home !== this.state.score.away) {
        this.state.isGameOver = true;
        this.state.winner = this.state.score.home > this.state.score.away ? 'home' : 'away';
      }
    }
    
    this.state.currentPhase = 'PITCH';
  }
}
