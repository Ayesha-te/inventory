import React from 'react';
import type { EnhancedOrder } from '../../types/MultiChannelTypes';

interface OrderDetailsProps {
  order: EnhancedOrder;
  onOrderUpdate: (orderId: string, updates: Partial<EnhancedOrder>) => Promise<void>;
  onClose: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onOrderUpdate,
  onClose
}) => {
  const handleStatusChange = (newStatus: EnhancedOrder['status']) => {
    onOrderUpdate(order.id, { status: newStatus });
  };

  return (
    <div style={{ 
      padding: "20px", 
      border: "1px solid #ddd", 
      borderRadius: "8px",
      backgroundColor: "#fff",
      maxHeight: "80vh",
      overflowY: "auto"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2>Order Details</h2>
        <button 
          onClick={onClose}
          style={{ 
            background: "none", 
            border: "none", 
            fontSize: "20px", 
            cursor: "pointer" 
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Order #{order.orderNumber}</h3>
        <p><strong>Channel:</strong> {order.channelName}</p>
        <p><strong>Status:</strong> 
          <select 
            value={order.status} 
            onChange={(e) => handleStatusChange(e.target.value as EnhancedOrder['status'])}
            style={{ marginLeft: "8px", padding: "4px" }}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </p>
        <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ${order.totalAmount} {order.currency}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4>Customer Information</h4>
        <p><strong>Name:</strong> {order.customerName}</p>
        <p><strong>Email:</strong> {order.customerEmail}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4>Shipping Address</h4>
        <p>{order.shippingAddress.name}</p>
        <p>{order.shippingAddress.address1}</p>
        {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
        <p>{order.shippingAddress.country}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4>Order Items</h4>
        {order.items.map((item, index) => (
          <div key={index} style={{ 
            padding: "12px", 
            border: "1px solid #eee", 
            marginBottom: "8px",
            borderRadius: "4px"
          }}>
            <p><strong>{item.name}</strong></p>
            <p>SKU: {item.sku}</p>
            <p>Quantity: {item.quantity} × ${item.unitPrice} = ${item.totalPrice}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4>Order Summary</h4>
        <p>Subtotal: ${order.subtotal}</p>
        <p>Tax: ${order.taxAmount}</p>
        <p>Shipping: ${order.shippingAmount}</p>
        <p>Discount: -${order.discountAmount}</p>
        <p><strong>Total: ${order.totalAmount} {order.currency}</strong></p>
      </div>

      {order.notes && (
        <div style={{ marginBottom: "20px" }}>
          <h4>Notes</h4>
          <p>{order.notes}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
