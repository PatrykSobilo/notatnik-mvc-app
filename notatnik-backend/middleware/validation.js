// Middleware do logowania requestów API
export const apiLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📡 [${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📋 Body:', req.body);
  }
  
  next();
};

// Middleware do walidacji JSON
export const validateJSON = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Nieprawidłowy format JSON',
      error: 'Malformed JSON in request body'
    });
  }
  next(err);
};

// Middleware do limitowania rozmiaru requestów
export const requestSizeLimit = (req, res, next) => {
  const contentLength = req.get('content-length');
  const maxSize = 1024 * 1024; // 1MB
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request zbyt duży',
      error: 'Request entity too large'
    });
  }
  
  next();
};

// Middleware do sanityzacji danych wejściowych
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    // Usuwanie potencjalnie niebezpiecznych znaków
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Usuń script tagi
          .trim();
      }
    });
  }
  
  next();
};
