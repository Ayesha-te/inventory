import React, { useState } from "react";

const MultiStoreDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStore, setSelectedStore] = useState("all");

  const stores = [
    { id: "store1", name: "Downtown Branch", location: "City Center", status: "Active" },
    { id: "store2", name: "Mall Branch", location: "Shopping Mall", status: "Active" },
    { id: "store3", name: "Airport Branch", location: "Terminal 1", status: "Maintenance" }
  ];

  const renderDashboard = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ padding: "20px", backgroundColor: "#e3f2fd", borderRadius: "8px", border: "1px solid #90caf9" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#1565c0" }}>📊 Total Stores</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>3</p>
          <small style={{ color: "#666" }}>2 Active, 1 Maintenance</small>
        </div>
        <div style={{ padding: "20px", backgroundColor: "#e8f5e8", borderRadius: "8px", border: "1px solid #81c784" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>📦 Total Orders</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>1,247</p>
          <small style={{ color: "#666" }}>↑ 12% from last month</small>
        </div>
        <div style={{ padding: "20px", backgroundColor: "#fff3e0", borderRadius: "8px", border: "1px solid #ffb74d" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#f57c00" }}>📋 Stock Items</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>8,432</p>
          <small style={{ color: "#666" }}>267 Low Stock</small>
        </div>
        <div style={{ padding: "20px", backgroundColor: "#fce4ec", borderRadius: "8px", border: "1px solid #f48fb1" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#c2185b" }}>🚚 Warehouses</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>5</p>
          <small style={{ color: "#666" }}>All Operational</small>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3>🏬 Store Overview</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
            <thead style={{ backgroundColor: "#f5f5f5" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Store Name</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Location</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Daily Revenue</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => (
                <tr key={store.id}>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{store.name}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>{store.location}</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      backgroundColor: store.status === "Active" ? "#e8f5e8" : "#fff3e0",
                      color: store.status === "Active" ? "#2e7d32" : "#f57c00"
                    }}>
                      {store.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>$2,340</td>
                  <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                    <button style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", marginRight: "5px" }}>
                      View
                    </button>
                    <button style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3>📦 Multi-Store Orders Management</h3>
        <button style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
          Create New Order
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <div style={{ padding: "15px", backgroundColor: "#e3f2fd", borderRadius: "6px" }}>
          <h4 style={{ margin: "0 0 5px 0" }}>🎯 Pending Orders</h4>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>43</p>
        </div>
        <div style={{ padding: "15px", backgroundColor: "#e8f5e8", borderRadius: "6px" }}>
          <h4 style={{ margin: "0 0 5px 0" }}>✅ Completed Orders</h4>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>1,204</p>
        </div>
        <div style={{ padding: "15px", backgroundColor: "#fff3e0", borderRadius: "6px" }}>
          <h4 style={{ margin: "0 0 5px 0" }}>🚚 In Transit</h4>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>28</p>
        </div>
        <div style={{ padding: "15px", backgroundColor: "#fce4ec", borderRadius: "6px" }}>
          <h4 style={{ margin: "0 0 5px 0" }}>⚠️ Issues</h4>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>5</p>
        </div>
      </div>

      <div style={{ backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
        <h4>Recent Orders</h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Order ID</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Store</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Customer</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Total</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>#ORD-2025-001</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Downtown Branch</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>John Doe</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>$156.78</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <span style={{ padding: "2px 8px", backgroundColor: "#e8f5e8", color: "#2e7d32", borderRadius: "12px", fontSize: "12px" }}>
                    Completed
                  </span>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <button style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px" }}>
                    View Details
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>#ORD-2025-002</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Mall Branch</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Sarah Smith</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>$89.25</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <span style={{ padding: "2px 8px", backgroundColor: "#fff3e0", color: "#f57c00", borderRadius: "12px", fontSize: "12px" }}>
                    Pending
                  </span>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <button style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px" }}>
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStock = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3>📋 Multi-Store Stock Management</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ padding: "10px 20px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px" }}>
            Sync All Stores
          </button>
          <button style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
            Add New Item
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        <div style={{ padding: "15px", backgroundColor: "#e3f2fd", borderRadius: "6px" }}>
          <h4 style={{ margin: "0 0 5px 0" }}>📦 Total Items</h4>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>8,432</p>
        </div>
        <div style={{ padding: "15px", backgroundColor: "#fff3e0", borderRadius: "6px" }}>
          <h4 style={{ margin: "0 0 5px 0" }}>⚠️ Low Stock</h4>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>267</p>
        </div>
        <div style={{ padding: "15px", backgroundColor: "#fce4ec", borderRadius: "6px" }}>
          <h4 style={{ margin: "0 0 5px 0" }}>❌ Out of Stock</h4>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>43</p>
        </div>
        <div style={{ padding: "15px", backgroundColor: "#e8f5e8", borderRadius: "6px" }}>
          <h4 style={{ margin: "0 0 5px 0" }}>🔄 Reorder Point</h4>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>156</p>
        </div>
      </div>

      <div style={{ backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
        <h4>Stock Overview by Store</h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Product</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>SKU</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Downtown</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Mall</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Airport</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Total</th>
                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>iPhone 15 Pro</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>IP15P-128</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>45</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>32</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>8</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>85</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <button style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "3px", marginRight: "5px" }}>
                    Transfer
                  </button>
                  <button style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px" }}>
                    Reorder
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>MacBook Air M3</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>MBA-M3-256</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>12</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>8</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>3</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>23</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <button style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "3px", marginRight: "5px" }}>
                    Transfer
                  </button>
                  <button style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "3px" }}>
                    Low Stock
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWarehouses = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3>🚚 Multi-Store Warehouse Management</h3>
        <button style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
          Add New Warehouse
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ padding: "20px", backgroundColor: "#e3f2fd", borderRadius: "8px", border: "1px solid #90caf9" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#1565c0" }}>🏢 Central Warehouse</h4>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📍 Industrial Zone A</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📦 Capacity: 85% (42,500/50,000)</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>🚛 Active Shipments: 23</p>
          <div style={{ marginTop: "15px" }}>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", marginRight: "5px" }}>
              View Details
            </button>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}>
              Manage
            </button>
          </div>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#e8f5e8", borderRadius: "8px", border: "1px solid #81c784" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>🏪 Regional Hub North</h4>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📍 North District</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📦 Capacity: 67% (20,100/30,000)</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>🚛 Active Shipments: 15</p>
          <div style={{ marginTop: "15px" }}>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", marginRight: "5px" }}>
              View Details
            </button>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}>
              Manage
            </button>
          </div>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#fff3e0", borderRadius: "8px", border: "1px solid #ffb74d" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#f57c00" }}>🏬 Regional Hub South</h4>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📍 South District</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📦 Capacity: 92% (18,400/20,000)</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>🚛 Active Shipments: 8</p>
          <div style={{ marginTop: "15px" }}>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", marginRight: "5px" }}>
              View Details
            </button>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}>
              Near Full
            </button>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
        <h4>📊 Warehouse Performance</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginTop: "15px" }}>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
            <h5 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>📈 Throughput</h5>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>2,345</p>
            <small>Items/Day</small>
          </div>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
            <h5 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>⚡ Processing Time</h5>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#17a2b8" }}>2.3h</p>
            <small>Average</small>
          </div>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
            <h5 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>✅ Accuracy</h5>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>99.7%</p>
            <small>Fulfillment</small>
          </div>
          <div style={{ textAlign: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
            <h5 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>🚛 Active Routes</h5>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#fd7e14" }}>46</p>
            <small>Deliveries</small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChannels = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3>📺 Multi-Store Channel Management</h3>
        <button style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
          Add New Channel
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ padding: "20px", backgroundColor: "#e3f2fd", borderRadius: "8px", border: "1px solid #90caf9" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
            <h4 style={{ margin: 0, color: "#1565c0" }}>🛒 E-Commerce Store</h4>
            <span style={{ marginLeft: "auto", padding: "4px 8px", backgroundColor: "#4caf50", color: "white", borderRadius: "12px", fontSize: "12px" }}>
              Active
            </span>
          </div>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📈 Daily Orders: 156</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>💰 Revenue: $12,450/day</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>🔄 Sync Status: Real-time</p>
          <div style={{ marginTop: "15px" }}>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", marginRight: "5px" }}>
              Manage
            </button>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px" }}>
              Sync Now
            </button>
          </div>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#e8f5e8", borderRadius: "8px", border: "1px solid #81c784" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
            <h4 style={{ margin: 0, color: "#2e7d32" }}>📱 Mobile App</h4>
            <span style={{ marginLeft: "auto", padding: "4px 8px", backgroundColor: "#4caf50", color: "white", borderRadius: "12px", fontSize: "12px" }}>
              Active
            </span>
          </div>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📈 Daily Orders: 89</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>💰 Revenue: $7,890/day</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>🔄 Sync Status: Real-time</p>
          <div style={{ marginTop: "15px" }}>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", marginRight: "5px" }}>
              Manage
            </button>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px" }}>
              Sync Now
            </button>
          </div>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#fff3e0", borderRadius: "8px", border: "1px solid #ffb74d" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
            <h4 style={{ margin: 0, color: "#f57c00" }}>🏪 In-Store POS</h4>
            <span style={{ marginLeft: "auto", padding: "4px 8px", backgroundColor: "#4caf50", color: "white", borderRadius: "12px", fontSize: "12px" }}>
              Active
            </span>
          </div>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📈 Daily Orders: 234</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>💰 Revenue: $18,670/day</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>🔄 Sync Status: Real-time</p>
          <div style={{ marginTop: "15px" }}>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", marginRight: "5px" }}>
              Manage
            </button>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px" }}>
              Sync Now
            </button>
          </div>
        </div>

        <div style={{ padding: "20px", backgroundColor: "#fce4ec", borderRadius: "8px", border: "1px solid #f48fb1" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
            <h4 style={{ margin: 0, color: "#c2185b" }}>📦 Third-Party Marketplace</h4>
            <span style={{ marginLeft: "auto", padding: "4px 8px", backgroundColor: "#ff9800", color: "white", borderRadius: "12px", fontSize: "12px" }}>
              Maintenance
            </span>
          </div>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>📈 Daily Orders: --</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>💰 Revenue: --</p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>🔄 Sync Status: Offline</p>
          <div style={{ marginTop: "15px" }}>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", marginRight: "5px" }}>
              Reconnect
            </button>
            <button style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}>
              Settings
            </button>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "20px" }}>
        <h4>📊 Channel Performance Summary</h4>
        <div style={{ overflowX: "auto", marginTop: "15px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Channel</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Today's Orders</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Revenue</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Conversion Rate</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Last Sync</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>🛒 E-Commerce</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>156</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>$12,450</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>3.2%</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                  <span style={{ padding: "2px 8px", backgroundColor: "#e8f5e8", color: "#2e7d32", borderRadius: "12px", fontSize: "12px" }}>
                    Active
                  </span>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>Just now</td>
              </tr>
              <tr>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>📱 Mobile App</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>89</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>$7,890</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>4.1%</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                  <span style={{ padding: "2px 8px", backgroundColor: "#e8f5e8", color: "#2e7d32", borderRadius: "12px", fontSize: "12px" }}>
                    Active
                  </span>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>2 min ago</td>
              </tr>
              <tr>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>🏪 In-Store POS</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>234</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>$18,670</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>--</td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                  <span style={{ padding: "2px 8px", backgroundColor: "#e8f5e8", color: "#2e7d32", borderRadius: "12px", fontSize: "12px" }}>
                    Active
                  </span>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>Just now</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ margin: "0 0 10px 0", color: "#333" }}>🏬 Multi-Store Dashboard</h1>
        <p style={{ margin: 0, color: "#666" }}>Comprehensive management system for all your store locations</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px", fontWeight: "bold" }}>Store Filter:</label>
        <select 
          value={selectedStore} 
          onChange={(e) => setSelectedStore(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", marginRight: "20px" }}
        >
          <option value="all">All Stores</option>
          <option value="store1">Downtown Branch</option>
          <option value="store2">Mall Branch</option>
          <option value="store3">Airport Branch</option>
        </select>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #ddd", marginBottom: "30px" }}>
        <button 
          onClick={() => setActiveTab("dashboard")}
          style={{ 
            padding: "15px 25px", 
            border: "none", 
            borderBottom: activeTab === "dashboard" ? "3px solid #007bff" : "3px solid transparent",
            backgroundColor: activeTab === "dashboard" ? "#f8f9fa" : "transparent",
            color: activeTab === "dashboard" ? "#007bff" : "#666",
            fontWeight: activeTab === "dashboard" ? "bold" : "normal",
            cursor: "pointer"
          }}
        >
          📊 Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("orders")}
          style={{ 
            padding: "15px 25px", 
            border: "none", 
            borderBottom: activeTab === "orders" ? "3px solid #007bff" : "3px solid transparent",
            backgroundColor: activeTab === "orders" ? "#f8f9fa" : "transparent",
            color: activeTab === "orders" ? "#007bff" : "#666",
            fontWeight: activeTab === "orders" ? "bold" : "normal",
            cursor: "pointer"
          }}
        >
          📦 Orders
        </button>
        <button 
          onClick={() => setActiveTab("stock")}
          style={{ 
            padding: "15px 25px", 
            border: "none", 
            borderBottom: activeTab === "stock" ? "3px solid #007bff" : "3px solid transparent",
            backgroundColor: activeTab === "stock" ? "#f8f9fa" : "transparent",
            color: activeTab === "stock" ? "#007bff" : "#666",
            fontWeight: activeTab === "stock" ? "bold" : "normal",
            cursor: "pointer"
          }}
        >
          📋 Stock
        </button>
        <button 
          onClick={() => setActiveTab("warehouses")}
          style={{ 
            padding: "15px 25px", 
            border: "none", 
            borderBottom: activeTab === "warehouses" ? "3px solid #007bff" : "3px solid transparent",
            backgroundColor: activeTab === "warehouses" ? "#f8f9fa" : "transparent",
            color: activeTab === "warehouses" ? "#007bff" : "#666",
            fontWeight: activeTab === "warehouses" ? "bold" : "normal",
            cursor: "pointer"
          }}
        >
          🚚 Warehouses
        </button>
        <button 
          onClick={() => setActiveTab("channels")}
          style={{ 
            padding: "15px 25px", 
            border: "none", 
            borderBottom: activeTab === "channels" ? "3px solid #007bff" : "3px solid transparent",
            backgroundColor: activeTab === "channels" ? "#f8f9fa" : "transparent",
            color: activeTab === "channels" ? "#007bff" : "#666",
            fontWeight: activeTab === "channels" ? "bold" : "normal",
            cursor: "pointer"
          }}
        >
          📺 Channels
        </button>
      </div>

      <div>
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "stock" && renderStock()}
        {activeTab === "warehouses" && renderWarehouses()}
        {activeTab === "channels" && renderChannels()}
      </div>
    </div>
  );
};

export default MultiStoreDashboard;