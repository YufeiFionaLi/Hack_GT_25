// Test script to check database connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Testing Supabase connection...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    // Test inserting a simple record
    const testData = {
      heart_rate: 123,
      spo: 1,
      raw: 'test_connection',
      first_name: 'Test',
      last_name: 'User',
      date_of_birth: '1990-01-01',
      insurance: 'Test Insurance',
      insurance_ID: 'TEST123',
      symptoms: 'Testing database connection'
    };
    
    console.log('Attempting to insert test data...');
    const { data, error } = await supabase
      .from('readings')
      .insert(testData)
      .select();
    
    if (error) {
      console.error('Database error:', error);
    } else {
      console.log('Success! Data inserted:', data);
    }
  } catch (e) {
    console.error('Connection error:', e.message);
  }
}

testConnection();

