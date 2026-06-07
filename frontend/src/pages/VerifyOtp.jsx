import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./VerifyOtp.css";

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

export default function VerifyOtp() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Phone number can be passed from Register via location.state
  // e.g. navigate("/verify-otp", { state: { phone: "9876543210" } })
 const identifier =
  location.state?.phone ||
  location.state?.email;

useEffect(() => {
  if (!identifier) {
    navigate("/register");
  }
}, [identifier, navigate]);

if (!identifier) return null;

const maskedPhone =
  location.state?.type === "phone"
    ? "+91 " +
      identifier.slice(0, -3).replace(/\d/g, "X") +
      identifier.slice(-3)
    : identifier;

  /* ── OTP digit state ── */
  const [digits,  setDigits]  = useState(Array(OTP_LENGTH).fill(""));
  const [hasErr,  setHasErr]  = useState(false);
  const [errMsg,  setErrMsg]  = useState("");
  const [success, setSuccess] = useState(false);

  /* ── countdown timer ── */
  const [timer,   setTimer]   = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const intervalRef = useRef(null);

  /* ── input refs for focus management ── */
  const inputRefs = useRef([]);

  /* start countdown */
  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimer(RESEND_COUNTDOWN);
    setCanResend(false);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, [startTimer]);

  /* ── digit input handler ── */
  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1); // digits only, last char
    const next = [...digits];
    next[index] = val;
    setDigits(next);
    setHasErr(false);
    setErrMsg("");

    // auto-advance to next box
    if (val && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* ── backspace → go back ── */
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // allow arrow navigation
    if (e.key === "ArrowLeft"  && index > 0)             inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  /* ── paste handling ── */
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    [...pasted].forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    // focus last filled box
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastIdx]?.focus();
  };

  const filled    = digits.every((d) => d !== "");
  const otpValue  = digits.join("");

  /* ── verify ── */
 const handleVerify = async () => {
  if (!filled) return;

  try {
    const otpResponse = await fetch(
      "http://localhost:5001/api/auth/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier:
            location.state?.type === "email"
              ? location.state?.email
              : location.state?.phone,
          otp: otpValue,
        }),
      }
    );

    const otpData = await otpResponse.json();

    if (!otpResponse.ok) {
      setHasErr(true);
      setErrMsg(otpData.message);
      return;
    }

    const registerPayload = {
      fullName: location.state?.fullName,
      password: location.state?.password,
    };

    if (location.state?.email) {
      registerPayload.email =
        location.state.email;
    }

    if (location.state?.phone) {
      registerPayload.phone =
        location.state.phone;
    }

    const registerResponse = await fetch(
      "https://krishimitra-sjw8.onrender.com/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerPayload),
      }
    );

    const registerData =
      await registerResponse.json();

    if (!registerResponse.ok) {
      setHasErr(true);
      setErrMsg(registerData.message);
      return;
    }

    setSuccess(true);

    setTimeout(() => {
      navigate("/");
    }, 1500);

  } catch (error) {
    console.error(error);

    setHasErr(true);
    setErrMsg("Server Error");
  }
};

    // ── WHAT TO DO WITH BACKEND ──
    // 1. Call your API: POST /api/auth/verify-otp { phone: rawPhone, otp: otpValue }
    // 2. On success: save token (localStorage / cookie), then navigate("/dashboard")
    // 3. On failure: setHasErr(true); setErrMsg("Invalid OTP. Please try again.");
    //
    // Example:
    // try {
    //   const res = await fetch("/api/auth/verify-otp", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ phone: rawPhone, otp: otpValue }),
    //   });
    //   const data = await res.json();
    //   if (!res.ok) throw new Error(data.message || "Invalid OTP");
    //   localStorage.setItem("km_token", data.token);  // or use a cookie / context
    //   navigate("/dashboard");
    // } catch (err) {
    //   setHasErr(true);
    //   setErrMsg(err.message);
    //   setDigits(Array(OTP_LENGTH).fill(""));
    //   inputRefs.current[0]?.focus();
    // }
  

  /* ── resend ── */
  const handleResend = () => {
    if (!canResend) return;
    setDigits(Array(OTP_LENGTH).fill(""));
    setHasErr(false);
    setErrMsg("");
    startTimer();
    inputRefs.current[0]?.focus();

    // TODO: call your API to resend OTP
    // POST /api/auth/send-otp { phone: rawPhone }
  };

  const timerDisplay = `0:${String(timer).padStart(2, "0")}`;

  /* ── success screen ── */
  if (success) {
    return (
      <div className="otp-page">
        <nav className="otp-nav">
          <Link to="/" className="otp-logo">
            <span></span>
            <span className="otp-logo-name">KrishiMitra</span>
          </Link>
        </nav>
        <main className="otp-main">
          <div className="otp-header" style={{ animation: "otpFadeUp 0.4s var(--ease) both" }}>
            <p className="otp-tag">Verification complete</p>
            <h1 className="otp-h1">You're all set!</h1>
            <p className="otp-sub">Taking you to your dashboard…</p>
          </div>
          <div className="otp-card" style={{ textAlign: "center" }}>
            <div className="otp-success-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ color: "var(--moss)", fontWeight: 600, fontSize: "1rem" }}>
              Mobile number verified!
            </p>
          </div>
        </main>
        <footer className="otp-footer">
          <span className="otp-footer-brand">KrishiMitra</span>
          <span className="otp-footer-copy">© 2025 · Made for Indian farmers</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="otp-page">

      {/* ── navbar ── */}
      <nav className="otp-nav">
        <Link to="/" className="otp-logo">
          <span></span>
          <span className="otp-logo-name">KrishiMitra</span>
        </Link>
        <button
          type="button"
          className="otp-nav-back"
          onClick={() => navigate("/register")}
        >
          ← Back to Register
        </button>
      </nav>

      {/* ── main ── */}
      <main className="otp-main">

        <div className="otp-header">
          <p className="otp-tag">One last step</p>
         <h1 className="otp-h1">
  Verify your {location.state?.type === "email" ? "email" : "mobile number"}
</h1>
          <p className="otp-sub">
            We sent a 6-digit code to your mobile number. Enter it below to confirm your account.
          </p>
        </div>

        <div className="otp-card">

          {/* phone pill */}
          <div className="otp-phone-pill">
            <span className="otp-phone-icon"></span>
            <span className="otp-phone-num">{maskedPhone}</span>
          </div>

          {/* OTP boxes */}
          <div className="otp-boxes" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={[
                  "otp-box",
                  d ? "otp-box-filled" : "",
                  hasErr ? "otp-box-err" : "",
                ].filter(Boolean).join(" ")}
                aria-label={`OTP digit ${i + 1}`}
                autoComplete={i === 0 ? "one-time-code" : "off"}
              />
            ))}
          </div>

          {/* error message */}
          <p className="otp-err">{errMsg}</p>

          {/* verify button */}
          <button
            type="button"
            className="otp-btn-verify"
            onClick={handleVerify}
            disabled={!filled}
          >
            Verify &amp; Continue
            <svg viewBox="0 0 20 20" fill="none" className="otp-ico" aria-hidden="true">
              <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* resend row */}
          <div className="otp-resend-row">
            {canResend ? (
              <>
                <span>Didn't receive it?</span>
                <button
                  type="button"
                  className="otp-btn-resend"
                  onClick={handleResend}
                >
                  Resend OTP
                </button>
              </>
            ) : (
              <>
                <span>Resend in</span>
                <span className="otp-timer">{timerDisplay}</span>
              </>
            )}
          </div>

          {/* hint */}
          <p className="otp-hint">
            Wrong number?{" "}
            <button
              type="button"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--moss)", fontSize: "0.77rem", fontWeight: 600,
                fontFamily: "var(--ff)", textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
              onClick={() => navigate("/register")}
            >
              Go back and edit
            </button>
          </p>

        </div>
      </main>

      <footer className="otp-footer">
        <span className="otp-footer-brand">KrishiMitra</span>
        <span className="otp-footer-copy">© 2025 · Made for Indian farmers</span>
      </footer>
    </div>
  );
}