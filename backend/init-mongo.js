// MongoDB Initialization Script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('shop');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'fullName'],
      properties: {
        email: { bsonType: 'string' },
        password: { bsonType: 'string' },
        fullName: { bsonType: 'string' },
        role: { enum: ['user', 'admin'] },
        isActive: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('products');
db.createCollection('orders');
db.createCollection('carts');
db.createCollection('conversations');
db.createCollection('discounts');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.products.createIndex({ productId: 1 }, { unique: true });
db.products.createIndex({ productName: 'text', brand: 'text', description: 'text' });
db.orders.createIndex({ userId: 1, createdAt: -1 });
db.orders.createIndex({ orderCode: 1 }, { unique: true });
db.carts.createIndex({ userId: 1 });
db.conversations.createIndex({ customerId: 1, createdAt: -1 });
db.discounts.createIndex({ code: 1 }, { unique: true });
db.discounts.createIndex({ startDate: 1, endDate: 1 });

print('✅ Shop database initialized successfully');
