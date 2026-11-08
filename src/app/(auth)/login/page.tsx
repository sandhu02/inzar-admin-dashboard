'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const queryError = searchParams.get('error');

  const queryErrorMessage =
    queryError === 'unauthorized_role'
      ? 'Your account does not have staff permissions to access the dashboard.'
      : queryError === 'session_expired'
        ? 'Your session has expired. Please sign in again.'
        : null;

  const [formError, setFormError] = React.useState<string | null>(null);
  const displayError = formError || queryErrorMessage;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(
          data?.error?.message ||
            'Authentication failed. Please check your credentials.'
        );
        return;
      }

      router.push(returnUrl);
      router.refresh();
    } catch {
      setFormError('A network error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 rounded-2xl border border-border bg-card shadow-2xl">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center gap-2">
          <span className="text-accent text-2xl font-bold leading-none select-none">
            ◆
          </span>
          <span className="text-2xl font-bold tracking-widest text-foreground font-sans">
            INZAR
          </span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Staff Login</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Control room for real-time local incident reporting
          </p>
        </div>
      </div>

      {/* Error banner */}
      {displayError && (
        <ErrorBanner
          error={displayError}
          title="Authentication Error"
          className="animate-in fade-in"
        />
      )}

      {/* Login Form */}
      <form
        method="post"
        action="#"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}
        className="space-y-5"
        suppressHydrationWarning
      >
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider"
          >
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@inzar.app"
            disabled={isSubmitting}
            className={errors.email ? 'border-destructive' : ''}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider"
            >
              Password
            </label>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            disabled={isSubmitting}
            className={errors.password ? 'border-destructive' : ''}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in to Dashboard</span>
          )}
        </Button>
      </form>

      {/* Staff Notice */}
      <div className="border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>Authorized admins and moderators only.</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md space-y-6 p-8 rounded-2xl border border-border bg-card">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
