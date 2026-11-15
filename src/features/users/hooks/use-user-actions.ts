'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserSuspension, updateUserRole, revokeUserSessions } from '../api/users';
import { useToast } from '@/components/ui/toast';
import type { UserRole } from '../types';

export function useUserActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const suspendMutation = useMutation({
    mutationFn: (variables: {
      userId: string;
      isSuspended: boolean;
      reason: string;
      notes?: string;
    }) => updateUserSuspension(variables),
    onSuccess: (updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.setQueryData(['admin', 'users', variables.userId], updatedUser);
      toast({
        title: variables.isSuspended ? 'Account Suspended' : 'Account Reinstated',
        description: variables.isSuspended
          ? `${updatedUser.display_name} has been suspended.`
          : `${updatedUser.display_name} has been reinstated to active status.`,
        variant: variables.isSuspended ? 'warning' : 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Action Failed',
        description: error.message || 'Failed to update user suspension status.',
        variant: 'danger',
      });
    },
  });

  const roleMutation = useMutation({
    mutationFn: (variables: {
      userId: string;
      role: UserRole;
      reason: string;
      notes?: string;
    }) => updateUserRole(variables),
    onSuccess: (updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.setQueryData(['admin', 'users', variables.userId], updatedUser);
      toast({
        title: 'Role Updated',
        description: `${updatedUser.display_name}'s role is now ${variables.role.toUpperCase()}.`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Role Change Failed',
        description: error.message || 'Failed to modify user role.',
        variant: 'danger',
      });
    },
  });

  const revokeSessionsMutation = useMutation({
    mutationFn: (variables: { userId: string; reason?: string }) =>
      revokeUserSessions(variables),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId] });
      toast({
        title: 'Sessions Terminated',
        description: `Successfully revoked ${data.revoked_count} active session${data.revoked_count === 1 ? '' : 's'}.`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Revocation Failed',
        description: error.message || 'Failed to revoke user sessions.',
        variant: 'danger',
      });
    },
  });

  return {
    suspendUser: suspendMutation.mutateAsync,
    isSuspending: suspendMutation.isPending,
    changeRole: roleMutation.mutateAsync,
    isChangingRole: roleMutation.isPending,
    revokeSessions: revokeSessionsMutation.mutateAsync,
    isRevokingSessions: revokeSessionsMutation.isPending,
  };
}
