import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const PrayerScreen = () => {
  const [prayerStreak, setPrayerStreak] = useState(7);
  const [todayPrayed, setTodayPrayed] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerActive(false);
      setTodayPrayed(true);
      setPrayerStreak((prev) => prev + 1);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const prayerGuides = [
    {
      id: '30day',
      title: '30-Day Revival Prayer',
      description: 'Personal revival journey through scripture',
      icon: '📅',
    },
    {
      id: 'korean',
      title: 'Tongsung Kido',
      description: 'Korean corporate prayer practice',
      icon: '🔊',
    },
    {
      id: 'moravian',
      title: '24/7 Prayer Watch',
      description: 'Sign up for your hour',
      icon: '⏰',
    },
    {
      id: 'scriptures',
      title: 'Revival Scriptures',
      description: 'Prayers and promises',
      icon: '📖',
    },
  ];

  const prayerPrompts = [
    'Pray for personal revival—"God, revive ME first"',
    'Pray for your local church and pastors',
    'Pray for your campus or workplace',
    'Pray for this generation to encounter God',
    'Pray for laborers for the harvest',
    'Pray for nations that need awakening',
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Prayer Timer */}
      <View style={styles.timerSection}>
        <Text style={styles.sectionTitle}>🙏 Daily Prayer</Text>
        <View style={styles.timerCard}>
          <Text style={styles.timerDisplay}>{formatTime(timeRemaining)}</Text>
          <Text style={styles.timerLabel}>
            {timerActive ? 'Praying...' : '15-Minute Challenge'}
          </Text>
          <TouchableOpacity
            style={[
              styles.timerButton,
              timerActive && styles.timerButtonActive,
            ]}
            onPress={() => setTimerActive(!timerActive)}
          >
            <Text style={styles.timerButtonText}>
              {timerActive ? 'Pause' : todayPrayed ? 'Completed ✓' : 'Start Prayer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Prayer Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakNumber}>{prayerStreak}</Text>
        <Text style={styles.streakLabel}>Day Prayer Streak 🔥</Text>
        <Text style={styles.streakEncouragement}>
          "The Moravians prayed for 100 years. Keep going!"
        </Text>
      </View>

      {/* Prayer Prompts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Prayer Focus</Text>
        <View style={styles.promptsContainer}>
          {prayerPrompts.map((prompt, index) => (
            <View key={index} style={styles.promptCard}>
              <Text style={styles.promptNumber}>{index + 1}</Text>
              <Text style={styles.promptText}>{prompt}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Prayer Guides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prayer Resources</Text>
        {prayerGuides.map((guide) => (
          <TouchableOpacity key={guide.id} style={styles.guideCard}>
            <Text style={styles.guideIcon}>{guide.icon}</Text>
            <View style={styles.guideContent}>
              <Text style={styles.guideTitle}>{guide.title}</Text>
              <Text style={styles.guideDescription}>{guide.description}</Text>
            </View>
            <Text style={styles.guideArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Global Prayer Network */}
      <View style={styles.networkCard}>
        <Text style={styles.networkTitle}>🌍 Global Prayer Network</Text>
        <Text style={styles.networkStats}>
          <Text style={styles.networkHighlight}>2,847</Text> people praying now
        </Text>
        <Text style={styles.networkText}>
          24/7 coverage across 47 countries
        </Text>
        <TouchableOpacity style={styles.networkButton}>
          <Text style={styles.networkButtonText}>Join the Watch</Text>
        </TouchableOpacity>
      </View>

      {/* Quote */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          "Every revival in history was preceded by extraordinary prayer."
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  timerSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  timerCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FF6B35',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: '#A0A0B0',
    marginTop: 8,
    marginBottom: 24,
  },
  timerButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  timerButtonActive: {
    backgroundColor: '#E55A2D',
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakCard: {
    backgroundColor: '#1A1A2E',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  streakLabel: {
    fontSize: 18,
    color: '#fff',
    marginTop: 4,
  },
  streakEncouragement: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  section: {
    padding: 16,
  },
  promptsContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  promptNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 12,
  },
  promptText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  guideCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  guideDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  guideArrow: {
    fontSize: 18,
    color: '#666',
  },
  networkCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  networkTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  networkStats: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  networkHighlight: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  networkText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  networkButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 16,
  },
  networkButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  quoteCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
  },
  quoteText: {
    fontSize: 16,
    color: '#A0A0B0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PrayerScreen;
