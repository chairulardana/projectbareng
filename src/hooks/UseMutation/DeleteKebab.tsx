import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";


export const DeleteKebab = () => {
    return useMutation({
        mutationFn: async (id_Kebab: number) => {
            const res = await api.delete(`/Kebab/${id_Kebab}`); // Kirim data ke endpoint
            return res.data;
        },
    });
}