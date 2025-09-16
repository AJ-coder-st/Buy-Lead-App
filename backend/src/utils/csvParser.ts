import { Readable } from 'stream';

export interface CSVParseResult {
  data: any[];
  errors: Array<{
    row: number;
    message: string;
    rawData?: string;
  }>;
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  data?: any;
}

export class CSVParser {
  private static validateCSVFormat(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'CSV file is empty' };
    }

    const lines = content.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { isValid: false, error: 'CSV must have at least a header row and one data row' };
    }

    // Check if first line looks like headers
    const firstLine = lines[0].trim();
    if (!firstLine.includes(',')) {
      return { isValid: false, error: 'CSV must be comma-separated' };
    }

    // Check for consistent column counts
    const headerColumns = this.parseCSVLine(firstLine).length;
    const inconsistentRows = [];
    
    for (let i = 1; i < Math.min(lines.length, 6); i++) { // Check first 5 data rows
      const rowColumns = this.parseCSVLine(lines[i]).length;
      if (rowColumns !== headerColumns) {
        inconsistentRows.push({ row: i + 1, expected: headerColumns, actual: rowColumns });
      }
    }

    if (inconsistentRows.length > 0) {
      return { 
        isValid: false, 
        error: `Column count mismatch detected. Header has ${headerColumns} columns, but some rows have different counts. This often indicates missing values or trailing commas.` 
      };
    }

    return { isValid: true };
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      i++;
    }

    result.push(current.trim());
    return result;
  }

  static parseCSV(content: string): CSVParseResult {
    const result: CSVParseResult = {
      data: [],
      errors: []
    };

    try {
      // Validate CSV format
      const formatValidation = this.validateCSVFormat(content);
      if (!formatValidation.isValid) {
        result.errors.push({
          row: 0,
          message: formatValidation.error || 'Invalid CSV format'
        });
        return result;
      }

      const lines = content.trim().split('\n').filter(line => line.trim());
      const headers = this.parseCSVLine(lines[0]).map(h => h.trim());
      const expectedColumns = headers.length;
      
      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        try {
          const values = this.parseCSVLine(line);
          
          // Handle column count mismatch - auto-fix common issues
          if (values.length !== expectedColumns) {
            if (values.length === expectedColumns - 1) {
              // Missing last column (likely status) - add default
              values.push('New');
              result.errors.push({
                row: i + 1,
                message: `Row had ${values.length} columns, expected ${expectedColumns}. Added default status 'New'.`,
                rawData: line
              });
            } else if (values.length > expectedColumns) {
              // Too many columns - truncate
              values.splice(expectedColumns);
              result.errors.push({
                row: i + 1,
                message: `Row had ${values.length} columns, expected ${expectedColumns}. Extra columns removed.`,
                rawData: line
              });
            } else {
              // Significant mismatch - pad with empty strings
              while (values.length < expectedColumns) {
                values.push('');
              }
              result.errors.push({
                row: i + 1,
                message: `Row had ${values.length} columns, expected ${expectedColumns}. Missing columns filled with empty values.`,
                rawData: line
              });
            }
          }
          
          // Create row object
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = (values[index] || '').trim();
          });
          
          result.data.push(row);
        } catch (error) {
          result.errors.push({
            row: i + 1,
            message: `Failed to parse row: ${error instanceof Error ? error.message : 'Unknown error'}`,
            rawData: line
          });
        }
      }
    } catch (error) {
      result.errors.push({
        row: 0,
        message: `CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return result;
  }

  static validateRequiredHeaders(data: any[], requiredHeaders: string[]): { isValid: boolean; missingHeaders: string[] } {
    if (data.length === 0) {
      return { isValid: false, missingHeaders: requiredHeaders };
    }

    const availableHeaders = Object.keys(data[0]);
    const missingHeaders = requiredHeaders.filter(header => !availableHeaders.includes(header));
    
    return {
      isValid: missingHeaders.length === 0,
      missingHeaders
    };
  }

  static validateRowData(row: any, validator: (row: any) => CSVValidationResult): CSVValidationResult {
    try {
      return validator(row);
    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}
