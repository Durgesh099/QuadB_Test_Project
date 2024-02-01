require('dotenv').config()
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());

mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.elxa07e.mongodb.net/${process.env.NAME}?retryWrites=true&w=majority`);

const wazirxSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  diff: Number
});

const Wazirx = mongoose.model('Wazirx', wazirxSchema);

app.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');

    const Results10 = Object.values(response.data)
      .slice(0, 10)
      .map((result) => {
        const last = parseFloat(result.last);
        const buy = parseFloat(result.buy);
        const sell = parseFloat(result.sell);
        const diff = buy !== 0 ? ((sell - buy) / buy) * 100 : null;
    
        return {
          name: result.name,
          last,
          buy,
          sell,
          diff: diff !== null ? parseFloat(diff.toFixed(2)) : null,
        };
      });

    await Wazirx.create(Results10);

    res.json({status:201 ,message: 'Success',data:Results10});
  } catch (error) {
    console.error('Error', error.message);
    res.status(500).json({status:500, message: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Server is running');
});
