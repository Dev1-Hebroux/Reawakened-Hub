# Social Media Posting System - Setup Guide

## Quick Start

### Option A: Use Scheduling Tool (Easiest)

1. Export your content:
   ```bash
   cd social-media/scripts
   node social-poster.js export csv
   ```

2. Import the CSV into your scheduler:
   - **Buffer:** Import → Upload CSV
   - **Hootsuite:** Bulk Composer → Import
   - **Later:** Calendar → Import

3. Schedule and publish!

---

### Option B: Direct API Posting

#### Step 1: Install Dependencies
```bash
cd social-media/scripts
npm init -y
npm install twitter-api-v2 axios dotenv
```

#### Step 2: Configure API Keys

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get API credentials for each platform (see below)

3. Edit `.env` with your credentials

#### Step 3: Test & Post

```bash
# List available content
node social-poster.js list

# Preview a post
node social-poster.js preview 001 twitter

# Post to specific platforms
node social-poster.js post 001 twitter,linkedin
```

---

## Platform Setup Instructions

### Twitter/X API

1. Go to [developer.twitter.com](https://developer.twitter.com/)
2. Create a Developer Account (if needed)
3. Create a new Project and App
4. Generate API Keys:
   - API Key and Secret
   - Access Token and Secret
5. Ensure your app has **Read and Write** permissions

**Required Scopes:** `tweet.read`, `tweet.write`, `users.read`

### LinkedIn API

1. Go to [linkedin.com/developers](https://www.linkedin.com/developers/)
2. Create an App
3. Request access to **Share on LinkedIn** product
4. Generate Access Token (OAuth 2.0)
5. Get your Person ID from the API or profile URL

**Required Permissions:** `w_member_social`

### Facebook Page API

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Create an App (Business type)
3. Add **Facebook Login** and **Pages API** products
4. Get Page Access Token:
   - Go to Graph API Explorer
   - Select your Page
   - Generate Page Access Token
5. Get your Page ID from Page settings

**Required Permissions:** `pages_manage_posts`, `pages_read_engagement`

### Instagram (Business)

1. Connect Instagram to a Facebook Page
2. Convert to Business or Creator account
3. Use the same Meta App as Facebook
4. Get Instagram Business User ID via API
5. Use the same Page Access Token

**Required Permissions:** `instagram_basic`, `instagram_content_publish`

### TikTok (Limited)

TikTok's API has limited posting capabilities. Options:
1. Use their **Login Kit** + **Video Kit** for uploads
2. Manual posting with copy/paste from exports
3. Third-party tools (Later, Hootsuite have TikTok integration)

### YouTube

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a Project
3. Enable **YouTube Data API v3**
4. Create OAuth 2.0 credentials
5. Complete OAuth flow to get refresh token

---

## Content Management

### Adding New Posts

Edit `content/revival-content-library.json`:

```json
{
  "id": "006",
  "series": "did_you_know",
  "title": "Your Post Title",
  "theme": "theme_tag",
  "status": "ready",
  "content": {
    "hook": "Opening hook...",
    "body": "Main content...",
    "cta": "Call to action...",
    "hashtags": ["#Tag1", "#Tag2"]
  },
  "platforms": {
    "twitter": {
      "text": "Twitter-specific version (280 chars)..."
    },
    "instagram": {
      "caption": "Instagram caption with more hashtags..."
    }
    // Add other platforms...
  }
}
```

### Post Status Values

| Status | Meaning |
|--------|---------|
| `draft` | Still being written |
| `ready` | Approved, ready to post |
| `scheduled` | Has a scheduled date |
| `posted` | Already published |
| `archived` | No longer active |

---

## Scheduling Workflows

### Daily Posting Schedule

```
6:00 AM  - Instagram (best morning engagement)
12:00 PM - LinkedIn (lunch break viewing)
3:00 PM  - Facebook (afternoon peak)
6:00 PM  - Twitter (evening engagement)
8:00 PM  - TikTok (prime time)
```

### Weekly Content Mix

| Day | Content Type | Theme |
|-----|--------------|-------|
| Mon | "Did You Know?" | Historical fact |
| Tue | Quote Graphic | Inspiration |
| Wed | 60-sec Story | Key figure |
| Thu | Prayer Challenge | Engagement |
| Fri | Testimony/UGC | Community |
| Sat | This Day in History | Anniversary |
| Sun | Weekly Reflection | Deeper content |

---

## Automation Options

### Using n8n (Self-Hosted)

```
Trigger: Schedule (daily)
    ↓
Read: Content Library JSON
    ↓
Filter: Today's scheduled posts
    ↓
Post: To each platform
    ↓
Update: Mark as posted
```

### Using Zapier

```
Trigger: New row in Google Sheet
    ↓
Action: Post to Twitter
Action: Post to Facebook
Action: Post to LinkedIn
    ↓
Update: Sheet status
```

### Using GitHub Actions (Free)

Create `.github/workflows/post.yml`:
```yaml
name: Daily Social Post
on:
  schedule:
    - cron: '0 12 * * *'  # Daily at noon UTC
jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node social-poster.js post-scheduled
        env:
          TWITTER_API_KEY: ${{ secrets.TWITTER_API_KEY }}
          # ... other secrets
```

---

## Troubleshooting

### Common Issues

**"Rate limit exceeded"**
- Twitter: 50 tweets/24hr for free tier
- LinkedIn: 100 posts/day
- Solution: Space out posts, use scheduling

**"Invalid credentials"**
- Check `.env` file exists and is correct
- Regenerate access tokens if expired
- Verify app permissions

**"Post too long"**
- Twitter: 280 characters max
- LinkedIn: 3,000 characters max
- Use platform-specific versions in content library

---

## File Structure

```
social-media/
├── content/
│   └── revival-content-library.json    # All post content
├── scripts/
│   ├── social-poster.js                # Main posting script
│   ├── .env.example                    # API key template
│   └── .env                            # Your API keys (git-ignored)
├── exports/
│   └── [generated CSV/JSON exports]
├── assets/
│   └── [images, videos for posts]
└── SETUP-GUIDE.md                      # This file
```

---

## Next Steps

1. ✅ Choose your approach (scheduler vs direct API)
2. ✅ Set up API credentials for your platforms
3. ✅ Test with one post
4. ✅ Set up scheduling workflow
5. ✅ Create content production pipeline
6. ✅ Monitor and optimize

Need help? The content library has 5 ready-to-post items to test with!
