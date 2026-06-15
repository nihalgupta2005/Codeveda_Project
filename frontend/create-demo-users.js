import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔧 Supabase URL:', supabaseUrl);
console.log('🔑 Using key:', supabaseServiceKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const demoUsers = [
  {
    email: 'admin@codeveda.com',
    password: 'admin123',
    full_name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'doctor@codeveda.com', 
    password: 'doctor123',
    full_name: 'Dr. Kumar',
    role: 'doctor'
  },
  {
    email: 'patient@codeveda.com',
    password: 'patient123', 
    full_name: 'Patient User',
    role: 'patient'
  }
];

async function createDemoUsers() {
  console.log('🚀 Creating demo users...\n');
  
  for (const user of demoUsers) {
    try {
      console.log(`👤 Creating user: ${user.email} (${user.role})`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: user.full_name,
          role: user.role
        }
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('already')) {
          console.log(`   ⚠️  User ${user.email} already exists`);
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === user.email);
          if (existingUser) {
            const { error: profileError } = await supabase
              .from('users')
              .upsert({
                id: existingUser.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
              });
            if (profileError) {
              console.log(`   ❌ Profile error for ${user.email}:`, profileError.message);
            } else {
              console.log(`   ✅ Profile updated for ${user.email}`);
            }
          }
          continue;
        }
        console.error(`❌ Auth error for ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Auth user created: ${authData.user.id}`);

      // Create/update profile in users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .upsert([
          {
            id: authData.user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
          }
        ])
        .select();

      if (profileError) {
        console.error(`❌ Profile error for ${user.email}:`, profileError.message);
        continue;
      }

      console.log(`✅ Profile created/updated for ${user.full_name}`);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Unexpected error for ${user.email}:`, error.message);
    }
  }
  
  console.log('🎉 Demo user creation completed!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@codeveda.com / admin123');
  console.log('Doctor: doctor@codeveda.com / doctor123'); 
  console.log('Patient: patient@codeveda.com / patient123');
}

// Run the script
createDemoUsers().catch(console.error);