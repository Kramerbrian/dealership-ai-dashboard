/**
 * Acknowledgment response generator
 */
export function ack(
  eventId: string,
  status: 'accepted' | 'duplicate' | 'stale' | 'invalid_signature' | 'bad_request',
  message?: string
) {
  return {
    event_id: eventId,
    status,
    message: message || status,
    timestamp: new Date().toISOString(),
  };
}

