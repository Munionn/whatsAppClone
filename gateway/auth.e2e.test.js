const request = require('supertest');

const gatewayUrl = 'http://localhost:3000';

describe('Gateway Auth E2E', () => {
  const randomPhone = '1' + Math.floor(Math.random() * 1e9).toString().padStart(9, '0');
  const password = 'testpass';
  const name = 'GatewayTestUser';
  let accessToken, refreshToken;

  it('should register a new user through the gateway', async () => {
    const res = await request(gatewayUrl)
      .post('/auth/register')
      .send({ phoneNumber: randomPhone, password, name })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('name', name);
    expect(res.body.user).toHaveProperty('phone', randomPhone);
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('should login with the registered user', async () => {
    const res = await request(gatewayUrl)
      .post('/auth/login')
      .send({ phoneNumber: randomPhone, password })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('user');
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('should refresh the token', async () => {
    const res = await request(gatewayUrl)
      .get('/auth/refresh')
      .set('x-refresh-token', refreshToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('should get users', async () => {
    const res = await request(gatewayUrl)
      .get('/auth/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(u => u.phone === randomPhone)).toBe(true);
  });

  it('should logout the user', async () => {
    const res = await request(gatewayUrl)
      .post('/auth/logout')
      .set('x-refresh-token', refreshToken);
    expect(res.statusCode).toBe(200);
  });
});