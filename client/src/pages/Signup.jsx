import { useState } from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    firstname: "",
    lastname: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend might send { error: 'message' }
        setError(data.error || "Signup failed");
      } else {
        setSuccess("Account created! You can log in now.");
        // optional: clear fields
        setForm({
          username: "",
          firstname: "",
          lastname: "",
          password: "",
        });
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-slate-800">
          Chat App - Signup
        </h1>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
            {success}
          </p>
        )}

        {/* Username */}
        <input
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-500"
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        {/* First name */}
        <input
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-500"
          type="text"
          name="firstname"
          placeholder="First name"
          value={form.firstname}
          onChange={handleChange}
          required
        />

        {/* Last name */}
        <input
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-500"
          type="text"
          name="lastname"
          placeholder="Last name"
          value={form.lastname}
          onChange={handleChange}
          required
        />

        {/* Password */}
        <input
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-500"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
        >
          Sign up
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
