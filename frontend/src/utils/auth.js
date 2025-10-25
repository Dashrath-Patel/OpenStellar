const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get current user data from localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (err) {
    console.error('Failed to parse user data:', err);
    return null;
  }
};

/**
 * Logout user and clear stored data
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/';
};

/**
 * Make an authenticated API call
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      logout();
      throw new Error('Authentication required. Please login again.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

/**
 * Fetch current user profile from backend
 */
export const fetchCurrentUser = async () => {
  try {
    const user = await apiCall('/api/auth/me');
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};

/**
 * Link Stellar wallet to user account
 */
export const linkStellarWallet = async (stellarPublicKey) => {
  return await apiCall('/api/auth/link-wallet', {
    method: 'POST',
    body: JSON.stringify({ stellarPublicKey }),
  });
};

/**
 * Create a new project
 */
export const createProject = async (projectData) => {
  return await apiCall('/api/project/create', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
};

/**
 * Get user's projects
 */
export const getUserProjects = async () => {
  return await apiCall('/api/project/list');
};

/**
 * Get all public projects
 */
export const getPublicProjects = async () => {
  return await apiCall('/api/project/public');
};

/**
 * Get a specific project by ID
 */
export const getProject = async (projectId) => {
  return await apiCall(`/api/project/${projectId}`);
};

/**
 * Update a project
 */
export const updateProject = async (projectId, updates) => {
  return await apiCall(`/api/project/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId) => {
  return await apiCall(`/api/project/${projectId}`, {
    method: 'DELETE',
  });
};

export default {
  getAuthToken,
  isAuthenticated,
  getCurrentUser,
  logout,
  apiCall,
  fetchCurrentUser,
  linkStellarWallet,
  createProject,
  getUserProjects,
  getPublicProjects,
  getProject,
  updateProject,
  deleteProject,
};
