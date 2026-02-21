'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnchorDashboard, updateAnchorProfile, AnchorProfileUpdate } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import SkeletonCard from '@/components/SkeletonCard';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import PrismaticButton from '@/components/ui/PrismaticButton';

interface ProfileSummary {
    name: string;
    specialization: string;
    language_spoken: string;
    rating: number;
    quote_price: number;
    past_work: string;
}

interface AppItem {
    application_id: number;
    event_title: string;
    event_date: string;
    location: string;
    host_name: string;
    application_status: string;
    event_status: string;
}

// ── Timeline Progress ─────────────────────────────────────────
function AppTimeline({ status, eventStatus }: { status: string; eventStatus: string }) {
    const fill = status === 'Accepted' ? 100 : status === 'Rejected' ? 100 : 35;
    const isRejected = status === 'Rejected';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 5, borderRadius: 9999, background: 'rgba(200,149,42,0.1)', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }} animate={{ width: `${fill}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        height: '100%', borderRadius: 9999,
                        background: isRejected
                            ? 'linear-gradient(90deg, #E11D48, #FB7185)'
                            : 'linear-gradient(90deg, var(--gold-vivid), var(--violet-vivid))',
                        boxShadow: isRejected ? '0 0 10px rgba(225,29,72,0.4)' : '0 0 10px rgba(200,149,42,0.4)',
                    }}
                />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <StatusBadge status={status} />
                <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600 }}>Event:</span>
                <StatusBadge status={eventStatus} />
            </div>
        </div>
    );
}

// ── Stat chip ─────────────────────────────────────────────────
function StatChip({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
    return (
        <div style={{
            padding: '16px 20px', borderRadius: 16,
            background: accent,
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', flexDirection: 'column', gap: 6,
            backdropFilter: 'blur(8px)',
        }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {icon} {label}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.18rem', color: '#fff', letterSpacing: '-0.01em' }}>
                {value}
            </div>
        </div>
    );
}

export default function AnchorProfilePage() {
    const { user_id, role } = useAuthStore();
    const router = useRouter();

    const [profile, setProfile] = useState<ProfileSummary | null>(null);
    const [applications, setApplications] = useState<AppItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<AnchorProfileUpdate>({
        Specialization: '', Past_Work_Links: '', Base_Fee: 0, Languages_Spoken: '', Average_Rating: 0,
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const fetchData = useCallback(async () => {
        if (!user_id) return;
        try {
            const data = await getAnchorDashboard(Number(user_id));
            setProfile(data.profile_summary);
            setApplications(data.my_applications);
            setEditForm({
                Specialization: data.profile_summary.specialization,
                Languages_Spoken: data.profile_summary.language_spoken,
                Base_Fee: data.profile_summary.quote_price,
                Average_Rating: data.profile_summary.rating,
                Past_Work_Links: data.profile_summary.past_work || '',
            });
        } catch { console.error('profile load failed'); }
        finally { setLoading(false); }
    }, [user_id]);

    useEffect(() => {
        if (role && role !== 'Anchor') { router.replace('/'); return; }
        fetchData();
    }, [user_id, role, router, fetchData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setSaveError('');
        try {
            await updateAnchorProfile(Number(user_id), editForm);
            setEditOpen(false);
            fetchData();
        } catch (err: unknown) {
            setSaveError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Save failed.');
        } finally { setSaving(false); }
    };

    const initials = profile?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>

            {/* ══ DARK HERO HEADER ════════════════════════════════════ */}
            <div style={{
                background: 'var(--deep-night)',
                paddingTop: 100, paddingBottom: 0,
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Grid */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(rgba(200,149,42,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,149,42,0.04) 1px,transparent 1px)',
                    backgroundSize: '48px 48px',
                }} />
                {/* Glows */}
                <div style={{
                    position: 'absolute', top: '50%', left: '60%', transform: 'translateY(-50%)',
                    width: 350, height: 350, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)',
                }} />
                <div style={{
                    position: 'absolute', bottom: 0, right: '5%',
                    width: 200, height: 200, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(200,149,42,0.1) 0%, transparent 65%)',
                }} />

                <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 5% 0', position: 'relative' }}>
                    {loading ? (
                        <div style={{ paddingBottom: 36 }}>
                            <SkeletonCard lines={3} height={120} />
                        </div>
                    ) : profile && (
                        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
                            style={{ paddingBottom: 36 }}
                        >
                            {/* Eyebrow */}
                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginBottom: 20 }}>
                                ✦ Anchor Profile
                            </div>

                            {/* Name row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 24, color: '#fff',
                                        boxShadow: '0 6px 24px rgba(200,149,42,0.4)',
                                        border: '3px solid rgba(255,255,255,0.15)',
                                    }}>
                                        {initials}
                                    </div>
                                    <div>
                                        <h1 style={{
                                            fontFamily: 'var(--font-serif)',
                                            fontSize: 'clamp(1.8rem,4vw,2.6rem)',
                                            color: 'var(--pearl-on-dark)', lineHeight: 1.0, marginBottom: 6,
                                        }}>
                                            {profile.name}
                                        </h1>
                                        <div style={{
                                            display: 'inline-block', fontSize: 13, fontWeight: 700,
                                            color: 'transparent',
                                            background: 'linear-gradient(135deg, var(--gold-vivid), var(--violet-light))',
                                            WebkitBackgroundClip: 'text', backgroundClip: 'text',
                                        }}>
                                            {profile.specialization}
                                        </div>
                                    </div>
                                </div>
                                <PrismaticButton onClick={() => setEditOpen(true)} size="sm">
                                    ✎ Edit Profile
                                </PrismaticButton>
                            </div>

                            {/* Stat chips on dark */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 12 }}>
                                <StatChip icon="🌐" label="Languages" value={profile.language_spoken}
                                    accent="linear-gradient(135deg, rgba(200,149,42,0.22), rgba(200,149,42,0.08))" />
                                <StatChip icon="⭐" label="Rating" value={`${profile.rating.toFixed(1)} / 5`}
                                    accent="linear-gradient(135deg, rgba(124,58,237,0.22), rgba(124,58,237,0.08))" />
                                <StatChip icon="💰" label="Base Fee" value={`₹${profile.quote_price.toLocaleString('en-IN')}`}
                                    accent="linear-gradient(135deg, rgba(13,148,136,0.22), rgba(13,148,136,0.08))" />
                                {profile.past_work && (
                                    <a href={profile.past_work} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                        <StatChip icon="🔗" label="Past Work" value="View Work ↗"
                                            accent="linear-gradient(135deg, rgba(225,29,72,0.18), rgba(225,29,72,0.06))" />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Wave separator */}
                <svg viewBox="0 0 1440 48" style={{ display: 'block', width: '100%', height: 48 }} preserveAspectRatio="none">
                    <path d="M0,16 C360,56 1080,0 1440,24 L1440,48 L0,48 Z" fill="var(--warm-white)" />
                </svg>
            </div>

            {/* ══ APPLICATIONS SECTION ══════════════════════════════ */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 5% 80px' }}>
                <div style={{ marginBottom: 22 }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--deep-ink)' }}>
                        My Applications
                        <span style={{
                            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 800,
                            color: 'var(--ink-faint)', marginLeft: 10,
                        }}>
                            ({applications.length})
                        </span>
                    </h2>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[1, 2, 3].map(i => <SkeletonCard key={i} lines={3} height={110} />)}
                    </div>
                ) : applications.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '64px 32px',
                        background: '#fff', borderRadius: 24,
                        border: '1px solid rgba(200,149,42,0.1)',
                    }}>
                        <div style={{ fontSize: 44, opacity: 0.35, marginBottom: 14 }}>📭</div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: 8 }}>No Applications Yet</h3>
                        <p style={{ color: 'var(--ink-muted)', maxWidth: 300, margin: '0 auto' }}>
                            Head to the dashboard to discover events and apply.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {applications.map((app, i) => (
                                <motion.div key={app.application_id}
                                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    style={{
                                        padding: '22px 24px', borderRadius: 18,
                                        background: '#fff',
                                        border: '1px solid rgba(200,149,42,0.12)',
                                        boxShadow: '0 2px 10px rgba(15,15,34,0.05)',
                                        borderLeft: `4px solid ${app.application_status === 'Accepted' ? 'var(--gold-vivid)' : app.application_status === 'Rejected' ? '#E11D48' : 'var(--violet-vivid)'}`,
                                    }}
                                >
                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--deep-ink)', marginBottom: 10 }}>
                                        {app.event_title}
                                    </div>
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))',
                                        gap: 6, fontSize: 12, color: 'var(--ink-muted)', fontWeight: 600, marginBottom: 14,
                                    }}>
                                        <span>📅 {new Date(app.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        <span>📍 {app.location}</span>
                                        <span>👤 {app.host_name}</span>
                                    </div>
                                    <AppTimeline status={app.application_status} eventStatus={app.event_status} />
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>

            {/* ── Edit Profile Modal ── */}
            <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Your Profile">
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {[
                        { key: 'Specialization', label: 'Specialization', type: 'text' },
                        { key: 'Languages_Spoken', label: 'Languages Spoken', type: 'text' },
                        { key: 'Past_Work_Links', label: 'Past Work Link (URL)', type: 'text' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="input-label">{f.label}</label>
                            <input className="input-field" type={f.type}
                                value={String(editForm[f.key as keyof AnchorProfileUpdate] ?? '')}
                                onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                                required
                            />
                        </div>
                    ))}
                    <div>
                        <label className="input-label">Base Fee (₹)</label>
                        <input className="input-field" type="number" min={0}
                            value={editForm.Base_Fee}
                            onChange={e => setEditForm({ ...editForm, Base_Fee: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">Average Rating (0–5)</label>
                        <input className="input-field" type="number" min={0} max={5} step={0.1}
                            value={editForm.Average_Rating}
                            onChange={e => setEditForm({ ...editForm, Average_Rating: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    {saveError && <div style={{ color: '#E11D48', fontSize: 13 }}>{saveError}</div>}
                    <PrismaticButton type="submit" disabled={saving} size="lg" style={{ width: '100%', marginTop: 6 }}>
                        {saving ? 'Saving…' : 'Save Changes'}
                    </PrismaticButton>
                </form>
            </Modal>
        </div>
    );
}
