import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const DevotionalScreen = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.date}>February 4, 2026</Text>
      <Text style={styles.title}>"I felt my heart strangely warmed"</Text>
      <Text style={styles.author}>— John Wesley, May 24, 1738</Text>
    </View>
    <View style={styles.content}>
      <Text style={styles.scripture}>
        "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come."
        {"\n\n"}— 2 Corinthians 5:17
      </Text>
      <Text style={styles.body}>
        Before May 24, 1738, John Wesley had been a minister for 13 years. He had crossed the Atlantic as a missionary. He had fasted, prayed, and served.
        {"\n\n"}
        But by his own admission, something was missing.
        {"\n\n"}
        That evening, at a small meeting on Aldersgate Street in London, while someone read from Martin Luther's preface to Romans, Wesley experienced what he called his "heart strangely warmed."
        {"\n\n"}
        He wrote: "I felt I did trust in Christ, Christ alone, for salvation; and an assurance was given me that He had taken away my sins, even mine."
        {"\n\n"}
        This moment launched a movement that today includes over 80 million people worldwide.
      </Text>
      <Text style={styles.challenge}>
        💡 Today's Challenge:{"\n\n"}
        Have you had your "Aldersgate moment"? Not just religious activity, but genuine encounter with Jesus?
        {"\n\n"}
        Ask God today: "Warm my heart. Make my faith REAL."
      </Text>
      <Text style={styles.prayer}>
        🙏 Closing Prayer:{"\n\n"}
        Lord, I don't want religion without relationship. I don't want activity without intimacy. Warm my heart today. Make my faith genuine. Transform me from the inside out. Amen.
      </Text>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: { backgroundColor: '#1A1A2E', padding: 24, alignItems: 'center' },
  date: { color: '#FF6B35', fontSize: 12, letterSpacing: 1, marginBottom: 12 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  author: { color: '#888', fontSize: 14, fontStyle: 'italic' },
  content: { padding: 20 },
  scripture: { backgroundColor: '#1A1A2E', padding: 20, borderRadius: 12, color: '#fff', fontSize: 16, fontStyle: 'italic', lineHeight: 24, borderLeftWidth: 4, borderLeftColor: '#FF6B35', marginBottom: 20 },
  body: { color: '#A0A0B0', fontSize: 16, lineHeight: 26, marginBottom: 20 },
  challenge: { backgroundColor: '#2D2D44', padding: 20, borderRadius: 12, color: '#fff', fontSize: 16, lineHeight: 24, marginBottom: 20 },
  prayer: { backgroundColor: '#1A1A2E', padding: 20, borderRadius: 12, color: '#A0A0B0', fontSize: 16, lineHeight: 24 },
});

export default DevotionalScreen;
