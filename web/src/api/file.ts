import axios from "axios";

export const uploadFile = async (workspaceId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file)
    const response = await axios.post(`/api/v1/workspaces/${workspaceId}/files`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
