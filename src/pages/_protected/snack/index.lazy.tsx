import { createLazyFileRoute } from '@tanstack/react-router';
import { Box, Typography, Card, CardContent, Grid, CardActions, Button, TextField, Modal, IconButton } from "@mui/material";
import { GetSnack } from '../../../hooks/UseQuery/GetSnack';
import { CreateSnack } from '../../../hooks/UseMutation/PostSnack';
import { DeleteSnack } from '../../../hooks/UseMutation/DeleteSnack';
import { UpdateSnack } from '../../../hooks/UseMutation/UpdateSnack';
import { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import React from 'react';

export const Route = createLazyFileRoute('/_protected/snack/')({
  component: Snack,
});

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
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

function Snack() {
  const { data, isLoading, error, refetch } = GetSnack();
  const { mutate: createSnack } = CreateSnack();
  const { mutate: deleteSnack } = DeleteSnack();
  const { mutate: updateSnack } = UpdateSnack();

  const [openModal, setOpenModal] = useState(false);
  const [selectedSnack, setSelectedSnack] = useState<{ 
    namaSnack: string; 
    harga: string; 
    stock: string; 
    id_Snack: string; 
    image: string; 
  } | null>(null);

  const [newSnack, setNewSnack] = useState({
    namaSnack: '',
    harga: '',
    stock: '',
    image: '', // Image URL as a string
  });

  const [progress, setProgress] = React.useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleOpenModal = (snack) => {
    setSelectedSnack({ ...snack });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSnack(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedSnack) {
      setSelectedSnack((prev) => ({
        ...prev!,
        [name]: value,
      }));
    } else {
      setNewSnack((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateSnack = () => {
    if (!newSnack.namaSnack || !newSnack.harga || !newSnack.stock || !newSnack.image) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return;
    }

    createSnack({ ...newSnack }, {
      onSuccess: () => {
        setNewSnack({ namaSnack: '', harga: '', stock: '', image: '' });
        Swal.fire('Success', 'Snack added successfully!', 'success');
        refetch();
      },
      onError: (error) => {
        Swal.fire('Error', `Failed to add snack: ${error.message}`, 'error');
      },
    });
  };

  const handleUpdateSnack = () => {
    if (!selectedSnack?.namaSnack || !selectedSnack?.harga || !selectedSnack?.stock || !selectedSnack?.image) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return;
    }

    updateSnack({ ...selectedSnack }, {
      onSuccess: () => {
        handleCloseModal();
        Swal.fire('Success', 'Snack updated successfully!', 'success');
        refetch();
      },
      onError: (error) => {
        Swal.fire('Error', `Failed to update snack: ${error.message}`, 'error');
      },
    });
  };

  const handleDeleteSnack = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSnack(id, {
          onSuccess: () => {
            Swal.fire('Deleted!', 'The snack has been deleted.', 'success');
            refetch();
          },
          onError: (error) => {
            Swal.fire('Error', `Failed to delete snack: ${error.message}`, 'error');
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
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
        <img
          src="https://openseauserdata.com/files/c630ca375299bbeb375d000d5999a1cc.jpg"
          alt="Error"
          style={{ width: '300px', height: 'auto', marginBottom: '20px' }}
        />
        <Typography variant="h6" color="error">
          {error.message}
        </Typography>
        <Button variant="contained" color="primary" onClick={refetch} style={{ marginTop: '20px' }}>
          Coba Lagi
        </Button>
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>Welcome to the Snacks Page!</Typography>

      {/* Form untuk menambahkan snack baru */}
      <Box mb={4}>
        <Typography variant="h6">Add New Snack</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nama Snack"
              name="namaSnack"
              value={newSnack.namaSnack}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Harga"
              name="harga"
              value={newSnack.harga}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stock"
              name="stock"
              value={newSnack.stock}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Image URL"
              name="image"
              value={newSnack.image}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleCreateSnack}>
              Add Snack
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Daftar Snack */}
      <Grid container spacing={3}>
        {data && data.length > 0 ? (
          data.map((snack) => (
            <Grid item xs={12} sm={6} md={4} key={snack.id_Snack}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{snack.nama_Snack}</Typography>
                  <Typography variant="body2">Harga: {snack.harga}</Typography>
                  <Typography variant="body2">Stock: {snack.stock}</Typography>
                  {snack.image && <img src={snack.image} alt={snack.nama_Snack} width="100" height="100" />}
                </CardContent>
                <CardActions>
                  <IconButton color="primary" onClick={() => handleOpenModal(snack)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteSnack(snack.id_Snack)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No snacks available at the moment.</Typography>
        )}
      </Grid>

      {/* Modal untuk Edit Snack */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" gutterBottom>Edit Snack</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Snack"
                name="namaSnack"
                value={selectedSnack?.namaSnack || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Harga"
                name="harga"
                value={selectedSnack?.harga || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                value={selectedSnack?.stock || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={selectedSnack?.image || ''}
                onChange={handleInputChange}
              />
              {selectedSnack?.image && <img src={selectedSnack.image} alt={selectedSnack.namaSnack} width="100" height="100" />}
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleUpdateSnack}>
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
}
