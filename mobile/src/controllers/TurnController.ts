export type TeamSide = 'home' | 'away';
export type TurnPhase = 'WAITING_FOR_ROLL' | 'ROLL_COMPLETE' | 'PASS_DEVICE';

export interface TurnState {
  currentTeam: TeamSide;
  phase: TurnPhase;
  lastRoll: number | null;
  message: string;
}

export interface TurnControllerConfig {
  onTurnChange?: (state: TurnState) => void;
  onRollReceived?: (team: TeamSide, roll: number) => void;
}

export interface ITurnController {
  getCurrentTurn(): TurnState;
  submitRoll(roll: number): void;
  acknowledgeResult(): void;
  setCurrentTeam(team: TeamSide): void;
  dispose(): void;
}

export class LocalTurnController implements ITurnController {
  private state: TurnState;
  private config: TurnControllerConfig;

  constructor(config: TurnControllerConfig = {}) {
    this.config = config;
    this.state = {
      currentTeam: 'away',
      phase: 'WAITING_FOR_ROLL',
      lastRoll: null,
      message: 'Away Team - Tap to Roll',
    };
  }

  getCurrentTurn(): TurnState {
    return { ...this.state };
  }

  setCurrentTeam(team: TeamSide): void {
    this.state.currentTeam = team;
    this.state.phase = 'WAITING_FOR_ROLL';
    this.state.message = this.getWaitingMessage(team);
    this.notifyChange();
  }

  submitRoll(roll: number): void {
    this.state.lastRoll = roll;
    this.state.phase = 'ROLL_COMPLETE';
    this.state.message = `Rolled: ${roll}`;
    
    this.config.onRollReceived?.(this.state.currentTeam, roll);
    this.notifyChange();
  }

  acknowledgeResult(): void {
    this.state.phase = 'PASS_DEVICE';
    this.state.message = this.getPassDeviceMessage();
    this.notifyChange();
  }

  startNextTurn(): void {
    this.state.phase = 'WAITING_FOR_ROLL';
    this.state.lastRoll = null;
    this.state.message = this.getWaitingMessage(this.state.currentTeam);
    this.notifyChange();
  }

  dispose(): void {}

  private getWaitingMessage(team: TeamSide): string {
    const teamName = team === 'home' ? 'Home Team' : 'Away Team';
    return `${teamName} - Tap to Roll`;
  }

  private getPassDeviceMessage(): string {
    const nextTeam = this.state.currentTeam === 'home' ? 'Away' : 'Home';
    return `Pass device to ${nextTeam} Team`;
  }

  private notifyChange(): void {
    this.config.onTurnChange?.(this.getCurrentTurn());
  }
}

export function createTurnController(
  mode: 'local' | 'network' = 'local',
  config: TurnControllerConfig = {}
): ITurnController {
  switch (mode) {
    case 'local':
      return new LocalTurnController(config);
    case 'network':
      throw new Error('Network mode not yet implemented');
    default:
      return new LocalTurnController(config);
  }
}
