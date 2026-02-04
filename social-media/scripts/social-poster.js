/**
 * Reawakened Social Media Posting System
 *
 * This script handles posting to multiple social media platforms.
 * Supports: Twitter/X, Facebook, LinkedIn, Instagram (via Meta API)
 *
 * Setup:
 * 1. npm install twitter-api-v2 axios dotenv
 * 2. Create .env file with API keys (see .env.example)
 * 3. Run: node social-poster.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  contentLibraryPath: path.join(__dirname, '../content/revival-content-library.json'),
  contentLibraries: [
    path.join(__dirname, '../content/revival-content-library.json'),
    path.join(__dirname, '../content/revival-content-expanded.json'),
    path.join(__dirname, '../content/revival-content-abraham-voice.json'),
  ],
  exportPath: path.join(__dirname, '../exports'),
  logPath: path.join(__dirname, '../logs'),
};

// ============================================
// TWITTER/X POSTING
// ============================================

async function postToTwitter(content) {
  const { TwitterApi } = require('twitter-api-v2');

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    const tweet = await client.v2.tweet(content.platforms.twitter.text);
    console.log('✅ Posted to Twitter:', tweet.data.id);
    return { success: true, id: tweet.data.id, platform: 'twitter' };
  } catch (error) {
    console.error('❌ Twitter error:', error.message);
    return { success: false, error: error.message, platform: 'twitter' };
  }
}

// Twitter Thread posting
async function postTwitterThread(tweets) {
  const { TwitterApi } = require('twitter-api-v2');

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    let lastTweetId = null;
    const postedTweets = [];

    for (const tweetText of tweets) {
      const options = lastTweetId ? { reply: { in_reply_to_tweet_id: lastTweetId } } : {};
      const tweet = await client.v2.tweet(tweetText, options);
      lastTweetId = tweet.data.id;
      postedTweets.push(tweet.data.id);
    }

    console.log('✅ Posted Twitter thread:', postedTweets.length, 'tweets');
    return { success: true, ids: postedTweets, platform: 'twitter_thread' };
  } catch (error) {
    console.error('❌ Twitter thread error:', error.message);
    return { success: false, error: error.message, platform: 'twitter_thread' };
  }
}

// ============================================
// LINKEDIN POSTING
// ============================================

async function postToLinkedIn(content) {
  const axios = require('axios');

  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personId = process.env.LINKEDIN_PERSON_ID; // Your LinkedIn URN

  try {
    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.platforms.linkedin.text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    console.log('✅ Posted to LinkedIn:', response.data.id);
    return { success: true, id: response.data.id, platform: 'linkedin' };
  } catch (error) {
    console.error('❌ LinkedIn error:', error.response?.data || error.message);
    return { success: false, error: error.message, platform: 'linkedin' };
  }
}

// ============================================
// FACEBOOK PAGE POSTING
// ============================================

async function postToFacebook(content) {
  const axios = require('axios');

  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        message: content.platforms.facebook.text,
        access_token: accessToken
      }
    );

    console.log('✅ Posted to Facebook:', response.data.id);
    return { success: true, id: response.data.id, platform: 'facebook' };
  } catch (error) {
    console.error('❌ Facebook error:', error.response?.data || error.message);
    return { success: false, error: error.message, platform: 'facebook' };
  }
}

// ============================================
// INSTAGRAM (via Meta Business API)
// Note: Instagram API requires a Business account and approved app
// ============================================

async function postToInstagram(content, imageUrl) {
  const axios = require('axios');

  const igUserId = process.env.INSTAGRAM_USER_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  try {
    // Step 1: Create media container
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/media`,
      {
        image_url: imageUrl, // Must be a publicly accessible URL
        caption: content.platforms.instagram.caption,
        access_token: accessToken
      }
    );

    const containerId = containerResponse.data.id;

    // Step 2: Publish the container
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
      {
        creation_id: containerId,
        access_token: accessToken
      }
    );

    console.log('✅ Posted to Instagram:', publishResponse.data.id);
    return { success: true, id: publishResponse.data.id, platform: 'instagram' };
  } catch (error) {
    console.error('❌ Instagram error:', error.response?.data || error.message);
    return { success: false, error: error.message, platform: 'instagram' };
  }
}

// ============================================
// CONTENT LIBRARY FUNCTIONS
// ============================================

function loadContentLibrary() {
  // Load and merge all content libraries into one unified library
  let allPosts = [];
  for (const libPath of CONFIG.contentLibraries) {
    if (fs.existsSync(libPath)) {
      const data = JSON.parse(fs.readFileSync(libPath, 'utf8'));
      if (data.posts) allPosts = allPosts.concat(data.posts);
    }
  }
  return { posts: allPosts, meta: { totalPosts: allPosts.length } };
}

function saveContentLibrary(library) {
  fs.writeFileSync(CONFIG.contentLibraryPath, JSON.stringify(library, null, 2));
}

function getReadyPosts(library) {
  return library.posts.filter(post => post.status === 'ready');
}

function getPostById(library, id) {
  return library.posts.find(post => post.id === id);
}

function markAsPosted(library, postId, platform, result) {
  const post = library.posts.find(p => p.id === postId);
  if (post) {
    post.postedTo.push({
      platform,
      timestamp: new Date().toISOString(),
      success: result.success,
      postId: result.id || null,
      error: result.error || null
    });
    saveContentLibrary(library);
  }
}

// ============================================
// EXPORT FOR SCHEDULING TOOLS
// ============================================

function exportToCSV(library, platforms = ['twitter', 'instagram', 'facebook', 'linkedin']) {
  const readyPosts = getReadyPosts(library);

  let csv = 'Post ID,Platform,Content,Hashtags,Status\n';

  readyPosts.forEach(post => {
    platforms.forEach(platform => {
      if (post.platforms[platform]) {
        const content = post.platforms[platform].text || post.platforms[platform].caption || '';
        const escapedContent = `"${content.replace(/"/g, '""')}"`;
        const hashtags = post.content.hashtags.join(' ');
        csv += `${post.id},${platform},${escapedContent},"${hashtags}",${post.status}\n`;
      }
    });
  });

  const exportFile = path.join(CONFIG.exportPath, `content-export-${Date.now()}.csv`);
  fs.writeFileSync(exportFile, csv);
  console.log('📁 Exported to:', exportFile);
  return exportFile;
}

// Export for Buffer (specific format)
function exportToBuffer(library) {
  const readyPosts = getReadyPosts(library);
  const bufferFormat = [];

  readyPosts.forEach(post => {
    // Twitter
    if (post.platforms.twitter) {
      bufferFormat.push({
        text: post.platforms.twitter.text,
        profile: 'twitter',
        scheduled_at: '', // Add date for scheduling
      });
    }
    // Facebook
    if (post.platforms.facebook) {
      bufferFormat.push({
        text: post.platforms.facebook.text,
        profile: 'facebook',
        scheduled_at: '',
      });
    }
    // LinkedIn
    if (post.platforms.linkedin) {
      bufferFormat.push({
        text: post.platforms.linkedin.text,
        profile: 'linkedin',
        scheduled_at: '',
      });
    }
  });

  const exportFile = path.join(CONFIG.exportPath, `buffer-export-${Date.now()}.json`);
  fs.writeFileSync(exportFile, JSON.stringify(bufferFormat, null, 2));
  console.log('📁 Buffer export:', exportFile);
  return exportFile;
}

// ============================================
// MAIN POSTING FUNCTION
// ============================================

async function postContent(postId, platforms = ['twitter', 'linkedin', 'facebook']) {
  const library = loadContentLibrary();
  const post = getPostById(library, postId);

  if (!post) {
    console.error('Post not found:', postId);
    return;
  }

  console.log(`\n🚀 Posting: "${post.title}"\n`);

  const results = [];

  for (const platform of platforms) {
    if (!post.platforms[platform]) {
      console.log(`⏭️  Skipping ${platform} (no content)`);
      continue;
    }

    let result;
    switch (platform) {
      case 'twitter':
        result = await postToTwitter(post);
        break;
      case 'linkedin':
        result = await postToLinkedIn(post);
        break;
      case 'facebook':
        result = await postToFacebook(post);
        break;
      case 'instagram':
        // Instagram requires an image URL
        console.log('⏭️  Instagram requires image URL - use postToInstagram() directly');
        continue;
      default:
        console.log(`⏭️  Unknown platform: ${platform}`);
        continue;
    }

    results.push(result);
    markAsPosted(library, postId, platform, result);

    // Rate limiting - wait between posts
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
}

// ============================================
// CLI INTERFACE
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list':
      const library = loadContentLibrary();
      const readyPosts = getReadyPosts(library);
      console.log('\n📋 Ready Posts:\n');
      readyPosts.forEach(post => {
        console.log(`  [${post.id}] ${post.title} (${post.series})`);
      });
      console.log(`\n  Total: ${readyPosts.length} posts ready\n`);
      break;

    case 'post':
      const postId = args[1];
      const platforms = args[2] ? args[2].split(',') : ['twitter', 'linkedin', 'facebook'];
      if (!postId) {
        console.log('Usage: node social-poster.js post <post-id> [platforms]');
        console.log('Example: node social-poster.js post 001 twitter,linkedin');
        break;
      }
      await postContent(postId, platforms);
      break;

    case 'export':
      const format = args[1] || 'csv';
      const lib = loadContentLibrary();
      if (format === 'buffer') {
        exportToBuffer(lib);
      } else {
        exportToCSV(lib);
      }
      break;

    case 'preview':
      const previewId = args[1];
      const previewPlatform = args[2] || 'twitter';
      const previewLib = loadContentLibrary();
      const previewPost = getPostById(previewLib, previewId);
      if (previewPost && previewPost.platforms[previewPlatform]) {
        console.log(`\n📱 Preview for ${previewPlatform}:\n`);
        console.log(previewPost.platforms[previewPlatform].text || previewPost.platforms[previewPlatform].caption);
        console.log('\n');
      } else {
        console.log('Post or platform not found');
      }
      break;

    default:
      console.log(`
Reawakened Social Media Poster
==============================

Commands:
  list                    Show all ready posts
  post <id> [platforms]   Post to platforms (comma-separated)
  export [csv|buffer]     Export content for scheduling tools
  preview <id> [platform] Preview post content

Examples:
  node social-poster.js list
  node social-poster.js post 001 twitter,linkedin
  node social-poster.js export buffer
  node social-poster.js preview 001 instagram
      `);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

// Export functions for use as module
module.exports = {
  postToTwitter,
  postToLinkedIn,
  postToFacebook,
  postToInstagram,
  postTwitterThread,
  loadContentLibrary,
  exportToCSV,
  exportToBuffer,
  postContent,
};
