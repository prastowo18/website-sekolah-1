'use client';

import { useActionState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { loginAction } from '@/features/auth/actions';
import { initialAuthActionState } from '@/features/auth/types';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialAuthActionState,
  );

  const identifierError = state.fieldErrors?.identifier?.[0];

  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === 'error' && state.message ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="identifier">Username atau email</Label>

        <Input
          id="identifier"
          name="identifier"
          type="text"
          placeholder="Masukkan username atau email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          disabled={isPending}
          aria-invalid={Boolean(identifierError)}
          aria-describedby={identifierError ? 'identifier-error' : undefined}
          required
          autoFocus
        />

        {identifierError ? (
          <p id="identifier-error" className="text-sm text-destructive">
            {identifierError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>

        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Masukkan password"
          autoComplete="current-password"
          disabled={isPending}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? 'password-error' : undefined}
          required
        />

        {passwordError ? (
          <p id="password-error" className="text-sm text-destructive">
            {passwordError}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner data-icon="inline-start" />
            Memproses...
          </>
        ) : (
          'Masuk'
        )}
      </Button>
    </form>
  );
}
