const express = require('express');
const mysql = require('mysql');


const routes = require('./routes')
const config = require('./config.json')
const cors = require('cors');


const app = express();
app.use(cors({
    origin: '*'
}));

// Route 1 - register as GET 
app.get('/hello', routes.hello)


// Route 2 - register as GET 
app.get('/price/:symbol', routes.price)
app.get('/indexPrice/:symbol', routes.indexPrice)


// Route 3 - register as GET 
app.get('/sector/:sector', routes.sector)
app.get('/sector', routes.all_sectors)


// Route 4 - Search Stock
app.get('/stocks',routes.all_stocks)
// http://localhost:8080/stocks
// http://localhost:8080/stocks/?page=1&pagesize=3

app.get('/search/stocks', routes.search_stocks)
//http://localhost:8080/search/stocks/?Sector=Healthcare
//http://localhost:8080/search/stocks/?Size=SmallCap

app.get('/stocks', routes.ticker)


//Route 5 for SectorPage
app.get('/sectorpage/upchange', routes.top_upchange)
app.get('/sectorpage/downchange', routes.top_downchange)

app.get('/sectorpage/maxdropdown', routes.top_maxdropdown)
app.get('/sectorpage/turnover', routes.top_turnover)
app.get('/sectorpage/sector', routes.top_sector)
app.get('/sectorpage/conditionsector', routes.condition_sector)
app.get('/sectorpage/industry', routes.top_industry)
app.get('/sectorpage/conditionindustry', routes.condition_industry)
app.get('/sectorpage/firstsector', routes.first_sector)
app.get('/sectorpage/conditionfirstsector', routes.condition_firstsector)
app.get('/sectorpage/firstindustry', routes.first_industry)
app.get('/sectorpage/conditionfirstindustry', routes.condition_firstindustry)
app.get('/sectorpage/stockcondition', routes.stock_condition)


app.get('/stock/:symbol',routes.stock)
app.get('/stockoutperform/:symbol',routes.stock_outperformance)
app.get('/search/pricesreverse/:symbol', routes.search_prices_reversal)



app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;
