import React from 'react';
import { useCart } from '../CartContext';

const MenuItemCard = ({ item }) => {
  const { addToCart, cartItems } = useCart();
  const existingItem = cartItems.find(c => c._id === item._id);

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '20px', 
      borderRadius: '8px', 
      width: '250px' 
    }}>
      <h4>{item.name}</h4>
      <p>₹{item.price}</p>
      <button 
        onClick={() => addToCart(item)}
        style={{
          background: existingItem ? '#28a745' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {existingItem ? `Added (${existingItem.qty})` : 'Add to Cart'}
      </button>
    </div>
  );
};

export default MenuItemCard;
