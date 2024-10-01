const express = require('express');
const axios = require('axios');
const Product = require('../models/Product');
const router = express.Router();

// Initialize Database with seed data from external API
router.get('/initialize', async (req, res) => {
  try {
    const { data } = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');

    const operations = data.map(item => ({
      updateOne: {
        filter: { id: item.id },
        update: {
          $set: {
            title: item.title,
            price: item.price,
            description: item.description,
            category: item.category,
            image: item.image,
            sold: item.sold,
            dateOfSale: new Date(item.dateOfSale),
          },
        },
        upsert: true, // Insert if the record does not exist
      },
    }));

    await Product.bulkWrite(operations);
    res.status(200).send({ message: 'Database initialized without duplicates' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).send({ error: 'Failed to initialize database' });
  }
});

// API: List transactions with search and pagination
router.get('/transactions', async (req, res) => {
  const {  month } = req.query;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());

  if (monthIndex === -1) {
    return res.status(400).json({ error: 'Invalid month provided' });
  }

  try {
    const transactions = await Product.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] },
        ],
      },    
    })
      

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      title: transaction.title,
      description: transaction.description,
      price: transaction.price,
      dateOfSale: transaction.dateOfSale.toLocaleDateString(), // Formats date properly
      category: transaction.category,
      sold: transaction.sold,
      image: transaction.image
    }));

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send({ error: 'Error fetching transactions' });
  }
});

// API: Statistics
router.get('/statistics', async (req, res) => {
  const { month } = req.query;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());

  if (monthIndex === -1) {
    return res.status(400).json({ error: 'Invalid month provided' });
  }

  try {
    const totalSales = await Product.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthIndex + 1]
          }
        }
      },
      {
        $group: { _id: null, totalAmount: { $sum: '$price' }, totalItems: { $sum: 1 } }
      },
    ]);

    const soldItems = await Product.countDocuments({ $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }, sold: true });
    const notSoldItems = await Product.countDocuments({ $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] }, sold: false });

    res.json({
      totalSales: totalSales[0]?.totalAmount || 0,
      totalSold: soldItems,
      totalNotSold: notSoldItems,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).send({ error: 'Error fetching statistics' });
  }
});

// API: Bar Chart Data
router.get('/barchart', async (req, res) => {
  const { month } = req.query;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());

  if (monthIndex === -1) {
    return res.status(400).json({ error: 'Invalid month provided' });
  }

  const priceRanges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity },
  ];

  try {
    const data = await Promise.all(priceRanges.map(async ({ range, min, max }) => {
      const count = await Product.countDocuments({
        $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] },
        price: { $gte: min, $lt: max },
      });
      return { range, count };
    }));

    res.json(data);
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    res.status(500).send({ error: 'Error fetching bar chart data' });
  }
});

// API: Pie Chart Data
router.get('/piechart', async (req, res) => {
  const { month } = req.query;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());

  if (monthIndex === -1) {
    return res.status(400).json({ error: 'Invalid month provided' });
  }

  try {
    const categories = await Product.aggregate([
      { $match: { $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex + 1] } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json(categories);
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).send({ error: 'Error fetching pie chart data' });
  }
});

module.exports = router;
