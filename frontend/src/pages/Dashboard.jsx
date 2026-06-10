import { useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const SCHEMES = [
  { id: 1, name: "PM-KISAN Samman Nidhi",            tag: "Income Support", benefit: "Rs 6,000 per year direct to your bank account in three equal instalments.",               ministry: "Ministry of Agriculture" },
  { id: 2, name: "Pradhan Mantri Fasal Bima Yojana", tag: "Insurance",      benefit: "Crop insurance at heavily subsidised premium rates — protect your harvest from losses.",  ministry: "Ministry of Agriculture" },
  { id: 3, name: "Kisan Credit Card",                tag: "Credit",         benefit: "Short-term credit up to Rs 3 lakh at just 4% interest for agricultural needs.",           ministry: "Ministry of Finance"     },
  { id: 4, name: "Soil Health Card Scheme",          tag: "Advisory",       benefit: "Free soil testing with crop-wise nutrient recommendations to boost yield.",               ministry: "Ministry of Agriculture" },
];

const SCHEME_ACTIONS = [
  { id: "browse",    label: "Browse Schemes",        desc: "1,200+ central & state schemes",             to: "/schemes" },
  { id: "eligib",    label: "Check Eligibility",     desc: "Find out which schemes you qualify for",     to: "/schemes" },
  { id: "track",     label: "Track Applications",    desc: "Monitor status of schemes you've applied",   to: "/schemes" },
  { id: "recommend", label: "Get Recommendations",   desc: "Schemes matched to your crops & location",   to: "/schemes" },
];

const STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

const CROPS = [
  "Rice","Wheat","Maize","Cotton","Sugarcane","Soybean",
  "Groundnut","Mustard","Onion","Tomato","Potato","Pulses",
];

// Farm setup state — toggle to true to preview the "farm data" state
const HAS_FARM_DATA = false;

const FARM_STATUS = {
  crop: "Wheat",
  season: "Rabi",
  stage: "Tillering",
  sowingDate: "15 Nov 2024",
  harvestEst: "20 Mar 2025",
  landSize: "3.5 acres",
  soilType: "Loamy",
  nextAction: "Apply second dose of nitrogen fertilizer",
  weather: { label: "Partly Cloudy", temp: "18°C", humidity: "64%", wind: "12 km/h", condition: "good" },
  alert: { text: "Watch for yellow rust in the next 10 days", severity: "medium" },
  health: 82, // crop health %
};

const FARM_FEATURES = [
  { icon: "crop",    title: "Crop Stage Tracking",        desc: "Know exactly where your crop is in its growth cycle." },
  { icon: "weather", title: "Live Weather & Humidity",     desc: "Real-time conditions tailored to your farm's location." },
  { icon: "alert",   title: "Pest & Disease Alerts",       desc: "Early warnings before problems become losses." },
  { icon: "ai",      title: "AI Fertilizer Reminders",     desc: "Get told what to apply and when, crop by crop." },
  { icon: "schemes", title: "Personalised Scheme Matches", desc: "Schemes filtered exactly for your crop and district." },
  { icon: "disease", title: "Photo Disease Detection",     desc: "Snap a leaf — our AI identifies the issue instantly." },
];

const Icons = {
  browse:    <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="2.5" rx="1.2" fill="currentColor"/><rect x="3" y="8.75" width="10" height="2.5" rx="1.2" fill="currentColor"/><rect x="3" y="13.5" width="7" height="2.5" rx="1.2" fill="currentColor"/></svg>,
  eligib:    <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  track:     <svg viewBox="0 0 20 20" fill="none"><circle cx="5" cy="7" r="1.5" fill="currentColor"/><circle cx="5" cy="13" r="1.5" fill="currentColor"/><rect x="9" y="6" width="8" height="2" rx="1" fill="currentColor"/><rect x="9" y="12" width="5" height="2" rx="1" fill="currentColor"/></svg>,
  recommend: <svg viewBox="0 0 20 20" fill="none"><path d="M10 3l1.8 3.6L16 7.6l-4 3.9.94 5.5L10 14.5l-4.94 2.7.94-5.5L2 7.8 7.5 7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  ai:        <svg viewBox="0 0 20 20" fill="none"><path d="M5 13.5C3.5 12.5 3 11 3 9.5A7 7 0 0 1 17 9.5c0 1.5-.5 3-2 4l-.5 3H5.5L5 13.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  disease:   <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.4"/></svg>,
  arrow:     <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron:   <svg viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  check:     <svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  farm:      <svg viewBox="0 0 20 20" fill="none"><path d="M2 17l4-8 4 4 3-6 5 10H2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="15" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>,
  schemes:   <svg viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5 5.5.8-4 3.9.94 5.5L10 14.5l-4.94 2.7.94-5.5L2 7.8 7.5 7z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round"/></svg>,
  alert:     <svg viewBox="0 0 20 20" fill="none"><path d="M10 3L2.5 16.5h15L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 9v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="10" cy="14.5" r="0.8" fill="currentColor"/></svg>,
  weather:   <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M5 14a4 4 0 0 1 10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  setup:     <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  crop:      <svg viewBox="0 0 20 20" fill="none"><path d="M10 18V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 10C10 6 6 4 3 5c1 3 4 5 7 5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M10 10c0-4 4-6 7-5-1 3-4 5-7 5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  humidity:  <svg viewBox="0 0 20 20" fill="none"><path d="M10 3C10 3 5 9 5 13a5 5 0 0 0 10 0c0-4-5-10-5-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  wind:      <svg viewBox="0 0 20 20" fill="none"><path d="M3 8h9a2 2 0 1 0-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M3 12h12a2 2 0 1 1-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  calendar:  <svg viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8h14M7 3v2M13 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  health:    <svg viewBox="0 0 20 20" fill="none"><path d="M10 16s-7-4.5-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 17 7c0 4.5-7 9-7 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
};

function ProgressRing({ pct, size = 44, stroke = 3.5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="db-ring-svg" aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} className="db-ring-track" fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} className="db-ring-fill" fill="none"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
}

function HealthBar({ pct }) {
  const color = pct >= 75 ? "var(--leaf)" : pct >= 50 ? "var(--amber)" : "#e05c5c";
  return (
    <div className="db-health-bar-wrap">
      <div className="db-health-bar-track">
        <div className="db-health-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="db-health-bar-label" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function Dashboard() {
  const [selectedState,  setSelectedState]  = useState("");
  const [selectedCrop,   setSelectedCrop]   = useState("");
  const [activeChip,     setActiveChip]     = useState(null);
  const [expandedScheme, setExpandedScheme] = useState(null);

  const toggleChip = (c) => setActiveChip((p) => (p === c ? null : c));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const pct = !selectedState && !selectedCrop ? 10
            : selectedState  && !selectedCrop ? 30
            : !selectedState && selectedCrop  ? 30
            : 60;

  return (
    <div className="db-page">

      {/* ── HEADER ── */}
      <header className="db-header">
        <div className="db-header-inner">
          <div className="db-brand">
            <span className="db-brand-icon db-brand-leaf">{Icons.farm}</span>
            <span className="db-brand-name">KrishiMitra</span>
          </div>
          <nav className="db-nav">
            <Link to="/schemes" className="db-nav-link">Schemes</Link>
            <Link to="/profile" className="db-nav-link">Profile</Link>
            <button className="db-nav-avatar" aria-label="Account">R</button>
          </nav>
        </div>
      </header>

      <div className="db-body">

        {/* ── 1. GREETING HERO ── */}
        <section className="db-hero">
          <p className="db-hero-greeting">{greeting}, Ramesh</p>
          <p className="db-hero-sub">
            {HAS_FARM_DATA
              ? "Here's what's happening on your farm today."
              : "Set up your farm profile to get personalised insights."}
          </p>
        </section>

        {/* ── 2. QUICK LINKS (Schemes + Farm) ── */}
        <section className="db-pillars">
          <Link to="/schemes" className="db-pillar-card db-pillar-schemes">
            <div className="db-pillar-icon-wrap db-pillar-icon-schemes">
              <span className="db-pillar-icon">{Icons.schemes}</span>
            </div>
            <div className="db-pillar-body">
              <h2 className="db-pillar-title">Government Schemes</h2>
              <p className="db-pillar-desc">Find benefits, subsidies and support for your farm.</p>
            </div>
            <span className="db-pillar-cta">Browse Schemes <span className="db-pillar-arrow">{Icons.arrow}</span></span>
          </Link>

          <Link to="/farm" className="db-pillar-card db-pillar-farm">
            <div className="db-pillar-icon-wrap db-pillar-icon-farm">
              <span className="db-pillar-icon">{Icons.farm}</span>
            </div>
            <div className="db-pillar-body">
              <h2 className="db-pillar-title">My Farm</h2>
              <p className="db-pillar-desc">Track crops, receive guidance and monitor farm progress.</p>
            </div>
            <span className="db-pillar-cta">Open My Farm <span className="db-pillar-arrow">{Icons.arrow}</span></span>
          </Link>
        </section>

        {/* ── 3. MY FARM STATUS ── */}
        <section className="db-section db-farm-section">
          {HAS_FARM_DATA ? (
            /* ── FILLED STATE: Full farm dashboard ── */
            <div className="db-farm-full">
              {/* Top bar */}
              <div className="db-farm-full-header">
                <div className="db-farm-full-title-group">
                  <span className="db-farm-badge">{Icons.crop} {FARM_STATUS.crop} · {FARM_STATUS.season}</span>
                  <h2 className="db-farm-full-title">My Farm</h2>
                </div>
                <Link to="/farm" className="db-text-cta">
                  Full details <span>{Icons.arrow}</span>
                </Link>
              </div>

              {/* Stage + health row */}
              <div className="db-farm-stage-row">
                <div className="db-farm-stage-card">
                  <span className="db-farm-stage-label">Growth Stage</span>
                  <span className="db-farm-stage-value">{FARM_STATUS.stage}</span>
                  <div className="db-farm-stage-bar">
                    <div className="db-farm-stage-track">
                      <div className="db-farm-stage-fill" style={{ width: "45%" }} />
                    </div>
                    <span className="db-farm-stage-pct">45% of season</span>
                  </div>
                </div>
                <div className="db-farm-stage-card db-farm-health-card">
                  <span className="db-farm-stage-label">Crop Health</span>
                  <span className="db-farm-stage-value db-farm-health-val">{FARM_STATUS.health}%</span>
                  <HealthBar pct={FARM_STATUS.health} />
                </div>
              </div>

              {/* Weather + humidity grid */}
              <div className="db-farm-metrics-grid">
                <div className="db-farm-metric">
                  <span className="db-farm-metric-icon db-metric-weather">{Icons.weather}</span>
                  <div>
                    <span className="db-farm-metric-label">Weather</span>
                    <span className="db-farm-metric-value">{FARM_STATUS.weather.label} · {FARM_STATUS.weather.temp}</span>
                  </div>
                </div>
                <div className="db-farm-metric">
                  <span className="db-farm-metric-icon db-metric-humidity">{Icons.humidity}</span>
                  <div>
                    <span className="db-farm-metric-label">Humidity</span>
                    <span className="db-farm-metric-value">{FARM_STATUS.weather.humidity}</span>
                  </div>
                </div>
                <div className="db-farm-metric">
                  <span className="db-farm-metric-icon db-metric-wind">{Icons.wind}</span>
                  <div>
                    <span className="db-farm-metric-label">Wind</span>
                    <span className="db-farm-metric-value">{FARM_STATUS.weather.wind}</span>
                  </div>
                </div>
                <div className="db-farm-metric">
                  <span className="db-farm-metric-icon db-metric-calendar">{Icons.calendar}</span>
                  <div>
                    <span className="db-farm-metric-label">Harvest Est.</span>
                    <span className="db-farm-metric-value">{FARM_STATUS.harvestEst}</span>
                  </div>
                </div>
              </div>

              {/* Next action */}
              <div className="db-farm-action-card">
                <span className="db-farm-action-label">Next Recommended Action</span>
                <p className="db-farm-action-text">{FARM_STATUS.nextAction}</p>
              </div>

              {/* Alert */}
              {FARM_STATUS.alert && (
                <div className={`db-farm-alert db-farm-alert-${FARM_STATUS.alert.severity}`}>
                  <span className="db-farm-alert-icon">{Icons.alert}</span>
                  <span className="db-farm-alert-text">{FARM_STATUS.alert.text}</span>
                </div>
              )}
            </div>
          ) : (
            /* ── EMPTY STATE: Feature unlock teaser ── */
            <div className="db-farm-unlock">
              <div className="db-farm-unlock-hero">
                <div className="db-farm-unlock-icon-wrap">
                  <span className="db-farm-unlock-icon">{Icons.farm}</span>
                </div>
                <div className="db-farm-unlock-text">
                  <h2 className="db-farm-unlock-title">Your farm dashboard is waiting</h2>
                  <p className="db-farm-unlock-sub">
                    Fill in your farm details once — and get a personalised command centre for your crops, weather, and more.
                  </p>
                  <Link to="/farm/setup" className="db-farm-unlock-cta">
                    Set Up My Farm <span>{Icons.arrow}</span>
                  </Link>
                </div>
              </div>

              <div className="db-farm-features-grid">
                {FARM_FEATURES.map((f) => (
                  <div key={f.icon} className="db-farm-feature-card">
                    <span className="db-farm-feature-icon">{Icons[f.icon]}</span>
                    <div>
                      <p className="db-farm-feature-title">{f.title}</p>
                      <p className="db-farm-feature-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── 4. SCHEMES SECTION ── */}
        <section className="db-section">
          <div className="db-section-head">
            <div>
              <p className="db-eyebrow">Government Benefits</p>
              <h2 className="db-section-title">Schemes for your farm</h2>
            </div>
            <Link to="/schemes" className="db-text-cta">
              View all <span>{Icons.arrow}</span>
            </Link>
          </div>

          <div className="db-scheme-actions">
            {SCHEME_ACTIONS.map((a) => (
              <Link key={a.id} to={a.to} className="db-scheme-action">
                <span className="db-scheme-action-icon">{Icons[a.id]}</span>
                <div>
                  <div className="db-scheme-action-label">{a.label}</div>
                  <div className="db-scheme-action-desc">{a.desc}</div>
                </div>
                <span className="db-scheme-action-arrow">{Icons.arrow}</span>
              </Link>
            ))}
          </div>

          {/* Popular schemes accordion */}
          <div className="db-scheme-list" style={{ marginTop: "1.25rem" }}>
            <p className="db-schemes-list-eyebrow">Popular schemes</p>
            {SCHEMES.map((s) => (
              <div key={s.id}
                className={`db-scheme-card ${expandedScheme === s.id ? "db-scheme-card-open" : ""}`}>
                <div className="db-scheme-top"
                  onClick={() => setExpandedScheme(expandedScheme === s.id ? null : s.id)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setExpandedScheme(expandedScheme === s.id ? null : s.id)}
                  aria-expanded={expandedScheme === s.id}>
                  <div className="db-scheme-main">
                    <span className="db-scheme-tag">{s.tag}</span>
                    <h3 className="db-scheme-name">{s.name}</h3>
                    <p className="db-scheme-ministry">{s.ministry}</p>
                  </div>
                  <span className={`db-scheme-chevron ${expandedScheme === s.id ? "db-chevron-up" : ""}`}>
                    {Icons.chevron}
                  </span>
                </div>
                {expandedScheme === s.id && (
                  <div className="db-scheme-detail">
                    <p className="db-scheme-benefit">{s.benefit}</p>
                    <div className="db-scheme-btns">
                      <Link to={`/schemes/${s.id}`} className="db-btn-detail">Full details</Link>
                      <button className="db-btn-eligibility" type="button">Check eligibility</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. PERSONALISATION ── */}
        <section className="db-section">
          <div className="db-personal-card">
            <div className="db-personal-top">
              <div className="db-personal-ring-wrap">
                <ProgressRing pct={pct} />
                <span className="db-ring-label">{pct}%</span>
              </div>
              <div className="db-personal-title-block">
                <h3 className="db-personal-title">Improve recommendations</h3>
                <p className="db-personal-sub">
                  {pct < 60
                    ? "Add a few details to get personalised guidance."
                    : "KrishiMitra is personalised for your farm."}
                </p>
              </div>
            </div>

            <div className="db-personal-body">
              <div className="db-personal-chips">
                <div className="db-chip-wrap">
                  <button type="button"
                    className={`db-chip ${selectedState ? "db-chip-set" : ""} ${activeChip === "state" ? "db-chip-open" : ""}`}
                    onClick={() => toggleChip("state")}>
                    {selectedState || "State"}
                    <span className="db-chip-arrow">{Icons.chevron}</span>
                  </button>
                  {activeChip === "state" && (
                    <div className="db-dropdown">
                      {STATES.map((s) => (
                        <button key={s} type="button"
                          className={`db-dropdown-item ${selectedState === s ? "db-dropdown-item-on" : ""}`}
                          onClick={() => { setSelectedState(s); setActiveChip(null); }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="db-chip-wrap">
                  <button type="button"
                    className={`db-chip ${selectedCrop ? "db-chip-set" : ""} ${activeChip === "crop" ? "db-chip-open" : ""}`}
                    onClick={() => toggleChip("crop")}>
                    {selectedCrop || "Crop"}
                    <span className="db-chip-arrow">{Icons.chevron}</span>
                  </button>
                  {activeChip === "crop" && (
                    <div className="db-dropdown">
                      {CROPS.map((c) => (
                        <button key={c} type="button"
                          className={`db-dropdown-item ${selectedCrop === c ? "db-dropdown-item-on" : ""}`}
                          onClick={() => { setSelectedCrop(c); setActiveChip(null); }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="db-personal-hint">Land Size</span>
                <span className="db-personal-hint">Soil Type</span>
                <span className="db-personal-hint">Irrigation</span>
              </div>

              <Link to="/profile" className="db-personal-cta">
                {pct < 60 ? "Complete profile" : "View profile"}
              </Link>
            </div>
          </div>
        </section>

      </div>

      <footer className="db-footer">
        <span className="db-footer-brand">KrishiMitra</span>
        <span className="db-footer-copy">© 2025 · Made for Indian farmers</span>
      </footer>
    </div>
  );
}
