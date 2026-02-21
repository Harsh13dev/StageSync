interface SkeletonCardProps {
    lines?: number;
    height?: number;
}

export default function SkeletonCard({ lines = 3, height = 180 }: SkeletonCardProps) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            padding: '24px',
            height: height,
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Shimmer overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(
                    105deg,
                    transparent 30%,
                    rgba(231,210,204,0.25) 50%,
                    rgba(224,176,255,0.12) 55%,
                    transparent 70%
                )`,
                backgroundSize: '300% 100%',
                animation: 'pearl-shimmer 1.8s linear infinite',
                borderRadius: 'inherit',
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ width: '45%', height: 12, borderRadius: 6, background: 'rgba(168,150,160,0.15)' }} />
                {Array.from({ length: lines }).map((_, i) => (
                    <div key={i} style={{
                        height: 10,
                        width: `${85 - i * 12}%`,
                        borderRadius: 5,
                        background: 'rgba(168,150,160,0.10)',
                    }} />
                ))}
            </div>
        </div>
    );
}
