import { supabaseAdmin } from './src/config/supabase.js';

async function checkDatabase() {
  try {
    console.log('=== SCHEMAS ===');
    const { data: schemas, error: schemasErr } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('public', 'internal');"
    });
    if (schemasErr) console.error('Error fetching schemas:', schemasErr);
    else console.log('Schemas found:', schemas);

    console.log('\n=== FUNCTIONS ===');
    const { data: functions, error: funcsErr } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        SELECT routine_schema, routine_name, security_type
        FROM information_schema.routines 
        WHERE routine_schema IN ('public', 'internal') 
          AND routine_name LIKE '%check_user_role%';
      `
    });
    if (funcsErr) console.error('Error fetching functions:', funcsErr);
    else console.log('Functions:', functions);

    console.log('\n=== POLICIES ===');
    const { data: policies, error: policiesErr } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        SELECT tablename, policyname, cmd, qualifier, roles, rls_enabled
        FROM (
          SELECT schemaname, tablename, policyname, cmd, qual::text as qualifier, roles 
          FROM pg_policies
        ) p
        JOIN pg_class c ON c.relname = p.tablename
        JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = p.schemaname
        JOIN (
          SELECT oid, relrowsecurity as rls_enabled FROM pg_class
        ) r ON r.oid = c.oid
        WHERE p.schemaname = 'public';
      `
    });
    if (policiesErr) console.error('Error fetching policies:', policiesErr);
    else {
      console.log('RLS Policies:');
      policies.forEach(p => {
        console.log(`- Table: ${p.tablename}`);
        console.log(`  Policy: ${p.policyname}`);
        console.log(`  Cmd: ${p.cmd}`);
        console.log(`  Roles: ${p.roles}`);
        console.log(`  Qual: ${p.qualifier}`);
        console.log('  ---');
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(1);
  }
}

checkDatabase();
