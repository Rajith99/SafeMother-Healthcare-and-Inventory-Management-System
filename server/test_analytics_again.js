import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function run() {
  try {
    console.log('Logging in as admin@safemother.com...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@safemother.com',
      password: 'Password123!'
    });
    
    const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'].join('; ') : '';

    console.log('Fetching analytics...');
    const analyticsRes = await axios.get(`${BASE_URL}/analytics`, {
      headers: {
        Cookie: cookie
      }
    });

    console.log('API Response status:', analyticsRes.status);
    console.log('Success:', analyticsRes.data.success);
  } catch (err) {
    console.error('Request failed!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.dir(err.response.data, { depth: null, colors: true });
    } else {
      console.error(err.message);
    }
  }
}

run();
