import React, { useState, useEffect } from "react";
import { useSmartWallet } from "../hooks/useSmartWallet";
import { formatEther } from "viem";

const SmartWallet = () => {
  const {
    address,
    isConnected,
    isSmartWallet,
    walletInfo,
    protocolStats,
    loading,
    error,
    connectSmartWallet,
    disconnectWallet,
    registerWallet,
    authorizeAgent,
    revokeAgent,
    freezeWallet,
    unfreezeWallet,
    getAgentAuth,
    setError,
  } = useSmartWallet();

  // Form states
  const [agentAddress, setAgentAddress] = useState(
    "0x1111111111111111111111111111111111111111",
  );
  const [spendLimit, setSpendLimit] = useState("1");
  const [dailyLimit, setDailyLimit] = useState("10");
  const [duration, setDuration] = useState("30");
  const [freezeReason, setFreezeReason] = useState("");
  const [status, setStatus] = useState("");
  const [agentAuthInfo, setAgentAuthInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Check agent authorization when agent address changes
  useEffect(() => {
    if (isConnected && agentAddress && agentAddress.length === 42) {
      checkAgentAuth();
    }
  }, [isConnected, agentAddress]);

  const checkAgentAuth = async () => {
    try {
      const auth = await getAgentAuth(agentAddress);
      setAgentAuthInfo(auth);
    } catch {
      setAgentAuthInfo(null);
    }
  };

  const handleRegister = async () => {
    try {
      setStatus("Registering smart wallet with DarkAgent protocol...");
      await registerWallet(address);
      setStatus("Smart wallet registered successfully!");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleAuthorize = async () => {
    try {
      setStatus(`Authorizing agent ${agentAddress.slice(0, 8)}...`);
      await authorizeAgent(
        agentAddress,
        spendLimit,
        dailyLimit,
        parseInt(duration),
      );
      setStatus("Agent authorized successfully!");
      await checkAgentAuth();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleRevoke = async () => {
    try {
      setStatus(`Revoking agent ${agentAddress.slice(0, 8)}...`);
      await revokeAgent(agentAddress);
      setStatus("Agent revoked successfully!");
      setAgentAuthInfo(null);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleFreeze = async () => {
    try {
      setStatus("Freezing wallet...");
      await freezeWallet(freezeReason || "Emergency freeze from UI");
      setStatus("Wallet frozen! All agent executions are now blocked.");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleUnfreeze = async () => {
    try {
      setStatus("Unfreezing wallet...");
      await unfreezeWallet();
      setStatus("Wallet unfrozen! Agent executions are now allowed.");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="page-shell">
      <div className="page-content">
        {/* Hero Section */}
        {!isConnected && (
          <div className="hero">
            <div className="hero-badge">
              <span className="dot"></span>
              Coinbase Smart Wallet × DarkAgent
            </div>
            <h1>
              <span className="gradient">Smart Wallet</span>
              <br />
              Agent Infrastructure
            </h1>
            <p className="subtitle">
              Connect your Coinbase Smart Wallet to manage AI agent permissions,
              spending limits, and emergency controls — all verified on-chain
              through the DarkAgent protocol on Base.
            </p>
            <div className="hero-cta">
              <button className="btn btn-brand" onClick={connectSmartWallet}>
                🔗 Connect Smart Wallet
              </button>
            </div>

            {/* Feature cards */}
            <div
              className="grid-3"
              style={{ width: "100%", maxWidth: "900px", marginTop: "2rem" }}
            >
              <div className="glass-card">
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔐</div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  Passkey Auth
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  No seed phrases. Authenticate with biometrics via Coinbase
                  Smart Wallet passkeys.
                </p>
              </div>
              <div className="glass-card">
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🤖</div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  Agent Permissions
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Grant AI agents controlled access with per-transaction and
                  daily spending limits.
                </p>
              </div>
              <div className="glass-card">
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🛡️</div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  Circuit Breaker
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Instantly freeze your wallet to block all agent activity. One
                  click emergency stop.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connected State */}
        {isConnected && (
          <div className="animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
              <h2>Smart Wallet Dashboard</h2>
              <p>Manage your Coinbase Smart Wallet and AI agent permissions</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid stagger">
              <div className="stat-card brand">
                <div className="stat-label">Connected Wallet</div>
                <div
                  className="stat-value brand"
                  style={{ fontSize: "1rem", fontFamily: "var(--font-mono)" }}
                >
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : "—"}
                </div>
                <div className="stat-subtitle">
                  {isSmartWallet
                    ? "🔵 Coinbase Smart Wallet"
                    : "📎 External Wallet"}
                </div>
              </div>

              <div className="stat-card emerald">
                <div className="stat-label">Wallet Status</div>
                <div
                  className={`stat-value ${
                    walletInfo?.frozen ? "red" : "emerald"
                  }`}
                >
                  {walletInfo
                    ? walletInfo.frozen
                      ? "🔴 FROZEN"
                      : "🟢 ACTIVE"
                    : "⚪ NOT REGISTERED"}
                </div>
                <div className="stat-subtitle">
                  {walletInfo
                    ? `Registered ${new Date(
                        walletInfo.registeredAt * 1000,
                      ).toLocaleDateString()}`
                    : "Register to get started"}
                </div>
              </div>

              <div className="stat-card cyan">
                <div className="stat-label">Total Executions</div>
                <div className="stat-value cyan">
                  {walletInfo?.totalExecutions || 0}
                </div>
                <div className="stat-subtitle">
                  {walletInfo?.totalSpent
                    ? `${formatEther(walletInfo.totalSpent)} ETH spent`
                    : "No activity yet"}
                </div>
              </div>

              <div className="stat-card amber">
                <div className="stat-label">Protocol Stats</div>
                <div className="stat-value amber">
                  {protocolStats.totalWallets}
                </div>
                <div className="stat-subtitle">
                  {protocolStats.totalExecutions} total executions
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              {["overview", "agents", "security"].map((tab) => (
                <button
                  key={tab}
                  className={`nav-link ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "overview" && "📊 "}
                  {tab === "agents" && "🤖 "}
                  {tab === "security" && "🛡️ "}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="animate-fade-in">
                {/* Registration Card */}
                {!walletInfo && (
                  <div
                    className="glass-card no-hover"
                    style={{ marginBottom: "24px" }}
                  >
                    <div className="card-header">
                      <div className="card-title">
                        🔗 Register Your Smart Wallet
                      </div>
                    </div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                        marginBottom: "16px",
                      }}
                    >
                      Register your Coinbase Smart Wallet with the DarkAgent
                      protocol to enable AI agent verification, spending
                      controls, and emergency freeze capabilities.
                    </p>
                    <button
                      className="btn btn-brand"
                      onClick={handleRegister}
                      disabled={loading}
                    >
                      {loading ? "⏳ Registering..." : "🔗 Register Wallet"}
                    </button>
                  </div>
                )}

                {/* Wallet Details */}
                {walletInfo && (
                  <div className="grid-2">
                    <div className="glass-card no-hover">
                      <div className="card-header">
                        <div className="card-title">📋 Wallet Details</div>
                        <span
                          className={`badge ${
                            walletInfo.frozen ? "badge-frozen" : "badge-active"
                          }`}
                        >
                          <span className="dot"></span>
                          {walletInfo.frozen ? "Frozen" : "Active"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Smart Wallet Address
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.85rem",
                              color: "var(--brand-pink)",
                            }}
                          >
                            {walletInfo.smartWallet}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Owner (EOA)
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.85rem",
                            }}
                          >
                            {walletInfo.owner}
                          </div>
                        </div>
                        <div className="grid-2" style={{ gap: "12px" }}>
                          <div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                              }}
                            >
                              Total Executions
                            </div>
                            <div
                              style={{
                                fontSize: "1.5rem",
                                fontWeight: 800,
                                color: "var(--accent-cyan)",
                              }}
                            >
                              {walletInfo.totalExecutions}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                              }}
                            >
                              Total Spent
                            </div>
                            <div
                              style={{
                                fontSize: "1.5rem",
                                fontWeight: 800,
                                color: "var(--accent-amber)",
                              }}
                            >
                              {formatEther(walletInfo.totalSpent || 0n)} ETH
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Architecture Diagram */}
                    <div className="glass-card no-hover">
                      <div className="card-header">
                        <div className="card-title">
                          🏗️ Integration Architecture
                        </div>
                      </div>
                      <div className="code-window">
                        <div className="code-window-bar">
                          <div className="code-dot red"></div>
                          <div className="code-dot yellow"></div>
                          <div className="code-dot green"></div>
                        </div>
                        <div className="code-window-body">
                          <div className="code-preview">
                            <div>
                              <span className="cmt">
                                {"// Coinbase Smart Wallet + DarkAgent Flow"}
                              </span>
                            </div>
                            <div>&nbsp;</div>
                            <div>
                              <span className="kw">User</span> →{" "}
                              <span className="fn">Coinbase Smart Wallet</span>
                            </div>
                            <div>
                              {"  "}
                              <span className="cmt">
                                {"// Passkey or EOA ownership"}
                              </span>
                            </div>
                            <div>&nbsp;</div>
                            <div>
                              <span className="kw">Agent</span> →{" "}
                              <span className="fn">DarkAgent.propose()</span>
                            </div>
                            <div>
                              {"  "}
                              <span className="cmt">
                                {"// Agent submits action"}
                              </span>
                            </div>
                            <div>&nbsp;</div>
                            <div>
                              <span className="kw">ENS</span> →{" "}
                              <span className="fn">DarkAgent.verify()</span>
                            </div>
                            <div>
                              {"  "}
                              <span className="cmt">
                                {"// Check ENS permissions"}
                              </span>
                            </div>
                            <div>&nbsp;</div>
                            <div>
                              <span className="kw">Adapter</span> →{" "}
                              <span className="fn">SmartWallet.execute()</span>
                            </div>
                            <div>
                              {"  "}
                              <span className="cmt">
                                {"// Execute through wallet"}
                              </span>
                            </div>
                            <div>&nbsp;</div>
                            <div>
                              <span className="str">
                                {"✓ Verified + Executed on Base"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "agents" && (
              <div className="animate-fade-in">
                <div className="grid-2">
                  {/* Authorize Agent */}
                  <div className="glass-card no-hover">
                    <div className="card-header">
                      <div className="card-title">🤖 Authorize AI Agent</div>
                    </div>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.85rem",
                        marginBottom: "16px",
                      }}
                    >
                      Grant an AI agent permission to execute verified
                      transactions through your smart wallet with strict
                      spending limits.
                    </p>

                    <div className="input-group">
                      <label>Agent Address</label>
                      <input
                        className="input input-mono"
                        value={agentAddress}
                        onChange={(e) => setAgentAddress(e.target.value)}
                        placeholder="0x..."
                      />
                    </div>

                    <div className="grid-2" style={{ gap: "12px" }}>
                      <div className="input-group">
                        <label>Max Per Transaction (ETH)</label>
                        <input
                          className="input"
                          type="number"
                          step="0.01"
                          value={spendLimit}
                          onChange={(e) => setSpendLimit(e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Daily Limit (ETH)</label>
                        <input
                          className="input"
                          type="number"
                          step="0.1"
                          value={dailyLimit}
                          onChange={(e) => setDailyLimit(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Authorization Duration (Days)</label>
                      <input
                        className="input"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>

                    <div
                      style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                    >
                      <button
                        className="btn btn-brand"
                        onClick={handleAuthorize}
                        disabled={loading || !walletInfo}
                      >
                        {loading ? "⏳ Processing..." : "✅ Authorize Agent"}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={handleRevoke}
                        disabled={loading || !agentAuthInfo?.authorized}
                      >
                        🚫 Revoke Agent
                      </button>
                    </div>
                  </div>

                  {/* Agent Status */}
                  <div className="glass-card no-hover">
                    <div className="card-header">
                      <div className="card-title">
                        📊 Agent Authorization Status
                      </div>
                    </div>

                    {agentAuthInfo ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            className={`badge ${
                              agentAuthInfo.authorized
                                ? "badge-active"
                                : "badge-frozen"
                            }`}
                          >
                            <span className="dot"></span>
                            {agentAuthInfo.authorized
                              ? "Authorized"
                              : "Not Authorized"}
                          </span>
                        </div>

                        {agentAuthInfo.authorized && (
                          <>
                            <div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-muted)",
                                  textTransform: "uppercase",
                                  marginBottom: "4px",
                                }}
                              >
                                Per-Transaction Limit
                              </div>
                              <div
                                style={{
                                  fontSize: "1.3rem",
                                  fontWeight: 700,
                                  color: "var(--accent-cyan)",
                                }}
                              >
                                {formatEther(agentAuthInfo.spendLimit)} ETH
                              </div>
                            </div>

                            <div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-muted)",
                                  textTransform: "uppercase",
                                  marginBottom: "4px",
                                }}
                              >
                                Daily Limit
                              </div>
                              <div
                                style={{
                                  fontSize: "1.3rem",
                                  fontWeight: 700,
                                  color: "var(--accent-amber)",
                                }}
                              >
                                {formatEther(agentAuthInfo.dailyLimit)} ETH
                              </div>
                              <div
                                className="progress-bar"
                                style={{ marginTop: "8px" }}
                              >
                                <div
                                  className="progress-fill brand"
                                  style={{
                                    width: `${
                                      agentAuthInfo.dailyLimit > 0n
                                        ? Number(
                                            (agentAuthInfo.dailySpent * 100n) /
                                              agentAuthInfo.dailyLimit,
                                          )
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <div
                                style={{
                                  fontSize: "0.78rem",
                                  color: "var(--text-muted)",
                                  marginTop: "4px",
                                }}
                              >
                                {formatEther(agentAuthInfo.dailySpent)} /{" "}
                                {formatEther(agentAuthInfo.dailyLimit)} ETH used
                                today
                              </div>
                            </div>

                            <div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-muted)",
                                  textTransform: "uppercase",
                                  marginBottom: "4px",
                                }}
                              >
                                Expires
                              </div>
                              <div
                                style={{
                                  fontSize: "0.9rem",
                                  fontFamily: "var(--font-mono)",
                                }}
                              >
                                {new Date(
                                  agentAuthInfo.expiresAt * 1000,
                                ).toLocaleString()}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "32px 0",
                          color: "var(--text-muted)",
                        }}
                      >
                        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
                          🤖
                        </div>
                        <p>
                          Enter an agent address to check its authorization
                          status
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-fade-in">
                <div className="grid-2">
                  {/* Circuit Breaker */}
                  <div className="cb-panel" style={{ gridColumn: "span 2" }}>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        marginBottom: "8px",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      🚨 Emergency Circuit Breaker
                    </h3>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                        marginBottom: "16px",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      Instantly freeze your smart wallet to block ALL agent
                      executions. Use this if you detect suspicious agent
                      behavior.
                    </p>

                    {walletInfo?.frozen ? (
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "var(--accent-red)",
                            marginBottom: "16px",
                          }}
                        >
                          ⚠️ WALLET IS FROZEN
                        </div>
                        <button
                          className="btn btn-brand"
                          onClick={handleUnfreeze}
                          disabled={loading}
                          style={{ margin: "0 auto" }}
                        >
                          {loading ? "⏳ Processing..." : "🔓 Unfreeze Wallet"}
                        </button>
                      </div>
                    ) : (
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div
                          className="input-group"
                          style={{ maxWidth: "400px", margin: "0 auto 16px" }}
                        >
                          <label>Freeze Reason (Optional)</label>
                          <input
                            className="input"
                            value={freezeReason}
                            onChange={(e) => setFreezeReason(e.target.value)}
                            placeholder="Suspicious agent activity detected..."
                          />
                        </div>
                        <button
                          className="kill-btn"
                          onClick={handleFreeze}
                          disabled={loading || !walletInfo}
                        >
                          <span className="icon">🛑</span>
                          <span>{loading ? "FREEZING..." : "FREEZE"}</span>
                        </button>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                            marginTop: "12px",
                          }}
                        >
                          This will immediately prevent all authorized agents
                          from executing transactions.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Security Info */}
                  <div className="glass-card no-hover">
                    <div className="card-header">
                      <div className="card-title">🔒 Smart Wallet Security</div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>🔑</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            Multi-Owner Support
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.82rem",
                            }}
                          >
                            Your Coinbase Smart Wallet supports multiple owners
                            via EOA addresses and passkeys.
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>⛽</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            ERC-4337 Compatible
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.82rem",
                            }}
                          >
                            Gas-sponsored transactions through account
                            abstraction. Agents can execute without requiring
                            user gas.
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>📋</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            ERC-1271 Signatures
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.82rem",
                            }}
                          >
                            Smart contract signature validation enables verified
                            agent proposals.
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>🔄</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            Cross-Chain Replay Protection
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.82rem",
                            }}
                          >
                            Built-in protection against cross-chain signature
                            replay attacks.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DarkAgent Verification */}
                  <div className="glass-card no-hover">
                    <div className="card-header">
                      <div className="card-title">
                        ✅ DarkAgent Verification
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>📝</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            ENS Permission Records
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.82rem",
                            }}
                          >
                            Agent permissions defined through ENSIP-XX text
                            records (max_spend, slippage, protocols).
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>🔍</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            On-Chain Verification
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.82rem",
                            }}
                          >
                            Every agent action is verified against ENS rules
                            before execution through the smart wallet.
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>💰</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            Spending Controls
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.82rem",
                            }}
                          >
                            Per-transaction limits, daily caps, and automatic
                            reset — enforced at the smart contract level.
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>🔐</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            Session Keys
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.82rem",
                            }}
                          >
                            Temporary session keys enable gas-sponsored agent
                            transactions with built-in expiry.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Bar */}
            {(status || error) && (
              <div
                className="glass-card no-hover"
                style={{ marginTop: "24px" }}
              >
                <div className="card-header">
                  <div className="card-title">📡 Status</div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setStatus("");
                      setError(null);
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85rem",
                    color: error
                      ? "var(--accent-red)"
                      : "var(--accent-emerald)",
                    wordBreak: "break-all",
                  }}
                >
                  {error || status}
                </div>
              </div>
            )}

            {/* Disconnect */}
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <button className="btn btn-outline" onClick={disconnectWallet}>
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartWallet;
