import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("googleUser");

    if (data) {
      setUser(JSON.parse(data));
    }
  }, []);

  return (
    <div>
      <h1>Profile Page</h1>

      {user && (
        <>
          <img
            src={user.picture}
            alt=""
            width="100"
          />

          <h2>{user.name}</h2>

          <p>{user.email}</p>
        </>
      )}
    </div>
  );
}