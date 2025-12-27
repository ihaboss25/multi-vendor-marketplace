const mongoose = require('mongoose');
const fs = require('fs');

const models = {
  User: {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  Product: {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  },
  Order: {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
      seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }
};

let mermaid = `erDiagram
    USER {
        ObjectId _id PK
        string email UK
        string password
        string role
        string name
        date createdAt
    }
    
    PRODUCT {
        ObjectId _id PK
        string name
        string description
        number price
        string category
        number stock
        string imageUrl
        ObjectId seller FK
        date createdAt
    }
    
    ORDER {
        ObjectId _id PK
        ObjectId buyer FK
        number totalAmount
        string status
        date createdAt
    }
    
    ORDER_ITEM {
        ObjectId product FK
        number quantity
        number price
        ObjectId seller FK
    }
    
    USER ||--o{ PRODUCT : sells
    USER ||--o{ ORDER : places
    PRODUCT ||--o{ ORDER_ITEM : appears_in
    ORDER ||--o{ ORDER_ITEM : contains
    USER ||--o{ ORDER_ITEM : sells_via
`;

fs.writeFileSync('ER_DIAGRAM.md', `# Entity-Relationship Diagram\n\n\`\`\`mermaid\n${mermaid}\n\`\`\``);
console.log('✅ ER diagram generated in ER_DIAGRAM.md');
