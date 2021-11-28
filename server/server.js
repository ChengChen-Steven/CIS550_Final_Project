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


//Route 5 for SectorPage
app.get('/sectorpage/upchange', routes.top_upchange)
app.get('/sectorpage/downchange', routes.top_downchange)
app.get('/sectorpage/amplitude,', routes.top_amplitude)
app.get('/sectorpage/turnover', routes.top_turnover)
app.get('/sectorpage/sector', routes.top_sector)
app.get('/sectorpage/conitionsector', routes.condition_sector)
app.get('/sectorpage/industry', routes.top_industry)
app.get('/sectorpage/conditionindustry', routes.condition_industry)
app.get('/sectorpage/firstsector', routes.first_sector)
app.get('/sectorpage/conditionfirstsector', routes.condition_firstsector)
app.get('/sectorpage/firstindustry', routes.first_industry)
app.get('/sectorpage/conditionfirstindustry', routes.condition_firstindustry)

// Route 2 - register as GET 
//app.get('/industry/:choice', routes.jersey)

// Route 2 - register as GET 
//app.get('/jersey/:choice', routes.jersey)

// Route 3 - register as GET 
//app.get('/matches/:league', routes.all_matches)

// Route 4 - register as GET 
//app.get('/players', routes.all_players)

// Route 5 - register as GET 
//app.get('/match', routes.match)

// Route 6 - register as GET 
//app.get('/player', routes.player)

// Route 7 - register as GET 
//app.get('/search/matches', routes.search_matches)

// Route 8 - register as GET 
//app.get('/search/players', routes.search_players)





app.listen(config.server_port, () => {
    console.log(`Server running at http://${config.server_host}:${config.server_port}/`);
});

module.exports = app;