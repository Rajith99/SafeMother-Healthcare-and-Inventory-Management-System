import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function run() {
  try {
    console.log('Logging in as admin@hospital.com...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@hospital.com',
      password: 'Admin@123'
    });
    
    console.log('Login Response status:', loginRes.status);
    console.log('Success:', loginRes.data.success);
    console.log('Role:', loginRes.data.data.user.role);
    console.log('Login successful!');
    process.exit(0);
  } catch (err) {
    console.error('Login failed!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.dir(err.response.data, { depth: null, colors: true });
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

run();
