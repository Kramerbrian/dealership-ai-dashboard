import 'dotenv/config';
import { pumpOutbox } from '@/workers/outbox';

async function loop() {
  try {
    await pumpOutbox(1000);
  } catch (e) {
    console.error('[outbox] loop err', e);
  }
  setTimeout(loop, 2000);
}

loop();

