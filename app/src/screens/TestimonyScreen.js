import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const TestimonyScreen = () => {
  const [testimony, setTestimony] = useState('');
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Share Your Story</Text>
        <Text style={styles.subtitle}>
          "They overcame him by the blood of the Lamb and by the word of their testimony." — Rev 12:11
        </Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Your Testimony</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={8}
          placeholder="What has God done in your life? How has studying revival history impacted you?"
          placeholderTextColor="#666"
          value={testimony}
          onChangeText={setTestimony}
        />
        <Text style={styles.hint}>
          💡 Tip: Florrie Evans sparked revival with just 14 words. Keep it simple and real.
        </Text>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Share Testimony</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inspiration}>
        <Text style={styles.inspirationTitle}>14 Words That Changed a Nation</Text>
        <Text style={styles.inspirationQuote}>
          "I love Jesus Christ with all my heart—he died for me."
        </Text>
        <Text style={styles.inspirationAuthor}>— Florrie Evans, 1904</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: { backgroundColor: '#1A1A2E', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  form: { padding: 20 },
  label: { color: '#FF6B35', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#1A1A2E', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, minHeight: 150, textAlignVertical: 'top' },
  hint: { color: '#888', fontSize: 12, marginTop: 12, fontStyle: 'italic' },
  submitButton: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  inspiration: { backgroundColor: '#1A1A2E', margin: 20, padding: 24, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#FF6B35' },
  inspirationTitle: { color: '#888', fontSize: 12, marginBottom: 12 },
  inspirationQuote: { color: '#fff', fontSize: 18, fontStyle: 'italic', lineHeight: 26 },
  inspirationAuthor: { color: '#FF6B35', fontSize: 14, marginTop: 12 },
});

export default TestimonyScreen;
