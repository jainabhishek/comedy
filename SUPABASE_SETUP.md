# Supabase Setup Guide for Tight 5 Comedy App

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in with your account
3. Click **"New Project"**
4. Fill in the details:
   - **Name**: `tight-5-comedy` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is perfect for development
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to be provisioned

## Step 2: Get Database Connection String

1. In your Supabase project dashboard, click **"Settings"** (gear icon in sidebar)
2. Click **"Database"** in the settings menu
3. Scroll down to **"Connection string"** section
4. Select **"URI"** tab
5. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
6. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the password you created in Step 1

## Step 3: Add to Environment Variables

Add this to your `.env.local` file:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"

# For connection pooling (recommended for production)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Google OAuth (to be configured later)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl

# OpenAI (already configured)
OPENAI_API_KEY=your-existing-key
```

## Step 4: Enable Supabase Features (Optional but Recommended)

In your Supabase dashboard:

1. **Database**:
   - Automatic backups are enabled by default
   - Database size is visible in the UI

2. **Table Editor**:
   - You can view and edit tables directly in the UI
   - Useful for debugging

3. **SQL Editor**:
   - Run custom queries
   - View table structures

## Step 5: Generate NEXTAUTH_SECRET

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` in `.env.local`

## Next Steps

Once you've completed these steps:
1. ✅ Supabase project created
2. ✅ Database connection string added to `.env.local`
3. ✅ NEXTAUTH_SECRET generated and added

The setup script will automatically:
- Initialize Prisma with Supabase
- Create database schema
- Run migrations
- Set up authentication

## Useful Supabase Features

- **Database Backups**: Daily automatic backups (free tier)
- **Table Editor**: GUI for viewing/editing data
- **SQL Editor**: Run custom queries
- **API Auto-generated**: RESTful API (we won't use this, using Prisma instead)
- **Real-time**: Subscriptions to database changes (future feature)
- **Storage**: File storage (for future profile pictures)

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

