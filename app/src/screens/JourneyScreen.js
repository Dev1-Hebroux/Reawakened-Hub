import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Journey curriculum data from discipleship-curriculum-revivalists-journey.md
const JOURNEY_DATA = {
  modules: [
    {
      id: 'module1',
      title: 'Foundations of Fire',
      weeks: [
        {
          id: 'week1',
          number: 1,
          title: 'The Heart Set Aflame',
          subtitle: 'Conversion & Encounter',
          revival: 'Wesley\'s Aldersgate',
          scripture: '2 Corinthians 5:17',
          completed: true,
        },
        {
          id: 'week2',
          number: 2,
          title: 'Methodical Devotion',
          subtitle: 'Spiritual Disciplines',
          revival: 'Holy Club Methods',
          scripture: '1 Timothy 4:7-8',
          completed: true,
        },
        {
          id: 'week3',
          number: 3,
          title: 'The Small Group Revolution',
          subtitle: 'Accountability & Community',
          revival: 'Wesley\'s Class Meetings',
          scripture: 'Hebrews 10:24-25',
          completed: false,
          current: true,
        },
      ],
    },
    {
      id: 'module2',
      title: 'Prayer Foundation',
      weeks: [
        {
          id: 'week4',
          number: 4,
          title: 'When Prayer Precedes Revival',
          subtitle: 'The Pattern of History',
          revival: 'Khasi Hills 1905',
          scripture: '2 Chronicles 7:14',
          completed: false,
        },
        {
          id: 'week5',
          number: 5,
          title: 'The Sound of Many Waters',
          subtitle: 'Corporate Prayer',
          revival: 'Pyongyang 1907',
          scripture: 'Acts 4:31',
          completed: false,
        },
        {
          id: 'week6',
          number: 6,
          title: 'The 24/7 Watch',
          subtitle: 'Sustained Prayer',
          revival: 'Moravians 1727',
          scripture: 'Luke 18:1',
          completed: false,
        },
      ],
    },
    {
      id: 'module3',
      title: 'Student Fire',
      weeks: [
        {
          id: 'week7',
          number: 7,
          title: 'Young Voices, Mighty Impact',
          subtitle: 'Testimony & Witness',
          revival: 'Florrie Evans 1904',
          scripture: 'Revelation 12:11',
          completed: false,
        },
        {
          id: 'week8',
          number: 8,
          title: 'The Cambridge Seven Call',
          subtitle: 'Sacrifice & Missions',
          revival: 'Cambridge Seven 1885',
          scripture: 'Matthew 16:24-25',
          completed: false,
        },
        {
          id: 'week9',
          number: 9,
          title: 'The Watchword Generation',
          subtitle: 'Movement Vision',
          revival: 'Student Volunteer Movement',
          scripture: 'Matthew 28:19-20',
          completed: false,
        },
      ],
    },
    {
      id: 'module4',
      title: 'Social Transformation',
      weeks: [
        {
          id: 'week10',
          number: 10,
          title: 'The Clapham Calling',
          subtitle: 'Justice & Advocacy',
          revival: 'Clapham Sect',
          scripture: 'Micah 6:8',
          completed: false,
        },
        {
          id: 'week11',
          number: 11,
          title: 'Mines, Mills & Missions',
          subtitle: 'Workplace Witness',
          revival: 'Welsh Miners',
          scripture: 'Colossians 3:23',
          completed: false,
        },
        {
          id: 'week12',
          number: 12,
          title: 'Building What Lasts',
          subtitle: 'Institution & Legacy',
          revival: 'YMCA & Movements',
          scripture: '1 Corinthians 3:10-14',
          completed: false,
        },
      ],
    },
  ],
};

const WeekCard = ({ week, onPress }) => (
  <TouchableOpacity
    style={[
      styles.weekCard,
      week.completed && styles.weekCardCompleted,
      week.current && styles.weekCardCurrent,
    ]}
    onPress={onPress}
  >
    <View style={styles.weekNumber}>
      <Text style={styles.weekNumberText}>
        {week.completed ? '✓' : week.number}
      </Text>
    </View>
    <View style={styles.weekContent}>
      <Text style={styles.weekTitle}>{week.title}</Text>
      <Text style={styles.weekSubtitle}>{week.subtitle}</Text>
      <Text style={styles.weekRevival}>📍 {week.revival}</Text>
    </View>
    <Text style={styles.weekArrow}>→</Text>
  </TouchableOpacity>
);

const JourneyScreen = () => {
  const navigation = useNavigation();

  const handleWeekPress = (week) => {
    navigation.navigate('WeekDetail', {
      weekId: week.id,
      title: `Week ${week.number}`,
      weekData: week,
    });
  };

  const completedWeeks = JOURNEY_DATA.modules.reduce(
    (acc, module) => acc + module.weeks.filter((w) => w.completed).length,
    0
  );
  const totalWeeks = 12;

  return (
    <ScrollView style={styles.container}>
      {/* Progress Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Revivalist's Journey</Text>
        <Text style={styles.headerSubtitle}>
          12 weeks to understand revival history and ignite your fire
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedWeeks / totalWeeks) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedWeeks}/{totalWeeks} weeks complete
          </Text>
        </View>
      </View>

      {/* Modules */}
      {JOURNEY_DATA.modules.map((module, moduleIndex) => (
        <View key={module.id} style={styles.moduleContainer}>
          <View style={styles.moduleHeader}>
            <Text style={styles.moduleNumber}>MODULE {moduleIndex + 1}</Text>
            <Text style={styles.moduleTitle}>{module.title}</Text>
          </View>
          {module.weeks.map((week) => (
            <WeekCard
              key={week.id}
              week={week}
              onPress={() => handleWeekPress(week)}
            />
          ))}
        </View>
      ))}

      {/* Footer CTA */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          "What God has done, He will do again."
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
  header: {
    backgroundColor: '#1A1A2E',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A0A0B0',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
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
    fontSize: 12,
    color: '#888',
  },
  moduleContainer: {
    padding: 16,
  },
  moduleHeader: {
    marginBottom: 16,
  },
  moduleNumber: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  weekCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  weekCardCompleted: {
    borderColor: '#4CAF50',
    opacity: 0.8,
  },
  weekCardCurrent: {
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  weekNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  weekNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  weekContent: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  weekSubtitle: {
    fontSize: 12,
    color: '#A0A0B0',
    marginBottom: 4,
  },
  weekRevival: {
    fontSize: 11,
    color: '#FF6B35',
  },
  weekArrow: {
    fontSize: 18,
    color: '#666',
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

export default JourneyScreen;
