import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseRunners } from '../models/Game';

interface BaseballDiamondProps {
  bases: BaseRunners;
}

export const BaseballDiamond: React.FC<BaseballDiamondProps> = ({ bases }) => {
  return (
    <View style={styles.container}>
      <View style={styles.diamond}>
        <View style={styles.secondBase}>
          <View style={[styles.base, bases.second && styles.baseOccupied]}>
            <Text style={styles.baseLabel}>2nd</Text>
            {bases.second && (
              <Text style={styles.playerName} numberOfLines={1}>
                {bases.second.name.split(' ').pop()}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.middleRow}>
          <View style={styles.thirdBase}>
            <View style={[styles.base, bases.third && styles.baseOccupied]}>
              <Text style={styles.baseLabel}>3rd</Text>
              {bases.third && (
                <Text style={styles.playerName} numberOfLines={1}>
                  {bases.third.name.split(' ').pop()}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.pitchersMound}>
            <View style={styles.mound}>
              <Text style={styles.moundLabel}>P</Text>
            </View>
          </View>
          
          <View style={styles.firstBase}>
            <View style={[styles.base, bases.first && styles.baseOccupied]}>
              <Text style={styles.baseLabel}>1st</Text>
              {bases.first && (
                <Text style={styles.playerName} numberOfLines={1}>
                  {bases.first.name.split(' ').pop()}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.homePlate}>
          <View style={styles.home}>
            <Text style={styles.homeLabel}>HOME</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  diamond: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  secondBase: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  middleRow: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    transform: [{ translateY: -40 }],
  },
  thirdBase: {
    marginLeft: 0,
  },
  firstBase: {
    marginRight: 0,
  },
  pitchersMound: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -25 }],
  },
  homePlate: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  base: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5dc',
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8b7355',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  baseOccupied: {
    backgroundColor: '#FFD700',
    borderColor: '#DAA520',
  },
  baseLabel: {
    transform: [{ rotate: '-45deg' }],
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  playerName: {
    transform: [{ rotate: '-45deg' }],
    fontSize: 10,
    color: '#333',
    marginTop: 4,
    maxWidth: 50,
  },
  mound: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8b7355',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#654321',
  },
  moundLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5f5dc',
  },
  home: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  homeLabel: {
    transform: [{ rotate: '-45deg' }],
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
});
