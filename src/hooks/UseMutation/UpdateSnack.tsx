import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface FormUpdateSnackType {
    id_Snack: number;
    namaSnack: string;
    harga: number;
    stock: number;
}

export const UpdateSnack = () => {
    return useMutation({
        mutationFn: async (form: FormUpdateSnackType) => {
            const response = await api.put(`/Snack/${form.id_Snack}`, form);
            return response.data;
        }
    })
}