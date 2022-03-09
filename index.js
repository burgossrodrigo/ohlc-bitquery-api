const express = require('express')
const bodyParse = require('body-parser')
require('isomorphic-fetch');

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

router.get('/', [], async (req, res) => {
    
    let changedData = []
    await fetch('https://graphql.bitquery.io', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "X-API-KEY": "XXX" },
        body: JSON.stringify({ query: `
        {
          ethereum(network: bsc) {
            dexTrades(
              options: {limit: 100, asc: "timeInterval.minute"}
              date: {since: "2020-11-01"}
              exchangeName: {in:["Pancake","Pancake v2"]}
              baseCurrency: {is: "0xe87e15b9c7d989474cb6d8c56b3db4efad5b21e8"}
              quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
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
        }` 
        }),
      })
      .then(res => res.json())
      .then(res => res.data.ethereum.dexTrades.map(chart =>{

    changedData.push({
      open: chart.open_price,
      high: chart.maximum_price,
      low: chart.minimum_price,
      close: chart.close_price
    });

    }));

    return res.json(changedData);


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