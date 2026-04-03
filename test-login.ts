import { login } from './server/src/services/auth.service';

async function test() {
  try {
    const res = await login({ email: 'admin@finance.com', password: 'Admin@1234' });
    console.log('Success:', res);
  } catch (err) {
    console.error('Test Failed:', err);
  }
}

test();
