export interface ApiResponse {
  status: number;
  message: string;
  data?: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}