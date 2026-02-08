# Audio Generation Quick Start Guide

## 🚀 Initial Setup (First Time Only)

After deploying the audio generation system, you need to manually trigger the first batch of audio generation. The automated jobs will maintain it after that.

### Method 1: Using Admin API (Recommended)

1. **Log in as super admin** at https://reawakened.app
2. **Open browser console** (F12 → Console tab)
3. **Run this command**:

```javascript
await fetch('/api/admin/spark-audio/generate-all', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ force: false, concurrency: 3 }),
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

This will start generating audio for all sparks that don't have audio yet.

### Method 2: Using Fly SSH

```bash
# Deploy the code first
flyctl deploy --remote-only --app reawakened-hub

# Wait for deployment to complete, then SSH in
flyctl ssh console --app reawakened-hub

# Inside the SSH session:
node /app/generate-audio-now.mjs
```

---

## ⏰ Automated Jobs (Runs Automatically)

Once the initial batch is generated, these jobs keep everything up to date:

| Job | Schedule | What It Does |
|-----|----------|--------------|
| **Weekly Pre-Generation** | Sunday 23:00 | Generates audio for next 7 days |
| **Pre-Release Verification** | Daily 04:30 | Checks audio is ready 30 mins before 05:00 release |
| **Startup Check** | 10s after boot | Catches up on any missing audio |

---

## ✅ Verify Audio is Working

1. Visit: https://reawakened.app/spark/1399
2. Click "Listen to Devotional" button
3. Audio should start playing within 1-2 seconds

---

## 🔍 Check Generation Status

### Via Admin API
```javascript
await fetch('/api/admin/spark-audio/status', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### Via Logs
```bash
flyctl logs --app reawakened-hub | grep audio-jobs
```

---

## 🐛 Troubleshooting

### Audio Still Not Playing After Initial Generation?

1. **Check if generation completed**:
   - Look for log messages like "Audio generation complete"
   - Status should show audio URLs for recent sparks

2. **Manually generate specific spark**:
   ```javascript
   await fetch('/api/admin/spark-audio/generate/1399', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ force: true }),
     credentials: 'include'
   }).then(r => r.json()).then(console.log);
   ```

3. **Verify API keys are set**:
   ```bash
   flyctl secrets list --app reawakened-hub
   # Should show: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
   ```

---

## 📊 Expected Timeline

- **Initial generation** (all historical sparks): 30-60 minutes
- **Weekly job** (7 days = ~42 sparks): 5-10 minutes
- **Single spark generation**: 10-30 seconds

---

## 💡 Pro Tips

1. **Run initial generation during off-peak hours** (generates ~264 audio files)
2. **Monitor first few runs** to ensure jobs are working
3. **Check logs after scheduled job times** to verify execution
4. **Keep concurrency at 3** to avoid rate limits

---

## 🎯 Quick Command Reference

```bash
# Check if jobs are registered
flyctl ssh console --app reawakened-hub -C "curl http://localhost:8080/api/jobs/status"

# View audio generation logs
flyctl logs --app reawakened-hub --region lhr | grep -i audio

# Manually trigger weekly generation (via browser console as admin)
await fetch('/api/admin/spark-audio/generate-all', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ concurrency: 3 }),
  credentials: 'include'
}).then(r => r.json());

# Check specific spark audio
await fetch('/api/sparks/1399/audio').then(r => r.json()).then(console.log);
```

---

**Remember**: After the initial batch generation, everything runs automatically. You don't need to do anything else!

The system will:
- ✅ Generate audio for new sparks every Sunday
- ✅ Verify audio quality before each day's release
- ✅ Auto-repair any missing or corrupted audio
- ✅ Handle everything with zero manual intervention

🎉 **That's it! Your audio system is now fully automated.**
