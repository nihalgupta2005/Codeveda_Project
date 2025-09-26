import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { User } from '../models/index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No token provided' 
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ 
        error: 'Invalid token', 
        message: 'Token verification failed' 
      });
    }

    // Get user profile from database using admin client
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('User profile lookup error:', profileError);
      return res.status(403).json({ 
        error: 'User profile not found', 
        message: 'Could not retrieve user profile' 
      });
    }
    
    if (!userProfile || !userProfile.is_active) {
      return res.status(403).json({ 
        error: 'User not found', 
        message: 'User profile not found or inactive' 
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: userProfile.role,
      fullName: userProfile.full_name,
      profile: userProfile
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Authentication check failed' 
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required', 
        message: 'Please authenticate first' 
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: `Required role: ${allowedRoles.join(' or ')}, but user has: ${userRole}` 
      });
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole('admin');

// Middleware to check if user is doctor or admin
export const requireDoctor = requireRole(['doctor', 'admin']);

// Middleware to check if user is patient, doctor, or admin
export const requireAuthenticated = requireRole(['patient', 'doctor', 'admin']);