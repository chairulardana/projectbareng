import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import { CreateLogin } from '../hooks/UseMutation/PostLogin';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

export const Route = createFileRoute('/')({
  component: LoginPage,
});

const providers = [{ id: 'credentials', name: 'Email dan Password' }];

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mutateAsync: login } = CreateLogin();

  // 🔹 Mengecek apakah user sudah login saat halaman dimuat
  React.useEffect(() => {
    const isLoggedIn = Cookies.get('isLoggedIn');
    const storedUser = Cookies.get('user');

    console.log("Cek cookies saat load:", { isLoggedIn, storedUser });

    if (isLoggedIn === 'true' && storedUser) {
      console.log("🔄 Redirecting to /dashboard...");
      navigate({ to: '/dashboard' }); 
    }
  }, [navigate]); // ✅ Pastikan navigate bisa diakses

  const signIn: (provider: AuthProvider, formData: FormData) => void = async (
    provider,
    formData,
  ) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Form Tidak Lengkap',
        text: 'Harap isi email dan password.',
      });
      return;
    }

    try {
      const response = await login({ email, password });

      console.log("Response dari backend:", response);

      if (response && response.token && response.user) {
        // Simpan data ke cookies
        Cookies.set('isLoggedIn', 'true', { expires: 1, path: '/' });
        Cookies.set('authToken', response.token, { expires: 1, path: '/' });
        Cookies.set('user', JSON.stringify(response.user), { expires: 1, path: '/' });

        console.log("✅ Cookies setelah disimpan:", document.cookie);

        Swal.fire({
          icon: 'success',
          title: `Selamat datang ${response.user.name || 'Admin'}`,
          text: 'Anda berhasil login.',
        }).then(() => {
          console.log("🔄 Redirecting to /dashboard...");
          navigate({ to: '/dashboard' }); // 🌟 Navigasi utama

          // 🔄 Fallback jika navigate tidak berjalan
          setTimeout(() => {
            console.log("🔄 Redirecting with window.location.href...");
            window.location.href = "/dashboard";
          }, 1000);
        });
      } else {
        throw new Error("Login gagal. Token atau data user tidak valid.");
      }
    } catch (error) {
      let errorMessage = 'Terjadi kesalahan saat login.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: errorMessage,
      });
    }
  };

  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={signIn}
        providers={providers}
        slotProps={{
          emailField: { autoFocus: false },
          form: { noValidate: true },
        }}
      />
    </AppProvider>
  );
}
