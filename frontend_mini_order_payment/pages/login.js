import { useState } from "react";
import API from "../lib/api";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const decodeJWT = (token) => {
    const base64Payload = token.split(".")[1];
    const payload = Buffer.from(base64Payload, "base64");
    return JSON.parse(payload.toString());
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("auth/login/", { email, password });

      const { access, refresh,id } = res.data;

      // decode token to get user_id

      // Save in localStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("user_id", id);

      alert("Login successful");

      router.push("/");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", paddingTop: 40 }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
