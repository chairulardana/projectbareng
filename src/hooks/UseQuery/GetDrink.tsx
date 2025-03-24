import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetDrink = () => {
    return useQuery({ queryKey: ['get-drink'],queryFn: async () => {
      const res = await api.get('/Drink')
      return res.data;
    }});
}