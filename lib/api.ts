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

export interface CourseChapter {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  chapter_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  contents?: CourseContent[];
}

export interface CourseContent {
  id: number;
  chapter_id: number;
  title: string;
  description?: string;
  content_type: 'video' | 'text' | 'image' | 'pdf' | 'link' | 'audio' | 'document';
  file_url?: string;
  content_text?: string;
  content_order: number;
  is_published: boolean;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
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

  async getMyEnrollments(token: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/enrollments/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch enrollments');
    }

    const result: ApiResponse<{ course_ids: number[] }> = await response.json();
    return result.data.course_ids || [];
  }

  async getCourseChapters(courseId: number, token?: string): Promise<CourseChapter[]> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/chapters?course_id=${courseId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch chapters');
    }

    const result: ApiResponse<{ chapters: CourseChapter[]; count: number }> = await response.json();
    return result.data.chapters || [];
  }

  async getChapterWithContents(chapterId: number, token?: string): Promise<CourseChapter> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/chapters/${chapterId}/contents`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch chapter contents');
    }

    const result: ApiResponse<CourseChapter> = await response.json();
    return result.data;
  }

  // Admin API methods
  async createCourse(data: { name: string; description: string }, token: string) {
    const response = await fetch(`${this.baseUrl}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to create course');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  async updateCourse(courseId: number, data: { name: string; description: string }, token: string) {
    const response = await fetch(`${this.baseUrl}/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to update course');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  async deleteCourse(courseId: number, token: string) {
    const response = await fetch(`${this.baseUrl}/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to delete course');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  // Chapter admin methods
  async createChapter(data: {
    course_id: number;
    title: string;
    description?: string;
    chapter_order?: number;
    is_published?: boolean;
  }, token: string) {
    const response = await fetch(`${this.baseUrl}/api/chapters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to create chapter');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  async updateChapter(chapterId: number, data: {
    title?: string;
    description?: string;
    chapter_order?: number;
    is_published?: boolean;
  }, token: string) {
    const response = await fetch(`${this.baseUrl}/api/chapters/${chapterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to update chapter');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  async deleteChapter(chapterId: number, token: string) {
    const response = await fetch(`${this.baseUrl}/api/chapters/${chapterId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to delete chapter');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  // Content admin methods
  async getContentsByChapter(chapterId: number, token?: string): Promise<CourseContent[]> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/contents?chapter_id=${chapterId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to fetch contents');
    }

    const result: ApiResponse<{ contents: CourseContent[]; count: number }> = await response.json();
    return result.data.contents || [];
  }

  async createContent(data: {
    chapter_id: number;
    title: string;
    description?: string;
    content_type: string;
    file_url?: string;
    content_text?: string;
    content_order?: number;
    is_published?: boolean;
    duration_minutes?: number;
  }, token: string) {
    const response = await fetch(`${this.baseUrl}/api/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to create content');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  async updateContent(contentId: number, data: {
    title?: string;
    description?: string;
    content_type?: string;
    file_url?: string;
    content_text?: string;
    content_order?: number;
    is_published?: boolean;
    duration_minutes?: number;
  }, token: string) {
    const response = await fetch(`${this.baseUrl}/api/contents/${contentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to update content');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }

  async deleteContent(contentId: number, token: string) {
    const response = await fetch(`${this.baseUrl}/api/contents/${contentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.message || 'Failed to delete content');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
