import { supabase } from '../supabase.js';

// Simple database connection test
export const testDatabaseConnection = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    }
  };

  const addTest = (name, success, error = null, data = null) => {
    results.tests.push({ name, success, error, data });
    results.summary.total++;
    if (success) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
      if (error) results.summary.errors.push(`${name}: ${error}`);
    }
  };

  console.log('🔍 Starting database connection tests...');

  // Test 1: Basic Supabase connection
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    addTest('Basic Supabase Connection', true, null, `Users table accessible, count: ${data}`);
    console.log('✅ Basic connection test passed');
  } catch (error) {
    addTest('Basic Supabase Connection', false, error.message);
    console.error('❌ Basic connection test failed:', error.message);
  }

  // Test 2: Auth connection
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    addTest('Auth Session Check', true, null, session ? 'Active session found' : 'No active session');
    console.log('✅ Auth connection test passed');
  } catch (error) {
    addTest('Auth Session Check', false, error.message);
    console.error('❌ Auth connection test failed:', error.message);
  }

  // Test 3: Check if required tables exist
  const requiredTables = ['users', 'user_analytics', 'checkins', 'activities', 'notifications'];

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) throw error;
      addTest(`Table: ${table}`, true, null, 'Table exists and accessible');
      console.log(`✅ Table ${table} exists`);
    } catch (error) {
      addTest(`Table: ${table}`, false, error.message);
      console.error(`❌ Table ${table} failed:`, error.message);
    }
  }

  // Test 4: Environment variables
  try {
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missing = requiredEnvVars.filter(varName => !import.meta.env[varName]);

    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    addTest('Environment Variables', true, null, 'All required env vars present');
    console.log('✅ Environment variables test passed');
  } catch (error) {
    addTest('Environment Variables', false, error.message);
    console.error('❌ Environment variables test failed:', error.message);
  }

  // Test 5: Database write permissions (if user is authenticated)
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Try to read user's analytics
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      addTest('User Data Access', true, null, data ? 'User analytics found' : 'No user analytics (expected for new users)');
      console.log('✅ User data access test passed');
    } else {
      addTest('User Data Access', true, null, 'No authenticated user (skipped)');
      console.log('ℹ️ User data access test skipped - no authenticated user');
    }
  } catch (error) {
    addTest('User Data Access', false, error.message);
    console.error('❌ User data access test failed:', error.message);
  }

  // Test 6: Real-time connection
  try {
    const channel = supabase.channel('test-channel');
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Real-time connection timeout'));
      }, 5000);

      channel
        .on('presence', { event: 'sync' }, () => {
          clearTimeout(timeout);
          resolve();
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            resolve();
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            clearTimeout(timeout);
            reject(new Error(`Real-time connection failed: ${status}`));
          }
        });
    });

    supabase.removeChannel(channel);
    addTest('Real-time Connection', true, null, 'Real-time subscription successful');
    console.log('✅ Real-time connection test passed');
  } catch (error) {
    addTest('Real-time Connection', false, error.message);
    console.error('❌ Real-time connection test failed:', error.message);
  }

  console.log('\n📊 Database Test Results:');
  console.log(`Total tests: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);

  if (results.summary.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.summary.errors.forEach(error => console.log(`  - ${error}`));
  }

  return results;
};

// Test specific database operations
export const testDatabaseOperations = async (userId) => {
  if (!userId) {
    console.error('❌ No user ID provided for database operations test');
    return { success: false, error: 'No user ID provided' };
  }

  const results = {
    userId,
    timestamp: new Date().toISOString(),
    operations: [],
    success: true,
    errors: []
  };

  const addOperation = (name, success, error = null, data = null) => {
    results.operations.push({ name, success, error, data });
    if (!success) {
      results.success = false;
      if (error) results.errors.push(`${name}: ${error}`);
    }
  };

  console.log(`🔍 Testing database operations for user: ${userId}`);

  // Test getUserAnalytics equivalent
  try {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    addOperation('Get User Analytics', true, null, data ? 'Analytics found' : 'No analytics (expected for new users)');
    console.log('✅ Get user analytics test passed');
  } catch (error) {
    addOperation('Get User Analytics', false, error.message);
    console.error('❌ Get user analytics test failed:', error.message);
  }

  // Test createActiveUser equivalent
  try {
    const testData = {
      user_id: userId,
      username: 'Test User',
      daily_checkin_counter: 0,
      total_checkins: 0,
      current_ai_score: 0,
      today_average_sentiment: 0,
      overall_average_sentiment: 0,
      current_streak: 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('user_analytics')
      .upsert(testData)
      .select()
      .single();

    if (error) throw error;

    addOperation('Create/Update User Analytics', true, null, 'User analytics created/updated successfully');
    console.log('✅ Create user analytics test passed');
  } catch (error) {
    addOperation('Create/Update User Analytics', false, error.message);
    console.error('❌ Create user analytics test failed:', error.message);
  }

  // Test user profile access
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    addOperation('Get User Profile', true, null, data ? 'User profile found' : 'No user profile');
    console.log('✅ Get user profile test passed');
  } catch (error) {
    addOperation('Get User Profile', false, error.message);
    console.error('❌ Get user profile test failed:', error.message);
  }

  console.log('\n📊 Database Operations Test Results:');
  console.log(`Operations tested: ${results.operations.length}`);
  console.log(`Overall success: ${results.success}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  return results;
};

// Comprehensive test that runs all tests
export const runFullDatabaseTest = async () => {
  console.log('🚀 Starting comprehensive database test suite...\n');

  const connectionResults = await testDatabaseConnection();

  // Get current user for operations test
  const { data: { user } } = await supabase.auth.getUser();
  let operationsResults = null;

  if (user) {
    console.log('\n🔍 Running database operations tests...\n');
    operationsResults = await testDatabaseOperations(user.id);
  } else {
    console.log('\nℹ️ Skipping database operations tests - no authenticated user\n');
  }

  const overallResults = {
    timestamp: new Date().toISOString(),
    connection: connectionResults,
    operations: operationsResults,
    summary: {
      connectionPassed: connectionResults.summary.passed,
      connectionFailed: connectionResults.summary.failed,
      operationsPassed: operationsResults ? operationsResults.operations.filter(op => op.success).length : 0,
      operationsFailed: operationsResults ? operationsResults.operations.filter(op => !op.success).length : 0,
      overallSuccess: connectionResults.summary.failed === 0 && (operationsResults ? operationsResults.success : true)
    }
  };

  console.log('🎯 COMPREHENSIVE TEST SUMMARY:');
  console.log(`Connection tests: ${overallResults.summary.connectionPassed}/${connectionResults.summary.total} passed`);
  if (operationsResults) {
    console.log(`Operations tests: ${overallResults.summary.operationsPassed}/${operationsResults.operations.length} passed`);
  }
  console.log(`Overall status: ${overallResults.summary.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);

  return overallResults;
};

// Quick health check
export const quickHealthCheck = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { healthy: true, message: 'Database connection healthy' };
  } catch (error) {
    return { healthy: false, message: `Database connection failed: ${error.message}` };
  }
};
