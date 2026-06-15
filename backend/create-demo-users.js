import { supabaseAdmin } from './src/config/supabase.js';

async function createDemoUsers() {
  console.log('🚀 Creating demo users for CodeVeda...');
  
  const demoUsers = [
    {
      email: 'admin@codeveda.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'admin',
      organization: 'CodeVeda HQ'
    },
    {
      email: 'doctor@codeveda.com', 
      password: 'doctor123',
      fullName: 'Dr. John Smith',
      role: 'doctor',
      organization: 'City Hospital',
      licenseNumber: 'MD-12345'
    },
    {
      email: 'patient@codeveda.com',
      password: 'patient123', 
      fullName: 'Jane Doe',
      role: 'patient',
      phone: '+91 98765 43210'
    }
  ];

  for (const user of demoUsers) {
    try {
      console.log(`📝 Creating ${user.role}: ${user.email}...`);
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          role: user.role
        }
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('already')) {
          console.log(`   ⚠️  User ${user.email} already exists`);
          
          // Get existing user and update profile
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === user.email);
          
          if (existingUser) {
            // Update or create profile
            const { error: profileError } = await supabaseAdmin
              .from('users')
              .upsert({
                id: existingUser.id,
                email: user.email,
                full_name: user.fullName,
                role: user.role,
                organization: user.organization || null,
                license_number: user.licenseNumber || null,
                phone: user.phone || null
              });
              
            if (profileError) {
              console.log(`   ❌ Profile error for ${user.email}:`, profileError.message);
            } else {
              console.log(`   ✅ Profile updated for ${user.email}`);
            }
          }
          continue;
        }
        
        console.error(`   ❌ Auth error for ${user.email}:`, authError.message);
        continue;
      }

      // Update user profile in database with additional details
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: authData.user.id,
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          organization: user.organization || null,
          license_number: user.licenseNumber || null,
          phone: user.phone || null
        });

      if (profileError) {
        console.log(`   ❌ Profile error for ${user.email}:`, profileError.message);
      } else {
        console.log(`   ✅ Profile updated/created successfully: ${user.email}`);
      }

    } catch (error) {
      console.error(`   ❌ Error creating ${user.email}:`, error.message);
    }
  }

  // Verify users
  console.log('\n🔍 Verifying demo users...');
  
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('email, full_name, role, organization')
    .in('email', ['admin@codeveda.com', 'doctor@codeveda.com', 'patient@codeveda.com']);

  if (error) {
    console.error('❌ Error verifying users:', error.message);
  } else {
    console.log('✅ Demo users created:');
    users.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}: ${user.email} (${user.full_name})`);
    });
  }

  console.log('\n🎉 Demo users setup complete!');
  console.log('\n📋 Login Credentials:');
  console.log('   Admin:   admin@codeveda.com   / admin123');
  console.log('   Doctor:  doctor@codeveda.com  / doctor123');
  console.log('   Patient: patient@codeveda.com / patient123');
  
  process.exit(0);
}

createDemoUsers().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});