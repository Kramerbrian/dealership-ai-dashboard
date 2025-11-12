export async function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: CCBot',
    'Allow: /',
    '',
    'User-agent: anthropic-ai',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}

