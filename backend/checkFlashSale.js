require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB');
    
    const FlashSale = require('./models/flashSaleModel');
    const now = new Date();
    console.log('Current time:', now.toISOString());
    
    // Get all flash sales
    const allFlashSales = await FlashSale.find().lean();
    console.log('\n=== ALL FLASH SALES ===');
    console.log('Total:', allFlashSales.length);
    
    allFlashSales.forEach(fs => {
        console.log('\n---');
        console.log('Name:', fs.name);
        console.log('Status:', fs.status);
        console.log('Start:', fs.startTime);
        console.log('End:', fs.endTime);
        
        const start = new Date(fs.startTime);
        const end = new Date(fs.endTime);
        const isActive = start <= now && end >= now;
        console.log('Is Active Now:', isActive);
    });
    
    // Test getForHomepage
    console.log('\n=== getForHomepage() Results ===');
    const { active, upcomingToday, tomorrow } = await FlashSale.getForHomepage();
    console.log('Active count:', active.length);
    console.log('Upcoming Today count:', upcomingToday.length);
    console.log('Tomorrow count:', tomorrow.length);
    
    if (active.length > 0) {
        console.log('\nActive Flash Sales:');
        active.forEach(a => console.log('  -', a.name));
    }
    
    await mongoose.disconnect();
    console.log('\nDone');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
