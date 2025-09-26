import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { User, AuditLog } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import validator from 'validator';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authRateLimiter);

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, role = 'patient', phone, licenseNumber, organization } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and full name are required'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!['admin', 'doctor', 'patient'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be admin, doctor, or patient'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        error: 'Registration failed',
        message: authError.message
      });
    }

    // Create user profile
    const userProfile = await User.createUserProfile({
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
      phone,
      license_number: licenseNumber,
      organization
    });

    // Log the registration
    await AuditLog.logAction(
      authData.user.id,
      'create',
      'user',
      authData.user.id,
      null,
      { email, role },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        fullName: userProfile.full_name,
        role: userProfile.role,
        isActive: userProfile.is_active
      }
    });

  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      await AuditLog.logAction(
        null,
        'login',
        'user',
        null,
        null,
        { email, success: false, error: error.message },
        req.ip,
        req.get('user-agent')
      );

      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message
      });
    }

    // Get user profile
    const userProfile = await User.findById(data.user.id);
    
    if (!userProfile || !userProfile.is_active) {
      return res.status(403).json({
        error: 'Account inactive',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Log successful login
    await AuditLog.logAction(
      data.user.id,
      'login',
      'user',
      data.user.id,
      null,
      { email, success: true },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Login successful',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        fullName: userProfile.full_name,
        role: userProfile.role,
        organization: userProfile.organization,
        isActive: userProfile.is_active
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      }
    });

  } catch (error) {
    next(error);
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({
        error: 'Logout failed',
        message: error.message
      });
    }

    // Log logout
    await AuditLog.logAction(
      req.user.id,
      'logout',
      'user',
      req.user.id,
      null,
      { success: true },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        phone: req.user.profile.phone,
        licenseNumber: req.user.profile.license_number,
        organization: req.user.profile.organization,
        isActive: req.user.profile.is_active,
        createdAt: req.user.profile.created_at,
        updatedAt: req.user.profile.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res, next) => {
  try {
    const { fullName, phone, organization } = req.body;
    const updateData = {};

    if (fullName) updateData.full_name = fullName;
    if (phone) updateData.phone = phone;
    if (organization) updateData.organization = organization;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No data to update',
        message: 'Please provide at least one field to update'
      });
    }

    const oldProfile = req.user.profile;
    const updatedProfile = await User.update(req.user.id, updateData);

    // Log profile update
    await AuditLog.logAction(
      req.user.id,
      'update',
      'user',
      req.user.id,
      { full_name: oldProfile.full_name, phone: oldProfile.phone, organization: oldProfile.organization },
      updateData,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        fullName: updatedProfile.full_name,
        role: updatedProfile.role,
        phone: updatedProfile.phone,
        licenseNumber: updatedProfile.license_number,
        organization: updatedProfile.organization,
        isActive: updatedProfile.is_active,
        updatedAt: updatedProfile.updated_at
      }
    });

  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing refresh token',
        message: 'Refresh token is required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      return res.status(401).json({
        error: 'Token refresh failed',
        message: error.message
      });
    }

    res.json({
      message: 'Token refreshed successfully',
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;