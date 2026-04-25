import { Sparkles, Check } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  bullets: string[];
}

export function ComingSoonPage({ title, description, bullets }: Props) {
  return (
    <div className="p-6">
      <div className="card mx-auto" style={{ maxWidth: 640 }}>
        <div className="card-body" style={{ padding: 32, textAlign: 'left' }}>
          <div
            className="brand-mark"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Sparkles size={22} strokeWidth={2.2} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
            {title}
          </h2>
          <p className="muted" style={{ marginTop: 8, marginBottom: 20, fontSize: 14 }}>
            {description}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {bullets.map((b) => (
              <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: 'var(--ec-orange-50)',
                    color: 'var(--ec-orange-600)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span style={{ fontSize: 13.5 }}>{b}</span>
              </li>
            ))}
          </ul>
          <div
            className="pill orange"
            style={{ marginTop: 24, display: 'inline-flex' }}
          >
            <span className="dot" style={{ background: 'currentColor' }} /> Coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
