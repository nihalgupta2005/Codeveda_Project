import express from 'express';
import { AuditLog } from '../models/index.js';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get audit logs (Admin only) - Main endpoint
router.get('/logs', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      user_id, 
      action, 
      resourceType,
      search,
      dateRange = '7days'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Calculate date filter based on dateRange
    let startDate = null;
    const now = new Date();
    
    switch (dateRange) {
      case '1day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = null;
    }

    // Build query
    let query = supabaseAdmin
      .from(AuditLog.tableName)
      .select(`
        *,
        user:user_id(full_name, email, role)
      `);

    // Apply filters
    if (user_id) query = query.eq('user_id', user_id);
    if (action) query = query.eq('action', action);
    if (resourceType) query = query.eq('resource_type', resourceType);
    if (startDate) query = query.gte('created_at', startDate.toISOString());
    
    // Apply search filter
    if (search) {
      query = query.or(`ip_address.ilike.%${search}%,user_agent.ilike.%${search}%,action.ilike.%${search}%,resource_type.ilike.%${search}%`);
    }

    // Execute query with pagination
    const { data: logs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      console.error('Audit logs query error:', error);
      throw error;
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from(AuditLog.tableName)
      .select('*', { count: 'exact', head: true });

    if (user_id) countQuery = countQuery.eq('user_id', user_id);
    if (action) countQuery = countQuery.eq('action', action);
    if (resourceType) countQuery = countQuery.eq('resource_type', resourceType);
    if (startDate) countQuery = countQuery.gte('created_at', startDate.toISOString());

    const { count: totalCount } = await countQuery;

    res.json({
      message: 'Audit logs retrieved successfully',
      data: logs || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / parseInt(limit))
      },
      filters: {
        user_id,
        action,
        resourceType,
        search,
        dateRange
      }
    });

  } catch (error) {
    console.error('Audit logs error:', error);
    next(error);
  }
});

// Get audit logs (Admin only) - Legacy endpoint for backward compatibility
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      user_id, 
      action, 
      resource_type,
      start_date,
      end_date 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const auditTrail = await AuditLog.getAuditTrail({
      userId: user_id,
      action,
      resourceType: resource_type,
      limit: parseInt(limit),
      offset
    });

    // Apply date filters if provided
    let filteredLogs = auditTrail;
    if (start_date || end_date) {
      filteredLogs = auditTrail.filter(log => {
        const logDate = new Date(log.created_at);
        const startFilter = start_date ? logDate >= new Date(start_date) : true;
        const endFilter = end_date ? logDate <= new Date(end_date) : true;
        return startFilter && endFilter;
      });
    }

    // Get total count for pagination (simplified)
    let countQuery = AuditLog.supabase
      .from(AuditLog.tableName)
      .select('*', { count: 'exact', head: true });

    if (user_id) countQuery = countQuery.eq('user_id', user_id);
    if (action) countQuery = countQuery.eq('action', action);
    if (resource_type) countQuery = countQuery.eq('resource_type', resource_type);

    const { count } = await countQuery;

    res.json({
      message: 'Audit logs retrieved successfully',
      data: filteredLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      },
      filters: {
        user_id,
        action,
        resource_type,
        start_date,
        end_date
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get audit statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
    const endDate = end_date || new Date().toISOString(); // now

    // Get all audit logs within date range
    const { data: logs, error } = await AuditLog.supabase
      .from(AuditLog.tableName)
      .select(`
        action,
        resource_type,
        created_at,
        user:user_id(role)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate statistics
    const stats = {
      total_actions: logs.length,
      by_action: {},
      by_resource_type: {},
      by_user_role: {},
      timeline: {}
    };

    logs.forEach(log => {
      // By action
      stats.by_action[log.action] = (stats.by_action[log.action] || 0) + 1;
      
      // By resource type
      stats.by_resource_type[log.resource_type] = (stats.by_resource_type[log.resource_type] || 0) + 1;
      
      // By user role
      const userRole = log.user?.role || 'unknown';
      stats.by_user_role[userRole] = (stats.by_user_role[userRole] || 0) + 1;
      
      // Timeline (by day)
      const dateKey = log.created_at.split('T')[0];
      stats.timeline[dateKey] = (stats.timeline[dateKey] || 0) + 1;
    });

    res.json({
      message: 'Audit statistics retrieved successfully',
      data: stats,
      date_range: {
        start_date: startDate,
        end_date: endDate
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get user activity (Admin only)
router.get('/users/:user_id/activity', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { limit = 50, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const userActivity = await AuditLog.getAuditTrail({
      userId: user_id,
      limit: parseInt(limit),
      offset
    });

    res.json({
      message: 'User activity retrieved successfully',
      data: userActivity,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;