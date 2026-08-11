import React, { useState } from "react";
import { scanfoodAPI } from "../Utility/api";

function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("000000");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      return setResult({
        type: "error",
        message: "กรุณากรอกอีเมล",
      });
    }

    try {
      setLoading(true);
      setResult({ type: "", message: "" });

      const finalPassword = password?.trim() || "000000";

      await scanfoodAPI.post("/office/resetPassword/", {
        email: email.trim(),
        password: finalPassword,
      });

      setResult({
        type: "success",
        message: `รีเซ็ตรหัสผ่านสำเร็จ (${email}) → ${finalPassword}`,
      });
    } catch (error) {
      setResult({
        type: "error",
        message:
          error?.response?.data?.message ||
          error.message ||
          "ไม่สามารถรีเซ็ตรหัสผ่านได้",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGradient} />

      <div style={styles.container}>
        <div style={styles.card}>
          {/* HEADER */}
          <div style={styles.header}>
            <div style={styles.logo}>S</div>
            <div>
              <div style={styles.title}>ScanFood</div>
              <div style={styles.subtitle}>Reset Password Tool</div>
            </div>
          </div>

          {/* BANNER */}
          <div style={styles.banner}>
            🔐 รีเซ็ตรหัสผ่านลูกค้า (Default: 000000)
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* EMAIL */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setResult({ type: "", message: "" });
                }}
                style={styles.input}
              />
            </div>

            {/* PASSWORD */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="000000"
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                />
                <div
                  style={styles.eye}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁"}
                </div>
              </div>
            </div>

            {/* RESULT */}
            {result.message && (
              <div
                style={{
                  ...styles.alert,
                  ...(result.type === "success"
                    ? styles.success
                    : styles.error),
                }}
              >
                {result.message}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? "กำลังรีเซ็ต..." : "Reset Password"}
            </button>
          </form>

          {/* FOOTER */}
          <div style={styles.footer}>
            ถ้าไม่กรอก password → ใช้ <b>000000</b> อัตโนมัติ
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= */
/* 🔥 SCANFOOD THEME STYLE */
/* ========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    position: "relative",
    fontFamily: "Inter, sans-serif",
  },

  bgGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "300px",
    background:
      "linear-gradient(135deg, #d90429 0%, #ef233c 50%, #ff4d6d 100%)",
    borderBottomLeftRadius: "40px",
    borderBottomRightRadius: "40px",
    boxShadow: "0 20px 40px rgba(217,4,41,0.3)",
  },

  container: {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  logo: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #d90429, #ef233c)",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "22px",
  },

  title: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    fontSize: "13px",
    color: "#666",
  },

  banner: {
    background: "#fff0f1",
    color: "#b00020",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontWeight: "600",
    border: "1px solid #ffd6db",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
  },

  input: {
    height: "48px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    padding: "0 14px",
    fontSize: "14px",
    outline: "none",
    transition: "0.2s",
  },

  passwordWrap: {
    position: "relative",
  },

  eye: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "16px",
  },

  alert: {
    padding: "12px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
  },

  success: {
    background: "#ecfdf3",
    color: "#027a48",
  },

  error: {
    background: "#fff1f3",
    color: "#b42318",
  },

  button: {
    height: "50px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #d90429 0%, #ef233c 100%)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(217,4,41,0.3)",
    transition: "0.2s",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  footer: {
    marginTop: "18px",
    fontSize: "12px",
    color: "#666",
    textAlign: "center",
  },
};

export default ResetPasswordScreen;