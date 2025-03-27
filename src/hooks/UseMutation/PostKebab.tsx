import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface FormCreateKebabType {
    nama_Kebab: string;
    harga: number;
    size: string; 
    level: number;
    stock: number;
    imageUrl: string;
}

export const CreateKebab = () => {
    return useMutation({
        mutationFn: async (form: FormCreateKebabType) => {
            const res = await api.post('/Kebab', form); // Kirim data ke endpoint
            return res.data;
        },
    });
}