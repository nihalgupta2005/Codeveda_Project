import { supabase, supabaseAdmin } from '../config/supabase.js';

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.supabase = supabase;
    this.supabaseAdmin = supabaseAdmin;
  }

  async findAll(options = {}) {
    const { select = '*', limit, offset, orderBy } = options;
    let query = this.supabase.from(this.tableName).select(select);
    
    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + limit - 1);
    if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findById(id, select = '*') {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(select)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(data) {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async update(id, data) {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async delete(id) {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  }

  async findByRole(role) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('role', role)
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  }

  async createUserProfile(userData) {
    // Use admin client to bypass RLS for initial user creation
    const { data, error } = await this.supabaseAdmin
      .from(this.tableName)
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

class CodeMappingModel extends BaseModel {
  constructor() {
    super('namaste_icd11_mappings');
  }

  async searchCodes(query, options = {}) {
    const { limit = 10, category, ayushSystem } = options;
    
    let supabaseQuery = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('is_active', true);
    
    if (query) {
      // Search in multiple fields
      supabaseQuery = supabaseQuery.or(`namaste_code.ilike.%${query}%,namaste_label.ilike.%${query}%,icd11_code.ilike.%${query}%,icd11_label.ilike.%${query}%`);
    }
    
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }
    
    if (ayushSystem) {
      supabaseQuery = supabaseQuery.eq('ayush_system', ayushSystem);
    }
    
    supabaseQuery = supabaseQuery
      .order('confidence_score', { ascending: false })
      .limit(limit);
    
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    return data;
  }

  async findByNamesteCode(namasteCode) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('namaste_code', namasteCode)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getCategories() {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null);
    
    if (error) throw error;
    return [...new Set(data.map(item => item.category))].sort();
  }

  async getAyushSystems() {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('ayush_system')
      .eq('is_active', true)
      .not('ayush_system', 'is', null);
    
    if (error) throw error;
    return [...new Set(data.map(item => item.ayush_system))].sort();
  }
}

class PatientVisitModel extends BaseModel {
  constructor() {
    super('patient_visits');
  }

  async findByPatientId(patientId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        doctor:doctor_id(full_name, email, organization),
        mapping:namaste_code(namaste_label, icd11_label, category, ayush_system)
      `)
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async findByDoctorId(doctorId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        patient:patient_id(full_name, email, phone),
        mapping:namaste_code(namaste_label, icd11_label, category, ayush_system)
      `)
      .eq('doctor_id', doctorId)
      .order('visit_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async getVisitStats(doctorId, startDate, endDate) {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('status, created_at')
      .eq('doctor_id', doctorId)
      .gte('visit_date', startDate)
      .lte('visit_date', endDate);
    
    if (error) throw error;
    
    const stats = {
      total: data.length,
      completed: data.filter(v => v.status === 'completed').length,
      draft: data.filter(v => v.status === 'draft').length,
      cancelled: data.filter(v => v.status === 'cancelled').length
    };
    
    return stats;
  }
}

class AuditLogModel extends BaseModel {
  constructor() {
    super('audit_logs');
  }

  async logAction(userId, action, resourceType, resourceId, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
    const logEntry = {
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent
    };

    // Use admin client to bypass RLS for audit logging
    const { data: result, error } = await this.supabaseAdmin
      .from(this.tableName)
      .insert(logEntry)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async getAuditTrail(options = {}) {
    const { userId, action, resourceType, limit = 100, offset = 0 } = options;
    
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        user:user_id(full_name, email, role)
      `)
      .order('created_at', { ascending: false });
    
    if (userId) query = query.eq('user_id', userId);
    if (action) query = query.eq('action', action);
    if (resourceType) query = query.eq('resource_type', resourceType);
    
    query = query.range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

export const User = new UserModel();
export const CodeMapping = new CodeMappingModel();
export const PatientVisit = new PatientVisitModel();
export const AuditLog = new AuditLogModel();