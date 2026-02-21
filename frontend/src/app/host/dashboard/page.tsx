'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getHostDashboard, hireAnchor, createEvent, updateEvent, deleteEvent, CreateEvent, UpdateEvent } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import SkeletonCard from '@/components/SkeletonCard';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import PrismaticButton from '@/components/ui/PrismaticButton';

interface Applicant {
    application_id: number; status: string; anchor_name: string; email: string;
    specialization: string; language_spoken: string; rating: number;
    quote_price: number; past_work: string;
}
interface Event {
    event_id: number; title: string; date: string; status: string; applicants: Applicant[];
}

// ── Dark stat chip ────────────────────────────────────────────
function StatChip({ icon, label, value, accent }: { icon: string; label: string; value: number; accent: string }) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{
                padding: '18px 22px', borderRadius: 16, backdropFilter: 'blur(8px)',
                background: accent, border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex', flexDirection: 'column', gap: 6,
            }}
        >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {icon} {label}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {value}
            </div>
        </motion.div>
    );
}

// ── Applicant card ────────────────────────────────────────────
function ApplicantCard({
    app, eventStatus, onHire, actionLoading, hiredId,
}: { app: Applicant; eventStatus: string; onHire: (id: number) => void; actionLoading: boolean; hiredId: number | null }) {
    const isHired = hiredId === app.application_id;
    const initials = app.anchor_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, boxShadow: '0 14px 38px rgba(15,15,34,0.12)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            style={{
                background: '#fff', borderRadius: 18,
                border: '1px solid rgba(200,149,42,0.12)',
                padding: '22px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(15,15,34,0.06)',
            }}
        >
            {/* Top accent strip */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: app.status === 'Accepted'
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : app.status === 'Rejected'
                        ? 'linear-gradient(90deg, #E11D48, #FB7185)'
                        : 'linear-gradient(90deg, var(--gold-vivid), var(--violet-vivid))',
            }} />

            {/* Name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 16, color: '#fff',
                    boxShadow: '0 3px 10px rgba(200,149,42,0.3)',
                }}>{initials}</div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--deep-ink)', lineHeight: 1.2 }}>{app.anchor_name}</div>
                    <div style={{ color: 'var(--ink-muted)', fontSize: 12, marginTop: 2, fontWeight: 500 }}>{app.email}</div>
                </div>
            </div>
            {/* Status badge on its own row */}
            <div style={{ marginBottom: 14 }}>
                <StatusBadge status={app.status} />
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
                <span style={{ padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700, background: 'rgba(200,149,42,0.1)', color: '#92620A', border: '1px solid rgba(200,149,42,0.25)' }}>
                    🎯 {app.specialization}
                </span>
                <span style={{ padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700, background: 'rgba(124,58,237,0.09)', color: '#5B21B6', border: '1px solid rgba(124,58,237,0.2)' }}>
                    🌐 {app.language_spoken}
                </span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 14, color: '#4B4B6A', fontWeight: 600 }}>⭐ {app.rating.toFixed(1)} <span style={{ color: '#888', fontWeight: 400 }}>/ 5.0</span></span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--deep-ink)' }}>₹{app.quote_price.toLocaleString('en-IN')}</span>
            </div>

            {app.past_work && (
                <a href={app.past_work} target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, fontWeight: 700, color: '#92620A', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14, textDecoration: 'none' }}>
                    🔗 View Past Work ↗
                </a>
            )}

            {app.status === 'Pending' && eventStatus === 'Open' && (
                <PrismaticButton size="sm" disabled={actionLoading} onClick={() => onHire(app.application_id)}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    Hire Anchor ✦
                </PrismaticButton>
            )}

            {/* Hire success overlay */}
            <AnimatePresence>
                {isHired && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', inset: 0, borderRadius: 'inherit',
                            background: 'radial-gradient(circle at 50% 40%, rgba(200,149,42,0.4) 0%, rgba(124,58,237,0.25) 60%, rgba(255,255,255,0.92) 100%)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                        }}
                    >
                        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                            style={{ fontSize: 40 }}>🎉</motion.div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--deep-ink)' }}>Hired!</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Event row ─────────────────────────────────────────────────
function EventRow({
    ev, expanded, onExpand, onEdit, onDelete, onHire, actionLoading, hiredId,
}: {
    ev: Event; expanded: boolean; onExpand: () => void;
    onEdit: (ev: Event) => void; onDelete: (id: number) => void;
    onHire: (id: number) => void; actionLoading: boolean; hiredId: number | null;
}) {
    const date = new Date(ev.date);
    const pending = ev.applicants.filter(a => a.status === 'Pending').length;
    const accepted = ev.applicants.filter(a => a.status === 'Accepted').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            style={{
                background: '#fff', borderRadius: 20, overflow: 'hidden',
                border: '1px solid rgba(200,149,42,0.12)',
                boxShadow: expanded ? '0 8px 32px rgba(15,15,34,0.10)' : '0 2px 8px rgba(15,15,34,0.05)',
                transition: 'box-shadow 0.3s',
            }}
        >
            {/* Status top bar */}
            <div style={{
                height: 4,
                background: ev.status === 'Confirmed'
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : ev.status === 'Cancelled'
                        ? 'linear-gradient(90deg, #E11D48, #FB7185)'
                        : 'linear-gradient(90deg, var(--gold-vivid), var(--violet-vivid))',
                backgroundSize: '200% auto', animation: 'border-flow 5s ease infinite',
            }} />

            <div style={{ padding: '22px 26px' }}>
                {/* Top row: title + actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--deep-ink)', lineHeight: 1.2 }}>
                                {ev.title}
                            </h2>
                            <StatusBadge status={ev.status} />
                        </div>
                        <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 600, flexWrap: 'wrap' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 9999, background: 'rgba(200,149,42,0.08)', color: 'var(--gold-vivid)', border: '1px solid rgba(200,149,42,0.2)' }}>
                                📅 {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            {pending > 0 && (
                                <span style={{ padding: '3px 10px', borderRadius: 9999, background: 'rgba(124,58,237,0.07)', color: 'var(--violet-vivid)', border: '1px solid rgba(124,58,237,0.18)' }}>
                                    ⏳ {pending} pending
                                </span>
                            )}
                            {accepted > 0 && (
                                <span style={{ padding: '3px 10px', borderRadius: 9999, background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    ✓ {accepted} hired
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                            onClick={onExpand}
                            style={{
                                padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                fontFamily: 'var(--font-sans)',
                                background: expanded ? 'var(--deep-night)' : 'rgba(200,149,42,0.07)',
                                color: expanded ? '#fff' : 'var(--gold-vivid)',
                                border: expanded ? '1px solid var(--deep-night)' : '1px solid rgba(200,149,42,0.2)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {expanded ? '▲ Hide' : `👥 Talent (${ev.applicants.length})`}
                        </button>
                        <button onClick={() => onEdit(ev)}
                            className="btn btn-ghost" style={{ fontSize: 12, padding: '8px 14px' }}>
                            ✎ Edit
                        </button>
                        <button onClick={() => onDelete(ev.event_id)}
                            className="btn btn-danger" style={{ fontSize: 12, padding: '8px 14px' }}>
                            🗑 Delete
                        </button>
                    </div>
                </div>

                {/* Talent gallery — expandable */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ height: 1, background: 'rgba(200,149,42,0.12)', margin: '20px 0' }} />
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold-vivid)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                                ✦ Talent Gallery
                            </div>
                            {ev.applicants.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--ink-muted)', fontSize: 14 }}>
                                    <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>🎭</div>
                                    No applications yet. Anchors will appear here once they apply.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 14 }}>
                                    {ev.applicants.map(app => (
                                        <ApplicantCard key={app.application_id} app={app} eventStatus={ev.status}
                                            onHire={onHire} actionLoading={actionLoading} hiredId={hiredId} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ── Page ──────────────────────────────────────────────────────
export default function HostDashboard() {
    const { user_id, role, name } = useAuthStore();
    const host_id = user_id;
    const router = useRouter();

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [hiredId, setHiredId] = useState<number | null>(null);
    const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editEvent, setEditEvent] = useState<Event | null>(null);
    const [createForm, setCreateForm] = useState<CreateEvent>({ Event_Title: '', Description: '', Event_Date: '', Location: '' });
    const [editForm, setEditForm] = useState<UpdateEvent>({});
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    const fetchDashboard = useCallback(async () => {
        try {
            const data = await getHostDashboard(Number(host_id));
            setEvents(data);
        } catch { console.error('Dashboard fetch failed'); }
        finally { setLoading(false); }
    }, [host_id]);

    useEffect(() => {
        if (role && role !== 'Host') { router.replace('/'); return; }
        fetchDashboard();
    }, [host_id, role, router, fetchDashboard]);

    const handleHire = async (appId: number) => {
        setActionLoading(true);
        try {
            await hireAnchor(Number(host_id), appId);
            setHiredId(appId);
            setTimeout(() => { setHiredId(null); fetchDashboard(); }, 2500);
        } catch (err: unknown) {
            alert((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Hire failed.');
        } finally { setActionLoading(false); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault(); setActionLoading(true); setActionError('');
        try {
            await createEvent(Number(host_id), createForm);
            setCreateOpen(false);
            setCreateForm({ Event_Title: '', Description: '', Event_Date: '', Location: '' });
            fetchDashboard();
        } catch (err: unknown) {
            setActionError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Create failed.');
        } finally { setActionLoading(false); }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editEvent) return;
        setActionLoading(true); setActionError('');
        try {
            await updateEvent(Number(host_id), editEvent.event_id, editForm);
            setEditEvent(null); fetchDashboard();
        } catch (err: unknown) {
            setActionError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Update failed.');
        } finally { setActionLoading(false); }
    };

    const handleDelete = async (event_id: number) => {
        if (!confirm('Delete this event permanently?')) return;
        try { await deleteEvent(Number(host_id), event_id); fetchDashboard(); }
        catch (err: unknown) { alert((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Delete failed.'); }
    };

    const stats = {
        total: events.length,
        open: events.filter(e => e.status === 'Open').length,
        confirmed: events.filter(e => e.status === 'Confirmed').length,
        totalApplicants: events.reduce((s, e) => s + e.applicants.length, 0),
    };

    const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'H';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>

            {/* ══ DARK HERO ══════════════════════════════════════════════ */}
            <div style={{ background: 'var(--deep-night)', paddingTop: 100, position: 'relative', overflow: 'hidden' }}>
                {/* Grid */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(rgba(200,149,42,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,149,42,0.04) 1px,transparent 1px)',
                    backgroundSize: '52px 52px',
                }} />
                {/* Glows */}
                <div style={{ position: 'absolute', top: '30%', right: '8%', width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(200,149,42,0.11) 0%, transparent 65%)' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: 220, height: 220, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 65%)' }} />

                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5% 0', position: 'relative' }}>
                    <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 36 }}>

                        {/* Eyebrow + name */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginBottom: 10 }}>
                                    ✦ Host Command Suite
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 20, color: '#fff',
                                        boxShadow: '0 6px 22px rgba(200,149,42,0.4)',
                                        border: '2.5px solid rgba(255,255,255,0.15)',
                                        flexShrink: 0,
                                    }}>{initials}</div>
                                    <h1 style={{
                                        fontFamily: 'var(--font-serif)', color: 'var(--pearl-on-dark)',
                                        fontSize: 'clamp(2rem,4.5vw,3rem)', lineHeight: 1.05,
                                    }}>
                                        {name ? `${name}'s` : 'Host'}{' '}
                                        <span style={{
                                            background: 'linear-gradient(135deg, #C8952A, #E8B84B, #A78BFA)',
                                            backgroundSize: '200% auto', WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                            animation: 'border-flow 5s ease infinite',
                                        }}>
                                            Portal
                                        </span>
                                    </h1>
                                </div>
                            </div>
                            {/* Create event CTA */}
                            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                                <PrismaticButton onClick={() => setCreateOpen(true)} size="md">
                                    + Create Event
                                </PrismaticButton>
                            </motion.div>
                        </div>

                        {/* Stat chips on dark background */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 12, marginTop: 24 }}>
                            <StatChip icon="🎬" label="Total Events" value={stats.total} accent="linear-gradient(135deg, rgba(200,149,42,0.25), rgba(200,149,42,0.09))" />
                            <StatChip icon="⚡" label="Open" value={stats.open} accent="linear-gradient(135deg, rgba(124,58,237,0.25), rgba(124,58,237,0.09))" />
                            <StatChip icon="✓" label="Confirmed" value={stats.confirmed} accent="linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.09))" />
                            <StatChip icon="👥" label="Applicants" value={stats.totalApplicants} accent="linear-gradient(135deg, rgba(13,148,136,0.25), rgba(13,148,136,0.09))" />
                        </div>
                    </motion.div>
                </div>

                {/* Wave separator */}
                <svg viewBox="0 0 1440 48" style={{ display: 'block', width: '100%', height: 48 }} preserveAspectRatio="none">
                    <path d="M0,0 C480,48 960,0 1440,32 L1440,48 L0,48 Z" fill="var(--warm-white)" />
                </svg>
            </div>

            {/* ══ EVENTS SECTION ══════════════════════════════════════════ */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 5% 80px' }}>

                {/* Section label */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginBottom: 4 }}>
                            ✦ Your Events
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--ink-muted)', fontWeight: 600 }}>
                            {!loading && `${events.length} event${events.length !== 1 ? 's' : ''} total`}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[1, 2, 3].map(i => <SkeletonCard key={i} lines={3} height={120} />)}
                    </div>
                ) : events.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center', padding: '72px 32px',
                            background: '#fff', borderRadius: 24,
                            border: '1px solid rgba(200,149,42,0.1)',
                        }}
                    >
                        <div style={{ fontSize: 52, marginBottom: 18, opacity: 0.4 }}>🎬</div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', marginBottom: 10 }}>No Events Yet</h3>
                        <p style={{ color: 'var(--ink-muted)', maxWidth: 320, margin: '0 auto 28px', lineHeight: 1.7 }}>
                            Create your first event to start receiving anchor applications.
                        </p>
                        <PrismaticButton onClick={() => setCreateOpen(true)}>Create Event ✦</PrismaticButton>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <AnimatePresence>
                            {events.map((ev, i) => (
                                <motion.div key={ev.event_id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                    <EventRow
                                        ev={ev}
                                        expanded={expandedEvent === ev.event_id}
                                        onExpand={() => setExpandedEvent(expandedEvent === ev.event_id ? null : ev.event_id)}
                                        onEdit={(e) => { setEditEvent(e); setEditForm({ Event_Title: e.title, Location: '' }); }}
                                        onDelete={handleDelete}
                                        onHire={handleHire}
                                        actionLoading={actionLoading}
                                        hiredId={hiredId}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* ── Create Modal ── */}
            <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Event">
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {[
                        { key: 'Event_Title', label: 'Event Title' },
                        { key: 'Description', label: 'Description' },
                        { key: 'Location', label: 'Location' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="input-label">{f.label}</label>
                            <input className="input-field" placeholder={f.label}
                                value={String(createForm[f.key as keyof CreateEvent] ?? '')}
                                onChange={e => setCreateForm({ ...createForm, [f.key as keyof CreateEvent]: e.target.value })}
                                required
                            />
                        </div>
                    ))}
                    <div>
                        <label className="input-label">Event Date & Time</label>
                        <input className="input-field" type="datetime-local"
                            value={createForm.Event_Date}
                            onChange={e => setCreateForm({ ...createForm, Event_Date: e.target.value })}
                            required
                        />
                    </div>
                    {actionError && <div style={{ color: '#E11D48', fontSize: 13 }}>{actionError}</div>}
                    <PrismaticButton type="submit" disabled={actionLoading} size="lg" style={{ width: '100%', marginTop: 4 }}>
                        {actionLoading ? 'Creating…' : 'Create Event ✦'}
                    </PrismaticButton>
                </form>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal isOpen={!!editEvent} onClose={() => setEditEvent(null)} title={`Edit: ${editEvent?.title ?? ''}`}>
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {([
                        { key: 'Event_Title', label: 'Event Title' },
                        { key: 'Description', label: 'Description' },
                        { key: 'Location', label: 'Location' },
                    ] as { key: keyof UpdateEvent; label: string }[]).map(f => (
                        <div key={f.key as string}>
                            <label className="input-label">{f.label}</label>
                            <input className="input-field"
                                placeholder={`Current: ${editEvent?.title ?? ''}`}
                                value={(editForm as Record<string, string>)[f.key as string] ?? ''}
                                onChange={e => setEditForm({ ...editForm, [f.key as string]: e.target.value })}
                            />
                        </div>
                    ))}
                    <div>
                        <label className="input-label">New Date & Time (optional)</label>
                        <input className="input-field" type="datetime-local"
                            value={editForm.Event_Date ?? ''}
                            onChange={e => setEditForm({ ...editForm, Event_Date: e.target.value })}
                        />
                    </div>
                    {actionError && <div style={{ color: '#E11D48', fontSize: 13 }}>{actionError}</div>}
                    <PrismaticButton type="submit" disabled={actionLoading} size="lg" style={{ width: '100%', marginTop: 4 }}>
                        {actionLoading ? 'Updating…' : 'Update Event ✦'}
                    </PrismaticButton>
                </form>
            </Modal>
        </div>
    );
}
