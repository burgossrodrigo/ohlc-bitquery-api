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

router.get('/:chain/:address/:from/:to/:resolution', [], async (req, res) => {

    const chain = req.query.chain;

    const baseAddress = req.params.address;

    const factoryAddress = () => {
      if(chain === 'ethereum'){
        return '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
      }

      if(chain === 'bsc'){
        return '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
      }
    };

    const quoteAddress = () => {
      if(chain === 'ethereum'){
        return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      }
      if(chain === 'bsc'){
        return '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
      }
    };

    const from = req.params.from;

    const to = req.params.to;

    const resolution = req.params.resolution;
    
    let changedData = []
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "BQYpMaOs1jlSOr3CQdT0yzQMdld6r8Mn"
      },
      mode: 'cors',
      body: JSON.stringify({
        query: `
            {
              ethereum(network: ${chain}) {
                dexTrades(
                  date: {between: ["${from}", "${to}"]}
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
            }
          `})
    })
      .then((res) => res.json())
      .then(res => res.data.ethereum.dexTrades.map(chart =>{
        
        /*
        var myDate = chart.timeInterval;
        myDate = myDate.split("-");
        var newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
        console.log(newDate.getTime());
        */

    changedData.push({
      time: Number(moment(chart.timeInterval.day).format('X')),
      low: chart.minimum_price,
      high: chart.maximum_price,
      open: Number(chart.open_price),
      close: Number(chart.close_price),
      volume: chart.trades
    });

    }));

    return res.json(changedData);


})

router.get('/hokk/:chain/:from/:to', [], async (req, res) => {
  const chain = req.query.chain;
  const factoryAddress = () => {
    if(chain === 'ethereum'){
      return '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
    }

    if(chain === 'bsc'){
      return '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
    }
  };

  const quoteAddress = () => {
    if(chain === 'ethereum'){
      return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    }
    if(chain === 'bsc'){
      return '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
    }
  };

  

  let changedData = []
    await fetch('https://graphql.bitquery.io', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "X-API-KEY": "BQYTYsxZMZA47wBr1PvuU8jYWieM3HSd" },
        body: JSON.stringify({ query: `
        {
          ethereum(network: bsc) {
            dexTrades(
              date: {between: ["${from}", "${to}"]}
              exchangeAddress: {is: "${factoryAddress}"}
              baseCurrency: {is: "0xe87e15b9c7d989474cb6d8c56b3db4efad5b21e8"}
              quoteCurrency: {is: "${quoteAddress}"}
            ) {
              exchange {
                name
              }
              timeInterval {
                day(count: 1)
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
              maximum_price: quotePrice(calculate: maximum)
              minimum_price: quotePrice(calculate: minimum)
              open_price: minimum(of: time, get: quote_price)
              close_price: maximum(of: time, get: quote_price)
              tradeAmount(in: USD, calculate: sum)
            }
          }
        }` 
        }),
      })
      .then(res => res.json())
      .then(res => res.data.ethereum.dexTrades.map(chart =>{
        
        /*
        var myDate = chart.timeInterval;
        myDate = myDate.split("-");
        var newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
        console.log(newDate.getTime());
        */

    changedData.push({
      time: Number(moment(chart.timeInterval.day).format('X')),
      low: chart.minimum_price,
      high: chart.maximum_price,
      open: Number(chart.open_price),
      close: Number(chart.close_price),
      volume: chart.trades
    });

    }));

    console.log(changedData);
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