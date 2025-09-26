import { supabaseAdmin } from './src/config/supabase.js';

async function checkUsers() {
    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, role')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error fetching users:', error);
            return;
        }
        
        console.log('=== ALL USERS IN DATABASE ===');
        if (data && data.length > 0) {
            data.forEach(user => {
                console.log(`- Email: ${user.email}`);
                console.log(`  Name: ${user.full_name}`);  
                console.log(`  Role: ${user.role}`);
                console.log(`  ID: ${user.id}`);
                console.log('---');
            });
        } else {
            console.log('No users found in database');
        }
        
        console.log('=== CHECKING FOR PATIENT USER ===');
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', 'patient@codeveda.com')
            .single();
            
        if (patientError || !patient) {
            console.log('❌ patient@codeveda.com NOT FOUND');
        } else {
            console.log('✅ patient@codeveda.com found:', patient);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();