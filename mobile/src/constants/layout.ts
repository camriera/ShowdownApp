import { Dimensions } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

// Device detection (for future tablet support)
export const IS_SMALL_DEVICE = height < 700;
export const IS_TABLET = width >= 768;

// Re-export scaling functions for convenience
export { scale, verticalScale, moderateScale };

// Scaled layout constants
export const LAYOUT = {
  // BaseballDiamond
  fieldSize: moderateScale(200, 0.3),
  infieldSide: moderateScale(112, 0.3),
  baseSize: moderateScale(12, 0.3),
  cardSlotWidth: moderateScale(90, 0.4),
  cardSlotHeight: moderateScale(125, 0.4),
  
  // DiceRoller
  diceSize: moderateScale(80, 0.3),
  
  // ShowdownCard
  compactCardWidth: moderateScale(130, 0.4),
  compactCardHeight: moderateScale(180, 0.4),
  miniCardWidth: moderateScale(45, 0.3),
  miniCardHeight: moderateScale(60, 0.3),
  
  // Scoreboard
  scoreboardHeight: verticalScale(48),
  
  // GameScreen sections
  lastPlayHeight: verticalScale(28),
  dugoutBarHeight: verticalScale(70),
  
  // Diamond container (enough space for field + 2nd base slot above)
  diamondContainerHeight: moderateScale(200, 0.3) + moderateScale(125, 0.4) + verticalScale(20),
};
