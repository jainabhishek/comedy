# 🚀 Setup Instructions - Phase 15 Complete!

## ✅ What's Been Done

1. ✅ Installed all authentication and database dependencies
2. ✅ Created complete Prisma database schema
3. ✅ Configured NextAuth.js with Google OAuth
4. ✅ Created authentication middleware for protected routes
5. ✅ Built beautiful sign-in page with Google OAuth button
6. ✅ Created user menu component with avatar and logout
7. ✅ Updated header to show authenticated user

## 📋 What You Need to Do Next

### Step 1: Set Up Supabase Database (15 minutes)

Follow the guide in `SUPABASE_SETUP.md`:

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Sign up/login and create new project
   - Name: `tight-5-comedy`
   - Save the database password!
   - Wait for provisioning (~2-3 minutes)

2. **Get Database Connection String**
   - In project dashboard → Settings → Database
   - Copy the "URI" connection string
   - Replace `[YOUR-PASSWORD]` with your actual password

3. **Update `.env.local`**
   ```bash
   # Replace these lines in .env.local:
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
   ```

### Step 2: Set Up Google OAuth (10 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Create a new project or select existing one

2. **Enable Google+ API**
   - In left sidebar → APIs & Services → Library
   - Search for "Google+ API"
   - Click and enable it

3. **Create OAuth Credentials**
   - APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Tight 5 Comedy App"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Click "Create"
   - Copy Client ID and Client Secret

4. **Update `.env.local`**
   ```bash
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### Step 3: Generate NextAuth Secret

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Update `.env.local`:

```bash
NEXTAUTH_SECRET="paste-the-generated-secret-here"
```

### Step 4: Run Database Migrations

Once `.env.local` is configured, run:

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### Step 5: Test the Application

```bash
# Start the dev server
npm run dev
```

Visit http://localhost:3000 and you should:

1. Be redirected to `/auth/signin`
2. See the Google sign-in button
3. Click it and authenticate with your Google account
4. Be redirected back to the dashboard
5. See your avatar in the top-right corner

## 🎯 What's Next?

After completing these steps, you'll have:

- ✅ Full authentication working
- ✅ Database connected
- ✅ User accounts with Google OAuth
- ✅ Protected routes

**Remaining work:**

1. Update API routes to use database instead of LocalStorage
2. Migrate useJokes/useRoutines hooks to React Query
3. Create LocalStorage → Database migration tool
4. Test multi-user functionality

## 🐛 Troubleshooting

### "Error: Invalid `prisma.user.create()` invocation"

- Check DATABASE_URL is correct in `.env.local`
- Run `npx prisma migrate reset` and try again

### "Error: NextAuth configuration error"

- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- Check Google Console redirect URIs match exactly

### "Database connection error"

- Verify Supabase password is correct
- Check Supabase project is running
- Try pinging: `psql "your-connection-string" -c "SELECT 1"`

### "Session not persisting"

- Check NEXTAUTH_SECRET is generated and set
- Clear browser cookies and try again

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- NextAuth.js Docs: https://authjs.dev/
- Prisma Docs: https://www.prisma.io/docs
- Google OAuth Setup: https://support.google.com/cloud/answer/6158849

## ✨ Pro Tips

1. **Test in Incognito** - To test sign-in flow without cached sessions
2. **Use Prisma Studio** - Great visual database browser (`npx prisma studio`)
3. **Check Supabase Logs** - Real-time database logs in Supabase dashboard
4. **Generate Types** - After schema changes: `npx prisma generate`

## 🎉 You're Almost There!

Once these steps are complete, you'll have a fully functional multi-user comedy app with:

- Secure Google authentication
- Cloud database storage
- User-specific data isolation
- Professional auth UI

Next steps will migrate the LocalStorage data to database and update all the API routes!
