import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CommunityScreen = () => {
  const navigation = useNavigation();

  const testimonies = [
    {
      id: '1',
      name: 'Sarah M.',
      location: 'Texas, USA',
      preview: '"God answered our 6-month prayer for revival on our campus..."',
      likes: 247,
      time: '2 hours ago',
    },
    {
      id: '2',
      name: 'James K.',
      location: 'Seoul, Korea',
      preview: '"After studying the Pyongyang revival, our church started 5AM prayer..."',
      likes: 189,
      time: '5 hours ago',
    },
    {
      id: '3',
      name: 'Maria G.',
      location: 'Brazil',
      preview: '"The 12-week journey changed everything about how I pray..."',
      likes: 156,
      time: '1 day ago',
    },
  ];

  const groups = [
    {
      id: '1',
      name: 'Campus Firebrands',
      members: 1247,
      description: 'Students seeking revival on campuses',
    },
    {
      id: '2',
      name: 'Prayer Warriors',
      members: 892,
      description: 'Committed intercessors for revival',
    },
    {
      id: '3',
      name: 'History Learners',
      members: 634,
      description: 'Studying revival movements together',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Share Testimony CTA */}
      <TouchableOpacity
        style={styles.shareCard}
        onPress={() => navigation.navigate('Testimony')}
      >
        <Text style={styles.shareTitle}>📝 Share Your Story</Text>
        <Text style={styles.shareText}>
          Your testimony could spark faith in someone else
        </Text>
        <Text style={styles.shareButton}>Share Testimony →</Text>
      </TouchableOpacity>

      {/* Recent Testimonies */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Testimonies</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {testimonies.map((testimony) => (
          <TouchableOpacity key={testimony.id} style={styles.testimonyCard}>
            <View style={styles.testimonyHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {testimony.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.testimonyMeta}>
                <Text style={styles.testimonyName}>{testimony.name}</Text>
                <Text style={styles.testimonyLocation}>
                  📍 {testimony.location} • {testimony.time}
                </Text>
              </View>
            </View>
            <Text style={styles.testimonyPreview}>{testimony.preview}</Text>
            <View style={styles.testimonyFooter}>
              <Text style={styles.testimonylikes}>❤️ {testimony.likes}</Text>
              <Text style={styles.testimonyRead}>Read More →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Community Groups */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Join a Group</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Browse All</Text>
          </TouchableOpacity>
        </View>

        {groups.map((group) => (
          <TouchableOpacity key={group.id} style={styles.groupCard}>
            <View style={styles.groupIcon}>
              <Text style={styles.groupIconText}>🔥</Text>
            </View>
            <View style={styles.groupContent}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupDescription}>{group.description}</Text>
              <Text style={styles.groupMembers}>
                {group.members.toLocaleString()} members
              </Text>
            </View>
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Discussion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Discussions</Text>
        <View style={styles.discussionCard}>
          <Text style={styles.discussionTitle}>
            📣 What revival moment impacted you most?
          </Text>
          <Text style={styles.discussionMeta}>
            127 responses • Started by @Abraham
          </Text>
        </View>
        <View style={styles.discussionCard}>
          <Text style={styles.discussionTitle}>
            🙏 Share your prayer strategies for your campus
          </Text>
          <Text style={styles.discussionMeta}>
            89 responses • Started by @CampusFire
          </Text>
        </View>
      </View>

      {/* Scripture Prompt */}
      <View style={styles.verseCard}>
        <Text style={styles.verseText}>
          "They overcame him by the blood of the Lamb and by the word of their
          testimony."
        </Text>
        <Text style={styles.verseReference}>— Revelation 12:11</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  shareCard: {
    backgroundColor: '#FF6B35',
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  shareText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  shareButton: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 12,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAll: {
    color: '#FF6B35',
    fontSize: 14,
  },
  testimonyCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  testimonyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  testimonyMeta: {
    flex: 1,
  },
  testimonyName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  testimonyLocation: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  testimonyPreview: {
    color: '#A0A0B0',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  testimonyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  testimonylikes: {
    color: '#888',
    fontSize: 12,
  },
  testimonyRead: {
    color: '#FF6B35',
    fontSize: 12,
  },
  groupCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupIconText: {
    fontSize: 24,
  },
  groupContent: {
    flex: 1,
  },
  groupName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  groupDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  groupMembers: {
    color: '#FF6B35',
    fontSize: 11,
    marginTop: 4,
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  discussionCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  discussionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  discussionMeta: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  verseCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  verseText: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  verseReference: {
    color: '#FF6B35',
    fontSize: 14,
    marginTop: 12,
  },
});

export default CommunityScreen;
