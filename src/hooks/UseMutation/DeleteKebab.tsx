import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface FormDeleteKebabType {
    id_Kebab: number;
    nama_Kebab: string;
    harga: number;
    size: string; 
    level: number;
    stock: number;
}

export const DeleteKebab = () => {
    return useMutation({
        mutationFn: async (id_Kebab: number) => {
            const res = await api.delete(`/Kebab/${id_Kebab}`); // Kirim data ke endpoint
            return res.data;
        },
    });
}