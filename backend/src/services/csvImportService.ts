import { CSVParser, CSVValidationResult } from '../utils/csvParser';
import { validateCSVRow } from '../validators/buyer';
import { CSVDataCleaner, CSVRowValidator } from '../validators/csvValidator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{
    row: number;
    errors: string[];
    data?: any;
  }>;
  warnings: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  size?: number;
  type?: string;
}

export class CSVImportService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly MAX_ROWS = 1000;
  private static readonly REQUIRED_HEADERS = [
    'fullName', 'phone', 'city', 'propertyType', 'purpose', 'timeline', 'source'
  ];

  static validateFile(file: Express.Multer.File): FileValidationResult {
    try {
      // Check file exists
      if (!file) {
        return { isValid: false, error: 'No file provided' };
      }

      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        return { 
          isValid: false, 
          error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (5MB)`,
          size: file.size
        };
      }

      // Check file type
      const allowedMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
      const allowedExtensions = ['.csv'];
      
      const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
      const hasValidExtension = allowedExtensions.some(ext => 
        file.originalname.toLowerCase().endsWith(ext)
      );

      if (!hasValidMimeType && !hasValidExtension) {
        return { 
          isValid: false, 
          error: `Invalid file type. Expected CSV file, got ${file.mimetype}`,
          type: file.mimetype
        };
      }

      // Check if file has content
      if (file.size === 0) {
        return { isValid: false, error: 'File is empty' };
      }

      return { 
        isValid: true, 
        size: file.size, 
        type: file.mimetype 
      };

    } catch (error) {
      return { 
        isValid: false, 
        error: `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  static async importBuyersFromCSV(
    file: Express.Multer.File, 
    ownerId: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      warnings: []
    };

    try {
      // Validate file
      const fileValidation = this.validateFile(file);
      if (!fileValidation.isValid) {
        result.errors.push({
          row: 0,
          errors: [fileValidation.error || 'File validation failed']
        });
        return result;
      }

      // Parse CSV content
      const csvContent = file.buffer.toString('utf-8');
      const parseResult = CSVParser.parseCSV(csvContent);

      // Handle parsing errors
      if (parseResult.errors.length > 0) {
        parseResult.errors.forEach(error => {
          result.errors.push({
            row: error.row,
            errors: [error.message],
            data: error.rawData
          });
        });
      }

      // Check if we have any data
      if (parseResult.data.length === 0) {
        result.errors.push({
          row: 0,
          errors: ['No valid data rows found in CSV']
        });
        return result;
      }

      // Check row limit
      if (parseResult.data.length > this.MAX_ROWS) {
        result.warnings.push(`CSV contains ${parseResult.data.length} rows. Only first ${this.MAX_ROWS} rows will be processed.`);
        parseResult.data = parseResult.data.slice(0, this.MAX_ROWS);
      }

      result.totalRows = parseResult.data.length;

      // Validate required headers
      const headerValidation = CSVParser.validateRequiredHeaders(parseResult.data, this.REQUIRED_HEADERS);
      if (!headerValidation.isValid) {
        result.errors.push({
          row: 0,
          errors: [`Missing required headers: ${headerValidation.missingHeaders.join(', ')}`]
        });
        return result;
      }

      // Process each row
      const validRows: any[] = [];
      
      for (let i = 0; i < parseResult.data.length; i++) {
        const row = parseResult.data[i];
        const rowNumber = i + 2; // +2 because CSV row numbers start from 2 (after header)

        try {
          // Clean and prepare row data
          const cleanedRow = this.cleanRowData(row);
          
          // Enhanced validation with better error messages
          const enhancedValidation = CSVRowValidator.validateRow(cleanedRow);
          const validation = validateCSVRow(cleanedRow);
          
          // Combine validation results
          const combinedErrors = [...enhancedValidation.errors];
          if (!validation.isValid) {
            combinedErrors.push(...validation.errors);
          }
          
          // Add warnings to result
          if (enhancedValidation.warnings.length > 0) {
            result.warnings.push(...enhancedValidation.warnings.map(w => `Row ${rowNumber}: ${w}`));
          }
          
          if (enhancedValidation.isValid && validation.isValid) {
            validRows.push({
              ...cleanedRow,
              ownerId,
              tags: JSON.stringify(cleanedRow.tags || [])
            });
            result.successfulImports++;
          } else {
            result.errors.push({
              row: rowNumber,
              errors: combinedErrors,
              data: row
            });
            result.failedImports++;
          }
        } catch (error) {
          result.errors.push({
            row: rowNumber,
            errors: [`Row processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            data: row
          });
          result.failedImports++;
        }
      }

      // Import valid rows to database
      if (validRows.length > 0) {
        try {
          await prisma.buyer.createMany({
            data: validRows
          });
        } catch (dbError) {
          result.errors.push({
            row: 0,
            errors: [`Database import failed: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`]
          });
          result.successfulImports = 0;
          result.failedImports = result.totalRows;
        }
      }

      result.success = result.successfulImports > 0;
      
      return result;

    } catch (error) {
      result.errors.push({
        row: 0,
        errors: [`Import process failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
      return result;
    }
  }

  private static cleanRowData(row: any): any {
    return CSVDataCleaner.cleanRowData(row);
  }
}
