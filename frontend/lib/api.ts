import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface Buyer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  source: string;
  status: string;
  notes?: string;
  tags: string[];
  ownerId: string;
  owner: {
    id: string;
    name?: string;
    email: string;
  };
  updatedAt: string;
  createdAt: string;
}

export interface BuyerHistory {
  id: string;
  buyerId: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, [any, any]>;
}

export interface BuyerListResponse {
  buyers: Buyer[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BuyerQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  sort?: string;
}

export interface CreateBuyerInput {
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  source: string;
  status?: string;
  notes?: string;
  tags: string[];
}

export interface UpdateBuyerInput extends CreateBuyerInput {
  updatedAt: string;
}

// Auth API
export const authApi = {
  demoLogin: () => api.post('/api/auth/demo-login'),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get<{ user: User }>('/api/auth/me'),
};

// Buyers API
export const buyersApi = {
  list: (query: BuyerQuery = {}) => 
    api.get<BuyerListResponse>('/api/buyers', { params: query }),
  
  get: (id: string) => 
    api.get<Buyer>(`/api/buyers/${id}`),
  
  create: (data: CreateBuyerInput) => 
    api.post<Buyer>('/api/buyers', data),
  
  update: (id: string, data: UpdateBuyerInput) => 
    api.put<Buyer>(`/api/buyers/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/api/buyers/${id}`),
  
  getHistory: (id: string, limit = 5) => 
    api.get<BuyerHistory[]>(`/api/buyers/${id}/history`, { params: { limit } }),
  
  importCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/buyers/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  exportCSV: (query: BuyerQuery = {}) => 
    api.get('/api/buyers/export.csv', { 
      params: query,
      responseType: 'blob',
    }),
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Request interceptor for debugging
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use((config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}
