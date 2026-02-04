import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EPISODES = [
  {
    id: 'ep01',
    number: 1,
    title: 'The Pattern Nobody Talks About',
    theme: 'Prayer precedes every revival',
    duration: '12 min',
    description:
      'There is a pattern so consistent across 300 years of revival history that it should shake us awake. The Moravians, the Welsh, the Koreans — they all share one thing in common. And almost nobody talks about it.',
    sections: ['Intro', 'The Evidence', 'The Moravian Standard', 'The Uncomfortable Application', 'Closing Challenge'],
    scripture: 'Joel 2:28',
  },
  {
    id: 'ep02',
    number: 2,
    title: 'The Teenage Girl Who Changed Everything',
    theme: 'Simple testimony releases power',
    duration: '11 min',
    description:
      'Fourteen words. Spoken by a terrified sixteen-year-old girl in a tiny chapel in Wales. That moment ignited a revival that transformed an entire nation. Her name was Florrie Evans.',
    sections: ['Intro', 'The Setup', 'The Moment', 'What This Means For You', 'Closing Challenge'],
    scripture: 'Revelation 12:11',
  },
  {
    id: 'ep03',
    number: 3,
    title: 'When the Horses Got Confused',
    theme: 'True revival transforms society',
    duration: '10 min',
    description:
      'In the Welsh coal mines, pit ponies were trained to respond to cursing. During the revival, the miners stopped swearing — and the horses didn\'t know what to do. That\'s what real revival looks like.',
    sections: ['Intro', 'The Surface-Level Story', 'The Evidence Nobody Disputes', 'The Challenge', 'Closing'],
    scripture: '2 Chronicles 7:14',
  },
];

const PodcastScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Podcast Header */}
      <View style={styles.header}>
        <View style={styles.podcastArt}>
          <Text style={styles.podcastArtText}>R</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.podcastTitle}>The Reawakened One</Text>
          <Text style={styles.podcastHost}>with Abraham</Text>
          <Text style={styles.podcastTagline}>
            Learning from history to ignite the future
          </Text>
        </View>
      </View>

      <Text style={styles.podcastDescription}>
        Bold, prophetic deep-dives into 300 years of revival history. What God
        has done, He will do again.
      </Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{EPISODES.length}</Text>
          <Text style={styles.statLabel}>Episodes</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>S1</Text>
          <Text style={styles.statLabel}>Season</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>Weekly</Text>
          <Text style={styles.statLabel}>New Episodes</Text>
        </View>
      </View>

      {/* Latest Episode Feature */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest Episode</Text>
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() =>
            navigation.navigate('EpisodeDetail', { episode: EPISODES[EPISODES.length - 1] })
          }
        >
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>NEW</Text>
          </View>
          <Text style={styles.featuredEpNumber}>
            Episode {EPISODES[EPISODES.length - 1].number}
          </Text>
          <Text style={styles.featuredTitle}>
            {EPISODES[EPISODES.length - 1].title}
          </Text>
          <Text style={styles.featuredTheme}>
            {EPISODES[EPISODES.length - 1].theme}
          </Text>
          <View style={styles.featuredFooter}>
            <Text style={styles.featuredDuration}>
              {EPISODES[EPISODES.length - 1].duration}
            </Text>
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>Play</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* All Episodes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Episodes</Text>

        {[...EPISODES].reverse().map((episode) => (
          <TouchableOpacity
            key={episode.id}
            style={styles.episodeCard}
            onPress={() =>
              navigation.navigate('EpisodeDetail', { episode })
            }
          >
            <View style={styles.episodeNumber}>
              <Text style={styles.episodeNumberText}>{episode.number}</Text>
            </View>
            <View style={styles.episodeContent}>
              <Text style={styles.episodeTitle}>{episode.title}</Text>
              <Text style={styles.episodeTheme}>{episode.theme}</Text>
              <View style={styles.episodeMeta}>
                <Text style={styles.episodeDuration}>{episode.duration}</Text>
                <Text style={styles.episodeScripture}>{episode.scripture}</Text>
              </View>
            </View>
            <View style={styles.episodePlay}>
              <Text style={styles.episodePlayIcon}>{'>'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subscribe CTA */}
      <View style={styles.subscribeCard}>
        <Text style={styles.subscribeTitle}>Never Miss an Episode</Text>
        <Text style={styles.subscribeText}>
          New episodes drop weekly. Subscribe to get notified when Abraham goes
          live with a new deep-dive into revival history.
        </Text>
        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeButtonText}>Subscribe</Text>
        </TouchableOpacity>
      </View>

      {/* Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          "What God has done, He will do again."
        </Text>
        <Text style={styles.quoteSign}>Go be dangerous.</Text>
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
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    alignItems: 'center',
  },
  podcastArt: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  podcastArtText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  podcastHost: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 2,
  },
  podcastTagline: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  podcastDescription: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#A0A0B0',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  featuredCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    marginBottom: 16,
  },
  featuredBadge: {
    backgroundColor: '#FF6B35',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredEpNumber: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  featuredTheme: {
    fontSize: 14,
    color: '#A0A0B0',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDuration: {
    color: '#888',
    fontSize: 13,
  },
  playButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  episodeCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  episodeNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  episodeNumberText: {
    color: '#FF6B35',
    fontWeight: 'bold',
    fontSize: 16,
  },
  episodeContent: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  episodeTheme: {
    fontSize: 12,
    color: '#A0A0B0',
    marginTop: 3,
  },
  episodeMeta: {
    flexDirection: 'row',
    marginTop: 6,
  },
  episodeDuration: {
    fontSize: 11,
    color: '#888',
    marginRight: 12,
  },
  episodeScripture: {
    fontSize: 11,
    color: '#FF6B35',
  },
  episodePlay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  episodePlayIcon: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subscribeCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    alignItems: 'center',
  },
  subscribeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subscribeText: {
    fontSize: 13,
    color: '#A0A0B0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  subscribeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  subscribeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  quoteCard: {
    margin: 16,
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    alignItems: 'center',
  },
  quoteText: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quoteSign: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
});

export default PodcastScreen;
