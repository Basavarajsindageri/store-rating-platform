process.env.NODE_ENV = 'test';
const http = require('http');
const crypto = require('crypto');
const { app } = require('./server');
const { sequelize, User, PasswordResetToken } = require('./src/models');
const { getLastDevToken } = require('./src/services/mail.service');

const runPasswordResetTests = async () => {
  let server;
  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  };

  try {
    await sequelize.authenticate();
    const testPort = 5088;
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(testPort, resolve));
    const BASE_URL = `http://localhost:${testPort}/api`;
    console.log(`Password reset test server running at ${BASE_URL}\n`);

    console.log('--- 1. FORGOT PASSWORD (ANTI-ENUMERATION & TOKEN STORAGE) ---');

    // 1.1 Unknown email returns generic 200 message
    let res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent_user@example.com' }),
    });
    let data = await res.json();
    assert(
      res.status === 200 && data.message === 'If this email exists, a reset link has been sent',
      'Unknown email returns generic anti-enumeration response (200)'
    );

    // 1.2 Known Normal User forgot password
    res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'christopher@example.com' }),
    });
    data = await res.json();
    assert(
      res.status === 200 && data.message === 'If this email exists, a reset link has been sent',
      'Known Normal User returns exact same generic response (200)'
    );

    const normalUserToken = getLastDevToken('christopher@example.com');
    assert(normalUserToken && normalUserToken.length === 64, 'Generated 32-byte hex token for normal user');

    // 1.3 Verify DB stores SHA-256 hash, not raw token
    const normalUserHash = crypto.createHash('sha256').update(normalUserToken).digest('hex');
    const storedRecord = await PasswordResetToken.findOne({
      where: { token_hash: normalUserHash },
    });
    assert(storedRecord !== null, 'DB stores SHA-256 token hash');
    const rawFound = await PasswordResetToken.findOne({
      where: { token_hash: normalUserToken },
    });
    assert(rawFound === null, 'Raw token is NEVER stored in database');

    console.log('\n--- 2. TOKEN VERIFICATION & EDGE CASES ---');

    // 2.1 Verify valid token endpoint
    res = await fetch(`${BASE_URL}/auth/verify-reset-token/${normalUserToken}`);
    data = await res.json();
    assert(res.status === 200 && data.data?.valid === true, 'Valid token verification returns 200');

    // 2.2 Invalid token
    res = await fetch(`${BASE_URL}/auth/verify-reset-token/invalid_token_1234567890`);
    assert(res.status === 400, 'Invalid token verification returns 400');

    // 2.3 Reset with weak password (missing special char or uppercase or too short)
    res = await fetch(`${BASE_URL}/auth/reset-password/${normalUserToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'weakpassword',
        confirmPassword: 'weakpassword',
      }),
    });
    data = await res.json();
    assert(res.status === 400 && data.errors?.password, 'Rejects password failing validation rules');

    // 2.4 Reset with mismatched confirmPassword
    res = await fetch(`${BASE_URL}/auth/reset-password/${normalUserToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'Valid@Password1',
        confirmPassword: 'Different@Password2',
      }),
    });
    data = await res.json();
    assert(res.status === 400 && data.errors?.confirmPassword, 'Rejects mismatched passwords');

    // 2.5 Successful reset for Normal User
    res = await fetch(`${BASE_URL}/auth/reset-password/${normalUserToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'Reset@User1',
        confirmPassword: 'Reset@User1',
      }),
    });
    data = await res.json();
    assert(res.status === 200 && data.success, 'Normal user resets password successfully');

    // 2.6 Login with new password
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'christopher@example.com',
        password: 'Reset@User1',
      }),
    });
    data = await res.json();
    assert(res.status === 200 && data.data?.token, 'Login with new password succeeds');

    // 2.7 Reused token rejected
    res = await fetch(`${BASE_URL}/auth/reset-password/${normalUserToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'Another@Pass1',
        confirmPassword: 'Another@Pass1',
      }),
    });
    data = await res.json();
    assert(res.status === 400 && data.message.includes('already been used'), 'Reused token is rejected');

    // 2.8 Expired token rejected
    // Create an expired token manually in DB
    const expiredRawToken = crypto.randomBytes(32).toString('hex');
    const expiredHash = crypto.createHash('sha256').update(expiredRawToken).digest('hex');
    await PasswordResetToken.create({
      user_id: 5,
      token_hash: expiredHash,
      expires_at: new Date(Date.now() - 60000), // 1 min in the past
    });

    res = await fetch(`${BASE_URL}/auth/reset-password/${expiredRawToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'Another@Pass1',
        confirmPassword: 'Another@Pass1',
      }),
    });
    data = await res.json();
    assert(res.status === 400 && data.message.includes('expired'), 'Expired token is rejected');

    console.log('\n--- 3. FORGOT / RESET PASSWORD FOR SYSTEM ADMIN & STORE OWNER ---');

    // 3.1 System Admin forgot & reset
    await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com' }),
    });
    const adminResetToken = getLastDevToken('admin@example.com');
    assert(adminResetToken !== null, 'Admin reset token generated');

    res = await fetch(`${BASE_URL}/auth/reset-password/${adminResetToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'NewAdmin@123',
        confirmPassword: 'NewAdmin@123',
      }),
    });
    data = await res.json();
    assert(res.status === 200 && data.success, 'Admin resets password successfully');

    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'NewAdmin@123' }),
    });
    data = await res.json();
    assert(res.status === 200 && data.data?.user.role === 'SYSTEM_ADMIN', 'Admin logs in with new password');

    // 3.2 Store Owner forgot & reset
    await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.owner@example.com' }),
    });
    const ownerResetToken = getLastDevToken('alex.owner@example.com');
    assert(ownerResetToken !== null, 'Store Owner reset token generated');

    res = await fetch(`${BASE_URL}/auth/reset-password/${ownerResetToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'NewOwner@123',
        confirmPassword: 'NewOwner@123',
      }),
    });
    data = await res.json();
    assert(res.status === 200 && data.success, 'Store Owner resets password successfully');

    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.owner@example.com', password: 'NewOwner@123' }),
    });
    data = await res.json();
    assert(res.status === 200 && data.data?.user.role === 'STORE_OWNER', 'Store Owner logs in with new password');

    console.log('\n=============================================');
    console.log(`PASSWORD RESET TESTS SUMMARY: ${passed} passed, ${failed} failed`);
    console.log('=============================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Password reset test error:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runPasswordResetTests();
