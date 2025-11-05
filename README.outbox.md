# Event Outbox

## Setup Instructions

1) Apply migration:

```bash
npx prisma generate
npx prisma migrate dev -n event_outbox
```

2) Run worker (in a separate process):

```bash
# Using ts-node
npx ts-node scripts/outbox-runner.ts

# Or using Node with loader
node --loader ts-node/esm scripts/outbox-runner.ts
```

3) Produce outbox rows in same transaction as DB writes. A separate worker calls `publish()` and marks them as processed.

## Architecture

- **EventOutbox Table**: Stores events that need to be published
- **Outbox Worker**: Continuously processes unprocessed events
- **Event Bus**: Publishes events via Redis Pub/Sub or local EventEmitter
- **Redis Streams**: Optional replay capability for event streams

## Environment Variables

```
REDIS_URL=redis://localhost:6379
EVENT_NS=dai
```

## Usage

When writing to the database, also insert into EventOutbox:

```typescript
await db.$transaction(async (tx) => {
  // Your main DB write
  await tx.dealership.update({ ... });
  
  // Insert into outbox
  await tx.eventOutbox.create({
    data: {
      topic: 'dai:ai-scores:update',
      payload: { /* event data */ }
    }
  });
});
```

The worker will pick up the event and publish it via the event bus.

