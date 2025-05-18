
import { auth } from "./firebase";

/**
 * error class for API responses
 */
export class ApiError extends Error {
  status: number;
  data?: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * helper function to fetch with Firebase auth token
 * @param url 
 * @param options 
 * @returns 
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const currentUser = auth.currentUser;
    
    const headers = new Headers(options.headers || {});
    
    // if user is logged in, add token to request
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken(true); // force refresh if needed
        headers.set("Authorization", `Bearer ${token}`);
      } catch (error) {
        console.error("Error getting auth token:", error);
      }
    }
    
    // return fetch with auth headers
    return fetch(url, {
      ...options,
      headers
    });
  } catch (error) {
    console.error("Error in authFetch:", error);
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred", 
      500
    );
  }
}

/**
 * parse response based on content type
 */
async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");
  
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  
  if (contentType?.includes("text/")) {
    return response.text();
  }
  
  return response.blob();
}

/**
 * process API response with error handling
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await parseResponse(response);
    } catch (e) {
      errorData = { message: "Unknown error occurred" };
    }
    
    const errorMessage = errorData?.message || `API error: ${response.status} ${response.statusText}`;
    throw new ApiError(errorMessage, response.status, errorData);
  }
  

  return parseResponse(response) as Promise<T>;
}

/**
 * typed API client with auth token handling
 */
export const api = {
  /**
   * GET request with authentication
   * @param url 
   * @param options 
   * @returns 
   */
  async get<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await authFetch(url, {
      ...options,
      method: "GET"
    });
    
    return handleResponse<T>(response);
  },
  
  /**
   * POST request with authentication
   * @param url 
   * @param data 
   * @param options 
   * @returns 
   */
  async post<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const hasFormData = data instanceof FormData;
    
    const response = await authFetch(url, {
      ...options,
      method: "POST",
      headers: {
        ...(!hasFormData && { "Content-Type": "application/json" }),
        ...options.headers
      },
      body: hasFormData ? data : data ? JSON.stringify(data) : undefined
    });
    
    return handleResponse<T>(response);
  },
  
  /**
   * PUT request with authentication
   * @param url 
   * @param data 
   * @param options
   * @returns 
   */
  async put<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const hasFormData = data instanceof FormData;
    
    const response = await authFetch(url, {
      ...options,
      method: "PUT",
      headers: {
        ...(!hasFormData && { "Content-Type": "application/json" }),
        ...options.headers
      },
      body: hasFormData ? data : data ? JSON.stringify(data) : undefined
    });
    
    return handleResponse<T>(response);
  },
  
  /**
   * DELETE request with authentication
   * @param url 
   * @param options 
   * @returns 
   */
  async delete<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await authFetch(url, {
      ...options,
      method: "DELETE"
    });
    
    return handleResponse<T>(response);
  },
  
  /**
   * PATCH request with authentication
   * @param url 
   * @param data 
   * @param options 
   * @returns 
   */
  async patch<T = any>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const hasFormData = data instanceof FormData;
    
    const response = await authFetch(url, {
      ...options,
      method: "PATCH",
      headers: {
        ...(!hasFormData && { "Content-Type": "application/json" }),
        ...options.headers
      },
      body: hasFormData ? data : data ? JSON.stringify(data) : undefined
    });
    
    return handleResponse<T>(response);
  },
  
  /**
   * Upload file with authentication
   * @param url 
   * @param file 
   * @param fieldName
   * @param additionalData 
   * @returns 
   */
  async uploadFile<T = any>(
    url: string, 
    file: File, 
    fieldName: string = "file",
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
  
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value?.toString() || "");
      });
    }
    
    return this.post<T>(url, formData);
  }
};