const http = require('http');

const email = `testuser_${Date.now()}@example.com`;
const data = JSON.stringify({
    name: 'Test User',
    email: email,
    password: 'password123',
    phone: '1234567890'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Attempting to register user: ${email}`);

const req = http.request(options, res => {
    let body = '';

    res.on('data', chunk => {
        body += chunk;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Body: ${body}`);

        try {
            const parsed = JSON.parse(body);
            if (res.statusCode === 201 && parsed.token && parsed.user.phone === '1234567890') {
                console.log('SUCCESS: Registration successful, token received, and phone saved!');
            } else {
                console.log('FAILURE: Registration failed or unexpected response.');
                if (!parsed.token) console.log('- Missing token');
                if (parsed.user && parsed.user.phone !== '1234567890') console.log('- Phone not saved matched');
            }
        } catch (e) {
            console.log('FAILURE: Could not parse response JSON.');
        }
    });
});

req.on('error', error => {
    console.error('ERROR: Could not connect to server. Is it running on port 5000?');
    console.error(error);
});

req.write(data);
req.end();
