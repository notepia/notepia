import axios from 'axios';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    disabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface UpdateUserRoleRequest {
    role: string;
}

export interface UpdateUserPasswordRequest {
    password: string;
}

export const listUsers = async (): Promise<AdminUser[]> => {
    const response = await axios.get('/api/v1/admin/users', { withCredentials: true });
    return response.data;
};

export const createUser = async (data: CreateUserRequest): Promise<AdminUser> => {
    const response = await axios.post('/api/v1/admin/users', data, { withCredentials: true });
    return response.data;
};

export const updateUserRole = async (userId: string, data: UpdateUserRoleRequest): Promise<AdminUser> => {
    const response = await axios.put(`/api/v1/admin/users/${userId}/role`, data, { withCredentials: true });
    return response.data;
};

export const updateUserPassword = async (userId: string, data: UpdateUserPasswordRequest): Promise<AdminUser> => {
    const response = await axios.put(`/api/v1/admin/users/${userId}/password`, data, { withCredentials: true });
    return response.data;
};

export const disableUser = async (userId: string): Promise<AdminUser> => {
    const response = await axios.put(`/api/v1/admin/users/${userId}/disable`, {}, { withCredentials: true });
    return response.data;
};

export const enableUser = async (userId: string): Promise<AdminUser> => {
    const response = await axios.put(`/api/v1/admin/users/${userId}/enable`, {}, { withCredentials: true });
    return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await axios.delete(`/api/v1/admin/users/${userId}`, { withCredentials: true });
};
