import { Box } from "@mui/material";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import MiniDrawer from "../components/atoms/Sidebar/Sidebar";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // ✅ Perbaikan import

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
  beforeLoad: () => {
    const token = Cookies.get('authToken'); // Ambil token dari cookies
    if (!token) {
      throw redirect({ to: '/' });
    }

    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : true; // ✅ Cek undefined
      
      if (isExpired) {
        throw redirect({ to: '/' });
      }
    } catch (error) {
      throw redirect({ to: '/' });
    }
  }
});

function ProtectedLayout() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
      }}
    >
      <MiniDrawer />
      <Box sx={{
        width: '100%'
      }}>
        <Outlet />
      </Box>
    </Box>
  );
}
