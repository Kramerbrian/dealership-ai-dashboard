// Disabled for Clerk integration
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(JSON.stringify({ message: 'Disabled for Clerk integration' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'Disabled for Clerk integration' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
