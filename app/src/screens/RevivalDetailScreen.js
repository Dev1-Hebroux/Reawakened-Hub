import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const RevivalDetailScreen = ({ route }) => {
  const { revivalData } = route.params || {};
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{revivalData?.emoji || '🔥'}</Text>
        <Text style={styles.title}>{revivalData?.title || 'Revival'}</Text>
        <Text style={styles.meta}>{revivalData?.location} • {revivalData?.year}</Text>
      </View>
      <View style={styles.impactCard}>
        <Text style={styles.impactLabel}>IMPACT</Text>
        <Text style={styles.impactValue}>{revivalData?.impact || 'Impact'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Figures</Text>
        <View style={styles.figuresRow}>
          {(revivalData?.keyFigures || []).map((f, i) => (
            <View key={i} style={styles.figureTag}><Text style={styles.figureText}>{f}</Text></View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Lesson</Text>
        <Text style={styles.lesson}>{revivalData?.keyLesson || 'Lesson'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>The Story</Text>
        <Text style={styles.body}>[Full revival story would load here from the content library]</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        <Text style={styles.body}>What can we learn from this revival for today?</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: { backgroundColor: '#1A1A2E', padding: 32, alignItems: 'center' },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  meta: { color: '#888', fontSize: 14, marginTop: 8 },
  impactCard: { backgroundColor: '#FF6B35', margin: 16, padding: 20, borderRadius: 12, alignItems: 'center' },
  impactLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 2 },
  impactValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A2E' },
  sectionTitle: { color: '#FF6B35', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  figuresRow: { flexDirection: 'row', flexWrap: 'wrap' },
  figureTag: { backgroundColor: '#2D2D44', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  figureText: { color: '#fff', fontSize: 14 },
  lesson: { color: '#fff', fontSize: 18, fontStyle: 'italic', lineHeight: 26 },
  body: { color: '#A0A0B0', fontSize: 16, lineHeight: 24 },
});

export default RevivalDetailScreen;
