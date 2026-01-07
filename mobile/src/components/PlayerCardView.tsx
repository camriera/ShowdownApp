import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PlayerCard, ChartEntry } from '../models/Card';

interface PlayerCardViewProps {
  card: PlayerCard;
}

export const PlayerCardView: React.FC<PlayerCardViewProps> = ({ card }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{card.name}</Text>
        <Text style={styles.year}>{card.year}</Text>
      </View>
      
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Team:</Text>
          <Text style={styles.value}>{card.team}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>
            {card.playerType === 'Pitcher' ? 'Control:' : 'On-Base:'}
          </Text>
          <Text style={styles.commandValue}>{card.command}</Text>
        </View>
        
        {card.playerType === 'Pitcher' && card.ip && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>IP:</Text>
            <Text style={styles.value}>{card.ip}</Text>
          </View>
        )}
        
        {card.playerType === 'Hitter' && card.speed && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Speed:</Text>
            <Text style={styles.value}>{card.speed}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Points:</Text>
          <Text style={styles.pointsValue}>{card.points}</Text>
        </View>
      </View>
      
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Chart (d20)</Text>
        <ScrollView style={styles.chartScroll}>
          {card.chart.map((entry, index) => (
            <View key={index} style={styles.chartRow}>
              <Text style={styles.chartRange}>
                {entry.range[0] === entry.range[1]
                  ? entry.range[0]
                  : `${entry.range[0]}-${entry.range[1]}`}
              </Text>
              <Text style={[styles.chartResult, getResultStyle(entry.result)]}>
                {entry.result}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const getResultStyle = (result: string) => {
  switch (result) {
    case 'HR':
      return styles.homeRun;
    case '3B':
    case '2B':
    case '1B':
    case '1B+':
      return styles.hit;
    case 'BB':
      return styles.walk;
    default:
      return styles.out;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#DC143C',
    paddingBottom: 12,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  year: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  info: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  commandValue: {
    fontSize: 18,
    color: '#DC143C',
    fontWeight: 'bold',
  },
  pointsValue: {
    fontSize: 16,
    color: '#1a472a',
    fontWeight: 'bold',
  },
  chartSection: {
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  chartScroll: {
    maxHeight: 200,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 4,
    borderRadius: 4,
  },
  chartRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
  },
  chartResult: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  homeRun: {
    color: '#FFD700',
  },
  hit: {
    color: '#228B22',
  },
  walk: {
    color: '#4169E1',
  },
  out: {
    color: '#DC143C',
  },
});
