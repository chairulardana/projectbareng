import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";


export const useDeleteDrink = () => {
    return useMutation({
        mutationFn: async (id_Drink: number) => {
            const res = await api.delete(`/Drink/${id_Drink}`);
            return res.data;
        },
    });
}