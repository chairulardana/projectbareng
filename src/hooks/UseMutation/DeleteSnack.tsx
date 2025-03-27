import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";


export const DeleteSnack = () => {
    return useMutation({
        mutationFn: async (id_Snack: number) => {
            const res = await api.delete(`/Snack/${id_Snack}`);
            return res.data;
        }
    })
}