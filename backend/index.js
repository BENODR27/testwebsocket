// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Sale } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Endpoint to get all sales
app.get('/sales', async (req, res) => {
  const sales = await Sale.findAll({
    limit: 5, 
    order: [['amount', 'DESC']] // Sort by amount in descending order
  });
  res.json(sales);
});

// Endpoint to add new sale (for testing purposes)
app.post('/sales', async (req, res) => {
  const newSale = await Sale.create(req.body);
  io.emit('new_sale', newSale); // Send real-time update to clients
  res.json(newSale);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server

  server.listen(3001, () => {
    console.log('Server running on port 3001');
  });

