// Mock CSV import API for Vercel deployment
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    const form = formidable({});
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          error: 'File upload failed' 
        });
      }
      
      const file = files.file;
      if (!file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }
      
      try {
        // Read and parse CSV content
        const csvContent = fs.readFileSync(file[0].filepath, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          return res.status(400).json({
            success: false,
            error: 'CSV file must contain at least a header and one data row'
          });
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataRows = lines.slice(1);
        
        // Mock validation - check required headers
        const requiredHeaders = ['fullName', 'phone', 'city', 'propertyType', 'purpose', 'timeline', 'source'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          return res.status(400).json({
            success: false,
            error: `Missing required headers: ${missingHeaders.join(', ')}`,
            totalRows: dataRows.length,
            successfulImports: 0,
            failedImports: dataRows.length,
            errors: [{
              row: 0,
              errors: [`Missing required headers: ${missingHeaders.join(', ')}`]
            }]
          });
        }
        
        // Mock successful import
        const mockResults = {
          success: true,
          message: `Successfully imported ${dataRows.length} buyer leads`,
          totalRows: dataRows.length,
          successfulImports: dataRows.length,
          failedImports: 0,
          errors: [],
          warnings: [],
          data: {
            importedLeads: dataRows.map((row, index) => {
              const cells = row.split(',').map(c => c.trim().replace(/"/g, ''));
              const leadData = {};
              headers.forEach((header, i) => {
                leadData[header] = cells[i] || '';
              });
              return {
                id: `mock-lead-${index + 1}`,
                ...leadData,
                createdAt: new Date().toISOString()
              };
            })
          }
        };
        
        return res.status(200).json(mockResults);
        
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: 'Failed to parse CSV file',
          totalRows: 0,
          successfulImports: 0,
          failedImports: 0,
          errors: [{
            row: 0,
            errors: ['Invalid CSV format']
          }]
        });
      }
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
