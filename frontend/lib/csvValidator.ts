export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  headers: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  size?: number;
}

export interface ValidationState {
  isValidating: boolean
  fileValid: boolean
  contentValid: boolean
  errors: string[]
  warnings: string[]
}

export class CSVValidator {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel']
  private static readonly REQUIRED_HEADERS = [
    'fullName', 'phone', 'city', 'propertyType', 'purpose', 'timeline', 'source'
  ]
  private static readonly ALL_HEADERS = [
    'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 
    'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'notes', 'tags', 'status'
  ]

  static validateFile(file: File): FileValidationResult {
    try {
      // Check file exists
      if (!file) {
        return { isValid: false, error: 'No file selected' };
      }

      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        const sizeMB = Math.round(file.size / 1024 / 1024);
        return { 
          isValid: false, 
          error: `File size (${sizeMB}MB) exceeds maximum allowed size (5MB)`,
          size: file.size
        };
      }

      // Check file extension
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv')) {
        return { 
          isValid: false, 
          error: 'Invalid file type. Please select a CSV file (.csv extension required)' 
        };
      }

      // Check file type
      const allowedTypes = ['text/csv', 'application/csv', 'text/plain'];
      if (!allowedTypes.includes(file.type) && file.type !== '') {
        return { 
          isValid: false, 
          error: `Invalid file type: ${file.type}. Expected CSV file.` 
        };
      }

      // Check if file has content
      if (file.size === 0) {
        return { isValid: false, error: 'File is empty' };
      }

      return { isValid: true, size: file.size };

    } catch (error) {
      return { 
        isValid: false, 
        error: `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  static async validateCSVContent(file: File): Promise<CSVValidationResult> {
    const result: CSVValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
      rowCount: 0,
      headers: []
    };

    try {
      // Read file content
      const content = await this.readFileContent(file);
      
      if (!content || content.trim().length === 0) {
        result.errors.push('CSV file is empty');
        return result;
      }

      // Parse CSV content
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        result.errors.push('CSV must have at least a header row and one data row');
        return result;
      }

      // Check row limit
      if (lines.length - 1 > this.MAX_ROWS) {
        result.warnings.push(`CSV contains ${lines.length - 1} data rows. Only first ${this.MAX_ROWS} rows will be processed.`);
      }

      // Parse headers
      const headerLine = lines[0];
      if (!headerLine.includes(',')) {
        result.errors.push('CSV must be comma-separated');
        return result;
      }

      const headers = this.parseCSVLine(headerLine).map(h => h.replace(/"/g, '').trim());
      result.headers = headers;

      // Validate required headers
      const missingHeaders = this.REQUIRED_HEADERS.filter(required => 
        !headers.some(header => header.toLowerCase() === required.toLowerCase())
      );

      if (missingHeaders.length > 0) {
        result.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      // Check for duplicate headers
      const duplicateHeaders = headers.filter((header, index) => 
        headers.indexOf(header) !== index
      );

      if (duplicateHeaders.length > 0) {
        result.warnings.push(`Duplicate headers found: ${duplicateHeaders.join(', ')}`);
      }

      // Validate data rows
      result.rowCount = lines.length - 1;
      let emptyRowCount = 0;

      for (let i = 1; i < Math.min(lines.length, 11); i++) { // Check first 10 data rows
        const line = lines[i].trim();
        if (!line) {
          emptyRowCount++;
          continue;
        }

        const values = this.parseCSVLine(line);
        
        // Check if row has correct number of columns
        if (values.length !== headers.length) {
          result.warnings.push(`Row ${i} has ${values.length} columns, expected ${headers.length}`);
        }

        // Check for completely empty rows
        if (values.every(val => !val.trim())) {
          emptyRowCount++;
        }
      }

      if (emptyRowCount > 0) {
        result.warnings.push(`Found ${emptyRowCount} empty rows in first 10 data rows`);
      }

      result.isValid = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push(`CSV validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  private static readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
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

  static generateSampleCSV(): string {
    const headers = [
      'fullName', 'email', 'phone', 'city', 'propertyType', 'bhk', 
      'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 
      'notes', 'tags', 'status'
    ];
    
    const sampleRows = [
      [
        'John Doe', 'john@example.com', '9876543210', 'Chandigarh', 'Apartment', 'Three',
        'Buy', '5000000', '7000000', 'ZeroToThree', 'Website',
        'Looking for 3BHK apartment', '', 'New'
      ],
      [
        'Jane Smith', 'jane@gmail.com', '9876543211', 'Mohali', 'Villa', 'Four',
        'Buy', '8000000', '12000000', 'ThreeToSix', 'Referral',
        'Prefers villa', '', 'Contacted'
      ]
    ];
    
    return [
      headers.join(','),
      ...sampleRows.map(row => row.join(','))
    ].join('\n');
  }
}
