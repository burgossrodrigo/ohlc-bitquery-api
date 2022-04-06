const express = require('express')
const bodyParse = require('body-parser')
require('isomorphic-fetch');
var cors = require('cors');

const json = bodyParse.json
const app = express();
const router = express.Router()

app.use(json());
app.use(router);
const PORT = process.env.PORT || 5000
var server_host = process.env.YOUR_HOST || '0.0.0.0';

app.listen(PORT, server_host, () => {
    console.log(`server is listening on port: ${PORT}`)
})

app.use(cors());

const corsOptions ={
  origin: false
}


router.get('/:network/:address/:from/:to/:resolution', cors(corsOptions), async (req, res) => {

     const network = req.params.network;

     const baseAddress = req.params.address;

    const factoryAddress = network === 'ethereum' ? '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' : '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'


    const quoteAddress = network === 'ethereum' ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' : '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

    const from = req.params.from;

    const to = req.params.to;

    const resolution = req.params.resolution;

    console.log('factory: ' + factoryAddress)
    console.log('ether: ' + quoteAddress)

    try{
    
    await fetch('https://graphql.bitquery.io', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "BQYpMaOs1jlSOr3CQdT0yzQMdld6r8Mn"
      },
      body: JSON.stringify({
        query: `
        {
          ethereum(network: ${network}) {
            dexTrades(
              options: {asc: "timeInterval.minute"}
              date: {since: "${from}", till: "${to}"}
              exchangeAddress: {is: "${factoryAddress}"}
              baseCurrency: {is: "${baseAddress}"}
              quoteCurrency: {is: "${quoteAddress}"}
              tradeAmountUsd: {gt: 10}
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
    })
      .then((res) => res.json())
      .then(res => 
        {
          console.log(res)
          return res
        
        })

}catch(err){
  console.log(err);
}
})





/*

 const CHART_DATA =  gql`
  query chart{
ethereum(network: bsc) {
dexTrades(
options: {limit: 1000, asc: "timeInterval.minute"}
date: {since: "2021-10-29"}
exchangeName: {in:["Pancake","Pancake v2"]}
baseCurrency: {is: "0xe87e15b9c7d989474cb6d8c56b3db4efad5b21e8"}
quoteCurrency: {is: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"}p
) {
timeInterval {
  minute(count: 5)
}
baseCurrency {
  symbol
  address
}
baseAmount
quoteCurrency {
  symbol
  address
}
quoteAmount
trades: count
quotePrice
maximum_price: quotePrice(calculate: maximum)
minimum_price: quotePrice(calculate: minimum)
open_price: minimum(of: block, get: quote_price)
close_price: maximum(of: block, get: quote_price)
}
}
}
`;

*/