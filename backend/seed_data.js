const db = require('./config/database');

async function seedData() {
  try {
    // 1. Get User
    let user = await db('users').first();
    let userId;
    
    if (!user) {
      console.log('No user found. You likely need to sign in to the frontend first to sync your Clerk user to the database! I will create a dummy test user, but you may not see these transactions if you log in as a different user later.');
      const [inserted] = await db('users').insert({
        name: 'Test Setup User',
        email: 'test' + Date.now() + '@example.com',
        password_hash: 'dummy',
        clerk_user_id: 'clerk_test' + Date.now()
      }).returning('id');
      userId = inserted.id || inserted;
    } else {
      userId = user.id;
      console.log(`Using existing user with ID: ${userId}`);
    }

    // 2. Insert Accounts
    console.log('Creating Accounts...');
    const accountsToInsert = [
      { user_id: userId, name: 'Personal Checking', type: 'Checking', balance: 0 },
      { user_id: userId, name: 'High Yield Savings', type: 'Savings', balance: 0 },
      { user_id: userId, name: 'Platinum Credit', type: 'Credit', balance: 0 }
    ];
    let accounts = await db('accounts').insert(accountsToInsert).returning('*');
    if (!accounts[0]?.id) accounts = await db('accounts').where('user_id', userId);

    const checkingId = accounts.find(a => a.name.includes('Checking')).id;
    const creditId = accounts.find(a => a.name.includes('Credit')).id;
    const savingsId = accounts.find(a => a.name.includes('Savings')).id;

    // 3. Generate 15 Diverse Transactions
    console.log('Creating 15 Transactions...');
    const now = new Date();
    
    function daysAgo(days) {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d.toISOString().split('T')[0];
    }

    const transactionsToInsert = [
      // Income
      { user_id: userId, account_id: checkingId, date: daysAgo(2), merchant: 'Tech Corp Inc.', description: 'Bi-weekly Salary', category: 'other', amount: 3500.00 },
      // Food
      { user_id: userId, account_id: creditId, date: daysAgo(1), merchant: 'Whole Foods Market', description: 'Weekly groceries', category: 'food', amount: -145.20 },
      { user_id: userId, account_id: creditId, date: daysAgo(3), merchant: 'Starbucks', description: 'Morning coffee', category: 'food', amount: -6.45 },
      { user_id: userId, account_id: creditId, date: daysAgo(5), merchant: 'Shake Shack', description: 'Lunch', category: 'food', amount: -18.90 },
      // Transportation
      { user_id: userId, account_id: creditId, date: daysAgo(2), merchant: 'Uber', description: 'Ride to airport', category: 'transportation', amount: -45.00 },
      { user_id: userId, account_id: checkingId, date: daysAgo(10), merchant: 'Shell Gas Station', description: 'Gas refill', category: 'transportation', amount: -55.50 },
      // Shopping
      { user_id: userId, account_id: creditId, date: daysAgo(8), merchant: 'Amazon', description: 'Household items', category: 'shopping', amount: -120.99 },
      { user_id: userId, account_id: creditId, date: daysAgo(14), merchant: 'Apple Store', description: 'AirPods', category: 'shopping', amount: -249.00 },
      // Entertainment
      { user_id: userId, account_id: creditId, date: daysAgo(4), merchant: 'Netflix', description: 'Monthly subscription', category: 'entertainment', amount: -15.99 },
      { user_id: userId, account_id: creditId, date: daysAgo(9), merchant: 'AMC Theatres', description: 'Movie tickets', category: 'entertainment', amount: -32.50 },
      { user_id: userId, account_id: creditId, date: daysAgo(11), merchant: 'Spotify', description: 'Music subscription', category: 'entertainment', amount: -10.99 },
      // Utilities
      { user_id: userId, account_id: checkingId, date: daysAgo(15), merchant: 'Pacific Gas & Electric', description: 'Electric bill', category: 'utilities', amount: -95.20 },
      { user_id: userId, account_id: checkingId, date: daysAgo(16), merchant: 'Comcast Internet', description: 'Internet bill', category: 'utilities', amount: -75.00 },
      // Healthcare
      { user_id: userId, account_id: creditId, date: daysAgo(20), merchant: 'CVS Pharmacy', description: 'Prescription refill', category: 'healthcare', amount: -22.40 },
      // Travel
      { user_id: userId, account_id: creditId, date: daysAgo(25), merchant: 'Delta Airlines', description: 'Flight to NY', category: 'travel', amount: -450.00 }
    ];
    
    await db('transactions').insert(transactionsToInsert);

    // Update balances by recalculating them
    for (const acc of accounts) {
      const [{ sum }] = await db('transactions')
        .where('account_id', acc.id)
        .sum('amount as sum');
      await db('accounts').where('id', acc.id).update({ balance: sum || 0 });
    }

    // 4. Create Budgets
    console.log('Creating Budgets...');
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();
    
    const budgetsToInsert = [
      { user_id: userId, category: 'food', limit_amount: 500.00, month, year },
      { user_id: userId, category: 'shopping', limit_amount: 300.00, month, year },
      { user_id: userId, category: 'entertainment', limit_amount: 150.00, month, year },
      { user_id: userId, category: 'utilities', limit_amount: 250.00, month, year }
    ];
    await db('budgets').insert(budgetsToInsert);

    console.log('✅ Successfully seeded the database with 3 accounts, 15 transactions, and 4 budgets for the current month.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    process.exit();
  }
}

seedData();
