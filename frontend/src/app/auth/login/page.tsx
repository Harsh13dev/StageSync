'use client';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import PrismaticButton from '@/components/ui/PrismaticButton';

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 18px',
    borderRadius: 14, fontSize: '1rem',
    fontFamily: 'var(--font-sans)',
    color: 'var(--deep-ink)',
    border: '1.5px solid rgba(231,210,204,0.45)',
    background: 'rgba(255,255,255,0.82)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 700,
    letterSpacing: '0.07em', textTransform: 'uppercase',
    color: 'var(--ink-muted)', marginBottom: 8,
    fontFamily: 'var(--font-sans)',
};

function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const { setAuth } = useAuthStore();
    const [form, setForm] = useState({ Email: '', Password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (params.get('registered')) setSuccess('Account created! Sign in to continue.');
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await login(form);
            setAuth(res.user_id, res.role);
            if (res.role === 'Host') router.push('/host/dashboard');
            else if (res.role === 'Anchor') router.push('/anchor/dashboard');
            else router.push('/user/discover');
        } catch (err: unknown) {
            setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    const focus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = 'var(--champagne-rose)';
        e.target.style.boxShadow = '0 0 0 3px rgba(231,210,204,0.28)';
    };
    const blur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = 'rgba(231,210,204,0.45)';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--pearl-silk)' }}>

            {/* ── Left: Form ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                padding: '5% 8%', paddingTop: 110, justifyContent: 'center',
                position: 'relative', zIndex: 10,
            }}>

                <motion.div
                    initial={{ opacity: 0, x: -32 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}
                >
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', marginBottom: 8, lineHeight: 1.1 }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: 'var(--ink-muted)', marginBottom: 38, fontSize: '1.05rem' }}>
                        Sign in to your StageSync account.
                    </p>

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'rgba(91,173,122,0.1)', color: '#2E7D52',
                                padding: '12px 16px', borderRadius: 12,
                                fontSize: '0.9rem', marginBottom: 24,
                                border: '1px solid rgba(91,173,122,0.25)',
                                fontFamily: 'var(--font-sans)',
                            }}
                        >
                            ✓ {success}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input type="email" placeholder="jane@company.com"
                                value={form.Email}
                                onChange={e => setForm({ ...form, Email: e.target.value })}
                                required style={inputStyle} onFocus={focus} onBlur={blur}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Password</label>
                            <input type="password" placeholder="••••••••"
                                value={form.Password}
                                onChange={e => setForm({ ...form, Password: e.target.value })}
                                required style={inputStyle} onFocus={focus} onBlur={blur}
                            />
                        </div>

                        {error && (
                            <div style={{ color: '#CC4444', fontSize: '0.88rem', padding: '10px 14px', background: 'rgba(204,68,68,0.07)', borderRadius: 10, border: '1px solid rgba(204,68,68,0.18)' }}>
                                {error}
                            </div>
                        )}

                        <PrismaticButton
                            type="submit"
                            disabled={loading}
                            size="lg"
                            style={{ width: '100%', marginTop: 8 }}
                        >
                            {loading ? 'Signing In…' : 'Sign In ✦'}
                        </PrismaticButton>
                    </form>

                    <p style={{ marginTop: 28, textAlign: 'center', fontSize: '0.95rem', color: 'var(--ink-muted)' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Create one</Link>
                    </p>
                </motion.div>
            </div>

            {/* ── Right: Visual ── */}
            <div className="auth-visuals" style={{
                flex: 1.1, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(145deg, var(--morning-mist) 0%, #EDE8F5 100%)',
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 50, ease: 'linear' }}
                    style={{
                        position: 'absolute', top: '-20%', right: '-20%',
                        width: '80vw', height: '80vw', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(224,176,255,0.10) 0%, transparent 60%)',
                    }}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
                    style={{
                        position: 'absolute', bottom: '-10%', left: '-10%',
                        width: '60vw', height: '60vw', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(231,210,204,0.12) 0%, transparent 60%)',
                    }}
                />

                {/* Central luxury card */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20, rotate: -5 }}
                        animate={{ opacity: 1, y: 0, rotate: -5 }}
                        transition={{ duration: 1 }}
                        style={{
                            width: 300, height: 380,
                            background: 'rgba(255,255,255,0.72)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(231,210,204,0.55)',
                            borderRadius: 28,
                            boxShadow: '0 24px 60px rgba(26,26,46,0.08)',
                            padding: 32,
                            display: 'flex', flexDirection: 'column', gap: 20,
                        }}
                    >
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #E7D2CC, #E0B0FF)', boxShadow: '0 4px 16px rgba(224,176,255,0.3)' }} />
                        <div style={{ width: '65%', height: 11, borderRadius: 6, background: 'rgba(168,150,160,0.18)' }} />
                        <div style={{ width: '45%', height: 9, borderRadius: 5, background: 'rgba(168,150,160,0.12)' }} />
                        <div style={{ width: '80%', height: 9, borderRadius: 5, background: 'rgba(168,150,160,0.10)' }} />
                        <div style={{ marginTop: 'auto', width: '100%', height: 42, borderRadius: 12, background: 'linear-gradient(135deg, rgba(224,176,255,0.35), rgba(231,210,204,0.35))', border: '1px solid rgba(255,255,255,0.5)' }} />
                    </motion.div>
                </div>

                <div style={{ position: 'absolute', bottom: 48, left: 0, right: 0, textAlign: 'center', padding: '0 32px' }}>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--deep-ink)', opacity: 0.5, fontStyle: 'italic' }}>
                        "Where art meets opportunity"
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
