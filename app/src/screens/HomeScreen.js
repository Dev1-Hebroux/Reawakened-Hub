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

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>🔥 Reawakened</Text>
        <Text style={styles.heroSubtitle}>
          What God has done, He will do again
        </Text>
      </View>

      {/* Daily Devotional Card */}
      <TouchableOpacity
        style={styles.devotionalCard}
        onPress={() => navigation.navigate('Devotional')}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>TODAY'S DEVOTIONAL</Text>
          <Text style={styles.cardDate}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <Text style={styles.devotionalTitle}>
          "I felt my heart strangely warmed"
        </Text>
        <Text style={styles.devotionalAuthor}>— John Wesley, 1738</Text>
        <Text style={styles.devotionalPreview}>
          Before this moment, Wesley had been a minister for 13 years. He had all
          the credentials. But something was missing...
        </Text>
        <Text style={styles.readMore}>Read More →</Text>
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Week Journey</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>300+</Text>
          <Text style={styles.statLabel}>Years of Revival</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>24/7</Text>
          <Text style={styles.statLabel}>Prayer Network</Text>
        </View>
      </View>

      {/* Journey Progress */}
      <TouchableOpacity
        style={styles.progressCard}
        onPress={() => navigation.navigate('Journey')}
      >
        <Text style={styles.sectionTitle}>Your Journey</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
        <Text style={styles.progressText}>Week 3 of 12 • Foundations of Fire</Text>
        <Text style={styles.continueButton}>Continue →</Text>
      </TouchableOpacity>

      {/* Featured Revival */}
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Revival</Text>
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() =>
            navigation.navigate('Library', {
              screen: 'RevivalDetail',
              params: { id: 'welsh-1904', title: 'Welsh Revival 1904' },
            })
          }
        >
          <View style={styles.featuredImage}>
            <Text style={styles.featuredEmoji}>🏴󠁧󠁢󠁷󠁬󠁳󠁿</Text>
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>Welsh Revival 1904-05</Text>
            <Text style={styles.featuredSubtitle}>
              100,000 conversions in months
            </Text>
            <Text style={styles.featuredTeaser}>
              Discover how a 16-year-old girl's 14-word testimony sparked one of
              history's greatest awakenings...
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Prayer Challenge */}
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => navigation.navigate('Prayer')}
      >
        <Text style={styles.challengeTitle}>🙏 15-Minute Prayer Challenge</Text>
        <Text style={styles.challengeText}>
          Join thousands praying for revival. Start your streak today.
        </Text>
        <Text style={styles.challengeButton}>Join Challenge</Text>
      </TouchableOpacity>

      {/* Quote of the Day */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          "If Jesus Christ be God and died for me, then no sacrifice can be too
          great for me to make for Him."
        </Text>
        <Text style={styles.quoteAuthor}>— C.T. Studd</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Go be dangerous. 🔥</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  hero: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#A0A0B0',
    fontStyle: 'italic',
  },
  devotionalCard: {
    backgroundColor: '#1A1A2E',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
  },
  devotionalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  devotionalAuthor: {
    fontSize: 14,
    color: '#A0A0B0',
    marginBottom: 12,
  },
  devotionalPreview: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  readMore: {
    color: '#FF6B35',
    marginTop: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#1A1A2E',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2D2D44',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#888',
  },
  continueButton: {
    color: '#FF6B35',
    marginTop: 12,
    fontWeight: '600',
  },
  featuredSection: {
    padding: 16,
  },
  featuredCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    height: 120,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredEmoji: {
    fontSize: 60,
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  featuredSubtitle: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 4,
  },
  featuredTeaser: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    lineHeight: 20,
  },
  challengeCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  challengeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  challengeButton: {
    color: '#fff',
    marginTop: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  quoteCard: {
    backgroundColor: '#1A1A2E',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  quoteText: {
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
