import { Router, Response } from 'express';
import multer from 'multer';
import { BuyerService } from '../services/buyerService';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { createUpdateLimiter } from '../middleware/rateLimiter';
import { 
  createBuyerSchema, 
  updateBuyerSchema, 
  buyerQuerySchema 
} from '../validators/buyer';
import { z } from 'zod';

const router = Router();
const buyerService = new BuyerService();

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Apply authentication to all routes except debug endpoint
router.use((req, res, next) => {
  // Skip auth for debug endpoint
  if (req.path === '/import-csv-debug') {
    return next();
  }
  return authenticateToken(req as AuthenticatedRequest, res, next);
});

// GET /buyers - List buyers with pagination and filters
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = buyerQuerySchema.parse(req.query);
    const result = await buyerService.listBuyers(query, req.user!.id, req.user!.role);
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      });
    }
    console.error('List buyers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /buyers/:id - Get single buyer
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyer = await buyerService.getBuyer(req.params.id, req.user!.id, req.user!.role);
    
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Parse tags back to array
    const buyerWithTags = {
      ...buyer,
      tags: JSON.parse(buyer.tags || '[]')
    };

    res.json(buyerWithTags);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Access denied')) {
      return res.status(403).json({ error: error.message });
    }
    console.error('Get buyer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /buyers - Create buyer (rate limited)
router.post('/', createUpdateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = createBuyerSchema.parse(req.body);
    const buyer = await buyerService.createBuyer(data, req.user!.id);
    
    // Parse tags back to array for response
    const buyerWithTags = {
      ...buyer,
      tags: JSON.parse(buyer.tags || '[]')
    };

    res.status(201).json(buyerWithTags);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    console.error('Create buyer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /buyers/:id - Update buyer (rate limited)
router.put('/:id', createUpdateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = updateBuyerSchema.parse(req.body);
    const buyer = await buyerService.updateBuyer(req.params.id, data, req.user!.id, req.user!.role);
    
    // Parse tags back to array for response
    const buyerWithTags = {
      ...buyer,
      tags: JSON.parse(buyer.tags || '[]')
    };

    res.json(buyerWithTags);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    if (error instanceof Error) {
      if (error.message === 'STALE_DATA') {
        return res.status(409).json({ 
          error: 'Record has been modified by another user. Please refresh and try again.',
          code: 'STALE_DATA'
        });
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Buyer not found') {
        return res.status(404).json({ error: error.message });
      }
    }
    console.error('Update buyer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /buyers/:id - Delete buyer
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await buyerService.deleteBuyer(req.params.id, req.user!.id, req.user!.role);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Access denied')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Buyer not found') {
        return res.status(404).json({ error: error.message });
      }
    }
    console.error('Delete buyer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /buyers/:id/history - Get buyer history
router.get('/:id/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const history = await buyerService.getBuyerHistory(req.params.id, limit);
    
    // Parse diff JSON for each history entry
    const historyWithParsedDiff = history.map(entry => ({
      ...entry,
      diff: JSON.parse(entry.diff)
    }));

    res.json(historyWithParsedDiff);
  } catch (error) {
    console.error('Get buyer history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /buyers/import-csv - Import buyers from CSV (with debug endpoint)
router.post('/import-csv-debug', upload.single('file'), async (req: any, res: Response) => {
  console.log('=== DEBUG CSV IMPORT (NO AUTH) ===');
  console.log('Headers:', req.headers);
  console.log('File:', req.file);
  console.log('Body:', req.body);
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Create or get debug user for testing
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    let debugUser = await prisma.user.findFirst({
      where: { email: 'debug@test.com' }
    });
    
    if (!debugUser) {
      debugUser = await prisma.user.create({
        data: {
          email: 'debug@test.com',
          name: 'Debug User',
          role: 'admin'
        }
      });
    }
    
    const { CSVImportService } = await import('../services/csvImportService');
    const result = await CSVImportService.importBuyersFromCSV(req.file, debugUser.id);
    
    res.json({
      success: result.success,
      message: `Processed ${result.totalRows} rows. Success: ${result.successfulImports}, Failed: ${result.failedImports}`,
      data: result
    });
  } catch (error) {
    console.error('Debug import error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /buyers/import-csv - Import buyers from CSV
router.post('/import-csv', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    
    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        data: { totalRows: 0, successfulImports: 0, failedImports: 0, errors: [], warnings: [] }
      });
    }

    if (!req.user) {
      console.log('ERROR: No authenticated user');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        data: { totalRows: 0, successfulImports: 0, failedImports: 0, errors: [], warnings: [] }
      });
    }

    // Import using enhanced CSV service
    const { CSVImportService } = await import('../services/csvImportService');
    console.log('CSV Import Service loaded');
    
    const result = await CSVImportService.importBuyersFromCSV(req.file, req.user.id);
    console.log('Import result:', {
      success: result.success,
      totalRows: result.totalRows,
      successfulImports: result.successfulImports,
      failedImports: result.failedImports,
      errorCount: result.errors.length,
      warningCount: result.warnings.length
    });
    
    if (result.errors.length > 0) {
      console.log('First 3 errors:', result.errors.slice(0, 3));
    }
    
    console.log('=== CSV IMPORT DEBUG END ===');
    
    // Return structured response
    const statusCode = result.success ? 200 : 400;
    
    res.status(statusCode).json({
      success: result.success,
      message: result.success 
        ? `Successfully imported ${result.successfulImports} of ${result.totalRows} rows`
        : `Import failed. ${result.failedImports} of ${result.totalRows} rows had errors`,
      data: {
        totalRows: result.totalRows,
        successfulImports: result.successfulImports,
        failedImports: result.failedImports,
        errors: result.errors,
        warnings: result.warnings
      }
    });
    
  } catch (error) {
    console.error('CSV import error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during CSV import',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /buyers/export.csv - Export buyers to CSV
router.get('/export.csv', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = buyerQuerySchema.parse(req.query);
    const buyers = await buyerService.exportBuyersToCSV(query, req.user!.id, req.user!.role);
    
    // Generate CSV content
    const headers = [
      'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk',
      'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source',
      'notes', 'tags', 'status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...buyers.map(buyer => 
        headers.map(header => {
          const value = (buyer as any)[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="buyers.csv"');
    res.send(csvContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid query parameters',
        details: error.errors 
      });
    }
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
