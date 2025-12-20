const axios = require('axios');

async function testApi() {
    try {
        const res = await axios.get('http://localhost:5000/api/restaurants');
        console.log('Status:', res.status);
        console.log('Total:', res.data.length);

        if (res.data.length > 0) {
            const id = res.data[0]._id;
            console.log('Testing Detail for ID:', id);
            const detailRes = await axios.get(`http://localhost:5000/api/restaurants/${id}`);
            console.log('Detail Status:', detailRes.status);
            console.log('Detail Name:', detailRes.data.name);
        }
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) console.error('Response:', err.response.data);
    }
}

testApi();
