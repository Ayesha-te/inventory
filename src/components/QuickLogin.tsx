import React from "react";

const QuickLogin = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const handleLogin = () => {
    localStorage.setItem("access_token", "dummy_token");
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", margin: "20px 0" }}>
      <h3>🔐 Quick Login</h3>
      <p>Demo login for testing purposes</p>
      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Login (Demo)
      </button>
    </div>
  );
};

export default QuickLogin;