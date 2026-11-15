'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { UserDetailView } from '@/features/users/components/detail/user-detail-view';

export default function UserDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  if (!id) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Invalid user ID requested.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-2">
      <UserDetailView userId={id} />
    </div>
  );
}
