import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetKebab = () => {
  return useQuery({ queryKey: ['get-kebab'],queryFn: async () => {
    const res = await api.get('/Kebab')
    return res.data;
  }});
};
