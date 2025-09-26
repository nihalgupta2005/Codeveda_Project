import { supabaseAdmin } from './src/config/supabase.js';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  console.log('🚀 Setting up CodeVeda database...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      if (statement.includes('INSERT INTO')) {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}: INSERT data...`);
      } else if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE\s+(?:public\.)?(\w+)/i)?.[1];
        console.log(`📝 Executing statement ${i + 1}/${statements.length}: CREATE TABLE ${tableName}...`);
      } else if (statement.includes('CREATE TYPE')) {
        const typeName = statement.match(/CREATE TYPE\s+(\w+)/i)?.[1];
        console.log(`📝 Executing statement ${i + 1}/${statements.length}: CREATE TYPE ${typeName}...`);
      } else {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
      }
      
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: statement });
        if (error) {
          console.warn(`⚠️ Statement ${i + 1} warning:`, error.message);
        }
      } catch (err) {
        console.warn(`⚠️ Statement ${i + 1} warning:`, err.message);
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    
    // Test the setup by checking if tables exist
    console.log('🔍 Verifying database setup...');
    
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'namaste_icd11_mappings', 'patient_visits', 'audit_logs']);
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
    } else {
      console.log('✅ Tables created:', tables.map(t => t.table_name).join(', '));
    }
    
    // Check sample data
    const { data: mappings, error: mappingsError } = await supabaseAdmin
      .from('namaste_icd11_mappings')
      .select('namaste_code, namaste_label, icd11_code, icd11_label')
      .limit(3);
    
    if (mappingsError) {
      console.error('❌ Error checking mappings:', mappingsError);
    } else {
      console.log('✅ Sample mappings created:');
      mappings.forEach(m => {
        console.log(`   ${m.namaste_code} (${m.namaste_label}) → ${m.icd11_code} (${m.icd11_label})`);
      });
    }
    
    console.log('\n🎉 Database is ready for CodeVeda!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();