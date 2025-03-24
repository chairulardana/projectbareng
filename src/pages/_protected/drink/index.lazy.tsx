import { createLazyFileRoute } from '@tanstack/react-router';
import React from 'react';
import { Box, Typography, Card, CardContent, Grid, CardActions, CircularProgress, Button, TextField, Modal, IconButton } from "@mui/material";
import { GetDrink } from '../../../hooks/UseQuery/GetDrink'; // Mengimpor hook untuk mengambil data minuman
import { useCreateDrink } from '../../../hooks/UseMutation/PostDrink';
import { useDeleteDrink } from '../../../hooks/UseMutation/DeleteDrink';
import { useUpdateDrink } from '../../../hooks/UseMutation/UpdateDrink';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

export const Route = createLazyFileRoute('/_protected/drink/')({
  component: Drink,
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

function Drink() {
  const { data, isLoading, error, refetch } = GetDrink(); // Add refetch here to reload data
  const { mutate: createDrink } = useCreateDrink();
  const { mutate: deleteDrink } = useDeleteDrink();
  const { mutate: updateDrink } = useUpdateDrink();

  const [openModal, setOpenModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<{ nama_Minuman: string; harga: string; suhu: string; stock: string; id_Drink: string } | null>(null);
  const [newDrink, setNewDrink] = useState({
    nama_Minuman: '',
    harga: '',
    suhu: '',
    stock: '',
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

  const handleOpenModal = (drink) => {
    setSelectedDrink({ ...drink });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDrink(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedDrink) {
      setSelectedDrink((prev) => ({
        ...prev!,
        [name]: value,
      }));
    } else {
      setNewDrink((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    console.log(`Field: ${name}, Value: ${value}`); // Debugging line
  };

  const handleCreateDrink = () => {
    if (!newDrink.nama_Minuman || !newDrink.harga || !newDrink.suhu || !newDrink.stock) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return;
    }

    console.log("Creating drink with data:", newDrink); // Debugging line
    createDrink(newDrink, {
      onSuccess: () => {
        setNewDrink({ nama_Minuman: '', harga: '', suhu: '', stock: '' });
        Swal.fire('Success', 'Drink added successfully!', 'success');
        refetch(); // Refetch the data to get the new drink added to the list
      },
      onError: (error) => {
        console.error("Error creating drink:", error); // Debugging line
        Swal.fire('Error', `Failed to add drink: ${error.message}`, 'error');
      },
    });
  };

  const handleUpdateDrink = () => {
    if (!selectedDrink?.nama_Minuman || !selectedDrink?.harga || !selectedDrink?.suhu || !selectedDrink?.stock) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return;
    }

    updateDrink(selectedDrink, {
      onSuccess: () => {
        handleCloseModal();
        Swal.fire('Success', 'Drink updated successfully!', 'success');
        refetch(); // Refetch the data after update
      },
      onError: (error) => {
        console.error("Error updating drink:", error); // Debugging line
        Swal.fire('Error', `Failed to update drink: ${error.message}`, 'error');
      },
    });
  };

  const handleDeleteDrink = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDrink(id, {
          onSuccess: () => {
            Swal.fire('Deleted!', 'The drink has been deleted.', 'success');
            refetch(); // Refetch the data after deletion
          },
          onError: (error) => {
            console.error("Error deleting drink:", error); // Debugging line
            Swal.fire('Error', `Failed to delete drink: ${error.message}`, 'error');
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
        <Typography color="error">Failed to fetch drinks. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>Welcome to the Drinks Page!</Typography>

      {/* Form untuk menambahkan minuman baru */}
      <Box mb={4}>
        <Typography variant="h6">Add New Drink</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nama Minuman"
              name="nama_Minuman"
              value={newDrink.nama_Minuman}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Harga"
              name="harga"
              value={newDrink.harga}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Suhu"
              name="suhu"
              value={newDrink.suhu}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stock"
              name="stock"
              value={newDrink.stock}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleCreateDrink}>
              Add Drink
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Daftar Minuman */}
      <Grid container spacing={3}>
        {data && data.length > 0 ? (
          data.map((drink) => (
            <Grid item xs={12} sm={6} md={4} key={drink.id_Drink}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{drink.nama_Minuman}</Typography>
                  <Typography variant="body2">Harga: {drink.harga}</Typography>
                  <Typography variant="body2">Suhu: {drink.suhu}</Typography>
                  <Typography variant="body2">Stock: {drink.stock}</Typography>
                </CardContent>
                <CardActions>
                  <IconButton color="primary" onClick={() => handleOpenModal(drink)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteDrink(drink.id_Drink)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No drinks available at the moment.</Typography>
        )}
      </Grid>

      {/* Modal untuk Edit Minuman */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" gutterBottom>Edit Drink</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Minuman"
                name="nama_Minuman"
                value={selectedDrink?.nama_Minuman || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Harga"
                name="harga"
                value={selectedDrink?.harga || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Suhu"
                name="suhu"
                value={selectedDrink?.suhu || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                value={selectedDrink?.stock || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleUpdateDrink}>
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
}