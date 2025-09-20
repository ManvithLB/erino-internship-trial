import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { AuthAPI } from "../lib/api";
import { useNavigate, Link } from "react-router-dom";

// Custom CSS to fix input colors
const inputStyles = `
  input {
    background: white !important;
    color: #374151 !important;
  }
`;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ email: string; password: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  // Inject custom CSS for inputs
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = inputStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "white",
          borderRadius: 16,
          padding: 40,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          border: "1px solid #E5E7EB",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#660090",
              borderRadius: 12,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: "bold",
              color: "white",
              marginBottom: 16,
            }}
          >
            E
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#1F2937",
              margin: 0,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6B7280",
              margin: "8px 0 0 0",
            }}
          >
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              setError("");
              await AuthAPI.login(v.email, v.password);
              navigate("/");
            } catch (err: any) {
              console.error("Login error:", err);
              if (err.response?.status === 401) {
                setError("Invalid email or password. Please try again.");
              } else if (err.response?.status === 400) {
                setError("Please check your email and password format.");
              } else {
                setError("Login failed. Please try again later.");
              }
            }
          })}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Email
            </label>
            <input
              {...register("email", { required: true })}
              type="email"
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#374151",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <input
              {...register("password", { required: true })}
              type="password"
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #D1D5DB",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#374151",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                padding: "12px 16px",
                color: "#DC2626",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? "#9CA3AF" : "#660090",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 14,
            color: "#6B7280",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#660090",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
