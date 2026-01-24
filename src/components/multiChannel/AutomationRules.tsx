import React from 'react';
import type { AutomationRule, Channel } from '../../types/MultiChannelTypes';

interface AutomationRulesProps {
  rules: AutomationRule[];
  channels: Channel[];
  onRulesUpdate: () => void;
  loading: boolean;
}

const AutomationRules: React.FC<AutomationRulesProps> = ({
  rules,
  channels,
  onRulesUpdate,
  loading
}) => {
  return (
    <div style={{ padding: "20px", border: "1px solid #ddd" }}>
      <h2>Automation Rules</h2>
      <p>Manage automation rules for order processing</p>
      
      <div style={{ marginTop: "20px" }}>
        <button 
          onClick={onRulesUpdate}
          disabled={loading}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Loading..." : "Refresh Rules"}
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Active Rules ({rules.filter(r => r.isActive).length})</h3>
        {rules.length === 0 ? (
          <p>No automation rules configured.</p>
        ) : (
          <div>
            {rules.map(rule => (
              <div key={rule.id} style={{ 
                padding: "16px", 
                border: "1px solid #eee", 
                marginBottom: "12px",
                borderRadius: "6px",
                backgroundColor: rule.isActive ? "#f8f9fa" : "#fff"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ margin: "0 0 8px 0" }}>{rule.name}</h4>
                    <p style={{ margin: "0 0 8px 0", color: "#666" }}>{rule.description}</p>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      Priority: {rule.priority} • Trigger: {rule.trigger}
                    </div>
                  </div>
                  <div style={{ 
                    padding: "4px 8px", 
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor: rule.isActive ? "#d4edda" : "#f8d7da",
                    color: rule.isActive ? "#155724" : "#721c24"
                  }}>
                    {rule.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                
                {/* Show some rule details */}
                <div style={{ marginTop: "12px", fontSize: "14px" }}>
                  {rule.conditions.channels && rule.conditions.channels.length > 0 && (
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Channels:</strong> {rule.conditions.channels.join(", ")}
                    </div>
                  )}
                  {rule.actions.assignTags && rule.actions.assignTags.length > 0 && (
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Assigns tags:</strong> {rule.actions.assignTags.join(", ")}
                    </div>
                  )}
                  {rule.actions.setPriority && (
                    <div style={{ marginBottom: "4px" }}>
                      <strong>Sets priority:</strong> {rule.actions.setPriority}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "30px", padding: "16px", backgroundColor: "#e9ecef", borderRadius: "6px" }}>
        <h4>Quick Stats</h4>
        <p>Total Rules: {rules.length}</p>
        <p>Active Rules: {rules.filter(r => r.isActive).length}</p>
        <p>Connected Channels: {channels.length}</p>
      </div>
    </div>
  );
};

export default AutomationRules;
