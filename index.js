const express = require('express')
const bodyParse = require('body-parser')
const axios = require('axios')
const cors = require('cors');
require('dotenv').config();


const PORT = process.env.PORT || 5000
const HOST_ADDRESS = process.env.HOST_ADDRESS || '0.0.0.0';
const BITQUERY_KEY = process.env.BITQUERY_KEY || '';
const BITQUERY_URL = 'https://graphql.bitquery.io';

const app = express();

const router = express.Router()

app.use(bodyParse.json());
app.use(router);

app.listen(PORT, HOST_ADDRESS, () => {
  console.log(`server is listening on port: ${PORT}`)
})

app.use(cors());

const corsOptions = {
  origin: false
}

router.get('/symbol_info/:network/:address', cors(corsOptions), async (req, res) => {

  try {

    const network = req.params.network;
    const address = req.params.address;
    console.log(network, address);

    const { data } = await axios.post(BITQUERY_URL, JSON.stringify({
      query: `
      {
        ethereum(network: ${network}) {
          address(address: {is: "${address}"}) {
            smartContract {
              currency {
                symbol
                name
                decimals
                tokenType
              }
            }
          }
        }
      }`}),
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": BITQUERY_KEY
        }
      });

    const result = data['data']['ethereum']['address'][0]['smartContract']['currency'];
    return res.json(result);

  } catch (err) {
    console.log(err);
  }

})

router.get('/ohlc_data/:network/:address/:from/:to/:resolution', cors(corsOptions), async (req, res) => {

  const network = req.params.network;

  const baseAddress = req.params.address;
  const factoryAddress = network === 'ethereum' ? '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' : '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
  const quoteAddress = network === 'ethereum' ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' : '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

  const from = req.params.from;
  const to = req.params.to;
  const resolution = req.params.resolution;

  console.log(network, baseAddress, from, to, resolution);

<<<<<<< HEAD
  try {
=======
    console.log('factory: ' + factoryAddress)
    console.log('ether: ' + quoteAddress)
    console.log('base currency: ' + baseAddress)
    console.log('from:' + from + ' to:' + to)
    console.log('network ' + network + ' and resolution: ' + resolution)
>>>>>>> a547fdda85935eaa5dce3314e6b9df68345f6838

    const { data } = await axios.post(BITQUERY_URL, JSON.stringify({
      query: `
        {
          ethereum(network: ${network}) {
            dexTrades(
              date: {since: "${from}", till: "${to}"}
              exchangeAddress: {is: "${factoryAddress}"}
              baseCurrency: {is: "${baseAddress}"}
              quoteCurrency: {is: "${quoteAddress}"}
            ) 
            {
              timeInterval {
                minute(count: ${resolution}, format: "%Y-%m-%dT%H:%M:%SZ")  
              }
              volume: quoteAmount
              high: quotePrice(calculate: maximum)
              low: quotePrice(calculate: minimum)
              open: minimum(of: block, get: quote_price)
              close: maximum(of: block, get: quote_price) 
            }
          }
        }`})
      , {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": BITQUERY_KEY
        }
      });

    const result = data['data']['ethereum']['dexTrades'];
    return res.json(result);

  } catch (err) {
    console.log(err);
  }
})