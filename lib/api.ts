const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface LoginRequest {
  nip: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  nip: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Login failed');
    }

    const result: ApiResponse<AuthResponse> = await response.json();
    return result.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Registration failed');
    }

    const result: ApiResponse<AuthResponse> = await response.json();
    return result.data;
  }

  async getCourses(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/courses`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch courses');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  async enrollInCourse(courseId: number, token: string) {
    const response = await fetch(`${this.baseUrl}/api/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ course_id: courseId }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to enroll in course');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  async getCourse(courseId: number, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/courses/${courseId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch course');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
