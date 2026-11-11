import * as React from 'react';
import { ModerationQueueView } from '@/features/queue/components/moderation-queue-view';

export const metadata = {
  title: 'Moderation Queue | Inzar Admin',
  description: 'Fast-track moderation workflow for pending incident reports.',
};

export default function QueuePage() {
  return <ModerationQueueView />;
}
