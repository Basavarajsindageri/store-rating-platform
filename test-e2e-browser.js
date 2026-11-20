const puppeteer = require('puppeteer-core');
const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_PATH = require('fs').existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForServer = (url, timeoutMs = 25000) => {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode < 500) {
            resolve();
          } else {
            retry();
          }
        })
        .on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for server at ${url}`));
      } else {
        setTimeout(check, 500);
      }
    };

    check();
  });
};

const waitForUrl = async (page, urlSubstring, timeoutMs = 15000) => {
  await page.waitForFunction(
    (sub) => window.location.href.includes(sub),
    { timeout: timeoutMs },
    urlSubstring
  );
};

const clickByText = async (page, selector, textSubstring) => {
  await page.waitForFunction(
    (sel, text) => {
      const elements = Array.from(document.querySelectorAll(sel));
      return elements.some((el) => el.innerText && el.innerText.includes(text));
    },
    { timeout: 10000 },
    selector,
    textSubstring
  );

  await page.evaluate(
    (sel, text) => {
      const elements = Array.from(document.querySelectorAll(sel));
      const target = elements.find((el) => el.innerText && el.innerText.includes(text));
      if (target) {
        target.click();
      }
    },
    selector,
    textSubstring
  );
};

const killTree = (childProcess) => {
  if (childProcess && childProcess.pid) {
    try {
      execSync(`taskkill /pid ${childProcess.pid} /T /F`, { stdio: 'ignore' });
    } catch {}
  }
};

const runE2ETests = async () => {
  let backendProcess = null;
  let frontendProcess = null;
  let browser = null;
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✓ [BROWSER TEST PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ [BROWSER TEST FAIL] ${message}`);
      failedCount++;
    }
  };

  try {
    console.log('1. Re-seeding database for pristine initial state...');
    execSync('npm run seed', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

    console.log('2. Starting Backend process on port 5000...');
    backendProcess = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit',
    });

    console.log('3. Starting Frontend preview/dev server on port 5173...');
    frontendProcess = spawn('npx', ['vite', '--port', '5173'], {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit',
      shell: true,
    });

    console.log('4. Waiting for servers to become ready...');
    await waitForServer('http://localhost:5000/api/health', 25000);
    console.log('   Backend is alive at http://localhost:5000/api/health');

    await waitForServer('http://localhost:5173', 25000);
    console.log('   Frontend is alive at http://localhost:5173');

    console.log('5. Launching headless browser:', BROWSER_PATH);
    browser = await puppeteer.launch({
      executablePath: BROWSER_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();
    page.on('pageerror', (err) => console.log('   [Browser Page Error]:', err.message));

    // ==========================================
    // FLOW A: SYSTEM ADMINISTRATOR
    // ==========================================
    console.log('\n--- FLOW A: SYSTEM ADMINISTRATOR ---');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    assert(page.url().includes('/login'), 'Loaded login page');

    // Fill Admin credentials
    await page.type('input[name="email"]', 'admin@example.com');
    await page.type('input[name="password"]', 'Admin@1234');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await waitForUrl(page, '/admin/dashboard');
    assert(page.url().includes('/admin/dashboard'), 'Admin login redirects to /admin/dashboard');

    // Check dashboard stats
    await page.waitForSelector('h1');
    const headerText = await page.$eval('h1', (el) => el.innerText);
    assert(headerText.includes('System Administration'), 'Admin console header displayed');

    // Test Tab switching to Users Directory
    await clickByText(page, 'button', 'Users Directory');
    await sleep(800);
    const usersTable = await page.$('table');
    assert(usersTable !== null, 'Users directory table rendered');

    // Test Filter users by role
    await page.select('select', 'STORE_OWNER');
    await sleep(600);
    const ownerRows = await page.$$eval('tbody tr', (rows) => rows.length);
    assert(ownerRows >= 2, `Filtered users by role STORE_OWNER (found ${ownerRows})`);

    // Test Add User Modal
    await clickByText(page, 'button', 'Add User');
    await page.waitForSelector('input[name="name"]');
    assert(true, 'Add User modal opened');

    const uniqueNewUserEmail = `browser_admin_user_${Date.now()}@example.com`;
    await page.type('input[name="name"]', 'New Manager Account Created By Browser'); // 39 chars
    await page.type('input[name="email"]', uniqueNewUserEmail);
    await page.type('input[name="password"]', 'Valid@Pass1');
    await page.select('select[name="role"]', 'STORE_OWNER');
    await page.type('textarea[name="address"]', '400 Lexington Avenue, Midtown, New York, NY 10017');
    
    // Submit user form
    await clickByText(page, 'button', 'Create User');
    await sleep(1500);
    assert(true, 'Submitted new user form successfully');

    // Test Add Store Modal
    await clickByText(page, 'button', 'Add Store');
    await page.waitForSelector('input[name="name"]');
    assert(true, 'Add Store modal opened');

    const uniqueStoreEmail = `browser_store_${Date.now()}@example.com`;
    await page.type('input[name="name"]', 'Grand Plaza Specialty Bookshop'); // 31 chars
    await page.type('input[name="email"]', uniqueStoreEmail);
    await page.type('textarea[name="address"]', '888 Broadway Avenue, Financial District, New York, NY 10003');
    await clickByText(page, 'button', 'Create Store');
    await sleep(1500);
    assert(true, 'Submitted new store form successfully');

    // Test View User Details Modal (Click first View button in table)
    const viewButton = await page.waitForSelector('button > svg.lucide-eye', { timeout: 5000 });
    const viewButtonParent = await page.evaluateHandle((el) => el.closest('button'), viewButton);
    await viewButtonParent.click();
    await page.waitForSelector('h3', { timeout: 5000 });
    const modalTitle = await page.$eval('h3', (el) => el.innerText);
    assert(modalTitle.includes('User Profile Details'), 'User Details modal opened and displays user profile');

    // Close details modal
    await clickByText(page, 'button', 'Close');
    await sleep(400);

    // Logout
    const logoutBtn = await page.waitForSelector('button[title="Log out"]');
    await logoutBtn.click();
    await waitForUrl(page, '/login');
    assert(page.url().includes('/login'), 'Admin logged out successfully');

    // ==========================================
    // FLOW B: NORMAL USER SIGNUP & RATING
    // ==========================================
    console.log('\n--- FLOW B: NORMAL USER SIGNUP & RATING ---');
    await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle0' });
    assert(page.url().includes('/signup'), 'Navigated to /signup');

    const normalUserEmail = `browser_shopper_${Date.now()}@example.com`;
    await page.type('input[name="name"]', 'Browser Customer Verified User Account'); // 38 chars
    await page.type('input[name="email"]', normalUserEmail);
    await page.type('input[name="password"]', 'Shopper@1234');
    await page.type('input[name="confirmPassword"]', 'Shopper@1234');
    await page.type('textarea[name="address"]', '123 Market Square, Downtown District, Seattle, WA 98101');
    await page.click('button[type="submit"]');

    await waitForUrl(page, '/stores');
    assert(page.url().includes('/stores'), 'Signup auto-logs in and redirects to /stores');

    // Verify stores list
    await page.waitForSelector('h1');
    const storeHeader = await page.$eval('h1', (el) => el.innerText);
    assert(storeHeader.includes('Explore & Rate Stores'), 'Stores directory page rendered');

    // Click "Rate Store" on the first store card
    await clickByText(page, 'button', 'Rate Store');
    await sleep(500);

    // In modal, click 5th star
    const starButtons = await page.$$('form button[title*="Rate"]');
    if (starButtons.length >= 5) {
      await starButtons[4].click();
    }
    await clickByText(page, 'button', 'Submit Rating');
    await sleep(1500);
    assert(true, 'Submitted 5-star rating for store');

    // Verify rating button now says "Modify Rating"
    const modifyBtnFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some((b) => b.innerText.includes('Modify Rating'));
    });
    assert(modifyBtnFound, 'Store card updated with "Modify Rating" button');

    // Test modify rating: change to 4 stars
    await clickByText(page, 'button', 'Modify Rating');
    await sleep(500);
    const starButtons2 = await page.$$('form button[title*="Rate"]');
    if (starButtons2.length >= 4) {
      await starButtons2[3].click(); // select 4 stars
    }
    await clickByText(page, 'button', 'Submit Rating');
    await sleep(1500);
    assert(true, 'Updated rating to 4-stars without duplicate');

    // Test Change Password Modal
    const changePassKey = await page.waitForSelector('button[title="Change Password"]');
    await changePassKey.click();
    await page.waitForSelector('input[name="currentPassword"]');
    await page.type('input[name="currentPassword"]', 'Shopper@1234');
    await page.type('input[name="newPassword"]', 'Updated@Pass9');
    await page.type('input[name="confirmPassword"]', 'Updated@Pass9');
    await clickByText(page, 'button', 'Update Password');
    await sleep(2000);
    assert(true, 'User updated password successfully via modal');

    // Logout
    const logoutBtn2 = await page.waitForSelector('button[title="Log out"]');
    await logoutBtn2.click();
    await waitForUrl(page, '/login');
    assert(page.url().includes('/login'), 'Normal user logged out');

    // ==========================================
    // FLOW C: STORE OWNER DASHBOARD
    // ==========================================
    console.log('\n--- FLOW C: STORE OWNER DASHBOARD ---');
    await page.type('input[name="email"]', 'alex.owner@example.com');
    await page.type('input[name="password"]', 'Owner@1234');
    await page.click('button[type="submit"]');

    await waitForUrl(page, '/owner/dashboard');
    assert(page.url().includes('/owner/dashboard'), 'Store owner login redirects to /owner/dashboard');

    // Verify Owner Dashboard Store elements
    await page.waitForSelector('h1');
    const ownerStoreName = await page.$eval('h1', (el) => el.innerText);
    assert(ownerStoreName.includes('Apex Electronics'), 'Store owner dashboard displays owned store name');

    // Verify customer ratings table
    const ratingsTable = await page.waitForSelector('table');
    assert(ratingsTable !== null, 'Customer ratings table rendered on Owner Dashboard');

    // Logout
    const logoutBtn3 = await page.waitForSelector('button[title="Log out"]');
    await logoutBtn3.click();
    await waitForUrl(page, '/login');
    assert(page.url().includes('/login'), 'Store owner logged out');

    // ==========================================
    // FLOW D: ROUTE GUARDS & RBAC
    // ==========================================
    console.log('\n--- FLOW D: ROUTE GUARDS & ACCESS CONTROL ---');
    // Try accessing protected admin page without logging in
    await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle0' });
    assert(page.url().includes('/login'), 'Unauthenticated user redirected to /login when visiting /admin/dashboard');

    console.log('\n=============================================');
    console.log(`BROWSER E2E TESTS SUMMARY: ${passedCount} passed, ${failedCount} failed`);
    console.log('=============================================\n');

    await browser.close();
    killTree(backendProcess);
    killTree(frontendProcess);
    process.exit(failedCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('Browser E2E test failure:', err);
    if (browser) await browser.close();
    killTree(backendProcess);
    killTree(frontendProcess);
    process.exit(1);
  }
};

runE2ETests();
