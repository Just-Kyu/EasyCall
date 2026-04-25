import { useMemo, useState } from 'react';
import {
  Phone,
  Delete,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownLeft,
  PhoneMissed,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatPhoneNumber, formatRelativeTime } from '@/lib/utils';

type Tab = 'keypad' | 'calls' | 'voicemail' | 'notes';

const KEYS: { k: string; s: string }[] = [
  { k: '1', s: '' },
  { k: '2', s: 'ABC' },
  { k: '3', s: 'DEF' },
  { k: '4', s: 'GHI' },
  { k: '5', s: 'JKL' },
  { k: '6', s: 'MNO' },
  { k: '7', s: 'PQRS' },
  { k: '8', s: 'TUV' },
  { k: '9', s: 'WXYZ' },
  { k: '*', s: '' },
  { k: '0', s: '+' },
  { k: '#', s: '' },
];

export function DialpadPage() {
  const accounts = useStore((s) => s.accounts);
  const defaultId = useStore((s) => s.defaultFromNumberId);
  const placeCall = useStore((s) => s.placeCall);
  const history = useStore((s) => s.callHistory);

  const [tab, setTab] = useState<Tab>('keypad');
  const [fromId, setFromId] = useState<string | null>(defaultId);
  const [dest, setDest] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const allNumbers = useMemo(
    () => accounts.flatMap((a) => a.numbers.map((n) => ({ ...n, accountName: a.name }))),
    [accounts],
  );
  const selectedFromId = fromId ?? defaultId ?? allNumbers[0]?.id ?? null;
  const fromNum = allNumbers.find((n) => n.id === selectedFromId) ?? null;

  const recentCalls = history.slice(0, 5);

  const press = (k: string) => setDest((v) => v + k);
  const back = () => setDest((v) => v.slice(0, -1));

  async function call() {
    setError(null);
    if (!selectedFromId) {
      setError('Choose a "From:" number first.');
      return;
    }
    const digits = dest.replace(/\D/g, '');
    if (digits.length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }
    try {
      await placeCall(selectedFromId, dest.startsWith('+') ? dest : `+${digits}`);
      setDest('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start call');
    }
  }

  return (
    <div
      className="dialpage"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '32px 24px',
        gap: 28,
        flexWrap: 'wrap',
      }}
    >
      {/* Phone shell */}
      <div
        style={{
          width: 340,
          background: 'var(--surface)',
          borderRadius: 18,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="ec-tabs">
          {(['keypad', 'calls', 'voicemail', 'notes'] as const).map((t) => (
            <button
              key={t}
              className={'ec-tab' + (tab === t ? ' active' : '')}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'keypad' && (
          <div style={{ padding: '14px 18px 22px' }}>
            {/* Caller ID picker */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <button
                onClick={() => setPickerOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--ec-orange-50)',
                  border: '1px solid var(--ec-orange-100)',
                  color: 'var(--ec-orange-600)',
                  borderRadius: 999,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <span className="muted" style={{ color: 'var(--text-muted)' }}>
                  Caller ID:
                </span>
                <strong className="mono">
                  {fromNum ? formatPhoneNumber(fromNum.number) : 'No number'}
                </strong>
                <ChevronDown size={12} />
              </button>
              {pickerOpen && allNumbers.length > 0 && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: 36,
                    zIndex: 10,
                    minWidth: 280,
                    maxHeight: 280,
                    overflow: 'auto',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {accounts.map((a) => (
                    <div key={a.id}>
                      <div
                        className="muted"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '10px 14px 4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {a.name}
                      </div>
                      {a.numbers.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            setFromId(n.id);
                            setPickerOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            width: '100%',
                            padding: '8px 14px',
                            border: 'none',
                            background:
                              n.id === selectedFromId ? 'var(--ec-orange-50)' : 'transparent',
                            color:
                              n.id === selectedFromId
                                ? 'var(--ec-orange-600)'
                                : 'var(--text)',
                            cursor: 'pointer',
                            fontSize: 13,
                            alignItems: 'center',
                            gap: 8,
                            justifyContent: 'space-between',
                          }}
                        >
                          <span className="mono">{formatPhoneNumber(n.number)}</span>
                          <span className="soft" style={{ fontSize: 11 }}>
                            {n.label || 'Unlabeled'}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Number input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 14,
                marginBottom: 6,
                position: 'relative',
              }}
            >
              <input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') call();
                }}
                placeholder="Enter a name or number"
                className="mono"
                style={{
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'center',
                  fontSize: 22,
                  fontWeight: 500,
                  color: 'var(--text)',
                  width: '100%',
                  outline: 'none',
                }}
              />
              {dest && (
                <button
                  onClick={back}
                  className="btn-ghost btn-icon"
                  aria-label="Backspace"
                  style={{ position: 'absolute', right: 0 }}
                >
                  <Delete size={16} />
                </button>
              )}
            </div>

            {/* Keypad grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 4,
                margin: '8px 0 14px',
              }}
            >
              {KEYS.map(({ k, s }) => (
                <button key={k} onClick={() => press(k)} className="dialpad-key">
                  <span className="digit">{k}</span>
                  <span className="sub">{s}</span>
                </button>
              ))}
            </div>

            {error && (
              <div
                style={{
                  borderRadius: 8,
                  border: '1px solid #FECACA',
                  background: 'var(--red-50)',
                  color: 'var(--red)',
                  padding: '8px 12px',
                  fontSize: 12.5,
                  marginBottom: 12,
                }}
              >
                {error}
              </div>
            )}

            {/* Call button row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                gap: 12,
              }}
            >
              <div style={{ width: 44 }} />
              <button
                onClick={call}
                disabled={!dest.trim()}
                className="call-btn"
                aria-label="Call"
              >
                <Phone size={22} strokeWidth={2.2} fill="white" />
              </button>
              <div style={{ width: 44 }} />
            </div>
          </div>
        )}

        {tab === 'calls' && <CallsTabContent />}
        {tab === 'voicemail' && <ComingSoonInline label="Visual voicemail" />}
        {tab === 'notes' && <ComingSoonInline label="Per-call notes" />}
      </div>

      {/* Side panels */}
      <div
        style={{
          maxWidth: 380,
          flex: '0 1 380px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div className="card">
          <div className="card-head">
            <Clock size={14} className="soft" />
            <div className="card-title">Recent activity</div>
            <div className="spacer" />
          </div>
          <div>
            {recentCalls.length === 0 && (
              <div
                style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13 }}
                className="soft"
              >
                No recent calls yet.
              </div>
            )}
            {recentCalls.map((c) => {
              const isMissed = c.status === 'missed';
              const isInbound = c.direction === 'inbound';
              const Icon = isMissed ? PhoneMissed : isInbound ? ArrowDownLeft : ArrowUpRight;
              const color = isMissed
                ? 'var(--red)'
                : isInbound
                  ? 'var(--green)'
                  : 'var(--text-muted)';
              const display = isInbound ? c.fromNumber : c.toNumber;
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ color }}>
                    <Icon size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }} className="mono">
                      {formatPhoneNumber(display)}
                    </div>
                    <div className="soft mono" style={{ fontSize: 11 }}>
                      via {c.businessNumberLabel || c.businessNumberUsed}
                    </div>
                  </div>
                  <div className="soft" style={{ fontSize: 11 }}>
                    {formatRelativeTime(c.startedAt)}
                  </div>
                  <button
                    className="btn-ghost btn-icon"
                    style={{ width: 26, height: 26 }}
                    onClick={() => setDest(display)}
                    aria-label="Redial"
                    title="Redial"
                  >
                    <Phone size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <Star size={14} className="soft" />
            <div className="card-title">Speed dial</div>
          </div>
          <div className="card-body">
            <div className="soft" style={{ fontSize: 13 }}>
              Pin contacts here for one-tap calling. (Coming soon.)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CallsTabContent() {
  const history = useStore((s) => s.callHistory).slice(0, 8);
  return (
    <div style={{ padding: '6px 0 16px' }}>
      {history.length === 0 && (
        <div className="soft" style={{ padding: 24, textAlign: 'center', fontSize: 13 }}>
          No calls yet.
        </div>
      )}
      {history.map((c) => {
        const isMissed = c.status === 'missed';
        const isInbound = c.direction === 'inbound';
        const Icon = isMissed ? PhoneMissed : isInbound ? ArrowDownLeft : ArrowUpRight;
        const color = isMissed
          ? 'var(--red)'
          : isInbound
            ? 'var(--green)'
            : 'var(--text-muted)';
        const display = isInbound ? c.fromNumber : c.toNumber;
        return (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ color }}>
              <Icon size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontWeight: 500 }}>
                {formatPhoneNumber(display)}
              </div>
              <div className="soft" style={{ fontSize: 11.5 }}>
                {c.businessNumberLabel || c.businessNumberUsed}
              </div>
            </div>
            <div className="soft" style={{ fontSize: 11.5 }}>
              {formatRelativeTime(c.startedAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComingSoonInline({ label }: { label: string }) {
  return (
    <div
      style={{ padding: '40px 20px', textAlign: 'center' }}
      className="soft"
    >
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 12.5 }}>Coming soon.</div>
    </div>
  );
}
