// ═══════════════════════════════════════════════════
//  UN COMMITTEE — GSL & TIMER DASHBOARD (React)
// ═══════════════════════════════════════════════════

const { useState, useEffect, useRef, useCallback } = React;

// ── COUNTRY → FLAG EMOJI ──────────────────────────
const flagMap = {
  "United States": "🇺🇸", "USA": "🇺🇸", "US": "🇺🇸",
  "United Kingdom": "🇬🇧", "UK": "🇬🇧",
  "France": "🇫🇷", "Germany": "🇩🇪", "Russia": "🇷🇺",
  "China": "🇨🇳", "Japan": "🇯🇵", "India": "🇮🇳",
  "Brazil": "🇧🇷", "Canada": "🇨🇦", "Australia": "🇦🇺",
  "South Africa": "🇿🇦", "Nigeria": "🇳🇬", "Egypt": "🇪🇬",
  "Saudi Arabia": "🇸🇦", "Israel": "🇮🇱", "Pakistan": "🇵🇰",
  "Argentina": "🇦🇷", "Mexico": "🇲🇽", "Italy": "🇮🇹",
  "Spain": "🇪🇸", "South Korea": "🇰🇷", "Indonesia": "🇮🇩",
  "Turkey": "🇹🇷", "Iran": "🇮🇷", "Ukraine": "🇺🇦",
  "Poland": "🇵🇱", "Sweden": "🇸🇪", "Norway": "🇳🇴",
  "Netherlands": "🇳🇱", "Switzerland": "🇨🇭", "Singapore": "🇸🇬",
  "New Zealand": "🇳🇿", "Chile": "🇨🇱", "Colombia": "🇨🇴",
  "Venezuela": "🇻🇪", "Cuba": "🇨🇺", "Lebanon": "🇱🇧",
  "Syria": "🇸🇾", "Iraq": "🇮🇶", "Afghanistan": "🇦🇫",
  "Ethiopia": "🇪🇹", "Kenya": "🇰🇪", "Ghana": "🇬🇭",
  "Morocco": "🇲🇦", "Algeria": "🇩🇿", "Libya": "🇱🇾",
  "Sudan": "🇸🇩", "Somalia": "🇸🇴", "Rwanda": "🇷🇼",
  "Bangladesh": "🇧🇩", "Sri Lanka": "🇱🇰", "Nepal": "🇳🇵",
  "Myanmar": "🇲🇲", "Thailand": "🇹🇭", "Vietnam": "🇻🇳",
  "Philippines": "🇵🇭", "Malaysia": "🇲🇾", "Cambodia": "🇰🇭",
};

const getFlag = (name) => {
  if (!name) return "🌐";
  for (const [key, flag] of Object.entries(flagMap)) {
    if (name.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(name.toLowerCase())) return flag;
  }
  return "🌐";
};

// ── UN EMBLEM SVG ─────────────────────────────────
const UNEmblem = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="un-emblem">
    <circle cx="50" cy="50" r="46" fill="none" stroke="#c9a84c" strokeWidth="2"/>
    <circle cx="50" cy="50" r="36" fill="none" stroke="#c9a84c" strokeWidth="1"/>
    <circle cx="50" cy="50" r="24" fill="none" stroke="#c9a84c" strokeWidth="1"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke="#c9a84c" strokeWidth="1"/>
    <line x1="4" y1="50" x2="96" y2="50" stroke="#c9a84c" strokeWidth="1"/>
    <line x1="50" y1="4" x2="50" y2="96" stroke="#c9a84c" strokeWidth="1"/>
    <ellipse cx="50" cy="50" rx="46" ry="18" fill="none" stroke="#c9a84c" strokeWidth="1"/>
    <ellipse cx="50" cy="50" rx="28" ry="46" fill="none" stroke="#c9a84c" strokeWidth="1"/>
    <text x="50" y="54" textAnchor="middle" fontFamily="Cinzel" fontSize="10" fill="#c9a84c" fontWeight="700">UN</text>
  </svg>
);

// ── TIMER RING ────────────────────────────────────
const TimerRing = ({ seconds, totalSeconds, running, paused }) => {
  const R = 85;
  const CIRC = 2 * Math.PI * R;
  const pct = totalSeconds > 0 ? seconds / totalSeconds : 1;
  const offset = CIRC * (1 - pct);
  const danger = seconds <= 10 && seconds > 0;
  const stateClass = danger ? 'danger' : paused ? 'paused' : running ? 'running' : '';

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  const stateLabel = running ? 'IN SESSION' : paused ? 'PAUSED' : 'READY';

  return (
    <div className="timer-display-wrap">
      <div className="timer-ring-container">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle className="timer-ring-bg" cx="100" cy="100" r={R}/>
          <circle
            className={`timer-ring-progress ${stateClass}`}
            cx="100" cy="100" r={R}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="timer-text-overlay">
          <div className={`timer-digits ${danger ? 'danger' : ''}`}>{display}</div>
          <div className="timer-state-label">{stateLabel}</div>
        </div>
      </div>
    </div>
  );
};

// ── TOAST ─────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState({ msg: '', show: false });
  const show = (msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2200);
  };
  return [toast, show];
};

// ── API HELPERS ───────────────────────────────────
const api = {
  get:  (path)       => fetch(path).then(r => r.json()),
  post: (path, body) => fetch(path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body||{}) }).then(r => r.json()),
  del:  (path)       => fetch(path, { method:'DELETE' }).then(r => r.json()),
};

// ── SESSION LOG ───────────────────────────────────
const SessionLog = ({ refresh }) => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/api/log').then(setLogs); }, [refresh]);

  const fmt = (ts) => {
    const d = new Date(ts + 'Z');
    return d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  };

  const eventLabel = (e) => {
    if (e.startsWith('YIELD_DELEGATE:')) return `YIELDED → ${e.split(':')[1]}`;
    return e.replace(/_/g,' ');
  };

  return (
    <div className="card log-card">
      <div className="card-header">
        <div className="card-icon">📋</div>
        <div>
          <div className="card-title">Session Log</div>
          <div className="card-subtitle">procedural record</div>
        </div>
      </div>
      <div className="card-body">
        <div className="log-list">
          {logs.length === 0 && <div style={{color:'var(--gold-dim)', fontStyle:'italic', fontSize:'13px'}}>No events recorded yet.</div>}
          {logs.map(l => (
            <div key={l.id} className="log-item">
              <span className="log-time">{fmt(l.timestamp)}</span>
              <span className="log-event">{eventLabel(l.event)}</span>
              {l.country && <span className="log-country">· {l.country}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────
const App = () => {
  // GSL state
  const [gsl, setGsl] = useState([]);
  const [newCountry, setNewCountry] = useState('');
  const [logRefresh, setLogRefresh] = useState(0);

  // Timer state
  const [totalSecs, setTotalSecs] = useState(60);
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(60);
  const intervalRef = useRef(null);

  // Yield state
  const [showYield, setShowYield] = useState(false);
  const [yieldTarget, setYieldTarget] = useState('');

  const [toast, showToast] = useToast();

  // Fetch GSL
  const fetchGSL = useCallback(() => {
    api.get('/api/gsl').then(setGsl);
  }, []);

  useEffect(() => { fetchGSL(); }, []);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setPaused(false);
            showToast('TIME EXPIRED');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleStart = () => {
    if (seconds === 0) setSeconds(totalSecs);
    setRunning(true);
    setPaused(false);
  };

  const handlePause = () => {
    setRunning(false);
    setPaused(true);
    setShowYield(true);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setPaused(false);
    setShowYield(false);
    setSeconds(totalSecs);
  };

  const setPreset = (s) => {
    if (!running) {
      setTotalSecs(s);
      setSeconds(s);
      setSelectedPreset(s);
    }
  };

  // Add country
  const handleAdd = async (e) => {
    e?.preventDefault();
    const c = newCountry.trim();
    if (!c) return;
    await api.post('/api/gsl/add', { country: c });
    setNewCountry('');
    fetchGSL();
    setLogRefresh(r => r+1);
    showToast(`${c} ADDED TO GSL`);
  };

  // Remove
  const handleRemove = async (id, name) => {
    await api.del(`/api/gsl/remove/${id}`);
    fetchGSL();
    setLogRefresh(r => r+1);
    showToast(`${name} REMOVED`);
  };

  // Move bottom
  const handleBottom = async (id, name) => {
    await api.post(`/api/gsl/move-bottom/${id}`);
    fetchGSL();
    setLogRefresh(r => r+1);
    showToast(`${name} MOVED TO BOTTOM`);
  };

  // Yield actions
  const handleYield = async (type) => {
    if (type === 'delegate' && !yieldTarget.trim()) {
      showToast('ENTER DELEGATE NAME');
      return;
    }
    await api.post('/api/gsl/yield', { type, target: yieldTarget.trim() });
    setRunning(false);
    setPaused(false);
    setShowYield(false);
    setSeconds(type === 'chair' ? totalSecs : seconds);
    if (type === 'chair') {
      setSeconds(totalSecs);
      showToast('YIELDED TO CHAIR');
    } else if (type === 'delegate') {
      showToast(`YIELDED TO ${yieldTarget.toUpperCase()}`);
      setYieldTarget('');
    } else {
      showToast('YIELDED TO QUESTIONS');
    }
    fetchGSL();
    setLogRefresh(r => r+1);
  };

  const handleClear = async () => {
    if (!window.confirm('Clear entire GSL? This cannot be undone.')) return;
    await api.post('/api/clear');
    fetchGSL();
    setLogRefresh(r => r+1);
    showToast('GSL CLEARED');
  };

  const current = gsl[0];
  const queue = gsl.slice(1);

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="un-header">
        <UNEmblem />
        <div className="header-eyebrow">United Nations · Model United Nations</div>
        <h1 className="header-title">Committee Session Dashboard</h1>
        <div className="header-subtitle">General Speakers' List &amp; Procedural Timer</div>
        <div className="header-divider"/>
      </header>

      {/* Status bar */}
      <div className="status-bar">
        <span className="status-dot"/>
        <span>SESSION LIVE</span>
        <span>·</span>
        <span>GSL: {gsl.length} DELEGATE{gsl.length !== 1 ? 'S' : ''}</span>
        <span>·</span>
        <span>{new Date().toLocaleDateString('en-GB', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}</span>
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">

        {/* ─── GSL Card ─── */}
        <div className="card gsl-card">
          <div className="card-header">
            <div className="card-icon">🎙</div>
            <div>
              <div className="card-title">General Speakers' List</div>
              <div className="card-subtitle">delegate queue management</div>
            </div>
            <button
              onClick={handleClear}
              style={{ marginLeft:'auto', background:'transparent', border:'1px solid rgba(192,57,43,0.3)', color:'var(--red)', fontFamily:'var(--font-display)', fontSize:'8px', letterSpacing:'2px', padding:'5px 10px', borderRadius:'2px', cursor:'pointer', textTransform:'uppercase' }}
            >
              Clear All
            </button>
          </div>
          <div className="card-body">
            {/* Add form */}
            <div className="gsl-add-form">
              <input
                className="gsl-input"
                placeholder="Enter country name (e.g. India, France…)"
                value={newCountry}
                onChange={e => setNewCountry(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <button className="btn-add" onClick={handleAdd}>+ Add</button>
            </div>

            {/* Current speaker */}
            {current ? (
              <div className="current-speaker">
                <div className="live-badge"><span className="live-dot"/>On Floor</div>
                <div style={{ display:'flex', alignItems:'center' }}>
                  <span className="speaker-flag">{getFlag(current.country)}</span>
                  <div>
                    <div className="current-speaker-name">{current.country}</div>
                    <div className="current-speaker-meta">Position #1 · Speaking Rights Active</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-speaker">No delegate currently on floor. Add countries to the GSL to begin.</div>
            )}

            {/* Queue */}
            {queue.length > 0 && (
              <>
                <div className="queue-label">Speakers In Queue ({queue.length})</div>
                <div className="queue-list">
                  {queue.map((item, i) => (
                    <div key={item.id} className="queue-item">
                      <span className="queue-pos">#{i+2}</span>
                      <span style={{fontSize:'20px', flexShrink:0}}>{getFlag(item.country)}</span>
                      <span className="queue-country">{item.country}</span>
                      <div className="queue-actions">
                        <button className="q-btn q-btn-bottom" onClick={() => handleBottom(item.id, item.country)}>↓ End</button>
                        <button className="q-btn q-btn-remove" onClick={() => handleRemove(item.id, item.country)}>✕ Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {queue.length === 0 && current && (
              <div className="empty-queue">No further speakers in queue.</div>
            )}
          </div>
        </div>

        {/* ─── Timer Card ─── */}
        <div className="card timer-card">
          <div className="card-header">
            <div className="card-icon">⏱</div>
            <div>
              <div className="card-title">Committee Timer</div>
              <div className="card-subtitle">speaking time control</div>
            </div>
          </div>
          <div className="card-body">
            {/* Presets */}
            <div className="timer-presets">
              {[30, 60, 90, 120].map(s => (
                <button
                  key={s}
                  className={`preset-btn ${selectedPreset === s ? 'active' : ''}`}
                  onClick={() => setPreset(s)}
                >
                  {s < 60 ? `${s}s` : `${s/60}m`}
                </button>
              ))}
            </div>

            {/* Ring */}
            <TimerRing
              seconds={seconds}
              totalSeconds={totalSecs}
              running={running}
              paused={paused}
            />

            {/* Controls */}
            <div className="timer-controls">
              <button className="btn btn-start" onClick={handleStart} disabled={running}>
                ▶ Start
              </button>
              <button className="btn btn-pause" onClick={handlePause} disabled={!running}>
                ⏸ Pause
              </button>
              <button className="btn btn-reset" onClick={handleReset}>
                ↺ Reset
              </button>
            </div>

            {/* Yield panel */}
            {showYield && (
              <div className="yield-panel">
                <div className="yield-title">⚖ Yield Protocol</div>
                <div className="yield-buttons">
                  <button className="btn btn-danger" onClick={() => handleYield('chair')}>
                    Yield to Chair
                  </button>
                  <div>
                    <input
                      className="yield-input"
                      placeholder="Delegate country name…"
                      value={yieldTarget}
                      onChange={e => setYieldTarget(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleYield('delegate')}
                    />
                    <button className="btn btn-gold" onClick={() => handleYield('delegate')}>
                      Yield to Delegate
                    </button>
                  </div>
                  <button className="btn btn-gold" onClick={() => handleYield('questions')} style={{ marginTop:'4px' }}>
                    Yield to Questions
                  </button>
                  <button
                    onClick={() => setShowYield(false)}
                    style={{ marginTop:'6px', background:'transparent', border:'none', color:'var(--gold-dim)', fontFamily:'var(--font-display)', fontSize:'9px', letterSpacing:'2px', cursor:'pointer', textTransform:'uppercase' }}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Session Log ─── */}
        <SessionLog refresh={logRefresh} />
      </div>

      {/* Footer */}
      <footer className="un-footer">
        United Nations · Model United Nations · GSL Committee Dashboard · Built for Chairperson Use
      </footer>

      {/* Toast */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
