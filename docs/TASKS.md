# KrishiMitra - Current Tasks

## Authentication

- [ ] Connect Google Sign In
- [ ] Add Phone OTP verification
- [ ] Connect Login page to backend
- [ ] Connect Register page to backend

---

## Dashboard

- [ ] Create Dashboard page
- [ ] Add "Government Schemes" section
- [ ] Add "Farming Assistance" section
- [ ] Finalize user navigation flow

---

## Schemes

- [ ] Add scheme data source
- [ ] State-wise scheme filtering
- [ ] Scheme search functionality
- [ ] Eligibility-based recommendations

---

## Farming Assistance

- [ ] Crop recommendations
- [ ] Fertilizer recommendations
- [ ] Irrigation guidance
- [ ] Pest management guidance

---

## Future Ideas

- [ ] Multi-language support
- [ ] Voice interaction
- [ ] Weather integration
- [ ] AI farming assistant
- [ ] Saved schemes/bookmarks

# Authentication Integration Tasks

## 1. Register Page

### Frontend Change to be done with Backend.(Register.jsx)

Replace mock navigation:

```js
navigate("/verify-otp", {
  state: {
    phone: form.contact
  }
});
```

With:

```js
const res = await fetch("/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    fullName: form.fullName,
    contact: form.contact,
    password: form.password,
    type: contactTab
  })
});

const data = await res.json();

if (!res.ok) {
  setErrors({ submit: data.message });
  return;
}

navigate("/verify-otp", {
  state: {
    phone: form.contact
  }
});
```

### Backend Endpoint

```http
POST /api/auth/register
```

Responsibilities:

* Validate input
* Check if user already exists
* Generate OTP
* Send OTP
* Return success response

---

## 2. OTP Verification

### Frontend Change (VerifyOtp.jsx)

Replace mock success logic:

```js
setSuccess(true);

setTimeout(() => {
  navigate("/dashboard");
}, 1500);
```

With:

```js
const res = await fetch("/api/auth/verify-otp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    phone: rawPhone,
    otp: otpValue
  })
});

const data = await res.json();

if (!res.ok) {
  setErrMsg(data.message);
  return;
}

localStorage.setItem("token", data.token);

navigate("/dashboard");
```

### Backend Endpoint

```http
POST /api/auth/verify-otp
```

Responsibilities:

* Verify OTP
* Create user account
* Generate JWT token
* Return token

Example Response:

```json
{
  "token": "jwt-token"
}
```

---

## 3. Resend OTP

### Frontend Change (VerifyOtp.jsx)

Inside resend handler:

```js
await fetch("/api/auth/resend-otp", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    phone: rawPhone
  })
});
```

### Backend Endpoint

```http
POST /api/auth/resend-otp
```

Responsibilities:

* Generate new OTP
* Send new OTP

---

## 4. Login Page

### Frontend Change (Login.jsx)

Replace mock login logic with:

```js
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    contact: form.contact,
    password: form.password
  })
});

const data = await res.json();

if (!res.ok) {
  setError(data.message);
  return;
}

localStorage.setItem("token", data.token);

navigate("/dashboard");
```

### Backend Endpoint

```http
POST /api/auth/login
```

Responsibilities:

* Verify credentials
* Generate JWT token
* Return token

---

## Notes

Do NOT modify:

* Register.css
* Login.css
* VerifyOtp.css

Only integrate backend into:

* Register.jsx
* Login.jsx
* VerifyOtp.jsx

Keep all existing frontend validation and UI unchanged.
Google Sign-In can be implemented later.
