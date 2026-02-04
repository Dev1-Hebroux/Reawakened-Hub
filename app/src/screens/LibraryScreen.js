import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Revival Library Data
const REVIVALS = [
  {
    id: 'welsh-1904',
    title: 'Welsh Revival',
    year: '1904-1905',
    location: 'Wales, UK',
    impact: '100,000 conversions',
    keyFigures: ['Evan Roberts', 'Florrie Evans', 'Seth Joshua'],
    keyLesson: 'Simple testimony + Spirit-led gatherings',
    emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    category: 'european',
  },
  {
    id: 'moravian-1727',
    title: 'Moravian Revival',
    year: '1727+',
    location: 'Herrnhut, Germany',
    impact: '100-year prayer watch',
    keyFigures: ['Count Zinzendorf', 'August Spangenberg'],
    keyLesson: 'Sustained prayer fuels missions',
    emoji: '🇩🇪',
    category: 'european',
  },
  {
    id: 'pyongyang-1907',
    title: 'Pyongyang Revival',
    year: '1907',
    location: 'Korea',
    impact: '30,000 Christians in months',
    keyFigures: ['Kil Sun-ju', 'Missionaries'],
    keyLesson: 'Corporate prayer + public confession',
    emoji: '🇰🇷',
    category: 'asian',
  },
  {
    id: 'methodist-1738',
    title: 'Methodist Revival',
    year: '1730s-1790s',
    location: 'England',
    impact: '72,000 members, now 80M+',
    keyFigures: ['John Wesley', 'Charles Wesley', 'George Whitefield'],
    keyLesson: 'Small groups scale discipleship',
    emoji: '🇬🇧',
    category: 'european',
  },
  {
    id: 'asbury-2023',
    title: 'Asbury 2023',
    year: '2023',
    location: 'Kentucky, USA',
    impact: '18 days continuous worship',
    keyFigures: ['Student-led'],
    keyLesson: 'Campuses as revival launching pads',
    emoji: '🇺🇸',
    category: 'modern',
  },
  {
    id: 'mukti-1905',
    title: 'Mukti Revival',
    year: '1905',
    location: 'India',
    impact: 'Women-led transformation',
    keyFigures: ['Pandita Ramabai'],
    keyLesson: 'Women as revival catalysts',
    emoji: '🇮🇳',
    category: 'asian',
  },
  {
    id: 'cambridge-1885',
    title: 'Cambridge Seven',
    year: '1885',
    location: 'England/China',
    impact: 'Sparked student missions movement',
    keyFigures: ['C.T. Studd', 'Stanley Smith'],
    keyLesson: 'Elite influence for missions',
    emoji: '🏫',
    category: 'student',
  },
  {
    id: 'svm-1886',
    title: 'Student Volunteer Movement',
    year: '1886+',
    location: 'USA/Global',
    impact: '20,500 missionaries sent',
    keyFigures: ['Robert Wilder', 'John R. Mott'],
    keyLesson: 'Clear watchword mobilizes generation',
    emoji: '🎓',
    category: 'student',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'european', label: 'UK/Europe' },
  { id: 'asian', label: 'Asia' },
  { id: 'student', label: 'Student' },
  { id: 'modern', label: 'Modern' },
];

const LibraryScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRevivals = REVIVALS.filter((revival) => {
    const matchesCategory =
      activeCategory === 'all' || revival.category === activeCategory;
    const matchesSearch =
      revival.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revival.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ScrollView style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search revivals..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <Text style={styles.resultsCount}>
        {filteredRevivals.length} revivals found
      </Text>

      {/* Revival Cards */}
      {filteredRevivals.map((revival) => (
        <TouchableOpacity
          key={revival.id}
          style={styles.revivalCard}
          onPress={() =>
            navigation.navigate('RevivalDetail', {
              id: revival.id,
              title: revival.title,
              revivalData: revival,
            })
          }
        >
          <View style={styles.revivalHeader}>
            <Text style={styles.revivalEmoji}>{revival.emoji}</Text>
            <View style={styles.revivalMeta}>
              <Text style={styles.revivalTitle}>{revival.title}</Text>
              <Text style={styles.revivalLocation}>
                📍 {revival.location} • {revival.year}
              </Text>
            </View>
          </View>
          <Text style={styles.revivalImpact}>🔥 {revival.impact}</Text>
          <Text style={styles.revivalLesson}>
            <Text style={styles.lessonLabel}>Key Lesson: </Text>
            {revival.keyLesson}
          </Text>
          <View style={styles.revivalFigures}>
            {revival.keyFigures.map((figure, index) => (
              <View key={index} style={styles.figureTag}>
                <Text style={styles.figureText}>{figure}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.readMore}>Explore →</Text>
        </TouchableOpacity>
      ))}

      {/* Six Pillars */}
      <View style={styles.pillarsSection}>
        <Text style={styles.sectionTitle}>Six Pillars of Revival</Text>
        <Text style={styles.sectionSubtitle}>
          Patterns extracted from 300 years of history
        </Text>
        {[
          { num: 1, title: 'Sustained Prayer', desc: 'Every revival preceded by extraordinary prayer' },
          { num: 2, title: 'Youth Catalysts', desc: 'Young people (under 35) ignite movements' },
          { num: 3, title: 'Small Group Accountability', desc: "Wesley's classes, Spener's collegia" },
          { num: 4, title: 'Cross-Class Accessibility', desc: 'Reaches all social strata' },
          { num: 5, title: 'International Networks', desc: 'Revival spreads through connections' },
          { num: 6, title: 'Social Transformation', desc: 'True revival changes society' },
        ].map((pillar) => (
          <View key={pillar.num} style={styles.pillarCard}>
            <Text style={styles.pillarNumber}>{pillar.num}</Text>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>{pillar.title}</Text>
              <Text style={styles.pillarDesc}>{pillar.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: '#1A1A2E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  resultsCount: {
    color: '#666',
    fontSize: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  revivalCard: {
    backgroundColor: '#1A1A2E',
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
  },
  revivalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  revivalEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  revivalMeta: {
    flex: 1,
  },
  revivalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  revivalLocation: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  revivalImpact: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 8,
  },
  revivalLesson: {
    fontSize: 14,
    color: '#A0A0B0',
    lineHeight: 20,
  },
  lessonLabel: {
    color: '#888',
    fontWeight: '600',
  },
  revivalFigures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  figureTag: {
    backgroundColor: '#2D2D44',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  figureText: {
    color: '#A0A0B0',
    fontSize: 12,
  },
  readMore: {
    color: '#FF6B35',
    marginTop: 12,
    fontWeight: '600',
  },
  pillarsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  pillarCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillarNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: 'bold',
    marginRight: 12,
  },
  pillarContent: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  pillarDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default LibraryScreen;
