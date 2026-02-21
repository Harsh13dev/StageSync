'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { register } from '@/lib/api';
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
    appearance: 'none',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 700,
    letterSpacing: '0.07em', textTransform: 'uppercase',
    color: 'var(--ink-muted)', marginBottom: 8,
    fontFamily: 'var(--font-sans)',
};

const ROLES = [
    { value: 'Host', emoji: '🎬', label: 'Host', sub: 'Create & manage events' },
    { value: 'Anchor', emoji: '🎤', label: 'Anchor', sub: 'Apply to host events' },
    { value: 'User', emoji: '✨', label: 'Audience', sub: 'Discover & book events' },
];

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        Name: '', Email: '', Password: '', Role_Type: 'User' as 'Host' | 'Anchor' | 'User',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await register(form);
            router.push('/auth/login?registered=1');
        } catch (err: unknown) {
            setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.style.borderColor = 'var(--champagne-rose)';
        e.target.style.boxShadow = '0 0 0 3px rgba(231,210,204,0.28)';
    };
    const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                    style={{ maxWidth: 460, width: '100%', margin: '0 auto' }}
                >
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', marginBottom: 8, lineHeight: 1.1 }}>
                        Join StageSync
                    </h1>
                    <p style={{ color: 'var(--ink-muted)', marginBottom: 38, fontSize: '1.05rem' }}>
                        The world's premier event marketplace.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Name */}
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input type="text" placeholder="Jane Doe"
                                value={form.Name}
                                onChange={e => setForm({ ...form, Name: e.target.value })}
                                required style={inputStyle} onFocus={focus} onBlur={blur}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input type="email" placeholder="jane@company.com"
                                value={form.Email}
                                onChange={e => setForm({ ...form, Email: e.target.value })}
                                required style={inputStyle} onFocus={focus} onBlur={blur}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label style={labelStyle}>Password</label>
                            <input type="password" placeholder="Create a secure password"
                                value={form.Password}
                                onChange={e => setForm({ ...form, Password: e.target.value })}
                                required style={inputStyle} onFocus={focus} onBlur={blur}
                            />
                        </div>

                        {/* Role selector — visual pill tabs */}
                        <div>
                            <label style={labelStyle}>Your Role</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                                {ROLES.map(r => (
                                    <motion.button
                                        key={r.value}
                                        type="button"
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => setForm({ ...form, Role_Type: r.value as 'Host' | 'Anchor' | 'User' })}
                                        style={{
                                            padding: '13px 8px',
                                            borderRadius: 14,
                                            border: form.Role_Type === r.value
                                                ? '2px solid var(--champagne-rose)'
                                                : '1.5px solid rgba(231,210,204,0.35)',
                                            background: form.Role_Type === r.value
                                                ? 'linear-gradient(135deg, rgba(231,210,204,0.25), rgba(224,176,255,0.12))'
                                                : 'rgba(255,255,255,0.6)',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.22s',
                                        }}
                                    >
                                        <div style={{ fontSize: 22, marginBottom: 4 }}>{r.emoji}</div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--deep-ink)', fontFamily: 'var(--font-sans)' }}>{r.label}</div>
                                        <div style={{ fontSize: 10, color: 'var(--ink-muted)', lineHeight: 1.3, marginTop: 2 }}>{r.sub}</div>
                                    </motion.button>
                                ))}
                            </div>
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
                            style={{ width: '100%', marginTop: 4 }}
                        >
                            {loading ? 'Creating Account…' : 'Create Account ✦'}
                        </PrismaticButton>
                    </form>

                    <p style={{ marginTop: 28, textAlign: 'center', fontSize: '0.95rem', color: 'var(--ink-muted)' }}>
                        Already have an account?{' '}
                        <Link href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Sign in</Link>
                    </p>
                </motion.div>
            </div>

            {/* ── Right: Visual Panel ── */}
            <div className="auth-visuals" style={{
                flex: 1.1, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(145deg, var(--morning-mist) 0%, #EDE8F5 100%)',
            }}>
                {/* Rotating ambient blobs */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
                    style={{
                        position: 'absolute', top: '-15%', left: '-20%',
                        width: '90vw', height: '90vw', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(224,176,255,0.12) 0%, transparent 60%)',
                    }}
                />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 32, ease: 'linear' }}
                    style={{
                        position: 'absolute', bottom: '-20%', right: '-10%',
                        width: '70vw', height: '70vw', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(231,210,204,0.14) 0%, transparent 60%)',
                    }}
                />

                {/* Frosted mosaic cards */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, transform: 'rotate(6deg)' }}>
                        {[
                            { bg: 'linear-gradient(135deg, rgba(231,210,204,0.55), rgba(255,255,255,0.7))', icon: '🎬', label: 'Host Events' },
                            { bg: 'linear-gradient(135deg, rgba(224,176,255,0.45), rgba(255,255,255,0.7))', icon: '🎤', label: 'Anchor Gigs' },
                            { bg: 'linear-gradient(135deg, rgba(201,228,255,0.45), rgba(255,255,255,0.7))', icon: '✨', label: 'Discover' },
                            { bg: 'linear-gradient(135deg, rgba(253,252,240,0.7),  rgba(231,210,204,0.3))', icon: '🌟', label: 'StageSync' },
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.12, duration: 0.8 }}
                                style={{
                                    width: 148, height: 148, borderRadius: 28,
                                    background: card.bg,
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.6)',
                                    boxShadow: '0 8px 32px rgba(26,26,46,0.07)',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: 8,
                                }}
                            >
                                <span style={{ fontSize: 32 }}>{card.icon}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--deep-ink)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>{card.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Tagline overlay */}
                <div style={{
                    position: 'absolute', bottom: 48, left: 0, right: 0,
                    textAlign: 'center', padding: '0 32px',
                }}>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--deep-ink)', opacity: 0.55, fontStyle: 'italic' }}>
                        "Where art meets opportunity"
                    </p>
                </div>
            </div>
        </div>
    );
}
