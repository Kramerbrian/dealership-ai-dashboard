const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing NextAuth imports for Clerk...');

// Files that should be disabled or converted
const authFiles = [
  'app/test-auth/page.tsx',
  'app/test-oauth/page.tsx',
  'app/signup/complete/page.tsx',
];

authFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = `'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
        {user ? (
          <div>
            <p className="text-green-600">✅ Authenticated</p>
            <p>User: {user.primaryEmailAddress?.emailAddress}</p>
          </div>
        ) : (
          <div>
            <p className="text-yellow-600">⚠️ Not authenticated</p>
            <a href="/dashboard" className="text-blue-600 underline">Go to Dashboard</a>
          </div>
        )}
      </div>
    </div>
  );
}`;

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${file}`);
  }
});

// Remove next-auth from SessionProvider
const sessionProvider = 'components/SessionProvider.tsx';
if (fs.existsSync(sessionProvider)) {
  const content = fs.readFileSync(sessionProvider, 'utf8');
  const newContent = content.replace(/next-auth\/react/g, '@clerk/nextjs');
  fs.writeFileSync(sessionProvider, newContent);
  console.log('✅ Fixed SessionProvider');
}

console.log('🎉 All NextAuth imports fixed!');
console.log('📋 Run: npm run build');
