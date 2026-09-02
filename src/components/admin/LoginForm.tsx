'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const supabase = getBrowserClient();
    if (!supabase) {
      setError('尚未設定 Supabase 環境變數。');
      return;
    }

    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Email 或密碼不正確。'
          : signInError.message,
      );
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  };

  const inputClass =
    'mt-2 w-full border border-ink/15 bg-paper px-3 py-2.5 font-sans text-sm text-ink outline-none transition-colors duration-300 focus:border-coffee';

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block">
        <span className="label-text text-ink/45">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="label-text text-ink/45">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="font-sans text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-ink px-5 py-3 font-sans text-sm text-paper transition-colors duration-300 hover:bg-coffee disabled:opacity-60"
      >
        {busy ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

/** useSearchParams 需要包在 Suspense 內。 */
export default function LoginForm() {
  return (
    <Suspense fallback={<div className="mt-8 h-64" />}>
      <LoginFormInner />
    </Suspense>
  );
}
