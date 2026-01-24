import React from 'react';
import type { Channel } from '../../types/MultiChannelTypes';

interface StockManagementProps {
  channels: Channel[];
  onSyncStock: (channelIds?: string[]) => Promise<void>;
  loading: boolean;
}

const StockManagement: React.FC<StockManagementProps> = ({
  channels,
  onSyncStock,
  loading
}) => {
  return (
    <div style={{ padding: "20px", border: "1px solid #ddd" }}>
      <h2>Stock Management</h2>
      <p>Manage and sync stock levels across all channels</p>
      
      <div style={{ marginTop: "20px" }}>
        <button 
          onClick={() => onSyncStock()}
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
          {loading ? "Syncing..." : "Sync All Channels"}
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Connected Channels</h3>
        {channels.length === 0 ? (
          <p>No channels connected.</p>
        ) : (
          <div>
            {channels.map(channel => (
              <div key={channel.id} style={{ 
                padding: "12px", 
                border: "1px solid #eee", 
                marginBottom: "8px",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <strong>{channel.name}</strong>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {channel.type} • {channel.status}
                  </div>
                </div>
                <button 
                  onClick={() => onSyncStock([channel.id])}
                  disabled={loading || channel.status !== 'connected'}
                  style={{ 
                    padding: "6px 12px", 
                    backgroundColor: "#28a745", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px",
                    cursor: (loading || channel.status !== 'connected') ? "not-allowed" : "pointer",
                    opacity: (loading || channel.status !== 'connected') ? 0.6 : 1
                  }}
                >
                  Sync
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManagement;
