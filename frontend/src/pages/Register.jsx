import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

/* ── password strength calculator ── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Weak",   color: "#e05252" };
  if (score === 2) return { score, label: "Fair",   color: "#f5a623" };
  if (score === 3) return { score, label: "Good",   color: "#27a35a" };
  return             { score, label: "Strong", color: "#3dd68c" };
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    contact:  "",   /* phone or email depending on tab */
    password: "",
    confirm:  "",
  });

  const [contactTab,  setContactTab]  = useState("phone"); /* "phone" | "email" */
  const [focused,     setFocused]     = useState({});
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors,      setErrors]      = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  /* when switching tabs, clear the contact field + its error */
  const switchTab = (tab) => {
    setContactTab(tab);
    setForm((p) => ({ ...p, contact: "" }));
    setErrors((p) => ({ ...p, contact: "" }));
  };

  const handleFocus = (f) => setFocused((p) => ({ ...p, [f]: true }));
  const handleBlur  = (f) => setFocused((p) => ({ ...p, [f]: false }));
  const isActive    = (f) => focused[f] || (form[f] && form[f].length > 0);

  /* contact label floats up when focused OR has value */
  const contactActive = focused["contact"] || form.contact.length > 0;

  /* ── validation ── */
  const validate = () => {
    const e = {};

    if (!form.fullName.trim())
      e.fullName = "Please enter your full name.";

    if (!form.contact.trim()) {
      e.contact = contactTab === "phone"
        ? "Please enter your mobile number."
        : "Please enter your email address.";
    } else if (contactTab === "phone" && !/^[6-9]\d{9}$/.test(form.contact.trim())) {
      e.contact = "Enter a valid 10-digit Indian mobile number.";
    } else if (contactTab === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.trim())) {
      e.contact = "Enter a valid email address.";
    }

    if (!form.password)
      e.password = "Please create a password.";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters.";

    if (!form.confirm)
      e.confirm = "Please confirm your password.";
    else if (form.password !== form.confirm)
      e.confirm = "Passwords don't match.";

    return e;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const errs = validate();

  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    return;
  }

try {
  const payload = {
    fullName: form.fullName,
    password: form.password,
  };

  if (contactTab === "email") {
    payload.email = form.contact;
  } else {
    payload.phone = form.contact;
  }

  const response = await fetch(
    "http://localhost:5001/api/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message);
    return;
  }

  alert("Registration Successful!");

  navigate("/");
} catch (error) {
  console.error(error);
  alert("Server Error");
} 
};

  const strength = getStrength(form.password);

  return (
    <div className="rg-page">

      {/* ── navbar ── */}
      <nav className="rg-nav">
        <Link to="/" className="rg-logo">
          <span>🌾</span>
          <span className="rg-logo-name">KrishiMitra</span>
        </Link>
        <Link to="/" className="rg-nav-back">← Back to home</Link>
      </nav>

      <main className="rg-main">

        <div className="rg-header">
          <p className="rg-tag">Free forever for farmers</p>
          <h1 className="rg-h1">Create your account</h1>
          <p className="rg-sub">
            Find government schemes and get farming guidance in one place.
          </p>
        </div>

        <div className="rg-card">
          <form onSubmit={handleSubmit} className="rg-form" noValidate>

            {/* ── Full Name ── */}
            <div className="rg-field">
              <label
                htmlFor="fullName"
                className={`rg-lbl ${isActive("fullName") ? "rg-lbl-up" : ""}`}
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                onFocus={() => handleFocus("fullName")}
                onBlur={() => handleBlur("fullName")}
                className={`rg-input ${errors.fullName ? "rg-input-err" : ""}`}
                autoComplete="name"
              />
              <div className="rg-uline" />
              {errors.fullName && <p className="rg-err">{errors.fullName}</p>}
            </div>

            {/* ── Contact: tabbed phone / email ── */}
            <div className="rg-field">

              {/* tab switcher — same pattern as login page */}
              <div className="rg-tabs" role="tablist">
                {["phone", "email"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={contactTab === t}
                    className={`rg-tab ${contactTab === t ? "rg-tab-on" : ""}`}
                    onClick={() => switchTab(t)}
                  >
                    {t === "phone" ? "Mobile" : "Email"}
                  </button>
                ))}
              </div>

              {/* single input that changes based on tab */}
              <div className={`rg-contact-input-wrap ${contactTab === "phone" && form.contact.length > 0 || focused["contact"] && contactTab === "phone" ? "rg-show-prefix" : ""}`}>
                {/* +91 prefix — only visible when phone tab is active and field has value or is focused */}
                {contactTab === "phone" && (focused["contact"] || form.contact.length > 0) && (
                  <span className="rg-prefix">🇮🇳 +91</span>
                )}
                <div className="rg-contact-field">
                  <label
                    htmlFor="contact"
                    className={`rg-lbl ${contactActive ? "rg-lbl-up" : ""}`}
                  >
                    {contactTab === "phone" ? "Mobile Number" : "Email Address"}
                  </label>
                  <input
                    id="contact"
                    name="contact"
                    type={contactTab === "phone" ? "tel" : "email"}
                    value={form.contact}
                    onChange={handleChange}
                    onFocus={() => handleFocus("contact")}
                    onBlur={() => handleBlur("contact")}
                    className={`rg-input ${errors.contact ? "rg-input-err" : ""}`}
                    autoComplete={contactTab === "phone" ? "tel" : "email"}
                    maxLength={contactTab === "phone" ? 10 : undefined}
                  />
                  <div className="rg-uline" />
                </div>
              </div>
              {errors.contact && <p className="rg-err">{errors.contact}</p>}
            </div>

            {/* ── Password ── */}
            <div className="rg-field">
              <label
                htmlFor="password"
                className={`rg-lbl ${isActive("password") ? "rg-lbl-up" : ""}`}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                className={`rg-input rg-input-pw ${errors.password ? "rg-input-err" : ""}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="rg-showhide"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? "Hide" : "Show"}
              </button>
              <div className="rg-uline" />
              {errors.password && <p className="rg-err">{errors.password}</p>}

              {/* strength bar */}
              {form.password.length > 0 && (
                <div className="rg-strength">
                  <div className="rg-strength-bars">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className="rg-bar"
                        style={{
                          background: n <= strength.score ? strength.color : "#dde8dd",
                          transition: "background 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                  <span className="rg-strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* ── Confirm Password ── */}
            <div className="rg-field">
              <label
                htmlFor="confirm"
                className={`rg-lbl ${isActive("confirm") ? "rg-lbl-up" : ""}`}
              >
                Confirm Password
              </label>
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                value={form.confirm}
                onChange={handleChange}
                onFocus={() => handleFocus("confirm")}
                onBlur={() => handleBlur("confirm")}
                className={`rg-input rg-input-pw ${errors.confirm ? "rg-input-err" : ""}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="rg-showhide"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide" : "Show"}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
              <div className="rg-uline" />
              {form.confirm.length > 0 && (
                <p className="rg-match" style={{
                  color: form.password === form.confirm ? "#27a35a" : "#e05252"
                }}>
                  {form.password === form.confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
                </p>
              )}
              {errors.confirm && !form.confirm.length && (
                <p className="rg-err">{errors.confirm}</p>
              )}
            </div>

            {/* ── terms ── */}
            <p className="rg-terms">
              By creating an account you agree to our{" "}
              <a href="#" className="rg-terms-link">Terms of Service</a>.
            </p>

            {/* ── submit ── */}
            <button type="submit" className="rg-btn-submit">
              Create Account
              <svg viewBox="0 0 20 20" fill="none" className="rg-ico" aria-hidden="true">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

          </form>

          <div className="rg-divider">
            <span /><span>or sign up with</span><span />
          </div>

          <button type="button" className="rg-btn-google">
            <svg className="rg-g-svg" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p className="rg-signin">
            Already have an account?{" "}
            <Link to="/" className="rg-signin-link">Sign in</Link>
          </p>
        </div>
      </main>

      <footer className="rg-footer">
        <span className="rg-footer-brand">🌾 KrishiMitra</span>
        <span className="rg-footer-copy">© 2025 · Made for Indian farmers</span>
      </footer>
    </div>
  );
}