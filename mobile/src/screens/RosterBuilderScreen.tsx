import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayerCard, HitterCard, PitcherCard } from '../models/Card';
import { searchCards, generateCard, ApiError } from '../api';

const MAX_ROSTER_POINTS = 5000;
const ROSTER_SIZE = 9;

export const RosterBuilderScreen: React.FC = () => {
  const [roster, setRoster] = useState<HitterCard[]>([]);
  const [pitcher, setPitcher] = useState<PitcherCard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchYear, setSearchYear] = useState('2024');
  const [searchResults, setSearchResults] = useState<PlayerCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalPoints = React.useMemo(() => {
    const rosterPoints = roster.reduce((sum, card) => sum + card.points, 0);
    const pitcherPoints = pitcher ? pitcher.points : 0;
    return rosterPoints + pitcherPoints;
  }, [roster, pitcher]);

  const canAddCard = (card: PlayerCard) => {
    if (card.playerType === 'Pitcher') {
      return !pitcher && totalPoints + card.points <= MAX_ROSTER_POINTS;
    }
    return roster.length < ROSTER_SIZE && totalPoints + card.points <= MAX_ROSTER_POINTS;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchCards({
        name: searchQuery,
        year: searchYear,
        limit: 20,
      });
      setSearchResults(results);

      if (results.length === 0) {
        Alert.alert('No Results', 'No cards found matching your search');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Search Failed', error.message);
      } else {
        Alert.alert('Error', 'Failed to search cards');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerate = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }

    setIsGenerating(true);
    try {
      const card = await generateCard(searchQuery, searchYear);
      setSearchResults([card]);
      Alert.alert('Success', `Generated card for ${card.name}`);
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Generation Failed', error.message);
      } else {
        Alert.alert('Error', 'Failed to generate card');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCard = (card: PlayerCard) => {
    if (!canAddCard(card)) {
      if (totalPoints + card.points > MAX_ROSTER_POINTS) {
        Alert.alert('Cannot Add', `Adding this card would exceed the ${MAX_ROSTER_POINTS} point limit`);
      } else if (card.playerType === 'Pitcher' && pitcher) {
        Alert.alert('Cannot Add', 'You already have a pitcher in your roster');
      } else {
        Alert.alert('Cannot Add', `Roster is full (${ROSTER_SIZE} players)`);
      }
      return;
    }

    if (card.playerType === 'Pitcher') {
      setPitcher(card as PitcherCard);
    } else {
      setRoster([...roster, card as HitterCard]);
    }
  };

  const handleRemoveHitter = (index: number) => {
    setRoster(roster.filter((_, i) => i !== index));
  };

  const handleRemovePitcher = () => {
    setPitcher(null);
  };

  const handleClearRoster = () => {
    Alert.alert(
      'Clear Roster',
      'Are you sure you want to clear your entire roster?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setRoster([]);
            setPitcher(null);
          },
        },
      ]
    );
  };

  const renderSearchResult = ({ item }: { item: PlayerCard }) => (
    <TouchableOpacity
      style={[
        styles.cardItem,
        !canAddCard(item) && styles.cardItemDisabled,
      ]}
      onPress={() => handleAddCard(item)}
      disabled={!canAddCard(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardPoints}>{item.points} pts</Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardDetail}>
          {item.year} • {item.playerType} • Command: {item.command}
        </Text>
      </View>
      {!canAddCard(item) && (
        <Text style={styles.cardDisabledText}>Cannot add to roster</Text>
      )}
    </TouchableOpacity>
  );

  const renderRosterHitter = ({ item, index }: { item: HitterCard; index: number }) => (
    <View style={styles.rosterItem}>
      <View style={styles.rosterItemContent}>
        <Text style={styles.rosterItemName}>
          {index + 1}. {item.name}
        </Text>
        <Text style={styles.rosterItemPoints}>{item.points} pts</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveHitter(index)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Roster Builder</Text>
        <Text style={styles.pointsCounter}>
          {totalPoints} / {MAX_ROSTER_POINTS} pts
        </Text>
      </View>

      <View style={styles.rosterSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Roster</Text>
          {(roster.length > 0 || pitcher) && (
            <TouchableOpacity onPress={handleClearRoster}>
              <Text style={styles.clearButton}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {pitcher && (
          <View style={styles.pitcherSection}>
            <Text style={styles.pitcherLabel}>Pitcher:</Text>
            <View style={styles.rosterItem}>
              <View style={styles.rosterItemContent}>
                <Text style={styles.rosterItemName}>{pitcher.name}</Text>
                <Text style={styles.rosterItemPoints}>{pitcher.points} pts</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemovePitcher}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.lineupLabel}>
          Lineup ({roster.length}/{ROSTER_SIZE}):
        </Text>
        {roster.length === 0 ? (
          <Text style={styles.emptyText}>No hitters added yet</Text>
        ) : (
          <FlatList
            data={roster}
            renderItem={renderRosterHitter}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            style={styles.rosterList}
          />
        )}
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Add Players</Text>
        <View style={styles.searchInputs}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="Player name"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
          />
          <TextInput
            style={[styles.input, styles.yearInput]}
            placeholder="Year"
            value={searchYear}
            onChangeText={setSearchYear}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
        <View style={styles.searchButtons}>
          <TouchableOpacity
            style={[styles.button, styles.searchButton]}
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Search</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.generateButton]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Generate</Text>
            )}
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              Results ({searchResults.length})
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              style={styles.resultsList}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  pointsCounter: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  rosterSection: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    padding: 12,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    color: '#d9534f',
    fontSize: 14,
    fontWeight: '600',
  },
  pitcherSection: {
    marginBottom: 16,
  },
  pitcherLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  lineupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  rosterList: {
    maxHeight: 200,
  },
  rosterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  rosterItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rosterItemName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  rosterItemPoints: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    marginLeft: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d9534f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchSection: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
  },
  searchInputs: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  nameInput: {
    flex: 1,
    marginRight: 8,
  },
  yearInput: {
    width: 80,
  },
  searchButtons: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  searchButton: {
    backgroundColor: '#5bc0de',
    marginRight: 8,
  },
  generateButton: {
    backgroundColor: '#5cb85c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  resultsList: {
    flex: 1,
  },
  cardItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardItemDisabled: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5cb85c',
  },
  cardDetails: {
    marginTop: 4,
  },
  cardDetail: {
    fontSize: 12,
    color: '#666',
  },
  cardDisabledText: {
    fontSize: 12,
    color: '#d9534f',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
