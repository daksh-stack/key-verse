const request = require('supertest');
const app = require('./management/server');  // ← points to your server.js file

describe('User Signup', () => {
  it('should create a new user and return 201', async () => {
    const email = `testuser_${Math.floor(Math.random() * 100000)}@example.com`;
    const response = await request(app)
      .post('/users/signup')
      .send({
        email,
        password: 'password123',
        role: 'consumer'
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);          // We expect "Created" status
    expect(response.body.message).toBe('User created!');
    expect(response.body.user).toHaveProperty('api_key');  // Check we got a key back
  });
});