import express from 'express';
import { PatientVisit, AuditLog, CodeMapping } from '../models/index.js';
import { authenticateToken, requireDoctor } from '../middleware/auth.js';
import validator from 'validator';

const router = express.Router();

// Get patient visits (for current user if patient, or by doctor if doctor/admin)
router.get('/visits', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, patient_id, doctor_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let visits;
    let totalCount = 0;

    // Role-based access control
    if (req.user.role === 'patient') {
      // Patients can only see their own visits
      visits = await PatientVisit.findByPatientId(req.user.id, {
        limit: parseInt(limit),
        offset
      });

      // Get total count for pagination
      const { count } = await PatientVisit.supabase
        .from(PatientVisit.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', req.user.id);
      
      totalCount = count;

    } else if (req.user.role === 'doctor') {
      // Doctors can see their own patient visits
      if (patient_id) {
        // Doctor viewing specific patient's visits (that they treated)
        const { data, error } = await PatientVisit.supabase
          .from(PatientVisit.tableName)
          .select(`
            *,
            patient:patient_id(full_name, email, phone),
            mapping:namaste_code(namaste_label, icd11_label, category, ayush_system)
          `)
          .eq('patient_id', patient_id)
          .eq('doctor_id', req.user.id)
          .order('visit_date', { ascending: false })
          .range(offset, offset + parseInt(limit) - 1);

        if (error) throw error;
        visits = data;

        const { count } = await PatientVisit.supabase
          .from(PatientVisit.tableName)
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patient_id)
          .eq('doctor_id', req.user.id);
        
        totalCount = count;

      } else {
        // Doctor viewing all their patient visits
        visits = await PatientVisit.findByDoctorId(req.user.id, {
          limit: parseInt(limit),
          offset
        });

        const { count } = await PatientVisit.supabase
          .from(PatientVisit.tableName)
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', req.user.id);
        
        totalCount = count;
      }

    } else if (req.user.role === 'admin') {
      // Admins can see all visits with filters
      let query = PatientVisit.supabase
        .from(PatientVisit.tableName)
        .select(`
          *,
          patient:patient_id(full_name, email, phone),
          doctor:doctor_id(full_name, email, organization),
          mapping:namaste_code(namaste_label, icd11_label, category, ayush_system)
        `);

      if (patient_id) query = query.eq('patient_id', patient_id);
      if (doctor_id) query = query.eq('doctor_id', doctor_id);

      const { data, error } = await query
        .order('visit_date', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (error) throw error;
      visits = data;

      // Get total count
      let countQuery = PatientVisit.supabase
        .from(PatientVisit.tableName)
        .select('*', { count: 'exact', head: true });

      if (patient_id) countQuery = countQuery.eq('patient_id', patient_id);
      if (doctor_id) countQuery = countQuery.eq('doctor_id', doctor_id);

      const { count } = await countQuery;
      totalCount = count;
    }

    res.json({
      message: 'Patient visits retrieved successfully',
      data: visits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get specific patient visit by ID
router.get('/visits/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validator.isUUID(id)) {
      return res.status(400).json({
        error: 'Invalid visit ID',
        message: 'Please provide a valid UUID for the visit ID'
      });
    }

    const { data: visit, error } = await PatientVisit.supabase
      .from(PatientVisit.tableName)
      .select(`
        *,
        patient:patient_id(full_name, email, phone),
        doctor:doctor_id(full_name, email, organization),
        mapping:namaste_code(namaste_label, icd11_label, category, ayush_system)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!visit) {
      return res.status(404).json({
        error: 'Visit not found',
        message: `No visit found with ID: ${id}`
      });
    }

    // Check access permissions
    const hasAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'patient' && visit.patient_id === req.user.id) ||
      (req.user.role === 'doctor' && visit.doctor_id === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this visit'
      });
    }

    res.json({
      message: 'Patient visit retrieved successfully',
      data: visit
    });

  } catch (error) {
    next(error);
  }
});

// Create new patient visit (Doctor only)
router.post('/visits', authenticateToken, requireDoctor, async (req, res, next) => {
  try {
    const {
      patient_id,
      visit_date,
      chief_complaint,
      diagnosis,
      namaste_code,
      treatment_plan,
      prescription,
      notes,
      hospital_name,
      follow_up_date
    } = req.body;

    // Validation
    if (!patient_id || !diagnosis) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'patient_id and diagnosis are required'
      });
    }

    if (!validator.isUUID(patient_id)) {
      return res.status(400).json({
        error: 'Invalid patient ID',
        message: 'Please provide a valid UUID for patient_id'
      });
    }

    // Verify NAMASTE code exists if provided
    let mappedIcd11Code = null;
    if (namaste_code) {
      const codeMapping = await CodeMapping.findByNamesteCode(namaste_code);
      if (!codeMapping) {
        return res.status(400).json({
          error: 'Invalid NAMASTE code',
          message: `NAMASTE code ${namaste_code} not found`
        });
      }
      mappedIcd11Code = codeMapping.icd11_code;
    }

    // Create the visit
    const visitData = {
      patient_id,
      doctor_id: req.user.id,
      visit_date: visit_date || new Date().toISOString().split('T')[0],
      chief_complaint,
      diagnosis,
      namaste_code,
      icd11_code: mappedIcd11Code,
      treatment_plan,
      prescription,
      notes,
      hospital_name,
      follow_up_date,
      status: 'completed'
    };

    const newVisit = await PatientVisit.create(visitData);

    // Get the full visit data with relationships
    const { data: fullVisit, error } = await PatientVisit.supabase
      .from(PatientVisit.tableName)
      .select(`
        *,
        patient:patient_id(full_name, email, phone),
        mapping:namaste_code(namaste_label, icd11_label, category, ayush_system)
      `)
      .eq('id', newVisit.id)
      .single();

    if (error) throw error;

    // Log the visit creation
    await AuditLog.logAction(
      req.user.id,
      'create',
      'patient_visit',
      newVisit.id,
      null,
      newVisit,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      message: 'Patient visit created successfully',
      data: fullVisit
    });

  } catch (error) {
    next(error);
  }
});

// Update patient visit (Doctor who created it or Admin)
router.put('/visits/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      visit_date,
      chief_complaint,
      diagnosis,
      namaste_code,
      treatment_plan,
      prescription,
      notes,
      hospital_name,
      follow_up_date,
      status
    } = req.body;

    if (!validator.isUUID(id)) {
      return res.status(400).json({
        error: 'Invalid visit ID',
        message: 'Please provide a valid UUID for the visit ID'
      });
    }

    // Get current visit
    const currentVisit = await PatientVisit.findById(id);
    if (!currentVisit) {
      return res.status(404).json({
        error: 'Visit not found',
        message: `No visit found with ID: ${id}`
      });
    }

    // Check permissions
    const canEdit = 
      req.user.role === 'admin' ||
      (req.user.role === 'doctor' && currentVisit.doctor_id === req.user.id);

    if (!canEdit) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to edit this visit'
      });
    }

    const updateData = {};
    if (visit_date !== undefined) updateData.visit_date = visit_date;
    if (chief_complaint !== undefined) updateData.chief_complaint = chief_complaint;
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (treatment_plan !== undefined) updateData.treatment_plan = treatment_plan;
    if (prescription !== undefined) updateData.prescription = prescription;
    if (notes !== undefined) updateData.notes = notes;
    if (hospital_name !== undefined) updateData.hospital_name = hospital_name;
    if (follow_up_date !== undefined) updateData.follow_up_date = follow_up_date;
    if (status !== undefined) updateData.status = status;

    // Handle NAMASTE code update
    if (namaste_code !== undefined) {
      if (namaste_code) {
        const codeMapping = await CodeMapping.findByNamesteCode(namaste_code);
        if (!codeMapping) {
          return res.status(400).json({
            error: 'Invalid NAMASTE code',
            message: `NAMASTE code ${namaste_code} not found`
          });
        }
        updateData.namaste_code = namaste_code;
        updateData.icd11_code = codeMapping.icd11_code;
      } else {
        updateData.namaste_code = null;
        updateData.icd11_code = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No data to update',
        message: 'Please provide at least one field to update'
      });
    }

    const updatedVisit = await PatientVisit.update(id, updateData);

    // Get the full updated visit data
    const { data: fullVisit, error } = await PatientVisit.supabase
      .from(PatientVisit.tableName)
      .select(`
        *,
        patient:patient_id(full_name, email, phone),
        mapping:namaste_code(namaste_label, icd11_label, category, ayush_system)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Log the update
    await AuditLog.logAction(
      req.user.id,
      'update',
      'patient_visit',
      id,
      currentVisit,
      updatedVisit,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Patient visit updated successfully',
      data: fullVisit
    });

  } catch (error) {
    next(error);
  }
});

// Delete patient visit (Doctor who created it or Admin)
router.delete('/visits/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validator.isUUID(id)) {
      return res.status(400).json({
        error: 'Invalid visit ID',
        message: 'Please provide a valid UUID for the visit ID'
      });
    }

    // Get current visit
    const currentVisit = await PatientVisit.findById(id);
    if (!currentVisit) {
      return res.status(404).json({
        error: 'Visit not found',
        message: `No visit found with ID: ${id}`
      });
    }

    // Check permissions
    const canDelete = 
      req.user.role === 'admin' ||
      (req.user.role === 'doctor' && currentVisit.doctor_id === req.user.id);

    if (!canDelete) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this visit'
      });
    }

    // Soft delete by updating status to 'cancelled'
    const deletedVisit = await PatientVisit.update(id, { status: 'cancelled' });

    // Log the deletion
    await AuditLog.logAction(
      req.user.id,
      'delete',
      'patient_visit',
      id,
      currentVisit,
      { status: 'cancelled' },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Patient visit deleted successfully',
      data: deletedVisit
    });

  } catch (error) {
    next(error);
  }
});

// Get visit statistics for doctor
router.get('/stats/visits', authenticateToken, requireDoctor, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago
    const endDate = end_date || new Date().toISOString().split('T')[0]; // today

    const stats = await PatientVisit.getVisitStats(req.user.id, startDate, endDate);

    // Get additional statistics
    const { data: visits } = await PatientVisit.supabase
      .from(PatientVisit.tableName)
      .select(`
        *,
        mapping:namaste_code(category, ayush_system)
      `)
      .eq('doctor_id', req.user.id)
      .gte('visit_date', startDate)
      .lte('visit_date', endDate);

    const categoryStats = {};
    const ayushSystemStats = {};
    
    visits.forEach(visit => {
      if (visit.mapping?.category) {
        categoryStats[visit.mapping.category] = (categoryStats[visit.mapping.category] || 0) + 1;
      }
      if (visit.mapping?.ayush_system) {
        ayushSystemStats[visit.mapping.ayush_system] = (ayushSystemStats[visit.mapping.ayush_system] || 0) + 1;
      }
    });

    res.json({
      message: 'Visit statistics retrieved successfully',
      data: {
        ...stats,
        date_range: { start_date: startDate, end_date: endDate },
        by_category: categoryStats,
        by_ayush_system: ayushSystemStats
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;