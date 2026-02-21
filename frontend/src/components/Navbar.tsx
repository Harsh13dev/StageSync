'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { user_id, role, name, clearAuth } = useAuthStore();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        clearAuth();
        router.push('/');
    };

    const dashboardHref =
        role === 'Host' ? '/host/dashboard'
            : role === 'Anchor' ? '/anchor/dashboard'
                : role === 'User' ? '/user/discover'
                    : '/';

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 5%',
                height: scrolled ? 62 : 80,
                background: scrolled
                    ? 'rgba(253, 252, 240, 0.88)'
                    : 'transparent',
                backdropFilter: scrolled ? 'blur(24px) saturate(1.5)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.5)' : 'none',
                borderBottom: scrolled
                    ? '1px solid rgba(231, 210, 204, 0.4)'
                    : '1px solid transparent',
                boxShadow: scrolled ? '0 4px 20px rgba(26, 26, 46, 0.05)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.25, 1, 0.3, 1)',
            }}
        >
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Iridescent mark */}
                <motion.div
                    whileHover={{ scale: 1.08 }}
                    style={{
                        width: 34, height: 34,
                        background: 'linear-gradient(135deg, #E7D2CC, #E0B0FF, #C9E4FF)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#1A1A2E',
                        fontWeight: 800, fontSize: '17px',
                        fontFamily: 'var(--font-serif)',
                        boxShadow: '0 4px 14px rgba(224,176,255,0.35)',
                    }}
                >
                    S
                </motion.div>
                <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 22, fontWeight: 700,
                    color: scrolled ? 'var(--deep-ink)' : '#fff',
                    letterSpacing: '-0.03em',
                    transition: 'color 0.3s',
                }}>StageSync</span>
            </Link>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {user_id ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.25 }}
                        >
                            <span style={{ fontSize: 13, fontWeight: 700, color: scrolled ? 'var(--deep-ink)' : '#fff', fontFamily: 'var(--font-sans)', transition: 'color 0.3s' }}>{name}</span>
                            <span style={{
                                fontSize: 10, color: scrolled ? 'var(--gold-vivid)' : 'rgba(200,149,42,0.9)',
                                textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, transition: 'color 0.3s',
                            }}>{role}</span>
                        </motion.div>
                        <Link href={dashboardHref}>
                            <motion.button
                                whileHover={{ scale: 1.04, y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn btn-ghost"
                                style={{ padding: '8px 22px', fontSize: 13 }}
                            >
                                Dashboard
                            </motion.button>
                        </Link>
                        {/* Profile icon — anchors only */}
                        {role === 'Anchor' && (
                            <Link href="/anchor/profile">
                                <motion.div
                                    whileHover={{ scale: 1.08, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="My Profile"
                                    style={{
                                        width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                                        background: 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 14, color: '#fff',
                                        boxShadow: '0 3px 12px rgba(200,149,42,0.35)',
                                        border: '2px solid rgba(255,255,255,0.8)',
                                        flexShrink: 0,
                                    }}
                                >
                                    {name ? name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
                                </motion.div>
                            </Link>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleLogout}
                            className="btn"
                            style={{ padding: '8px 18px', fontSize: 13, color: 'var(--ink-muted)', background: 'rgba(26,26,46,0.04)' }}
                        >
                            Sign out
                        </motion.button>
                    </>
                ) : (
                    <>
                        <Link href="/auth/login">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                style={{ fontSize: 14, fontWeight: 600, color: scrolled ? 'var(--deep-ink)' : '#fff', background: 'transparent', padding: '8px 16px', fontFamily: 'var(--font-sans)', transition: 'color 0.3s' }}
                            >
                                Login
                            </motion.button>
                        </Link>
                        <Link href="/auth/register">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn btn-prismatic"
                                style={{ padding: '10px 26px', fontSize: 14 }}
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </>
                )}
            </div>
        </motion.nav>
    );
}
