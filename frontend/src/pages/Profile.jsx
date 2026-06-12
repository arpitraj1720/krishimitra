import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

// ─── COMPLETION SCORING ───────────────────────────────────────────────────────
// Auth fields (name, phone/email) contribute to completion so a new user
// never starts at 0%. Farm fields make up the rest.
function calcCompletion(authUser, profile) {
  let score = 0;
  const total = 10;

  // Auth fields — 2 points
  if (authUser?.fullName || authUser?.name) score++;
  if (authUser?.phone || authUser?.email)   score++;

  // Farm fields — 8 points
  if (profile.state)          score++;
  if (profile.district)       score++;
  if (profile.landSize)       score++;
  if (profile.primaryCrop)    score++;
  if (profile.irrigationType) score++;
  if (profile.farmerCategory) score++;
  if (profile.landOwnership)  score++;
  if (profile.annualIncome)   score++;

  return Math.round((score / total) * 100);
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function ProgressRing({ pct }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={r} fill="none"
        stroke="#6fcf97" strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dasharray 0.7s ease" }}
      />
      <text x="44" y="49" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">
        {pct}%
      </text>
    </svg>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`km-toggle ${checked ? "km-toggle--on" : ""}`}
      aria-pressed={checked}
    >
      <span className="km-toggle__thumb" />
    </button>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const googleUser = localStorage.getItem("googleUser");
    const normalUser = localStorage.getItem("user");
    if (googleUser) setAuthUser(JSON.parse(googleUser));
    else if (normalUser) setAuthUser(JSON.parse(normalUser));
  }, []);

  // TODO (backend): On mount, fetch farm profile from Firestore using authUser.id.
  // const ref = doc(db, "farmerProfiles", authUser.id);
  // const snap = await getDoc(ref); if (snap.exists()) setProfile(snap.data());
  const [profile, setProfile] = useState({
    state: "",
    district: "",
    landSize: "",
    landUnit: "Acres",
    primaryCrop: "",
    secondaryCrop: "",
    irrigationType: "",
    farmerCategory: "",
    landOwnership: "",
    annualIncome: "",
    language: "Hindi",
    notifWeather: true,
    notifSchemes: true,
    notifCrops: true,
  });

  const [editingAccount, setEditingAccount] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    if (authUser) {
      setEditName(authUser.fullName || authUser.name || "");
      setEditPhone(authUser.phone || "");
    }
  }, [authUser]);

  const completion = calcCompletion(authUser, profile);

  function set(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    // TODO (backend): Save to Firestore.
    // const ref = doc(db, "farmerProfiles", authUser.id);
    // await setDoc(ref, profile, { merge: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const avatarLetter = (authUser?.fullName || authUser?.name || "U")[0].toUpperCase();

  return (
    <div className="km-profile-page">
      {/* ── NAV ── */}
      <header className="km-nav">
        <div className="km-nav-inner">
          <div className="km-nav__logo" onClick={() => navigate("/dashboard")}>
            KrishiMitra
          </div>
          <nav className="km-nav__links">
            <span onClick={() => navigate("/schemes")} className="km-nav__link">Schemes</span>
            <span className="km-nav__link km-nav__link--active">Profile</span>
            <button className="km-nav__avatar">{avatarLetter}</button>
          </nav>
        </div>
      </header>

      <main className="km-profile-main">

        {/* ── VALUE BANNER ── */}
        <div className="km-value-banner">
          <div className="km-value-banner__text">
            <h1>Farm Profile</h1>
            <p>Fill this once — KrishiMitra does the rest.</p>
          </div>
          <ul className="km-value-banner__list">
            <li>Scheme recommendations matched to your farm</li>
            <li>Accurate eligibility checks</li>
            <li>Weather alerts for your location</li>
            <li>Crop guidance and farm monitoring</li>
          </ul>
        </div>

        <div className="km-profile-layout">
          {/* ── LEFT COLUMN ── */}
          <div className="km-profile-left">

            {/* SECTION 1: Account */}
            <section className="km-card km-card--account">
              <div className="km-card__head">
                <h2 className="km-card__title">Account</h2>
                <button className="km-btn-ghost" onClick={() => setEditingAccount((v) => !v)}>
                  {editingAccount ? "Done" : "Edit"}
                </button>
              </div>
              <div className="km-account-fields">
                {editingAccount ? (
                  <>
                    <div className="km-field">
                      <label>Full Name</label>
                      {/* TODO (backend): Save editName to Firestore if editable */}
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="km-field">
                      <label>Mobile</label>
                      {/* TODO (backend): Phone from auth — confirm if mutable */}
                      <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                    </div>
                    {authUser?.email && (
                      <div className="km-field">
                        <label>Email</label>
                        <input value={authUser.email} readOnly style={{ opacity: 0.6 }} />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="km-account-row">
                      <span className="km-account-label">Name</span>
                      <span className="km-account-value">{editName || "—"}</span>
                    </div>
                    {editPhone && (
                      <div className="km-account-row">
                        <span className="km-account-label">Mobile</span>
                        <span className="km-account-value">{editPhone}</span>
                      </div>
                    )}
                    {authUser?.email && (
                      <div className="km-account-row">
                        <span className="km-account-label">Email</span>
                        <span className="km-account-value">{authUser.email}</span>
                      </div>
                    )}
                    {authUser?.picture && (
                      <img src={authUser.picture} alt="profile"
                        style={{ width: 44, height: 44, borderRadius: "50%", marginTop: 12 }} />
                    )}
                  </>
                )}
              </div>
            </section>

            {/* SECTION 2: Completion */}
            <section className="km-card km-card--completion">
              <div className="km-completion-ring">
                <ProgressRing pct={completion} />
              </div>
              <div className="km-completion-body">
                <h2>{completion < 100 ? `${completion}% complete` : "Profile complete"}</h2>
                <p className="km-completion-sub">
                  {completion < 50
                    ? "Add farm details to get personalised guidance."
                    : completion < 100
                    ? "Almost there — a few more details."
                    : "You're all set. Enjoy full access."}
                </p>
                <div className="km-completion-steps">
                  <span className={authUser?.fullName || authUser?.name ? "km-step km-step--done" : "km-step"}>Account info</span>
                  <span className={profile.state && profile.district ? "km-step km-step--done" : "km-step"}>Location</span>
                  <span className={profile.primaryCrop && profile.landSize ? "km-step km-step--done" : "km-step"}>Farm details</span>
                  <span className={profile.farmerCategory && profile.annualIncome ? "km-step km-step--done" : "km-step"}>Eligibility</span>
                </div>
              </div>
            </section>

            {/* SECTION 5: Preferences */}
            <section className="km-card">
              <h2 className="km-card__title km-card__title--spaced">Preferences</h2>
              <div className="km-field">
                <label>Language</label>
                <select value={profile.language} onChange={(e) => set("language", e.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Gujarati</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="km-notif-section">
                <p className="km-notif-label">Notifications</p>
                {[
                  { key: "notifWeather", title: "Weather Alerts",  desc: "Rain, drought, temperature warnings" },
                  { key: "notifSchemes", title: "Scheme Updates",  desc: "New schemes and deadlines" },
                  { key: "notifCrops",   title: "Crop Advisories", desc: "Pest alerts and farming tips" },
                ].map(({ key, title, desc }) => (
                  <div className="km-notif-row" key={key}>
                    <div>
                      <span className="km-notif-title">{title}</span>
                      <span className="km-notif-desc">{desc}</span>
                    </div>
                    <Toggle checked={profile[key]} onChange={(v) => set(key, v)} />
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 6: Documents */}
            <section className="km-card km-card--docs">
              <div className="km-card__head">
                <h2 className="km-card__title">Documents</h2>
                <span className="km-badge-soon">Coming Soon</span>
              </div>
              <p className="km-docs-desc">
                Securely store your documents to speed up scheme applications.
              </p>
              <div className="km-docs-grid">
                {["Aadhaar Card", "Land Records", "Farmer ID", "Bank Details"].map((doc) => (
                  <div className="km-doc-item" key={doc}>
                    <div className="km-doc-icon">
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                        <rect x="3" y="1" width="12" height="16" rx="2" stroke="#1d4a2a" strokeWidth="1.5"/>
                        <path d="M6 6h6M6 9h6M6 12h4" stroke="#1d4a2a" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="km-profile-right">

            {/* SECTION 3: My Farm */}
            <section className="km-card km-card--farm">
              <div className="km-farm-head">
                <span className="km-card__eyebrow">Most Important</span>
                <h2 className="km-card__title">My Farm</h2>
                <p className="km-card__desc">Powers scheme matching, crop guidance, and weather alerts.</p>
              </div>

              {/* Location */}
              <div className="km-section-group">
                <p className="km-group-label">Location</p>
                <div className="km-field-row">
                  <div className="km-field">
                    <label>State</label>
                    <select value={profile.state} onChange={(e) => set("state", e.target.value)}>
                      <option value="">Select State</option>
                      {["Andhra Pradesh","Bihar","Gujarat","Haryana","Karnataka","Madhya Pradesh",
                        "Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana",
                        "Uttar Pradesh","West Bengal"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="km-field">
                    <label>District</label>
                    <input value={profile.district} onChange={(e) => set("district", e.target.value)} placeholder="e.g. Patna" />
                  </div>
                </div>
              </div>

              {/* Land */}
              <div className="km-section-group">
                <p className="km-group-label">Land</p>
                <div className="km-field-row km-field-row--land">
                  <div className="km-field km-field--grow">
                    <label>Land Size</label>
                    <input type="number" min="0" value={profile.landSize}
                      onChange={(e) => set("landSize", e.target.value)} placeholder="e.g. 2.5" />
                  </div>
                  <div className="km-field km-field--unit">
                    <label>Unit</label>
                    <select value={profile.landUnit} onChange={(e) => set("landUnit", e.target.value)}>
                      <option>Acres</option>
                      <option>Hectares</option>
                      <option>Bigha</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Crops */}
              <div className="km-section-group">
                <p className="km-group-label">Crops</p>
                <div className="km-field">
                  <label>Primary Crop</label>
                  <select value={profile.primaryCrop} onChange={(e) => set("primaryCrop", e.target.value)}>
                    <option value="">Select Crop</option>
                    {["Rice","Wheat","Maize","Cotton","Sugarcane","Soybean","Groundnut","Mustard","Pulses","Vegetables","Fruits"]
                      .map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="km-field">
                  <label>Secondary Crop <span className="km-optional">(optional)</span></label>
                  <select value={profile.secondaryCrop} onChange={(e) => set("secondaryCrop", e.target.value)}>
                    <option value="">None</option>
                    {["Rice","Wheat","Maize","Cotton","Sugarcane","Soybean","Groundnut","Mustard","Pulses","Vegetables","Fruits"]
                      .map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Irrigation */}
              <div className="km-section-group">
                <p className="km-group-label">Irrigation</p>
                <div className="km-chip-group">
                  {["Canal","Borewell","Rainwater","Drip","Sprinkler","None"].map((opt) => (
                    <button key={opt} type="button"
                      className={`km-chip ${profile.irrigationType === opt ? "km-chip--active" : ""}`}
                      onClick={() => set("irrigationType", opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 4: Scheme Eligibility */}
            <section className="km-card km-card--eligibility">
              <div className="km-card__head">
                <div>
                  <span className="km-card__eyebrow">For Scheme Matching</span>
                  <h2 className="km-card__title">Eligibility Details</h2>
                  <p className="km-card__desc">Used only to find schemes you qualify for. Never shared.</p>
                </div>
              </div>

              {/* Farmer Category — updated to hectares, card-style chips */}
              <div className="km-section-group">
                <p className="km-group-label">Farmer Category</p>
                <div className="km-category-group">
                  {[
                    { val: "Marginal", label: "Marginal", sub: "Less than 1 hectare" },
                    { val: "Small",    label: "Small",    sub: "1 to 2 hectares" },
                    { val: "Large",    label: "Large",    sub: "More than 2 hectares" },
                  ].map(({ val, label, sub }) => (
                    <button key={val} type="button"
                      className={`km-category-card ${profile.farmerCategory === val ? "km-category-card--active" : ""}`}
                      onClick={() => set("farmerCategory", val)}>
                      <span className="km-category-label">{label}</span>
                      <span className="km-category-sub">{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Land Ownership */}
              <div className="km-section-group">
                <p className="km-group-label">Land Ownership</p>
                <div className="km-chip-group">
                  {["Owner", "Tenant", "Shared"].map((opt) => (
                    <button key={opt} type="button"
                      className={`km-chip ${profile.landOwnership === opt ? "km-chip--active" : ""}`}
                      onClick={() => set("landOwnership", opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Income */}
              <div className="km-section-group">
                <p className="km-group-label">Annual Income</p>
                <div className="km-chip-group">
                  {[
                    { val: "<1L",  label: "Below ₹1L" },
                    { val: "1-2L", label: "₹1–2 Lakh" },
                    { val: "2-5L", label: "₹2–5 Lakh" },
                    { val: ">5L",  label: "Above ₹5L" },
                  ].map(({ val, label }) => (
                    <button key={val} type="button"
                      className={`km-chip ${profile.annualIncome === val ? "km-chip--active" : ""}`}
                      onClick={() => set("annualIncome", val)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* SAVE BAR */}
        <div className="km-save-bar">
          {saved && <span className="km-saved-msg">Profile saved successfully.</span>}
          <button className="km-btn-save" onClick={handleSave}>
            {saved ? "Saved" : "Save Profile"}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}