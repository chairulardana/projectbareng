import { createLazyFileRoute } from '@tanstack/react-router';
import { Box, Typography, Card, CardContent, Grid, CardActions, CircularProgress, Button, TextField, Modal, IconButton, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { GetPaket } from '../../../hooks/UseQuery/GetPaket'; 
import { GetKebab } from '../../../hooks/UseQuery/GetKebab'; 
import { GetSnack } from '../../../hooks/UseQuery/GetSnack'; 
import { GetDrink } from '../../../hooks/UseQuery/GetDrink'; 
import { CreatePaket } from '../../../hooks/UseMutation/PostPaket';
import { DeletePaket } from '../../../hooks/UseMutation/DeletePaket';
import { UpdatePaket } from '../../../hooks/UseMutation/UpdatePaket';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

export const Route = createLazyFileRoute('/_protected/PaketMakanan/')({
  component: PaketMakanan,
});

function PaketMakanan() {
  const { data, isLoading, error, refetch } = GetPaket();
  const { data: kebabData } = GetKebab(); 
  const { data: snackData } = GetSnack(); 
  const { data: drinkData } = GetDrink();

  const { mutate: createPaket } = CreatePaket();
  const { mutate: deletePaket } = DeletePaket();
  const { mutate: updatePaket } = UpdatePaket();

  const [openModal, setOpenModal] = useState(false);
  const [selectedPaket, setSelectedPaket] = useState(null);
  const [newPaket, setNewPaket] = useState({
    nama_Paket: '',
    harga_Paket: '',
    diskon: 0,
    id_Kebab: '',
    id_Snack: '',
    id_Drink: '',
    harga_Paket_After_Diskon: 0,
    nama_Kebab: '',
    nama_Snack: '',
    nama_Minuman: '',
  });

  // State loading untuk create, update, dan delete
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingPakets, setDeletingPakets] = useState({});

  const handleOpenModal = (paket) => {
    setSelectedPaket({ ...paket });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPaket(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (selectedPaket) {
      setSelectedPaket((prev) => {
        const updatedValue = { ...prev, [name]: value };
        if (name === "harga_Paket" || name === "diskon") {
          const hargaPaket = parseFloat(updatedValue.harga_Paket) || 0;
          const diskon = parseFloat(updatedValue.diskon) || 0;
          updatedValue.harga_Paket_After_Diskon = hargaPaket - (hargaPaket * diskon / 100);
        }
        return updatedValue;
      });
    } else {
      setNewPaket((prev) => {
        const updatedValue = { ...prev, [name]: value };
        if (name === "harga_Paket" || name === "diskon") {
          const hargaPaket = parseFloat(updatedValue.harga_Paket) || 0;
          const diskon = parseFloat(updatedValue.diskon) || 0;
          updatedValue.harga_Paket_After_Diskon = hargaPaket - (hargaPaket * diskon / 100);
        }
        return updatedValue;
      });
    }
  };
  
  const handleCreatePaket = () => {
    // Validasi foreign key terkait menggunakan nama
    const kebab = kebabData.find((k) => k.nama_Kebab === newPaket.nama_Kebab);
    const snack = snackData.find((s) => s.nama_Snack === newPaket.nama_Snack);
    const drink = drinkData.find((d) => d.nama_Minuman === newPaket.nama_Minuman);

    // Cek apakah nama yang dipilih valid
    if (!kebab || !snack || !drink) {
      Swal.fire('Error', 'Pilih kebab, snack, atau drink yang valid!', 'error');
      return;
    }

    // Pastikan field wajib terisi
    if (!newPaket.nama_Paket || !newPaket.harga_Paket) {
      Swal.fire('Error', 'Semua kolom harus diisi!', 'error');
      return;
    }

    // Buat payload dengan ID berdasarkan nama yang dipilih
    const payload = {
      ...newPaket,
      id_Kebab: kebab.id_Kebab,
      id_Snack: snack.id_Snack,
      id_Drink: drink.id_Drink,
    };

    setIsCreating(true);
    // Kirimkan data ke server
    createPaket(payload, {
      onSuccess: () => {
        setNewPaket({
          nama_Paket: '',
          harga_Paket: '',
          diskon: 0,
          id_Kebab: '',
          id_Snack: '',
          id_Drink: '',
          harga_Paket_After_Diskon: 0,
          nama_Kebab: '',
          nama_Snack: '',
          nama_Minuman: '',
        });
        Swal.fire('Success', 'Paket berhasil ditambahkan!', 'success');
        refetch(); // Mengambil data ulang setelah berhasil
        setIsCreating(false);
      },
      onError: (error) => {
        Swal.fire('Error', `Gagal menambahkan paket: ${error.message}`, 'error');
        setIsCreating(false);
      },
    });
  };

  const handleUpdatePaket = () => {
    // Validasi foreign key terkait menggunakan nama
    const kebab = kebabData.find((k) => k.nama_Kebab === selectedPaket.nama_Kebab);
    const snack = snackData.find((s) => s.nama_Snack === selectedPaket.nama_Snack);
    const drink = drinkData.find((d) => d.nama_Minuman === selectedPaket.nama_Minuman);

    // Cek apakah nama yang dipilih valid
    if (!kebab || !snack || !drink) {
      Swal.fire('Error', 'Pilih kebab, snack, atau drink yang valid!', 'error');
      return;
    }

    if (!selectedPaket.nama_Paket || !selectedPaket.harga_Paket) {
      Swal.fire('Error', 'Semua kolom harus diisi!', 'error');
      return;
    }

    // Buat payload dengan ID berdasarkan nama yang dipilih
    const payload = {
      ...selectedPaket,
      id_Kebab: kebab.id_Kebab,
      id_Snack: snack.id_Snack,
      id_Drink: drink.id_Drink,
    };

    setIsUpdating(true);
    // Kirimkan data ke server
    updatePaket(payload, {
      onSuccess: () => {
        handleCloseModal();
        Swal.fire('Success', 'Paket berhasil diperbarui!', 'success');
        refetch(); // Mengambil data ulang setelah berhasil
        setIsUpdating(false);
      },
      onError: (error) => {
        Swal.fire('Error', `Gagal memperbarui paket: ${error.message}`, 'error');
        setIsUpdating(false);
      },
    });
  };

  const handleDeletePaket = (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Paket ini tidak dapat dikembalikan setelah dihapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Tidak, batal!',
    }).then((result) => {
      if (result.isConfirmed) {
        setDeletingPakets((prev) => ({ ...prev, [id]: true }));
        deletePaket(id, {
          onSuccess: () => {
            Swal.fire('Dihapus!', 'Paket telah dihapus.', 'success');
            refetch(); // Mengambil data ulang setelah berhasil
            setDeletingPakets((prev) => ({ ...prev, [id]: false }));
          },
          onError: (error) => {
            Swal.fire('Error', `Gagal menghapus paket: ${error.message}`, 'error');
            setDeletingPakets((prev) => ({ ...prev, [id]: false }));
          },
        });
      }
    });
  };

  // Loading dan error handling
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">Gagal mengambil data paket. Silakan coba lagi nanti.</Typography>
      </Box>
    );
  }

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>Selamat datang di Halaman Paket Makanan!</Typography>

      {/* Form untuk menambahkan paket baru */}
      <Box mb={4}>
        <Typography variant="h6">Tambah Paket Baru</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nama Paket"
              name="nama_Paket"
              value={newPaket.nama_Paket}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Harga"
              name="harga_Paket"
              value={newPaket.harga_Paket}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Diskon (%)"
              name="diskon"
              value={newPaket.diskon}
              onChange={handleInputChange}
              required
            />
          </Grid>
          {/* Dropdown untuk Kebab */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="kebab-select-label">Kebab</InputLabel>
              <Select
                labelId="kebab-select-label"
                name="nama_Kebab"
                value={newPaket.nama_Kebab || ""}
                onChange={handleInputChange}
              >
                {kebabData && kebabData.map((kebab) => (
                  <MenuItem key={kebab.id_Kebab} value={kebab.nama_Kebab}>
                    {kebab.nama_Kebab}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Dropdown untuk Snack */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="snack-select-label">Snack</InputLabel>
              <Select
                labelId="snack-select-label"
                name="nama_Snack"
                value={newPaket.nama_Snack || ""}
                onChange={handleInputChange}
              >
                {snackData && snackData.map((snack) => (
                  <MenuItem key={snack.id_Snack} value={snack.nama_Snack}>
                    {snack.nama_Snack}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Dropdown untuk Drink */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="drink-select-label">Drink</InputLabel>
              <Select
                labelId="drink-select-label"
                name="nama_Minuman"
                value={newPaket.nama_Minuman || ""}
                onChange={handleInputChange}
              >
                {drinkData && drinkData.map((drink) => (
                  <MenuItem key={drink.id_Drink} value={drink.nama_Minuman}>
                    {drink.nama_Minuman}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreatePaket}
              disabled={isCreating}
            >
              {isCreating ? <CircularProgress size={24} /> : "Tambah Paket"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Daftar Paket */}
      <Grid container spacing={3}>
        {data && data.length > 0 ? (
          data.map((paket) => {
            // Ambil nama kebab, snack, dan drink berdasarkan id
            const kebab = kebabData.find((k) => k.id_Kebab === paket.id_Kebab);
            const snack = snackData.find((s) => s.id_Snack === paket.id_Snack);
            const drink = drinkData.find((d) => d.id_Drink === paket.id_Drink);

            return (
              <Grid item xs={12} sm={6} md={4} key={paket.id_Paket}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                    {paket.nama_Paket.replace(/_/g, " ")}
                    </Typography>
                    <Typography variant="body2">Harga: {paket.harga_Paket}</Typography>
                    <Typography variant="body2">Diskon: {paket.diskon}%</Typography>
                    <Typography variant="body2">
                      Harga Setelah Diskon: {paket.harga_Paket_After_Diskon}
                    </Typography>
                    <Typography variant="body2">
                      Kebab: {kebab ? kebab.nama_Kebab : 'Tidak Ditemukan'}
                    </Typography>
                    <Typography variant="body2">
                      Snack: {snack ? snack.nama_Snack : 'Tidak Ditemukan'}
                    </Typography>
                    <Typography variant="body2">
                      Drink: {drink ? drink.nama_Minuman : 'Tidak Ditemukan'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton color="primary" onClick={() => handleOpenModal(paket)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeletePaket(paket.id_Paket)}
                      disabled={deletingPakets[paket.id_Paket]}
                    >
                      {deletingPakets[paket.id_Paket] ? <CircularProgress size={24} /> : <DeleteIcon />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Typography>Tidak ada paket saat ini.</Typography>
        )}
      </Grid>

      {/* Modal untuk Edit Paket */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>Edit Paket</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Paket"
                name="nama_Paket"
                value={selectedPaket?.nama_Paket || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Harga"
                name="harga_Paket"
                value={selectedPaket?.harga_Paket || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diskon (%)"
                name="diskon"
                value={selectedPaket?.diskon || ''}
                onChange={handleInputChange}
                required
              />
            </Grid>
            {/* Dropdown untuk Kebab */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="edit-kebab-select-label">Kebab</InputLabel>
                <Select
                  labelId="edit-kebab-select-label"
                  name="nama_Kebab"
                  value={selectedPaket?.nama_Kebab || ''}
                  onChange={handleInputChange}
                >
                  {kebabData && kebabData.map((kebab) => (
                    <MenuItem key={kebab.id_Kebab} value={kebab.nama_Kebab}>
                      {kebab.nama_Kebab}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Dropdown untuk Snack */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="edit-snack-select-label">Snack</InputLabel>
                <Select
                  labelId="edit-snack-select-label"
                  name="nama_Snack"
                  value={selectedPaket?.nama_Snack || ''}
                  onChange={handleInputChange}
                >
                  {snackData && snackData.map((snack) => (
                    <MenuItem key={snack.id_Snack} value={snack.nama_Snack}>
                      {snack.nama_Snack}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Dropdown untuk Drink */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="edit-drink-select-label">Drink</InputLabel>
                <Select
                  labelId="edit-drink-select-label"
                  name="nama_Minuman"
                  value={selectedPaket?.nama_Minuman || ''}
                  onChange={handleInputChange}
                >
                  {drinkData && drinkData.map((drink) => (
                    <MenuItem key={drink.id_Drink} value={drink.nama_Minuman}>
                      {drink.nama_Minuman}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdatePaket}
                disabled={isUpdating}
              >
                {isUpdating ? <CircularProgress size={24} /> : "Simpan Perubahan"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
}

export default PaketMakanan;