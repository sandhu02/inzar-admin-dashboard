import * as React from 'react';
import { FlagsView } from '@/features/flags/components/flags-view';

export const metadata = {
  title: 'Community Flags | Inzar Admin',
  description: 'Review and resolve community-reported flags and report disputes.',
};

export default function FlagsPage() {
  return <FlagsView />;
}
