import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

/* ─────────────────────────────────────────
   Firefly swarm — amber particles that slowly
   chase the cursor like insects drawn to light,
   then scatter organically when cursor is still.
   Each firefly has its own personality: speed,
   pulse rhythm, wander tendency.
───────────────────────────────────────── */
function useParticleCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    /* cursor state */
    const mouse    = { x: -9999, y: -9999 };
    const prevMouse = { x: -9999, y: -9999 };
    let   cursorSpeed = 0;   /* how fast cursor is moving */
    let   stillTimer  = 0;   /* frames since cursor last moved */

    /* resize helper */
    const resize = () => {
      const rect    = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const W = () => canvas.width  / window.devicePixelRatio;
    const H = () => canvas.height / window.devicePixelRatio;

    /* ── firefly factory ── */
    const makeFirefly = () => {
      /* slight colour variation: warm amber → gold → pale yellow-green */
      const hue = 35 + Math.random() * 22;           /* 35–57° */
      const sat = 88 + Math.random() * 12;           /* 88–100% */
      const lit = 58 + Math.random() * 18;           /* 58–76% */
      return {
        x:  Math.random() * W(),
        y:  Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,

        /* intrinsic wander: each firefly wanders slightly differently */
        wanderAngle:  Math.random() * Math.PI * 2,
        wanderSpeed:  0.018 + Math.random() * 0.022,  /* how fast wander rotates */
        wanderRadius: 0.06  + Math.random() * 0.10,   /* wander impulse magnitude */

        /* attraction to cursor — lazy bugs attract slower */
        attractStrength: 0.0012 + Math.random() * 0.0018,
        /* max speed cap — keeps organic, not rocket-like */
        maxSpeed: 1.1 + Math.random() * 0.7,

        /* visual */
        r:   1.4 + Math.random() * 1.4,              /* body radius */
        hue, sat, lit,
        alpha:      0.55 + Math.random() * 0.35,
        pulseSpeed: 0.028 + Math.random() * 0.038,
        pulsePhase: Math.random() * Math.PI * 2,
        glowScale:  3.5  + Math.random() * 2.5,      /* halo radius multiplier */

        /* scatter: when still, bugs drift outward */
        scatterVx: (Math.random() - 0.5) * 2.2,
        scatterVy: (Math.random() - 0.5) * 2.2,
      };
    };

    const isMobile = window.innerWidth < 768;
    /* fewer fireflies — they should feel like a small, intimate swarm */
    const COUNT = isMobile ? 14 : 22;
    let fireflies = [];

    const init = () => {
      resize();
      fireflies = Array.from({ length: COUNT }, makeFirefly);
    };

    /* ── animation loop ── */
    let raf;
    let tick = 0;

    const draw = () => {
      tick++;
      const w = W(), h = H();

      /* track cursor movement speed */
      const mdx = mouse.x - prevMouse.x;
      const mdy = mouse.y - prevMouse.y;
      cursorSpeed = Math.sqrt(mdx * mdx + mdy * mdy);
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;

      /* count still frames */
      if (cursorSpeed < 1.5) {
        stillTimer = Math.min(stillTimer + 1, 120);
      } else {
        stillTimer = Math.max(stillTimer - 6, 0);
      }
      const isStill = stillTimer > 40;     /* cursor has been still ~0.7 s */
      const scatterT = Math.min((stillTimer - 40) / 50, 1); /* 0→1 scatter blend */

      /* fade trail instead of hard clear — gives gentle motion blur */
      ctx.fillStyle = "rgba(12,31,18,0.55)";
      ctx.fillRect(0, 0, w, h);

      fireflies.forEach((f) => {
        /* ── wander: organic directionless drift ── */
        f.wanderAngle += (Math.random() - 0.5) * f.wanderSpeed * 2;
        f.vx += Math.cos(f.wanderAngle) * f.wanderRadius;
        f.vy += Math.sin(f.wanderAngle) * f.wanderRadius;

        /* ── attraction to cursor ── */
        const cursorVisible = mouse.x > -100;
        if (cursorVisible) {
          const dx   = mouse.x - f.x;
          const dy   = mouse.y - f.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (!isStill && dist > 0) {
            /* lazily chase — attraction fades with distance so close bugs orbit */
            const attract = f.attractStrength * Math.min(1, dist / 180);
            f.vx += (dx / dist) * attract * dist;
            f.vy += (dy / dist) * attract * dist;
          } else if (isStill) {
            /* cursor stopped — scatter outward from it */
            if (dist > 0 && dist < 300) {
              const repel = scatterT * 0.025 * (1 - dist / 300);
              f.vx -= (dx / dist) * repel * dist * 0.04;
              f.vy -= (dy / dist) * repel * dist * 0.04;
              /* add individual scatter impulse for organic feel */
              f.vx += f.scatterVx * scatterT * 0.012;
              f.vy += f.scatterVy * scatterT * 0.012;
            }
          }
        }

        /* ── clamp speed ── */
        const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        if (speed > f.maxSpeed) {
          f.vx = (f.vx / speed) * f.maxSpeed;
          f.vy = (f.vy / speed) * f.maxSpeed;
        }

        /* ── friction ── */
        f.vx *= 0.978;
        f.vy *= 0.978;

        f.x += f.vx;
        f.y += f.vy;

        /* wrap edges smoothly */
        if (f.x < -20) f.x = w + 20;
        if (f.x > w + 20) f.x = -20;
        if (f.y < -20) f.y = h + 20;
        if (f.y > h + 20) f.y = -20;

        /* ── pulse alpha ── */
        const pulse   = Math.sin(tick * f.pulseSpeed + f.pulsePhase);
        const alpha   = Math.max(0.08, f.alpha + pulse * 0.28);
        const glowAlpha = alpha * 0.32;

        /* ── draw glow halo ── */
        const glowR = f.r * f.glowScale;
        const grad  = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowR);
        grad.addColorStop(0,   `hsla(${f.hue},${f.sat}%,${f.lit}%,${glowAlpha})`);
        grad.addColorStop(0.4, `hsla(${f.hue},${f.sat}%,${f.lit}%,${glowAlpha * 0.5})`);
        grad.addColorStop(1,   `hsla(${f.hue},${f.sat}%,${f.lit}%,0)`);
        ctx.beginPath();
        ctx.arc(f.x, f.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        /* ── draw firefly body ── */
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.hue},${f.sat}%,${Math.min(f.lit + 18, 95)}%,${alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    /* ── event listeners ── */
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onTouchMove = (e) => {
      const rect  = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      stillTimer = 0;
    };

    const ro = new ResizeObserver(() => {
      resize();
      fireflies.forEach((f) => {
        f.x = Math.random() * W();
        f.y = Math.random() * H();
      });
    });

    init();
    draw();
    ro.observe(canvas);
    canvas.addEventListener("mousemove",  onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchmove",  onTouchMove, { passive: true });

    /* cleanup */
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove",  onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchmove",  onTouchMove);
    };
  }, [canvasRef]);
}

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
export default function Login() {
  const navigate   = useNavigate();
  const loginRef   = useRef(null);
  const canvasRef  = useRef(null);

  useParticleCanvas(canvasRef);

  /* form state */
  const [formData, setFormData]     = useState({ identifier: "", password: "" });
  const [focused,  setFocused]      = useState({ identifier: false, password: false });
  const [showPass, setShowPass]     = useState(false);
  const [activeTab, setActiveTab]   = useState("phone");
  const [errors,   setErrors]       = useState({ identifier: "" });

  /* ── validators ── */
  const validatePhone = (val) => {
    const digits = val.replace(/\s/g, "");
    if (!digits)               return "Phone number is required.";
    if (!/^\d+$/.test(digits)) return "Only digits are allowed.";
    if (!/^[6-9]/.test(digits)) return "Must start with 6, 7, 8, or 9.";
    if (digits.length !== 10)  return "Must be exactly 10 digits.";
    return "";
  };

  const validateEmail = (val) => {
    if (!val) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Enter a valid email address.";
    return "";
  };

  const validateIdentifier = (val, tab) =>
    (tab || activeTab) === "phone" ? validatePhone(val) : validateEmail(val);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (name === "identifier") setErrors((p) => ({ ...p, identifier: "" }));
  };

  const handleFocus  = (f) => setFocused((p) => ({ ...p, [f]: true }));

  const handleBlur   = (f) => {
    setFocused((p) => ({ ...p, [f]: false }));
    if (f === "identifier")
      setErrors((p) => ({ ...p, identifier: validateIdentifier(formData.identifier) }));
  };

  const isActive = (f) => focused[f] || formData[f].length > 0;

  const handleTabSwitch = (t) => {
    setActiveTab(t);
    setErrors({ identifier: "" });
    setFormData((p) => ({ ...p, identifier: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const idErr = validateIdentifier(formData.identifier);
    if (idErr) { setErrors({ identifier: idErr }); return; }
    navigate("/profile"); /* TODO: Firebase auth */
  };

  const scrollToLogin = () =>
    loginRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  /* content */
  const pillars = [
    {
      num: "01",
      icon: "",
      label: "Scheme Discovery",
      body: "Instantly surface every government subsidy, insurance, and loan you qualify for — filtered to your state, crop, and land size.",
    },
    {
      num: "02",
      icon: "",
      label: "Smart Crop Guidance",
      body: "Season-aware advice on seeds, fertilizers, irrigation, and pest control — tailored to your exact farm profile.",
    },
    {
      num: "03",
      icon: "",
      label: "Personalised Intelligence",
      body: "Recommendations that improve with every harvest. The more you use KrishiMitra, the smarter it gets.",
    },
  ];

  const stats = [
    { value: "1,200+", label: "Schemes tracked" },
    { value: "28",     label: "States covered"  },
    { value: "10M+",   label: "Farmers helped"  },
  ];

  return (
    <div className="km-page">

      {/* ══════════════════════════════════════
          HERO — full viewport
      ══════════════════════════════════════ */}
      <section className="km-hero">

        {/* interactive canvas background */}
        <canvas ref={canvasRef} className="km-canvas" aria-hidden="true" />

        {/* navbar */}
        <nav className="km-nav">
          <div className="km-logo">
            <span className="km-logo-icon"></span>
            <span className="km-logo-name">KrishiMitra</span>
            <span className="km-beta">BETA</span>
          </div>
          <button className="km-nav-btn" onClick={scrollToLogin} type="button">
            Sign in
          </button>
        </nav>

        {/* hero body */}
        <div className="km-hero-body">

          <p className="km-eyebrow">India's agricultural intelligence platform</p>

          <h1 className="km-h1">
            <span className="km-line km-line-1">Government Schemes.</span>
            <span className="km-line km-line-2">Smart Farming.</span>
            <span className="km-line km-line-3 km-accent">One Platform.</span>
          </h1>

          <p className="km-sub">
            Stop missing benefits you deserve. Stop guessing what your land needs.
            KrishiMitra connects you to both — personalised to your farm.
          </p>

          <div className="km-cta-row">
            <button className="km-btn-cta" onClick={scrollToLogin} type="button">
              Get Started Free
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="km-ico">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="km-cta-note">Free forever for individual farmers</span>
          </div>

          <div className="km-stats">
            {stats.map((s) => (
              <div className="km-stat" key={s.label}>
                <span className="km-stat-val">{s.value}</span>
                <span className="km-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* scroll cue */}
        <div className="km-scroll-cue" aria-hidden="true">
          <span className="km-scroll-bar" />
          <span className="km-scroll-txt">scroll to explore</span>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PILLARS
      ══════════════════════════════════════ */}
      <section className="km-pillars-wrap">
        <p className="km-tag">What KrishiMitra does</p>
        <h2 className="km-pillars-h2">Built around the real problems farmers face</h2>
        <div className="km-pillars">
          {pillars.map((p) => (
            <div className="km-pillar" key={p.num}>
              <div className="km-pillar-top">
                <span className="km-pillar-num">{p.num}</span>
                <span className="km-pillar-icon">{p.icon}</span>
              </div>
              <h3 className="km-pillar-title">{p.label}</h3>
              <p className="km-pillar-body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          LOGIN FORM
      ══════════════════════════════════════ */}
      <section className="km-login-wrap" ref={loginRef}>
        <div className="km-login-hd">
          <p className="km-tag km-tag-muted">Start for free</p>
          <h2 className="km-login-h2">Sign in to KrishiMitra</h2>
          <p className="km-login-sub">
            No paperwork. No confusion. Just your farm details and we handle the rest.
          </p>
        </div>

        <div className="km-card">

          {/* tabs */}
          <div className="km-tabs" role="tablist">
            {["phone", "email"].map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={activeTab === t}
                className={`km-tab ${activeTab === t ? "km-tab-on" : ""}`}
                onClick={() => handleTabSwitch(t)}
              >
                {t === "phone" ? "Phone" : "Email"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="km-form" noValidate>

            {/* identifier */}
            <div className="km-field">
              <label
                htmlFor="identifier"
                className={`km-lbl ${isActive("identifier") ? "km-lbl-up" : ""}`}
              >
                {activeTab === "phone" ? "Phone Number" : "Email Address"}
              </label>
              <input
                id="identifier"
                name="identifier"
                type={activeTab === "phone" ? "tel" : "email"}
                value={formData.identifier}
                onChange={handleChange}
                onFocus={() => handleFocus("identifier")}
                onBlur={() => handleBlur("identifier")}
                className="km-input"
                autoComplete={activeTab === "phone" ? "tel" : "email"}
                required
              />
              <div className="km-uline" />
              {errors.identifier && (
                <p className="km-field-err">{errors.identifier}</p>
              )}
            </div>

            {/* password */}
            <div className="km-field">
              <label
                htmlFor="password"
                className={`km-lbl ${isActive("password") ? "km-lbl-up" : ""}`}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                className="km-input km-input-pw"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="km-showhide"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? "Hide" : "Show"}
              </button>
              <div className="km-uline" />
            </div>

            <button type="submit" className="km-btn-signin">
              Sign In
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="km-ico">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          <div className="km-divider">
            <span /><span>or continue with</span><span />
          </div>

          <button type="button" className="km-btn-google">
            <svg className="km-g-svg" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <Link to="/register" className="km-btn-register">
            New to KrishiMitra? Sign Up
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="km-footer">
        <span className="km-footer-brand">KrishiMitra</span>
        <span className="km-footer-copy">© 2025 · Made for Indian farmers</span>
      </footer>

    </div>
  );
}