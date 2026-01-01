import { db } from '../server/db';
import { badges } from '../shared/schema';

const badgeDefinitions = [
  {
    code: 'FIRST_SPARK',
    name: 'First Spark',
    description: 'Completed your first daily devotional',
    iconUrl: null,
    criteriaJson: { type: 'sparks_viewed', value: 1 }
  },
  {
    code: 'STREAK_3',
    name: 'On Fire',
    description: 'Maintained a 3-day streak',
    iconUrl: null,
    criteriaJson: { type: 'streak', value: 3 }
  },
  {
    code: 'STREAK_7',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    iconUrl: null,
    criteriaJson: { type: 'streak', value: 7 }
  },
  {
    code: 'STREAK_14',
    name: 'Consistent',
    description: 'Maintained a 14-day streak',
    iconUrl: null,
    criteriaJson: { type: 'streak', value: 14 }
  },
  {
    code: 'STREAK_30',
    name: 'Champion',
    description: 'Completed the full 30-day DOMINION campaign',
    iconUrl: null,
    criteriaJson: { type: 'streak', value: 30 }
  },
  {
    code: 'EARLY_BIRD',
    name: 'Early Bird',
    description: 'Engaged with content before 7am',
    iconUrl: null,
    criteriaJson: { type: 'early_engagement', value: 7 }
  },
  {
    code: 'SHARER',
    name: 'Ambassador',
    description: 'Shared a spark with others',
    iconUrl: null,
    criteriaJson: { type: 'shares', value: 1 }
  },
  {
    code: 'REFLECTOR',
    name: 'Deep Thinker',
    description: 'Completed 5 reflection cards',
    iconUrl: null,
    criteriaJson: { type: 'reflections', value: 5 }
  },
  {
    code: 'CHALLENGER',
    name: 'Challenge Accepted',
    description: 'Completed all 5 weekly challenges',
    iconUrl: null,
    criteriaJson: { type: 'challenges', value: 5 }
  },
  {
    code: 'COMMUNITY',
    name: 'Community Builder',
    description: 'Posted in the community hub',
    iconUrl: null,
    criteriaJson: { type: 'posts', value: 1 }
  }
];

async function seedBadges() {
  console.log('Seeding badge definitions...');
  
  for (const badge of badgeDefinitions) {
    try {
      await db.insert(badges).values(badge).onConflictDoNothing();
      console.log(`✓ Badge: ${badge.name}`);
    } catch (error) {
      console.log(`- Skipped: ${badge.name} (may already exist)`);
    }
  }
  
  console.log('\nBadge seeding complete!');
  process.exit(0);
}

seedBadges().catch(console.error);
