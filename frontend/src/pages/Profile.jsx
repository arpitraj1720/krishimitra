import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const googleUser = localStorage.getItem("googleUser");
    const normalUser = localStorage.getItem("user");

    if (googleUser) {
      setUser(JSON.parse(googleUser));
    } else if (normalUser) {
      setUser(JSON.parse(normalUser));
    }
  }, []);

  return (
    <div>
      <h1>Profile Page</h1>

      {user ? (
        <>
          {user.picture && (
            <img
              src={user.picture}
              alt="profile"
              width="100"
            />
          )}

          <h2>{user.name || user.fullName}</h2>

          {user.email && <p>Email: {user.email}</p>}

          {user.phone && <p>Phone: {user.phone}</p>}
        </>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
}