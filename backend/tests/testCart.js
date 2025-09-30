const axios = require('axios');

const API_URL = 'http://localhost:5000/api/users/login';
let token = '';

// Test data
const testUser = {
    email: 'test@example.com',
    password: 'test123'
};

const testProduct = {
    productId: 'laptop01',
    quantity: 1
};

async function runTests() {
    try {
        // 1. Login
        console.log('1. Testing login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
        token = loginRes.data.token;
        console.log('Login successful, token received');

        // Setup axios headers
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Add to cart
        console.log('\n2. Testing add to cart...');
        const addRes = await axios.post(
            `${API_URL}/cart/add`,
            testProduct,
            config
        );
        console.log('Add to cart response:', addRes.data);

        // 3. Get cart
        console.log('\n3. Testing get cart...');
        const cartRes = await axios.get(`${API_URL}/cart`, config);
        console.log('Cart contents:', cartRes.data);

        // 4. Update quantity
        console.log('\n4. Testing update quantity...');
        const updateRes = await axios.post(
            `${API_URL}/cart/update`,
            { ...testProduct, quantity: 2 },
            config
        );
        console.log('Update response:', updateRes.data);

        // 5. Get cart again
        console.log('\n5. Testing get cart after update...');
        const cartAfterRes = await axios.get(`${API_URL}/cart`, config);
        console.log('Cart after update:', cartAfterRes.data);

        // 6. Clear cart
        console.log('\n6. Testing clear cart...');
        const clearRes = await axios.post(`${API_URL}/cart/clear`, {}, config);
        console.log('Clear cart response:', clearRes.data);

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

// Run tests
runTests();