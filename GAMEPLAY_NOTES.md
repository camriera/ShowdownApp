# Gameplay Implementation Notes

## Known Limitations & Future Work

### Lineup Validation
- **Status**: Not yet implemented
- **Issue**: Current sample lineups are minimal (not full 9-person rosters)
- **Todo**: Add validation before starting real games:
  - Verify lineup has exactly 9 hitters
  - Verify pitcher is assigned
  - Check for duplicate players
  - Validate all cards have required fields
- **Priority**: Medium (implement when moving to full season/tournament mode)

### Chart Result Mapping
- Currently using simple chart array lookup
- May need more complex result handling as features expand
- Consider future: special rules, park factors, weather effects

### Fatigue System
- Basic fatigue tracking implemented for pitchers
- Currently only affects display
- Future: Integrate into actual game mechanics (reduce control over innings)

### Base Running
- Basic base advancement implemented
- Future enhancements:
  - Player speed affecting steal attempts
  - Advance on errors
  - Force plays

## Testing Scenarios

When testing gameplay:
1. Check console logs for lineup initialization
2. Verify pitch phase control math
3. Verify swing phase chart lookups
4. Test various chart results (outs, hits, home runs)

## Performance Notes

- Card loading happens in parallel (Promise.all)
- Failed cards are filtered out (not ideal for future - should error instead)
- Consider caching loaded cards to avoid repeated API calls
