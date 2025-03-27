import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  TextField, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Paper,
  useTheme,
  styled,
  CircularProgress,
  Chip,
  Collapse,
  IconButton,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { GetTransaksi } from '../../../hooks/UseQuery/GetTransaksi';
import { createLazyFileRoute } from '@tanstack/react-router';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import PrintIcon from '@mui/icons-material/Print';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const Route = createLazyFileRoute('/_protected/dashboard/')({
  component: DashboardAdmin,
});

interface Transaction {
  id_DetailTransaksi: number;
  tanggalTransaksi: string;
  nama_Kebab?: string;
  nama_Snack?: string;
  nama_Paket?: string;
  nama_Drink?: string;
  jumlah: number;
  totalHarga: number;
  name: string;
}

interface GroupedTransaction {
  id: string;
  pelanggan: string;
  waktu: string;
  items: Transaction[];
  total: number;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
  }
}));

const ProductChip = styled(Chip)(({ theme }) => ({
  margin: '4px',
  borderRadius: '8px',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  fontWeight: 500
}));

function DashboardAdmin() {
  const theme = useTheme();
  const { data: transaksiData, isLoading, error } = GetTransaksi();
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransaction[]>([]);
  const [topProducts, setTopProducts] = useState<{name: string, count: number}[]>([]);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [expandedTransactions, setExpandedTransactions] = useState<Record<string, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Group transactions by customer and time
  const groupTransactions = (transactions: Transaction[]): GroupedTransaction[] => {
    const grouped: Record<string, GroupedTransaction> = {};
    
    transactions.forEach(trans => {
      const key = `${trans.name}-${dayjs(trans.tanggalTransaksi).format('YYYY-MM-DD-HH-mm')}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          pelanggan: trans.name,
          waktu: trans.tanggalTransaksi,
          items: [],
          total: 0
        };
      }
      
      grouped[key].items.push(trans);
      grouped[key].total += trans.totalHarga;
    });
    
    return Object.values(grouped);
  };

  // Calculate totals and top products
  useEffect(() => {
    if (transaksiData) {
      let filtered = [...transaksiData];
      
      if (selectedDate) {
        filtered = filtered.filter(t => 
          dayjs(t.tanggalTransaksi).isSame(selectedDate, 'day')
        );
      }
      
      setFilteredTransactions(filtered);
      setGroupedTransactions(groupTransactions(filtered));
      
      // Calculate top products
      const productCount: Record<string, number> = {};
      
      filtered.forEach(t => {
        if (t.nama_Kebab) productCount[t.nama_Kebab] = (productCount[t.nama_Kebab] || 0) + t.jumlah;
        if (t.nama_Snack) productCount[t.nama_Snack] = (productCount[t.nama_Snack] || 0) + t.jumlah;
        if (t.nama_Paket) productCount[t.nama_Paket] = (productCount[t.nama_Paket] || 0) + t.jumlah;
        if (t.nama_Drink) productCount[t.nama_Drink] = (productCount[t.nama_Drink] || 0) + t.jumlah;
      });
      
      const sortedProducts = Object.entries(productCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 products
      
      setTopProducts(sortedProducts);
    }
  }, [transaksiData, selectedDate]);

  // Calculate totals
  const totalPendapatan = filteredTransactions.reduce((sum, t) => sum + t.totalHarga, 0);
  const jumlahTransaksi = groupedTransactions.length;
  const rataRataTransaksi = jumlahTransaksi > 0 ? totalPendapatan / jumlahTransaksi : 0;

  // Chart data
  const chartData = {
    labels: filteredTransactions.map(t => dayjs(t.tanggalTransaksi).format('HH:mm')),
    datasets: [{
      label: 'Total Transaksi (Rp)',
      data: filteredTransactions.map(t => t.totalHarga),
      borderColor: theme.palette.primary.main,
      backgroundColor: 'rgba(63, 81, 181, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: theme.palette.primary.dark,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { 
      legend: { 
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: theme.typography.fontFamily
          }
        }
      },
      title: { 
        display: true, 
        text: 'Tren Transaksi Harian',
        font: {
          size: 16,
          family: theme.typography.fontFamily
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Rp ${context.raw.toLocaleString('id-ID')}`;
          }
        }
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: {
          font: {
            family: theme.typography.fontFamily
          }
        }
      },
      y: {
        grid: { 
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          callback: (value: number) => 'Rp ' + value.toLocaleString('id-ID'),
          font: {
            family: theme.typography.fontFamily
          }
        }
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Export functions
  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Judul
    doc.setFontSize(18);
    doc.text('Laporan Transaksi', 105, 15, { align: 'center' });
    
    // Filter date info
    const dateInfo = selectedDate 
      ? `Tanggal: ${selectedDate.format('DD MMMM YYYY')}`
      : 'Semua Tanggal';
    doc.setFontSize(12);
    doc.text(dateInfo, 105, 23, { align: 'center' });
  
    // Data transaksi (tanpa kolom aksi)
    const headers = [['Pelanggan', 'Waktu', 'Produk', 'Qty', 'Harga Satuan', 'Total (Rp)']];
    
    // Flatten all items from all transactions
    const data = groupedTransactions.flatMap(group => 
      group.items.map(item => [
        group.pelanggan,
        dayjs(group.waktu).format('DD MMM YYYY HH:mm'),
        item.nama_Kebab || item.nama_Snack || item.nama_Paket || item.nama_Drink || '',
        item.jumlah,
        `Rp ${(item.totalHarga / item.jumlah).toLocaleString('id-ID')}`,
        `Rp ${item.totalHarga.toLocaleString('id-ID')}`
      ])
    );
  
    // Add summary row
    data.push([
      '', 
      '', 
      'TOTAL', 
      '',
      '',
      `Rp ${totalPendapatan.toLocaleString('id-ID')}`
    ]);
  
    (doc as any).autoTable({
      head: headers,
      body: data,
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 2,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [63, 81, 181], // Warna primary
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Pelanggan
        1: { cellWidth: 30 }, // Waktu
        2: { cellWidth: 40 }, // Produk
        3: { cellWidth: 15 }, // Qty
        4: { cellWidth: 25 }, // Harga Satuan
        5: { cellWidth: 25 }  // Total
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data: any) => {
        // Style untuk row total
        if (data.pageCount === data.pageNumber) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          const finalY = data.cursor.y;
          doc.text(`Total Pendapatan: Rp ${totalPendapatan.toLocaleString('id-ID')}`, 
                   data.settings.margin.left, finalY + 10);
        }
      }
    });
    
    doc.save(`transaksi_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
    handleExportClose();
  };

  const exportToExcel = () => {
    // Format data untuk Excel
    const data = [
      ['Laporan Transaksi'],
      [selectedDate ? `Tanggal: ${selectedDate.format('DD MMMM YYYY')}` : 'Semua Tanggal'],
      [],
      ['Pelanggan', 'Waktu', 'Produk', 'Qty', 'Total (Rp)']
    ];
    
    filteredTransactions.forEach(t => {
      data.push([
        t.name,
        dayjs(t.tanggalTransaksi).format('DD MMM YYYY HH:mm'),
        t.nama_Kebab || t.nama_Snack || t.nama_Paket || t.nama_Drink || '',
        t.jumlah,
        t.totalHarga
      ]);
    });
    
    // Tambah total
    data.push([], ['Total Pendapatan', '', '', '', totalPendapatan]);
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
    
    // Styling untuk header
    if (!ws['!cols']) ws['!cols'] = [];
    ws['!cols'][4] = { numFmt: '"Rp"#,##0' }; // Format currency untuk kolom total
    
    XLSX.writeFile(wb, `transaksi_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    handleExportClose();
  };

  const handlePrint = () => {
    setPrintDialogOpen(true);
  };

  const handlePrintDialogClose = () => {
    setPrintDialogOpen(false);
  };

  const handlePrintConfirm = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const tableHtml = tableRef.current?.outerHTML || '';
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Laporan Transaksi</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; font-size: 18px; }
              .date-info { text-align: center; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th { background-color: #3f51b5; color: white; padding: 8px; text-align: left; }
              td { padding: 8px; border-bottom: 1px solid #ddd; }
              .total-row { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Laporan Transaksi</h1>
            <div class="date-info">
              ${selectedDate ? `Tanggal: ${selectedDate.format('DD MMMM YYYY')}` : 'Semua Tanggal'}
            </div>
            ${tableHtml}
            <div style="margin-top: 20px; text-align: right; font-weight: bold;">
              Total Pendapatan: Rp ${totalPendapatan.toLocaleString('id-ID')}
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
    setPrintDialogOpen(false);
  };

  if (isLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress size={60} />
    </Box>
  );
  
  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography color="error">Gagal memuat data transaksi</Typography>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        backgroundColor: '#f9fafb', 
        minHeight: '100vh',
        p: 4
      }}>
        <Box maxWidth="1600px" mx="auto">
          {/* Header with Real-time Clock */}
          <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                Dashboard Admin
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Ringkasan penjualan dan performa toko
              </Typography>
            </Box>
            <Box bgcolor="primary.main" p={1.5} borderRadius="12px">
              <Typography variant="h6" color="white" fontWeight="bold">
                {currentTime.format('HH:mm:ss')}
              </Typography>
              <Typography variant="caption" color="white" display="block" textAlign="center">
                {currentTime.format('dddd, D MMMM YYYY')}
              </Typography>
            </Box>
          </Box>

          {/* Date Filter */}
          <Box mb={4}>
            <DatePicker
              label="Pilih Tanggal"
              value={selectedDate}
              onChange={setSelectedDate}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth
                  sx={{
                    maxWidth: '300px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'white'
                    }
                  }}
                />
              )}
              inputFormat="DD/MM/YYYY"
            />
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Total Pendapatan
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    Rp {totalPendapatan.toLocaleString('id-ID')}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedDate ? selectedDate.format('DD MMMM YYYY') : 'Semua waktu'}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Jumlah Transaksi
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {jumlahTransaksi}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedDate ? selectedDate.format('DD MMMM YYYY') : 'Total transaksi'}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Rata-rata Transaksi
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    Rp {rataRataTransaksi.toLocaleString('id-ID', {maximumFractionDigits: 0})}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Per transaksi
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>

          {/* Top Products and Chart */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={5}>
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Produk Terlaris
                  </Typography>
                  {topProducts.length > 0 ? (
                    <Box>
                      {topProducts.map((product, index) => (
                        <Box key={product.name} display="flex" alignItems="center" mb={2}>
                          <Box width={40} height={40} bgcolor={theme.palette.primary.light} 
                            borderRadius="8px" display="flex" alignItems="center" 
                            justifyContent="center" mr={2}>
                            <Typography color="primary.contrastText" fontWeight="bold">
                              {index + 1}
                            </Typography>
                          </Box>
                          <Box flexGrow={1}>
                            <Typography fontWeight="medium">{product.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              Terjual {product.count} pcs
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Tidak ada data produk
                    </Typography>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <StyledCard>
                <CardContent sx={{ p: 3, height: '100%' }}>
                  <Line data={chartData} options={chartOptions} />
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>

          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Detail Transaksi
              </Typography>
              <ButtonGroup variant="contained">
                <Button 
                  startIcon={<ArrowDropDownIcon />}
                  onClick={handleExportClick}
                  sx={{ backgroundColor: theme.palette.primary.main }}
                >
                  Excel
                </Button>
                <Button 
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ backgroundColor: theme.palette.secondary.main }}
                >
                  Print
                </Button>
              </ButtonGroup>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleExportClose}
              >
                <MenuItem onClick={exportToExcel}>
                  <GridOnIcon sx={{ mr: 1 }} />
                  Export to Excel
                </MenuItem>
              </Menu>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Table ref={tableRef}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pelanggan</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Waktu</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedTransactions.length > 0 ? (
                    groupedTransactions.map((group) => (
                      <React.Fragment key={group.id}>
                        <TableRow hover>
                          <TableCell>
                            <Typography fontWeight="medium">{group.pelanggan}</Typography>
                          </TableCell>
                          <TableCell>
                            {dayjs(group.waktu).format('DD MMM YYYY HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">
                              Rp {group.total.toLocaleString('id-ID')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => toggleExpand(group.id)}
                              endIcon={expandedTransactions[group.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              size="small"
                            >
                              {expandedTransactions[group.id] ? 'Tutup' : 'Detail'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} sx={{ p: 0 }}>
                            <Collapse in={expandedTransactions[group.id] || false}>
                              <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Detail Pesanan:
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Produk</TableCell>
                                      <TableCell align="right">Qty</TableCell>
                                      <TableCell align="right">Harga Satuan</TableCell>
                                      <TableCell align="right">Total</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {group.items.map((item) => (
                                      <TableRow key={item.id_DetailTransaksi}>
                                        <TableCell>
                                          {item.nama_Kebab && `Kebab: ${item.nama_Kebab}`}
                                          {item.nama_Snack && `Snack: ${item.nama_Snack}`}
                                          {item.nama_Paket && `Paket: ${item.nama_Paket}`}
                                          {item.nama_Drink && `Minuman: ${item.nama_Drink}`}
                                        </TableCell>
                                        <TableCell align="right">{item.jumlah}</TableCell>
                                        <TableCell align="right">
                                          Rp {(item.totalHarga / item.jumlah).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell align="right">
                                          Rp {item.totalHarga.toLocaleString('id-ID')}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="textSecondary">
                          {selectedDate 
                            ? 'Tidak ada transaksi pada tanggal ini' 
                            : 'Tidak ada data transaksi'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        </Box>

        {/* Print Dialog */}
        <Dialog open={printDialogOpen} onClose={handlePrintDialogClose}>
          <DialogTitle>Konfirmasi Cetak</DialogTitle>
          <DialogContent>
            <Typography>Anda akan mencetak laporan transaksi.</Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              {selectedDate 
                ? `Tanggal: ${selectedDate.format('DD MMMM YYYY')}`
                : 'Semua Tanggal'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePrintDialogClose}>Batal</Button>
            <Button onClick={handlePrintConfirm} color="primary" variant="contained">
              Cetak
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default DashboardAdmin;