import express from 'express';
import { CodeMapping, AuditLog } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Search for code mappings (public endpoint)
router.get('/search', authenticateToken, async (req, res, next) => {
  try {
    const { q, category, ayush_system, limit = 10 } = req.query;

    if (!q && !category && !ayush_system) {
      return res.status(400).json({
        error: 'Missing search parameters',
        message: 'Provide at least one of: q (query), category, or ayush_system'
      });
    }

    const searchResults = await CodeMapping.searchCodes(q, {
      limit: parseInt(limit),
      category,
      ayushSystem: ayush_system
    });

    // Log the search action
    await AuditLog.logAction(
      req.user.id,
      'search',
      'code_mapping',
      null,
      null,
      { query: q, category, ayush_system, results_count: searchResults.length },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Search completed successfully',
      results: searchResults,
      count: searchResults.length,
      query: {
        search: q,
        category,
        ayush_system,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get all code mappings with pagination
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, ayush_system } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let options = {
      limit: parseInt(limit),
      offset,
      orderBy: { column: 'created_at', ascending: false }
    };

    // Apply filters if provided
    let query = CodeMapping.supabase
      .from(CodeMapping.tableName)
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (ayush_system) {
      query = query.eq('ayush_system', ayush_system);
    }

    const { data: mappings, error } = await query
      .order('confidence_score', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    // Get total count for pagination
    let countQuery = CodeMapping.supabase
      .from(CodeMapping.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (category) countQuery = countQuery.eq('category', category);
    if (ayush_system) countQuery = countQuery.eq('ayush_system', ayush_system);

    const { count } = await countQuery;

    res.json({
      message: 'Code mappings retrieved successfully',
      data: mappings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get code mapping by NAMASTE code
router.get('/namaste/:code', authenticateToken, async (req, res, next) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        error: 'Missing NAMASTE code',
        message: 'NAMASTE code parameter is required'
      });
    }

    const mapping = await CodeMapping.findByNamesteCode(code);

    if (!mapping) {
      return res.status(404).json({
        error: 'Mapping not found',
        message: `No mapping found for NAMASTE code: ${code}`
      });
    }

    res.json({
      message: 'Code mapping found',
      data: mapping
    });

  } catch (error) {
    next(error);
  }
});

// Get categories
router.get('/categories', authenticateToken, async (req, res, next) => {
  try {
    const categories = await CodeMapping.getCategories();

    res.json({
      message: 'Categories retrieved successfully',
      data: categories
    });

  } catch (error) {
    next(error);
  }
});

// Get AYUSH systems
router.get('/ayush-systems', authenticateToken, async (req, res, next) => {
  try {
    const systems = await CodeMapping.getAyushSystems();

    res.json({
      message: 'AYUSH systems retrieved successfully',
      data: systems
    });

  } catch (error) {
    next(error);
  }
});

// Create new code mapping (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const {
      namaste_code,
      namaste_label,
      namaste_description,
      icd11_code,
      icd11_label,
      icd11_description,
      category,
      ayush_system,
      confidence_score = 1.00
    } = req.body;

    // Validation
    if (!namaste_code || !namaste_label || !icd11_code || !icd11_label) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'namaste_code, namaste_label, icd11_code, and icd11_label are required'
      });
    }

    if (confidence_score < 0 || confidence_score > 1) {
      return res.status(400).json({
        error: 'Invalid confidence score',
        message: 'Confidence score must be between 0.00 and 1.00'
      });
    }

    // Check if NAMASTE code already exists
    const existingMapping = await CodeMapping.findByNamesteCode(namaste_code);
    if (existingMapping) {
      return res.status(409).json({
        error: 'Code mapping already exists',
        message: `A mapping for NAMASTE code ${namaste_code} already exists`
      });
    }

    const newMapping = await CodeMapping.create({
      namaste_code,
      namaste_label,
      namaste_description,
      icd11_code,
      icd11_label,
      icd11_description,
      category,
      ayush_system,
      confidence_score,
      created_by: req.user.id
    });

    // Log the creation
    await AuditLog.logAction(
      req.user.id,
      'create',
      'code_mapping',
      newMapping.id,
      null,
      newMapping,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      message: 'Code mapping created successfully',
      data: newMapping
    });

  } catch (error) {
    next(error);
  }
});

// Update code mapping (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      namaste_label,
      namaste_description,
      icd11_code,
      icd11_label,
      icd11_description,
      category,
      ayush_system,
      confidence_score,
      is_active
    } = req.body;

    // Get current mapping for audit log
    const currentMapping = await CodeMapping.findById(id);
    if (!currentMapping) {
      return res.status(404).json({
        error: 'Mapping not found',
        message: `No mapping found with ID: ${id}`
      });
    }

    const updateData = {};
    if (namaste_label !== undefined) updateData.namaste_label = namaste_label;
    if (namaste_description !== undefined) updateData.namaste_description = namaste_description;
    if (icd11_code !== undefined) updateData.icd11_code = icd11_code;
    if (icd11_label !== undefined) updateData.icd11_label = icd11_label;
    if (icd11_description !== undefined) updateData.icd11_description = icd11_description;
    if (category !== undefined) updateData.category = category;
    if (ayush_system !== undefined) updateData.ayush_system = ayush_system;
    if (confidence_score !== undefined) {
      if (confidence_score < 0 || confidence_score > 1) {
        return res.status(400).json({
          error: 'Invalid confidence score',
          message: 'Confidence score must be between 0.00 and 1.00'
        });
      }
      updateData.confidence_score = confidence_score;
    }
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No data to update',
        message: 'Please provide at least one field to update'
      });
    }

    const updatedMapping = await CodeMapping.update(id, updateData);

    // Log the update
    await AuditLog.logAction(
      req.user.id,
      'update',
      'code_mapping',
      id,
      currentMapping,
      updatedMapping,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Code mapping updated successfully',
      data: updatedMapping
    });

  } catch (error) {
    next(error);
  }
});

// Delete (deactivate) code mapping (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get current mapping for audit log
    const currentMapping = await CodeMapping.findById(id);
    if (!currentMapping) {
      return res.status(404).json({
        error: 'Mapping not found',
        message: `No mapping found with ID: ${id}`
      });
    }

    // Soft delete by setting is_active to false
    const updatedMapping = await CodeMapping.update(id, { is_active: false });

    // Log the deletion
    await AuditLog.logAction(
      req.user.id,
      'delete',
      'code_mapping',
      id,
      currentMapping,
      { is_active: false },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Code mapping deactivated successfully',
      data: updatedMapping
    });

  } catch (error) {
    next(error);
  }
});

// Get mapping statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    // Get total counts
    const { data: allMappings } = await CodeMapping.supabase
      .from(CodeMapping.tableName)
      .select('category, ayush_system, confidence_score, is_active');

    const stats = {
      total: allMappings.length,
      active: allMappings.filter(m => m.is_active).length,
      inactive: allMappings.filter(m => !m.is_active).length,
      by_category: {},
      by_ayush_system: {},
      confidence_distribution: {
        high: allMappings.filter(m => m.confidence_score >= 0.9).length,
        medium: allMappings.filter(m => m.confidence_score >= 0.7 && m.confidence_score < 0.9).length,
        low: allMappings.filter(m => m.confidence_score < 0.7).length
      }
    };

    // Group by category
    allMappings.forEach(mapping => {
      if (mapping.category) {
        stats.by_category[mapping.category] = (stats.by_category[mapping.category] || 0) + 1;
      }
      if (mapping.ayush_system) {
        stats.by_ayush_system[mapping.ayush_system] = (stats.by_ayush_system[mapping.ayush_system] || 0) + 1;
      }
    });

    res.json({
      message: 'Statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    next(error);
  }
});

export default router;