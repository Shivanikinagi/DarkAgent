import { useState } from "react";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Proposer from "./pages/Proposer";
import SmartWallet from "./pages/SmartWallet";
import { useContracts } from "./hooks/useContracts";
import { useSmartWallet } from "./hooks/useSmartWallet";

const NAV_ITEMS = [
  { id: "smartwallet", label: "🔵 Smart Wallet" },
  { id: "dashboard", label: "📊 Protocol Activity" },
  { id: "propose", label: "⚡ Agent Execution" },
];

export default function App() {
  const [activePage, setActivePage] = useState("smartwallet");
  const { connected, connectMetaMask, account, isLive } = useContracts();
  const {
    address,
    isConnected: isSmartWalletConnected,
    isSmartWallet,
    connectSmartWallet,
  } = useSmartWallet();

  // Use either legacy MetaMask or Smart Wallet connection
  const isAnyConnected = connected || isSmartWalletConnected;
  const displayAddress = address || account;
  const displayIsLive = isLive || isSmartWalletConnected;

  const renderPage = () => {
    switch (activePage) {
      case "smartwallet":
        return <SmartWallet />;
      case "dashboard":
        return <Dashboard />;
      case "propose":
        return <Proposer />;
      default:
        return <SmartWallet />;
    }
  };

  return (
    <div className="app-root">
      {/* Navbar */}
      <nav className="navbar">
        <div
          className="navbar-brand"
          onClick={() => setActivePage("smartwallet")}
        >
          <div className="brand-icon">⚡</div>
          <span>DarkAgent</span>
        </div>

        <div className="navbar-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`nav-link ${activePage === item.id ? "active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          {isAnyConnected ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: displayIsLive
                    ? "var(--accent-emerald)"
                    : "var(--accent-amber)",
                  animation: "pulse 2s infinite",
                }}
              ></span>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-secondary)",
                }}
              >
                {displayAddress
                  ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(
                      -4,
                    )}`
                  : "Connected"}
              </span>
              {isSmartWallet && (
                <span
                  style={{
                    fontSize: "0.65rem",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#60a5fa",
                    fontWeight: 600,
                  }}
                >
                  SMART
                </span>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-brand btn-sm"
                onClick={connectSmartWallet}
              >
                🔵 Smart Wallet
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={connectMetaMask}
              >
                🦊 MetaMask
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <div className="page-shell">{renderPage()}</div>
    </div>
  );
}
