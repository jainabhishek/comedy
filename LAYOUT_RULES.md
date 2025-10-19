# Layout Rules - Header & Main Container

## 🎯 Header Display Rules

### ❌ No Header (Clean Pages)

- **Homepage** (`/`) - Landing page
- **Auth Pages** (`/auth/*`) - Sign in, sign up, error pages

### ✅ Header Visible (App Pages)

- **Dashboard** (`/dashboard`)
- **Workshop** (`/workshop`)
- **Editor** (`/editor/[id]`)
- **Routines** (`/routines`)
- **Routine Builder** (`/routine/[id]`)
- All other authenticated app pages

## 📏 Main Container Rules

### Full Width (No Container, No Padding)

- **Homepage** (`/`) - Edge-to-edge content
- **Auth Pages** (`/auth/*`) - Clean sign-in experience

### Container Layout (Centered with Padding)

- **All App Pages** - Consistent `container mx-auto px-4 py-8`

## 🔧 Implementation

### ConditionalHeader Component

```typescript
const isHomepage = pathname === "/";
const isAuthPage = pathname.startsWith("/auth");

// Don't render header on homepage or auth pages
if (isHomepage || isAuthPage) {
  return null;
}
```

### ConditionalMain Component

```typescript
const isHomepage = pathname === "/";
const isAuthPage = pathname.startsWith("/auth");

// Homepage and auth pages: full width
if (isHomepage || isAuthPage) {
  return <main className="min-h-screen">{children}</main>;
}

// App pages: container with padding
return <main className="container mx-auto px-4 py-8 min-h-screen">{children}</main>;
```

## 📁 File Structure

```
components/layout/
├── header.tsx              # Main header component
├── conditional-header.tsx  # Conditionally render header
└── conditional-main.tsx    # Conditionally apply layout

app/
└── layout.tsx             # Root layout uses conditional components
```

## ✅ Result

### Sign-In Page (`/auth/signin`)

```
┌─────────────────────────────────┐
│                                 │ ← No header!
│     🎤 Tight 5                  │
│                                 │
│  Welcome Back, Comedian!        │
│                                 │
│  [Continue with Google]         │
│                                 │
└─────────────────────────────────┘
```

### App Pages (e.g., `/dashboard`)

```
┌─────────────────────────────────┐
│ 🎤 Tight 5 | Home | Dashboard   │ ← Header visible
├─────────────────────────────────┤
│   Centered Container Content    │
│   with padding                  │
└─────────────────────────────────┘
```

## 🎨 Design Benefits

1. **Clean Auth Experience** - No distracting navigation
2. **Professional Look** - Focused sign-in/sign-up flow
3. **Consistent App** - All authenticated pages have header
4. **Modern Design** - Full-width for marketing/auth pages
5. **Easy Maintenance** - One component controls all layout

---

**Your auth pages now have a clean, distraction-free design!** 🎉
