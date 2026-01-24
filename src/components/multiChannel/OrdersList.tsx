import React from 'react';
import type { EnhancedOrder, OrderFilters } from '../../types/MultiChannelTypes';

interface OrdersListProps {
  orders: EnhancedOrder[];
  onOrderSelect: (order: EnhancedOrder) => void;
  onOrdersFilter: (filters: OrderFilters) => Promise<void>;
  loading: boolean;
}

const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  onOrderSelect,
  onOrdersFilter,
  loading
}) => {
  if (loading) {
    return (
      <div style={{ padding: "20px", border: "1px solid #ddd" }}>
        <div>Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd" }}>
      <h2>Orders List</h2>
      <p>Total orders: {orders.length}</p>
      
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ marginTop: "16px" }}>
          {orders.slice(0, 10).map(order => (
            <div 
              key={order.id}
              style={{ 
                padding: "12px", 
                border: "1px solid #eee", 
                marginBottom: "8px",
                cursor: "pointer",
                borderRadius: "4px"
              }}
              onClick={() => onOrderSelect(order)}
            >
              <div style={{ fontWeight: "bold" }}>#{order.orderNumber}</div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                {order.channelName} • {order.customerName} • ${order.totalAmount}
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                Status: {order.status} • {new Date(order.orderDate).toLocaleDateString()}
              </div>
            </div>
          ))}
          {orders.length > 10 && (
            <p style={{ color: "#666", fontStyle: "italic" }}>
              Showing first 10 of {orders.length} orders
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersList;
