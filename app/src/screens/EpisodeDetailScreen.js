import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const EpisodeDetailScreen = ({ route }) => {
  const { episode } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // TODO: Integrate expo-av Audio.Sound for actual playback
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Episode Header */}
      <View style={styles.header}>
        <Text style={styles.epNumber}>Episode {episode.number}</Text>
        <Text style={styles.title}>{episode.title}</Text>
        <Text style={styles.theme}>{episode.theme}</Text>
      </View>

      {/* Player Card */}
      <View style={styles.playerCard}>
        {/* Podcast Art */}
        <View style={styles.playerArt}>
          <Text style={styles.playerArtNumber}>{episode.number}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.progressTimes}>
            <Text style={styles.progressTime}>{formatTime(0)}</Text>
            <Text style={styles.progressTime}>{episode.duration}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setCurrentSection(Math.max(0, currentSection - 1))}
          >
            <Text style={styles.controlIcon}>{'<<'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playControl} onPress={togglePlay}>
            <Text style={styles.playIcon}>{isPlaying ? '||' : '>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() =>
              setCurrentSection(
                Math.min(episode.sections.length - 1, currentSection + 1)
              )
            }
          >
            <Text style={styles.controlIcon}>{'>>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Current Section */}
        <Text style={styles.currentSectionLabel}>
          Now: {episode.sections[currentSection]}
        </Text>
      </View>

      {/* Episode Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Episode</Text>
        <Text style={styles.description}>{episode.description}</Text>
      </View>

      {/* Scripture */}
      <View style={styles.scriptureCard}>
        <Text style={styles.scriptureLabel}>Key Scripture</Text>
        <Text style={styles.scriptureRef}>{episode.scripture}</Text>
      </View>

      {/* Sections List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sections</Text>
        {episode.sections.map((sec, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sectionItem,
              index === currentSection && styles.sectionItemActive,
            ]}
            onPress={() => setCurrentSection(index)}
          >
            <View
              style={[
                styles.sectionDot,
                index === currentSection && styles.sectionDotActive,
              ]}
            />
            <Text
              style={[
                styles.sectionItemText,
                index === currentSection && styles.sectionItemTextActive,
              ]}
            >
              {sec}
            </Text>
            {index === currentSection && (
              <Text style={styles.nowPlaying}>Playing</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Challenge Card */}
      <View style={styles.challengeCard}>
        <Text style={styles.challengeTitle}>This Week's Challenge</Text>
        <Text style={styles.challengeText}>
          {episode.number === 1 &&
            'Set aside 15 minutes a day to pray specifically for revival. Pray: "God, revive ME first."'}
          {episode.number === 2 &&
            'Tell someone your story this week. Not the religious version — the REAL version. Just one person.'}
          {episode.number === 3 &&
            'Pray for TRANSFORMATION — not just salvation. Pray that God would change hearts so completely that the secular world can\'t deny it.'}
        </Text>
      </View>

      {/* Sign-off */}
      <View style={styles.signoff}>
        <Text style={styles.signoffQuote}>
          "What God has done, He will do again."
        </Text>
        <Text style={styles.signoffTag}>Go be dangerous.</Text>
        <Text style={styles.signoffName}>— Abraham</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  epNumber: {
    color: '#FF6B35',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  theme: {
    fontSize: 14,
    color: '#A0A0B0',
    fontStyle: 'italic',
  },
  playerCard: {
    margin: 16,
    marginTop: 4,
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  playerArt: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  playerArtNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#2D2D44',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  progressTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressTime: {
    color: '#888',
    fontSize: 11,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  controlIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playControl: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  currentSectionLabel: {
    color: '#A0A0B0',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#A0A0B0',
    lineHeight: 22,
  },
  scriptureCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scriptureLabel: {
    color: '#888',
    fontSize: 12,
  },
  scriptureRef: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  sectionItemActive: {
    backgroundColor: '#1A1A2E',
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D2D44',
    marginRight: 12,
  },
  sectionDotActive: {
    backgroundColor: '#FF6B35',
  },
  sectionItemText: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  sectionItemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  nowPlaying: {
    color: '#FF6B35',
    fontSize: 11,
    fontWeight: '600',
  },
  challengeCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  challengeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  signoff: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  signoffQuote: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  signoffTag: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  signoffName: {
    color: '#888',
    fontSize: 12,
    marginTop: 6,
  },
});

export default EpisodeDetailScreen;
