# DealershipAI Tesla Cognitive Interface
# Deploy to Vercel + GitHub

## STEP 1: Create Next.js Project

```bash
npx create-next-app@14 dealershipai --typescript --tailwind --app
cd dealershipai
```

## STEP 2: Install Dependencies

```bash
npm install zustand framer-motion @tanstack/react-query lucide-react recharts date-fns
```

## STEP 3: Copy Files from This Export

Use Cursor Agent:

1. Open Cursor
2. Press Cmd/Ctrl + K
3. Paste: "@import Create DealershipAI Tesla Cognitive Interface from CURSOR_IMPORT.tsx"
4. Let Cursor generate all files

## STEP 4: Initialize Git

```bash
git init
git add .
git commit -m "Initial commit: DealershipAI Tesla Cognitive Interface"
```

## STEP 5: Push to GitHub

```bash
gh repo create dealershipai --public --source=. --remote=origin --push
```

## STEP 6: Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Or use Vercel Dashboard:

1. Import GitHub repo
2. Add environment variables
3. Deploy

## STEP 7: Add Environment Variables in Vercel

- ELEVENLABS_API_KEY
- NEXT_PUBLIC_DAI_AGENT_ID
- DATABASE_URL
- REDIS_URL
- ANTHROPIC_API_KEY
- OPENAI_API_KEY

## STEP 8: Configure Custom Domain

- dealershipai.com → Vercel project
- Update NEXT_PUBLIC_APP_URL

Done! 🚀

