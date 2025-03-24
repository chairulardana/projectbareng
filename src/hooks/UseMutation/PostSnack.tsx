import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface FormCreateSnackType {
    namaSnack: string;
    harga: number;
    stock: number;
} 

export const CreateSnack = () => {
    return useMutation({
        mutationFn: async (form: FormCreateSnackType) => {
            const res = await api.post('/Snack', form);
            return res.data;
        },
    });
};