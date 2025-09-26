import express from 'express';
import { User, AuditLog } from '../models/index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import validator from 'validator';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, is_active, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = User.supabase
      .from(User.tableName)
      .select('*');

    // Apply filters
    if (role && ['admin', 'doctor', 'patient'].includes(role)) {
      query = query.eq('role', role);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    // Get total count for pagination
    let countQuery = User.supabase
      .from(User.tableName)
      .select('*', { count: 'exact', head: true });

    if (role && ['admin', 'doctor', 'patient'].includes(role)) {
      countQuery = countQuery.eq('role', role);
    }
    if (is_active !== undefined) {
      countQuery = countQuery.eq('is_active', is_active === 'true');
    }
    if (search) {
      countQuery = countQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    // Remove sensitive data from response
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      phone: user.phone,
      licenseNumber: user.license_number,
      organization: user.organization,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    res.json({
      message: 'Users retrieved successfully',
      data: sanitizedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      },
      filters: {
        role,
        is_active,
        search
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get user by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validator.isUUID(id)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'Please provide a valid UUID for the user ID'
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `No user found with ID: ${id}`
      });
    }

    // Remove sensitive data
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      phone: user.phone,
      licenseNumber: user.license_number,
      organization: user.organization,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.json({
      message: 'User retrieved successfully',
      data: sanitizedUser
    });

  } catch (error) {
    next(error);
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      role,
      phone,
      licenseNumber,
      organization,
      isActive
    } = req.body;

    if (!validator.isUUID(id)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'Please provide a valid UUID for the user ID'
      });
    }

    // Get current user data for audit log
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({
        error: 'User not found',
        message: `No user found with ID: ${id}`
      });
    }

    const updateData = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (role !== undefined && ['admin', 'doctor', 'patient'].includes(role)) {
      updateData.role = role;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (licenseNumber !== undefined) updateData.license_number = licenseNumber;
    if (organization !== undefined) updateData.organization = organization;
    if (isActive !== undefined) updateData.is_active = isActive;

    // Validation for role change
    if (role && !['admin', 'doctor', 'patient'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be admin, doctor, or patient'
      });
    }

    // Prevent admin from deactivating themselves
    if (isActive === false && currentUser.id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot deactivate own account',
        message: 'You cannot deactivate your own account'
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No data to update',
        message: 'Please provide at least one field to update'
      });
    }

    const updatedUser = await User.update(id, updateData);

    // Log the update
    await AuditLog.logAction(
      req.user.id,
      'update',
      'user',
      id,
      {
        full_name: currentUser.full_name,
        role: currentUser.role,
        phone: currentUser.phone,
        license_number: currentUser.license_number,
        organization: currentUser.organization,
        is_active: currentUser.is_active
      },
      updateData,
      req.ip,
      req.get('user-agent')
    );

    // Remove sensitive data
    const sanitizedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
      role: updatedUser.role,
      phone: updatedUser.phone,
      licenseNumber: updatedUser.license_number,
      organization: updatedUser.organization,
      isActive: updatedUser.is_active,
      updatedAt: updatedUser.updated_at
    };

    res.json({
      message: 'User updated successfully',
      data: sanitizedUser
    });

  } catch (error) {
    next(error);
  }
});

// Deactivate user (Admin only) - soft delete
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validator.isUUID(id)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'Please provide a valid UUID for the user ID'
      });
    }

    // Get current user data
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({
        error: 'User not found',
        message: `No user found with ID: ${id}`
      });
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === req.user.id) {
      return res.status(400).json({
        error: 'Cannot delete own account',
        message: 'You cannot delete your own account'
      });
    }

    // Soft delete by setting is_active to false
    const deactivatedUser = await User.update(id, { is_active: false });

    // Log the deactivation
    await AuditLog.logAction(
      req.user.id,
      'delete',
      'user',
      id,
      currentUser,
      { is_active: false },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'User deactivated successfully',
      data: {
        id: deactivatedUser.id,
        email: deactivatedUser.email,
        fullName: deactivatedUser.full_name,
        isActive: deactivatedUser.is_active
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get user statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    // Get all users
    const { data: allUsers } = await User.supabase
      .from(User.tableName)
      .select('role, is_active, created_at');

    const stats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.is_active).length,
      inactive: allUsers.filter(u => !u.is_active).length,
      by_role: {
        admin: allUsers.filter(u => u.role === 'admin').length,
        doctor: allUsers.filter(u => u.role === 'doctor').length,
        patient: allUsers.filter(u => u.role === 'patient').length
      },
      recent_registrations: {
        last_7_days: allUsers.filter(u => {
          const userDate = new Date(u.created_at);
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return userDate >= sevenDaysAgo;
        }).length,
        last_30_days: allUsers.filter(u => {
          const userDate = new Date(u.created_at);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return userDate >= thirtyDaysAgo;
        }).length
      }
    };

    res.json({
      message: 'User statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    next(error);
  }
});

// Search users (simplified endpoint for dropdowns, etc.)
router.get('/search/simple', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { q, role, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'Invalid search query',
        message: 'Search query must be at least 2 characters long'
      });
    }

    let query = User.supabase
      .from(User.tableName)
      .select('id, full_name, email, role')
      .eq('is_active', true)
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(parseInt(limit));

    if (role && ['admin', 'doctor', 'patient'].includes(role)) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    res.json({
      message: 'Search completed successfully',
      data: users.map(user => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      }))
    });

  } catch (error) {
    next(error);
  }
});

// Patient lookup for doctors (used in EHR forms)
router.get('/patient/lookup', authenticateToken, async (req, res, next) => {
  try {
    const { email } = req.query;
    
    // Only doctors and admins can lookup patients
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only doctors and admins can lookup patient information'
      });
    }
    
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }
    
    const { data: patient, error } = await User.supabase
      .from(User.tableName)
      .select('id, full_name, email, phone')
      .eq('email', email)
      .eq('role', 'patient')
      .eq('is_active', true)
      .single();
    
    if (error || !patient) {
      return res.status(404).json({
        error: 'Patient not found',
        message: 'No active patient found with this email address'
      });
    }
    
    res.json({
      message: 'Patient found successfully',
      data: {
        id: patient.id,
        fullName: patient.full_name,
        email: patient.email,
        phone: patient.phone
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Create patient visit with automatic patient creation if needed
router.post('/patient/visit', authenticateToken, async (req, res, next) => {
  try {
    // Only doctors and admins can create patient visits
    if (!['doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only doctors and admins can create patient visits'
      });
    }
    
    const {
      patient_name,
      patient_email,
      patient_age,
      patient_contact,
      visit_date,
      chief_complaint,
      diagnosis,
      namaste_code,
      icd11_code,
      treatment_plan,
      prescription,
      hospital_name
    } = req.body;
    
    if (!patient_name || !diagnosis) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Patient name and diagnosis are required'
      });
    }
    
    let patientId;
    
    if (patient_email && patient_email.trim() !== '') {
      // Try to find existing patient by email
      const { data: existingPatient } = await User.supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', patient_email)
        .eq('role', 'patient')
        .single();
        
      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Create new patient with email
        const { data: newPatient, error: createError } = await User.supabaseAdmin.auth.admin.createUser({
          email: patient_email,
          password: 'temp_password_' + Date.now(),
          email_confirm: true,
          user_metadata: {
            full_name: patient_name,
            role: 'patient',
            created_by_doctor: true
          }
        });
        
        if (createError) {
          return res.status(500).json({
            error: 'Failed to create patient account',
            message: createError.message
          });
        }
        
        // Create user profile
        const { error: profileError } = await User.supabaseAdmin
          .from('users')
          .insert({
            id: newPatient.user.id,
            email: patient_email,
            full_name: patient_name,
            role: 'patient',
            phone: patient_contact || null,
            is_active: true
          });
          
        if (profileError) {
          return res.status(500).json({
            error: 'Failed to create patient profile',
            message: profileError.message
          });
        }
        
        patientId = newPatient.user.id;
        
        // Log patient creation
        await AuditLog.logAction(
          req.user.id,
          'create',
          'patient',
          patientId,
          null,
          {
            full_name: patient_name,
            email: patient_email,
            phone: patient_contact,
            created_by_doctor: true
          },
          req.ip,
          req.get('user-agent')
        );
      }
    } else {
      // Create anonymous patient (no email)
      const tempEmail = `temp_patient_${Date.now()}@external.local`;
      const { data: newPatient, error: createError } = await User.supabaseAdmin.auth.admin.createUser({
        email: tempEmail,
        password: 'temp_password_' + Date.now(),
        email_confirm: true,
        user_metadata: {
          full_name: patient_name,
          role: 'patient',
          created_by_doctor: true,
          is_external: true
        }
      });
      
      if (createError) {
        return res.status(500).json({
          error: 'Failed to create patient account',
          message: createError.message
        });
      }
      
      // Create user profile for anonymous patient
      const { error: profileError } = await User.supabaseAdmin
        .from('users')
        .insert({
          id: newPatient.user.id,
          email: tempEmail,
          full_name: patient_name,
          role: 'patient',
          phone: patient_contact || null,
          is_active: true
        });
        
      if (profileError) {
        return res.status(500).json({
          error: 'Failed to create patient profile',
          message: profileError.message
        });
      }
      
      patientId = newPatient.user.id;
      
      // Log anonymous patient creation
      await AuditLog.logAction(
        req.user.id,
        'create',
        'patient',
        patientId,
        null,
        {
          full_name: patient_name,
          phone: patient_contact,
          is_external: true,
          created_by_doctor: true
        },
        req.ip,
        req.get('user-agent')
      );
    }
    
    // Create visit record
    const visitData = {
      patient_id: patientId,
      doctor_id: req.user.id,
      visit_date: visit_date || new Date().toISOString().split('T')[0],
      chief_complaint: chief_complaint || diagnosis,
      diagnosis,
      namaste_code: namaste_code || null,
      icd11_code: icd11_code || null,
      treatment_plan: treatment_plan || null,
      prescription: prescription || null,
      hospital_name: hospital_name || null,
      status: 'completed'
    };
    
    const { data: visit, error: visitError } = await User.supabaseAdmin
      .from('patient_visits')
      .insert([visitData])
      .select()
      .single();
      
    if (visitError) {
      return res.status(500).json({
        error: 'Failed to create visit record',
        message: visitError.message
      });
    }
    
    // Log the visit creation
    await AuditLog.logAction(
      req.user.id,
      'create',
      'patient_visit',
      visit.id,
      null,
      {
        patient_name,
        patient_email: patient_email || 'anonymous',
        diagnosis,
        visit_date: visitData.visit_date,
        hospital_name,
        patient_id: patientId
      },
      req.ip,
      req.get('user-agent')
    );
    
    res.json({
      message: 'Patient visit created successfully',
      data: {
        visit,
        patient_id: patientId
      }
    });
    
  } catch (error) {
    next(error);
  }
});

export default router;
