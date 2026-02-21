interface StatusBadgeProps {
    status: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
    Open: { label: 'Open', bg: 'rgba(201,160,122,0.14)', color: '#9A6840', border: 'rgba(201,160,122,0.35)' },
    Confirmed: { label: 'Confirmed', bg: 'rgba(224,176,255,0.18)', color: '#7B4FAE', border: 'rgba(224,176,255,0.45)' },
    Completed: { label: 'Completed', bg: 'rgba(91,173,122,0.14)', color: '#2E7D52', border: 'rgba(91,173,122,0.35)' },
    Pending: { label: 'Pending', bg: 'rgba(244,247,246,0.8)', color: '#6B6B88', border: 'rgba(168,150,160,0.3)' },
    Accepted: { label: 'Accepted', bg: 'rgba(224,176,255,0.18)', color: '#7B4FAE', border: 'rgba(224,176,255,0.45)' },
    Rejected: { label: 'Rejected', bg: 'rgba(204,68,68,0.1)', color: '#CC4444', border: 'rgba(204,68,68,0.25)' },
    Cancelled: { label: 'Cancelled', bg: 'rgba(204,68,68,0.1)', color: '#CC4444', border: 'rgba(204,68,68,0.25)' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status,
        bg: 'rgba(168,150,160,0.12)',
        color: '#6B6B88',
        border: 'rgba(168,150,160,0.25)',
    };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 11px',
            borderRadius: 9999,
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-sans)',
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
            {cfg.label}
        </span>
    );
}
