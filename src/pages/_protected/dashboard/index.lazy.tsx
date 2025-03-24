import React, { useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, IconButton, Divider, TextField } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { DatePicker } from '@mui/lab';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { createLazyFileRoute } from '@tanstack/react-router';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const Route = createLazyFileRoute('/_protected/dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [date, setDate] = useState(new Date());

  const salesPerDayData = {
    labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    datasets: [
      {
        label: 'Sales per Hour',
        data: [120, 150, 200, 170, 190, 220, 210, 230, 250, 270],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const topSellingProducts = [
    { name: 'Kebab Modern', price: '$1,000' },
    { name: 'Sosis Keju', price: '$600' },
    { name: 'Es Buah', price: '$300' },
  ];

  return (
    <Box padding={3} sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
        Dashboard
      </Typography>

      {/* Date Picker */}
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <DatePicker
          label="Pilih Tanggal"
          value={date}
          onChange={(newDate) => setDate(newDate)}
          renderInput={(props) => (
            <TextField {...props} variant="outlined" size="small" sx={{ backgroundColor: '#fff' }} />
          )}
        />
        <IconButton color="primary" aria-label="calendar" sx={{ ml: 1, backgroundColor: '#3f51b5', color: '#fff' }}>
          <CalendarTodayIcon />
        </IconButton>
      </Box>

      {/* Cards Section */}
      <Grid container spacing={3}>
        {[
          { title: 'NEW ORDERS', value: '35,673', change: '2.0% (30 days)', color: '#4caf50' },
          { title: 'TOTAL INCOME', value: '$14,966', change: 'Increased by 7.35%', color: '#2196f3' },
          { title: 'TOTAL EXPENSE', value: '$26,526', change: 'Increased by 7.35%', color: '#f44336' },
          { title: 'NEW USERS', value: '32,566', change: '54.1% less earnings', color: '#ff9800' },
        ].map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, backgroundColor: card.color, color: '#fff' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{card.title}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{card.value}</Typography>
                <Divider sx={{ my: 2, backgroundColor: '#fff' }} />
                <Typography variant="body2">{card.change}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Sales per Day and Top Selling Products Section */}
      <Grid container spacing={3} mt={4}>
        {/* Sales per Day Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Sales per Day</Typography>
              <Line data={salesPerDayData} />
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Products Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Top Selling Products</Typography>
              {topSellingProducts.map((product, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">{product.name} - {product.price}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default RouteComponent;