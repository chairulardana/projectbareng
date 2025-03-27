import { createLazyFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CardActions, CircularProgress, CircularProgressProps, Button, TextField, Modal, IconButton } from "@mui/material";
import { GetDrink } from '../../../hooks/UseQuery/GetDrink';
import { useCreateDrink } from '../../../hooks/UseMutation/PostDrink';
import { useDeleteDrink } from '../../../hooks/UseMutation/DeleteDrink';
import { useUpdateDrink } from '../../../hooks/UseMutation/UpdateDrink';
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

interface Drink {
  id_Drink: string;
  nama_Minuman: string;
  harga: string;
  suhu: string;
  stock: string;
  image: string;
}

interface FormCreateDrinkType {
  namaMinuman: string;
  harga: number;
  suhu: string;
  stock: string;
  image: string; // Added image URL
}

interface FormUpdateDrinkType {
  id_Drink: number;
  namaMinuman: string;
  harga: number;
  suhu: string;
  stock: string;
  image: string; // Added image URL
}

function Drink() {
  const { data, isLoading, error, refetch } = GetDrink();
  const { mutate: createDrink } = useCreateDrink();
  const { mutate: deleteDrink } = useDeleteDrink();
  const { mutate: updateDrink } = useUpdateDrink();

  const [openModal, setOpenModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [newDrink, setNewDrink] = useState<FormCreateDrinkType>({
    namaMinuman: '',
    harga: 0,
    suhu: '',
    stock: '',
    image: '', // Added image URL
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

  const handleOpenModal = (drink: Drink): void => {
    setSelectedDrink({ ...drink });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDrink(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (selectedDrink) {
      setSelectedDrink((prev) => ({
        ...prev!,
        [name]: value,
      }));
    } else {
      setNewDrink((prev) => ({
        ...prev,
        [name]: name === 'harga' ? Number(value) : value,
      }));
    }
  };

  const handleLevelChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as number;
    if (selectedDrink) {
      setSelectedDrink((prev) => ({
        ...prev!,
        level: value,
      }));
    } else {
      setNewDrink((prev) => ({
        ...prev,
        level: value,
      }));
    }
  };

  const handleCreateDrink = () => {
    if (!newDrink.namaMinuman || !newDrink.harga || !newDrink.suhu || !newDrink.stock || !newDrink.image) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return;
    }

    createDrink(newDrink, {
      onSuccess: () => {
        setNewDrink({ namaMinuman: '', harga: 0, suhu: '', stock: '', image: '' });
        Swal.fire('Success', 'Drink added successfully!', 'success');
        refetch();
      },
      onError: (error) => {
        console.error("Error creating drink:", error);
        Swal.fire('Error', `Failed to add drink: ${error.message}`, 'error');
      },
    });
  };

  const handleUpdateDrink = () => {
    if (!selectedDrink?.namaMinuman || !selectedDrink?.harga || !selectedDrink?.suhu || !selectedDrink?.stock || !selectedDrink?.image) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return;
    }

    const drinkData: FormUpdateDrinkType = {
      id_Drink: Number(selectedDrink.id_Drink),
      namaMinuman: selectedDrink.namaMinuman,
      harga: Number(selectedDrink.harga),
      suhu: selectedDrink.suhu,
      stock: selectedDrink.stock,
      image: selectedDrink.image, // Include image
    };

    updateDrink(drinkData, {
      onSuccess: () => {
        handleCloseModal();
        Swal.fire('Success', 'Drink updated successfully!', 'success');
        refetch();
      },
      onError: (error) => {
        console.error("Error updating drink:", error);
        Swal.fire('Error', `Failed to update drink: ${error.message}`, 'error');
      },
    });
  };

  const handleDeleteDrink = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDrink(Number(id), {
          onSuccess: () => {
            Swal.fire('Deleted!', 'The drink has been deleted.', 'success');
            refetch();
          },
          onError: (error) => {
            console.error("Error deleting drink:", error);
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
              name="namaMinuman"
              value={newDrink.namaMinuman}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Harga"
              name="harga"
              type="number"
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
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Image URL"
              name="image"
              value={newDrink.image}
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
                  {drink.image && <img src={drink.image} alt={drink.namaMinuman} width="100" height="100" />}
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
                name="namaMinuman"
                value={selectedDrink?.namaMinuman || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Harga"
                name="harga"
                type="number"
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
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={selectedDrink?.image || ''}
                onChange={handleInputChange}
                required
              />
              {selectedDrink?.image && <img src={selectedDrink.image} alt={selectedDrink.namaMinuman} width="100" height="100" />}
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
