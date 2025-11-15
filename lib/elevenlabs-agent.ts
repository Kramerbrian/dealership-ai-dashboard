// @ts-ignore
import { ElevenLabsClient } from '@elevenlabs/client';

/**
 * Initialize ElevenLabs Agents Platform client
 */
export function getElevenLabsAgentClient() {
  const agentId = process.env.ELEVENLABS_AGENT_ID || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const conversationSignature = process.env.ELEVENLABS_CONVERSATION_SIGNATURE || process.env.NEXT_PUBLIC_ELEVENLABS_CONVERSATION_SIGNATURE;

  if (!agentId || !conversationSignature) {
    throw new Error('ELEVENLABS_AGENT_ID and ELEVENLABS_CONVERSATION_SIGNATURE must be configured');
  }

  return new ElevenLabsClient({
    agentId: agentId,
    conversationSignature: conversationSignature,
  });
}

/**
 * Start a conversation with the ElevenLabs agent
 */
export async function startConversation(client: ElevenLabsClient) {
  // The actual API depends on @11labs/client implementation
  // This is a placeholder structure
  return await client.start();
}

/**
 * Stop the current conversation
 */
export async function stopConversation(client: ElevenLabsClient) {
  return await client.stop();
}

/**
 * Send a message to the agent
 */
export async function sendMessage(client: ElevenLabsClient, message: string) {
  return await client.send(message);
}

