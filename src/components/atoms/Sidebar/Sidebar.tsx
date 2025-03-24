import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from '@tanstack/react-router';
import Avatar from '@mui/material/Avatar';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  })
);

// Fungsi untuk mengambil awalan nama
const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Ambil data pengguna dari localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Jika tidak ada di localStorage, coba ambil dari cookie
      const cookies = document.cookie.split('; ');
      const userCookie = cookies.find((row) => row.startsWith('user='));
      if (userCookie) {
        try {
          const decodedUser = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          setUser(decodedUser);
        } catch (error) {
          console.error('Error parsing user cookie:', error);
        }
      }
    }
  }, []);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleLogout = () => {
    // Hapus cookies
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Hapus user dari localStorage
    localStorage.removeItem("user");

    // Arahkan ke halaman login
    navigate({ to: "/" });

    // Refresh halaman untuk memastikan logout benar-benar bersih
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerOpen} sx={{ display: open ? 'none' : 'block' }}>
            <MenuIcon />
          </IconButton>
          <IconButton onClick={handleDrawerClose} sx={{ display: open ? 'block' : 'none' }}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>

        {open && user && (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: '2rem',
                bgcolor: 'primary.main',
                margin: 'auto',
              }}
            >
              {getInitials(user.name)}
            </Avatar>
            <ListItemText primary={user.name || 'Guest'} secondary={user.email || 'No Email'} />
          </Box>
        )}

        <Divider />
        <List>
          {['Kebab', 'Drink', 'Snack', 'Paket'].map((text, index) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => {
                  if (text === 'Kebab') {
                    navigate({ to: '/kebab' });
                  } else if (text === 'Drink') {
                    navigate({ to: '/drink' });
                  } else if (text === 'Snack') {
                    navigate({ to: '/snack' });
                  } else if (text === 'Paket') {
                    navigate({ to: '/PaketMakanan' });
                  }
                }}
              >
                <ListItemIcon>
                  {index === 0 ? <LocalDiningIcon /> :
                   index === 1 ? <LocalBarIcon /> :
                   index === 2 ? <BakeryDiningIcon /> : <FastfoodIcon />}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate({ to: '/dashboard' })}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List sx={{ marginTop: 'auto' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ color: 'red' }}>
              <ListItemIcon sx={{ color: 'red' }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
      </Box>
    </Box>
  );
}