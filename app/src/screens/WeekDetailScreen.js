import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const WeekDetailScreen = ({ route }) => {
  const { weekData } = route.params || {};
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.weekNum}>WEEK {weekData?.number || 1}</Text>
        <Text style={styles.title}>{weekData?.title || 'Week Title'}</Text>
        <Text style={styles.subtitle}>{weekData?.subtitle || 'Subtitle'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📖 Scripture Focus</Text>
        <Text style={styles.scripture}>{weekData?.scripture || 'Scripture'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Historical Encounter</Text>
        <Text style={styles.body}>
          Based on: {weekData?.revival || 'Revival Story'}
          {"\n\n"}
          [Full week content would load here from the discipleship curriculum]
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Discussion Questions</Text>
        <Text style={styles.body}>1. Opening question{"\n"}2. Application question{"\n"}3. Challenge question</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 This Week's Assignment</Text>
        <Text style={styles.body}>Weekly activation assignment goes here.</Text>
      </View>
      <TouchableOpacity style={styles.completeButton}>
        <Text style={styles.completeButtonText}>Mark Week Complete ✓</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: { backgroundColor: '#1A1A2E', padding: 24, alignItems: 'center' },
  weekNum: { color: '#FF6B35', fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#888', fontSize: 14, marginTop: 8 },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A2E' },
  sectionTitle: { color: '#FF6B35', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  scripture: { color: '#fff', fontSize: 18, fontStyle: 'italic' },
  body: { color: '#A0A0B0', fontSize: 16, lineHeight: 24 },
  completeButton: { backgroundColor: '#FF6B35', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  completeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default WeekDetailScreen;
