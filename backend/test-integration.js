const { app, startServer } = require('./server');
const { sequelize } = require('./src/models');
const http = require('http');

let server;
let BASE_URL;

const runTests = async () => {
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
    const testPort = 5099;
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(testPort, resolve));
    BASE_URL = `http://localhost:${testPort}/api`;
    console.log(`Test server running at ${BASE_URL}\n`);

    console.log('--- 1. AUTHENTICATION & VALIDATION TESTS ---');

    // 1.1 Login with seeded admin
    let res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@1234' }),
    });
    let data = await res.json();
    assert(res.status === 200 && data.success && data.data.token, 'Admin login succeeds');
    const adminToken = data.data?.token;

    // 1.2 Login with seeded store owner
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.owner@example.com', password: 'Owner@1234' }),
    });
    data = await res.json();
    assert(res.status === 200 && data.success && data.data.user.role === 'STORE_OWNER', 'Store Owner login succeeds');
    const ownerToken = data.data?.token;

    // 1.3 Login with seeded normal user
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'christopher@example.com', password: 'User@1234' }),
    });
    data = await res.json();
    assert(res.status === 200 && data.success && data.data.user.role === 'NORMAL_USER', 'Normal user login succeeds');
    const userToken = data.data?.token;

    // 1.4 Login with invalid password
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'WrongPassword' }),
    });
    data = await res.json();
    assert(res.status === 401 && !data.success, 'Login fails with wrong password (401)');

    // 1.5 Register validation: Name too short (< 20 chars)
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Name',
        email: 'newuser@example.com',
        password: 'Password@123',
        address: '123 Test Street, New York, NY 10001',
      }),
    });
    data = await res.json();
    assert(res.status === 400 && data.errors?.name, 'Register rejects name < 20 chars');

    // 1.6 Register validation: Weak password (no special char or no uppercase)
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Length User Name Here',
        email: 'newuser@example.com',
        password: 'password123',
        address: '123 Test Street, New York, NY 10001',
      }),
    });
    data = await res.json();
    assert(res.status === 400 && data.errors?.password, 'Register rejects weak password without uppercase & special char');

    // 1.7 Register with valid normal user
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Newly Registered Test User Account', // 34 chars
        email: uniqueEmail,
        password: 'Valid@Pass1', // 11 chars
        address: '999 Long Island Expressway, Suite 400, Flushing, NY 11354',
      }),
    });
    data = await res.json();
    if (!data.success) {
      console.log('Registration error response:', data);
    }
    assert(res.status === 201 && data.success && data.data.token, 'Register valid normal user returns 201 and token');
    const newRegisteredUserToken = data.data?.token;

    // 1.8 Change Password
    res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newRegisteredUserToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'Valid@Pass1',
        newPassword: 'BrandNew@Pass1',
      }),
    });
    data = await res.json();
    assert(res.status === 200 && data.success, 'Change password succeeds');

    // 1.9 Login with changed password
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'BrandNew@Pass1' }),
    });
    data = await res.json();
    assert(res.status === 200 && data.success, 'Login with new changed password succeeds');

    console.log('\n--- 2. SYSTEM ADMINISTRATOR ENDPOINTS & RBAC ---');

    // 2.1 Admin dashboard stats
    res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(
      res.status === 200 && data.data.totalUsers >= 7 && data.data.totalStores >= 3,
      'Admin dashboard returns stats'
    );

    // 2.2 Normal user forbidden from admin dashboard (403)
    res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(res.status === 403, 'Normal user blocked from admin dashboard (403)');

    // 2.3 Admin list users with search and sorting
    res = await fetch(`${BASE_URL}/admin/users?sortBy=name&order=asc&limit=5&page=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(res.status === 200 && Array.isArray(data.data) && data.meta.total >= 7, 'Admin lists users with pagination');

    // 2.4 Admin creates new user
    const adminCreatedEmail = `admin_created_${Date.now()}@example.com`;
    res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Manager Created User Account', // 28 chars
        email: adminCreatedEmail,
        password: 'Admin@User999',
        address: '555 Central Avenue, Suite 200, Phoenix, AZ 85004',
        role: 'STORE_OWNER',
      }),
    });
    data = await res.json();
    assert(res.status === 201 && data.data.role === 'STORE_OWNER', 'Admin creates new STORE_OWNER user');
    const createdOwnerId = data.data.id;

    // 2.5 Admin user details view
    res = await fetch(`${BASE_URL}/admin/users/2`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(
      res.status === 200 && data.data.store && data.data.store.averageRating !== undefined,
      'Admin view user details returns store info & average rating for owner'
    );

    // 2.6 Admin creates a new store
    const storeEmail = `newstore_${Date.now()}@example.com`;
    res = await fetch(`${BASE_URL}/admin/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Starlight Books & Modern Coffee', // 31 chars
        email: storeEmail,
        address: '777 Evergreen Blvd, Downtown, Austin, TX 78701',
        owner_id: createdOwnerId,
      }),
    });
    data = await res.json();
    assert(res.status === 201 && data.data.owner_id === createdOwnerId, 'Admin creates store assigned to owner');

    // 2.7 Admin lists stores with sorting by rating
    res = await fetch(`${BASE_URL}/admin/stores?sortBy=rating&order=desc`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(res.status === 200 && data.data.length >= 4, 'Admin lists stores sorted by rating');

    console.log('\n--- 3. NORMAL USER STORES & RATING FLOW ---');

    // 3.1 Normal user views stores list (includes their rating and average rating)
    res = await fetch(`${BASE_URL}/stores`, {
      headers: { Authorization: `Bearer ${newRegisteredUserToken}` },
    });
    data = await res.json();
    assert(
      res.status === 200 && data.data[0].averageRating !== undefined && data.data[0].userRating !== undefined,
      'Normal user views stores with overall average rating and userRating'
    );

    // 3.2 Normal user submits rating (upsert new rating for store 3)
    res = await fetch(`${BASE_URL}/stores/3/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newRegisteredUserToken}`,
      },
      body: JSON.stringify({ rating: 5 }),
    });
    data = await res.json();
    assert(res.status === 201 && data.data.rating.rating === 5, 'User submits rating 5 for store 3');

    // 3.3 Normal user updates existing rating (upsert modify rating to 4)
    res = await fetch(`${BASE_URL}/stores/3/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newRegisteredUserToken}`,
      },
      body: JSON.stringify({ rating: 4 }),
    });
    data = await res.json();
    assert(res.status === 200 && data.data.rating.rating === 4, 'User updates rating to 4 without duplicate');

    // 3.4 Store owner blocked from submitting ratings (403)
    res = await fetch(`${BASE_URL}/stores/1/rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ rating: 5 }),
    });
    assert(res.status === 403, 'Store owner cannot submit store ratings (403)');

    console.log('\n--- 4. STORE OWNER DASHBOARD ---');

    // 4.1 Owner dashboard stats and breakdown
    res = await fetch(`${BASE_URL}/owner/dashboard`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    data = await res.json();
    assert(
      res.status === 200 && data.data.hasStore && data.data.breakdown && data.data.store.averageRating !== undefined,
      'Store Owner dashboard returns store info, average rating, and rating breakdown'
    );

    // 4.2 Owner lists raters (users who rated their store)
    res = await fetch(`${BASE_URL}/owner/ratings?sortBy=rating&order=desc`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    data = await res.json();
    assert(
      res.status === 200 && Array.isArray(data.data) && data.data.length > 0 && data.data[0].user.name,
      'Store Owner views list of raters (user name, email, rating, date)'
    );

    console.log('\n=============================================');
    console.log(`INTEGRATION TESTS SUMMARY: ${passed} passed, ${failed} failed`);
    console.log('=============================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
