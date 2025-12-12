import { useState } from "react";
import { useRouter } from "next/router";
import API from "../lib/api"; // ← your axios instance

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/register/", {
        email,
        password,
      });

      alert("Registration successful!");
      router.push("/login");
    } catch (err) {
      console.log("REGISTER ERROR:", err);
      alert("Registration failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Register</h2>

      <form onSubmit={submit} style={{ width: 300 }}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%", padding: 8 }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%", padding: 8 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px 10px",
            backgroundColor: "blue",
            color: "white",
            borderRadius: 5,
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
