export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    message: err.message || 'Internal server error',
    status: err.status || 500
  };

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case 'PGRST116': // Not found
        error = {
          message: 'Resource not found',
          status: 404
        };
        break;
      case '23505': // Unique violation
        error = {
          message: 'Resource already exists',
          status: 409
        };
        break;
      case '23503': // Foreign key violation
        error = {
          message: 'Referenced resource not found',
          status: 400
        };
        break;
      case '42501': // Insufficient privileges
        error = {
          message: 'Access denied',
          status: 403
        };
        break;
      default:
        error = {
          message: 'Database error occurred',
          status: 500
        };
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation failed',
      status: 400,
      details: err.details || {}
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401
    };
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: error.details 
    }),
    timestamp: new Date().toISOString(),
    path: req.path
  });
};