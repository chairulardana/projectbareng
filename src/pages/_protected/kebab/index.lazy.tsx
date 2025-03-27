import { createLazyFileRoute } from '@tanstack/react-router';
import { Box, Typography, Card, CardContent, Grid, CardActions, CircularProgress, Button, TextField, Modal, IconButton, FormControl, InputLabel, Select, MenuItem, CircularProgressProps } from "@mui/material";
import { GetKebab } from '../../../hooks/UseQuery/GetKebab'; 
import { CreateKebab } from '../../../hooks/UseMutation/PostKebab';
import { DeleteKebab } from '../../../hooks/UseMutation/DeleteKebab';
import { UpdateKebab } from '../../../hooks/UseMutation/UpdateKebab';
import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

export const Route = createLazyFileRoute('/_protected/kebab/')({
  component: Kebab,
});

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: 'text.secondary' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function Kebab() {
  const { data, isLoading, error, refetch } = GetKebab(); // Add refetch here to reload data
  const { mutate: createKebab } = CreateKebab();
  const { mutate: deleteKebab } = DeleteKebab();
  const { mutate: updateKebab } = UpdateKebab();

  const [openModal, setOpenModal] = useState(false);
  const [selectedKebab, setSelectedKebab] = useState<{ 
    nama_Kebab: string; 
    harga: string; 
    size: string; 
    level: number; 
    stock: string; 
    id_Kebab: string; 
    imageUrl: string;
  } | null>(null);
  
  const [newKebab, setNewKebab] = useState({
    nama_Kebab: '',
    harga: '',
    size: '',
    level: 0,
    stock: '',
    imageUrl: '', // Added image URL
  });

  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleOpenModal = (kebab) => {
    setSelectedKebab({ ...kebab });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedKebab(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedKebab) {
      setSelectedKebab((prev) => ({
        ...prev!,
        [name]: value,
      }));
    } else {
      setNewKebab((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLevelChange = (e) => {
    const value = e.target.value;
    if (selectedKebab) {
      setSelectedKebab((prev) => ({
        ...prev!,
        level: value,
      }));
    } else {
      setNewKebab((prev) => ({
        ...prev,
        level: value,
      }));
    }
  };

  const handleCreateKebab = () => {
    if (!newKebab.nama_Kebab || !newKebab.harga || !newKebab.size || newKebab.level === undefined || !newKebab.stock || !newKebab.imageUrl) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return;
    }

    createKebab(newKebab, {
      onSuccess: () => {
        setNewKebab({ nama_Kebab: '', harga: '', size: '', level: 0, stock: '', imageUrl: '' });
        Swal.fire('Success', 'Kebab added successfully!', 'success');
        refetch(); // Refetch the data to get the new kebab added to the list
      },
      onError: (error) => {
        Swal.fire('Error', `Failed to add kebab: ${error.message}`, 'error');
      },
    });
  };

  const handleUpdateKebab = () => {
    if (!selectedKebab?.nama_Kebab || !selectedKebab?.harga || !selectedKebab?.size || selectedKebab?.level === undefined || !selectedKebab?.stock || !selectedKebab?.imageUrl) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return;
    }

    updateKebab(selectedKebab, {
      onSuccess: () => {
        handleCloseModal();
        Swal.fire('Success', 'Kebab updated successfully!', 'success');
        refetch(); // Refetch the data after update
      },
      onError: (error) => {
        Swal.fire('Error', `Failed to update kebab: ${error.message}`, 'error');
      },
    });
  };

  const handleDeleteKebab = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteKebab(id, {
          onSuccess: () => {
            Swal.fire('Deleted!', 'The kebab has been deleted.', 'success');
            refetch(); // Refetch the data after deletion
          },
          onError: (error) => {
            Swal.fire('Error', `Failed to delete kebab: ${error.message}`, 'error');
          },
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgressWithLabel value={progress} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">Failed to fetch kebabs. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>Welcome to the Kebabs Page!</Typography>

      {/* Form untuk menambahkan kebab baru */}
      <Box mb={4}>
        <Typography variant="h6">Add New Kebab</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nama Kebab"
              name="nama_Kebab"
              value={newKebab.nama_Kebab}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Harga"
              name="harga"
              value={newKebab.harga}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Size"
              name="size"
              value={newKebab.size}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="level-select-label">Level</InputLabel>
              <Select
                labelId="level-select-label"
                value={newKebab.level} // Use newKebab.level or selectedKebab.level
                label="Level"
                onChange={handleLevelChange}
              >
                <MenuItem value={0}>Tidak Pedas</MenuItem>
                <MenuItem value={1}>Pedas Sedang</MenuItem>
                <MenuItem value={2}>Pedas</MenuItem>
                <MenuItem value={3}>Sangat Pedas</MenuItem>
                <MenuItem value={4}>Ekstra Pedas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stock"
              name="stock"
              value={newKebab.stock}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Image URL"
              name="imageUrl"
              value={newKebab.imageUrl}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleCreateKebab}>
              Add Kebab
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Daftar Kebab */}
      <Grid container spacing={3}>
        {data && data.length > 0 ? (
          data.map((kebab) => (
            <Grid item xs={12} sm={6} md={4} key={kebab.id_Kebab}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{kebab.nama_Kebab}</Typography>
                  <Typography variant="body2">Harga: {kebab.harga}</Typography>
                  <Typography variant="body2">Size: {kebab.size}</Typography>
                  <Typography variant="body2">Level: {kebab.level}</Typography>
                  <Typography variant="body2">Stock: {kebab.stock}</Typography>
                  {kebab.imageUrl && <img src={kebab.imageUrl} alt={kebab.nama_Kebab} width="100" height="100" />}
                </CardContent>
                <CardActions>
                  <IconButton color="primary" onClick={() => handleOpenModal(kebab)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteKebab(kebab.id_Kebab)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No kebabs available at the moment.</Typography>
        )}
      </Grid>

      {/* Modal untuk Edit Kebab */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" gutterBottom>Edit Kebab</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Kebab"
                name="nama_Kebab"
                value={selectedKebab?.nama_Kebab || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Harga"
                name="harga"
                value={selectedKebab?.harga || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Size"
                name="size"
                value={selectedKebab?.size || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="edit-level-select-label">Level</InputLabel>
                <Select
                  labelId="edit-level-select-label"
                  value={selectedKebab?.level || 0}
                  label="Level"
                  onChange={handleLevelChange}
                >
                  <MenuItem value={0}>Tidak Pedas</MenuItem>
                  <MenuItem value={1}>Pedas Sedang</MenuItem>
                  <MenuItem value={2}>Pedas</MenuItem>
                  <MenuItem value={3}>Sangat Pedas</MenuItem>
                  <MenuItem value={4}>Ekstra Pedas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                value={selectedKebab?.stock || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="imageUrl"
                value={selectedKebab?.imageUrl || ''}
                onChange={handleInputChange}
                required
              />
              {selectedKebab?.imageUrl && <img src={selectedKebab.imageUrl} alt={selectedKebab.nama_Kebab} width="100" height="100" />}
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleUpdateKebab}>
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
}
