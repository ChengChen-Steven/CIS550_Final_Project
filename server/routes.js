const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');

// TODO: fill in your connection details here
const connection = mysql.createConnection({
    host: config.rds_host,
    user: config.rds_user,
    password: config.rds_password,
    port: config.rds_port,
    database: config.rds_db
});
connection.connect();


// ********************************************
//            SIMPLE ROUTE EXAMPLE
// ********************************************

// Route 1 (handler)
async function hello(req, res) {
    // a GET request to /hello?name=Steve
    if (req.query.name) {
        res.send(`Hello, ${req.query.name}! Welcome to the Stock Trading App!`)
    } else {
        res.send(`Hello! Welcome to the Stock Trading App!`)
    }
}

// Route 2 (handler)
async function price(req, res) {
    const symbol = req.params.symbol
    if (symbol) {
        var query = `
          SELECT p.symbol, p.open, p.high, p.low, p.close
            FROM Price AS p
           WHERE symbol = '${symbol}';        
          `
            ;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    } else {
        res.json([])
    }
}


// Route 3 (handler)
async function sector(req, res) {
    const sector = req.params.sector 
    if (sector) {
        var query = `
          WITH cte AS (
              SELECT p.Symbol, p.Change
                FROM Price AS p
               WHERE date = (SELECT MAX(Date) FROM Price)
          )
          SELECT f.sector, CONCAT(ROUND(100 * AVG(cte.Change), 3), '%') AS day_change
            FROM Fundamentals AS f
           INNER JOIN cte
              ON cte.symbol = f.symbol
             AND f.sector = '${sector}';        
          `
            ;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    } else {
        res.json([])
    }
}

// Route 4 (handler)
async function all_sectors(req, res) {
    var query = `
      WITH a AS (
          SELECT symbol, date, p.close, p.change, 
                 ROW_NUMBER() over (PARTITION BY symbol ORDER BY date desc) as rk
            FROM Price AS p
           WHERE DATEDIFF((SELECT MAX(Date) FROM Price), date) <= 20
      ), b AS (
          SELECT a1.symbol,
               a1.change AS 1d_change,
               (a1.close-a2.close)/a2.close AS 10d_change
            FROM a AS a1
           INNER JOIN a AS a2
              ON a1.symbol = a2.symbol
             AND a1.rk = 1
             AND a2.rk = 11
    )
    SELECT f.sector,
           CONCAT(ROUND(100 * AVG(b.1d_change), 3), '%') AS 1d_change,
           CONCAT(ROUND(100 * AVG(b.10d_change), 3), '%') AS 10d_change
      FROM Fundamentals AS f
     INNER join b
        ON f.symbol = b.symbol
     GROUP BY f.sector;      
          `
        ;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////// HW2  ///////////////////////////////////////////////////////////////

// Route 3 (handler)
async function all_price(req, res) {
    //

    if (req.query.page && !isNaN(req.query.page)) {
        // This is the case where page is defined.
        const symbol = req.params.symbol
        var pagesize = req.query.pagesize ? req.params.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query = `
          SELECT p.symbol, p.open, p.high, p.low, p.close
          FROM Price AS p
          WHERE symbol = '${symbol}';
          LIMIT ${pagesize}
          OFFSET ${offset_page_size};
          `
            ;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });

    } else {
        var query = `
          SELECT p.symbol, p.open, p.high, p.low, p.close
          FROM Price AS p
          WHERE symbol = '${symbol}';`;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }
}

// Route 4 (handler)
async function all_stocks(req, res) {
    // info of all stocks in database
    if (req.query.page && !isNaN(req.query.page)) {
        var pagesize = req.query.pagesize ? req.params.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query = `
          SELECT symbol, shortName AS name, sector, country,
          FROM Fundamentals
          ORDER BY symbol
          LIMIT ${pagesize}
          OFFSET ${offset_page_size};`
            ;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    } else {
        var query = `
          SELECT symbol, shortName AS name, sector, country
          FROM Fundamentals
          ORDER BY symbol;`
            ;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }
}


// ********************************************
//             MATCH-SPECIFIC ROUTES
// ********************************************

// Route 5 (handler)
async function price(req, res) {
    // TODO: TASK 6: implement and test, potentially writing your own (ungraded) tests
    if (req.query.symbol && !isNaN(req.query.symbol)) {
        var query = `
          SELECT p.Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume, p.Change AS PercentChange, p.DIF AS PriceChange
          FROM Price p
          WHERE symbol = ${req.query.symbol};`
            ;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    } else {
        res.json([])
    }
}

// ********************************************
//            PLAYER-SPECIFIC ROUTES
// ********************************************

// Route 6 (handler)
async function stock(req, res) {
    // display details of specified stock
    if (req.query.id && !isNaN(req.query.id)) {
        var query = `
          SELECT symbol,shortName,exchange,sector,industry,fullTimeEmployees,longBusinessSummary, country
          FROM Fundamentals
          WHERE symbol = ${req.query.symbol};`
            ;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else {
                res.json({ results: results })
            }
        });
    } else {
        res.json([])
    }

}


// ********************************************
//             SEARCH ROUTES
// ********************************************

// Route 7 (handler)
async function search_prices(req, res) {
    // search for price history within the dates specified by user
    var query1 = "SELECT p.Date, p.Symbol, p.Open, p.Close, p.High, p.Close, p.Volume FROM Price p"
    var query2 = " ORDER BY Date"
    if (req.query.StartDate && req.query.EndDate) {
        var where_clause = "WHERE Date > '" + req.query.StartDate + " AND " + " Date <'" + req.query.EndDate
    } else if (req.query.StartDate) {
        var where_clause = "WHERE Date > '" + req.query.StartDate
    } else if (req.query.EndDate) {
        var where_clause = "WHERE Date < '" + req.query.EndDate
    } else {
        var where_clause = ""
    }
    if (req.query.page && !isNaN(req.query.page)) {
        var pagesize = req.query.pagesize ? req.params.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query3 = " LIMIT " + pagesize + " OFFSET " + offset_page_size
        var query = query1 + where_clause + query2 + query3
        //res.json({results: query})
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    } else {
        var query = query1 + where_clause + query2
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    }
}

// Route 8 (handler)
async function search_stocks(req, res) {
    // search result for specific stock filter conditions
    var query1 = "SELECT  symbol,shortName,exchange,sector,industry,fullTimeEmployees,longBusinessSummary, country FROM Fundamentals WHERE "
    var cond1 = req.query.symbol ? " symbol LIKE '" + req.query.symbol + "%'" : ""
    var cond2 = req.query.exchange ? " AND exchange = '" + req.query.exchange + "'" : ""
    var cond3 = req.query.sector ? " AND sector = '" + req.query.sector + "'" : ""
    var cond4 = req.query.country ? " AND country = '" + req.query.country + "'" : ""
    var query2 = " ORDER BY Symbol "

    if (req.query.page && !isNaN(req.query.page)) {
        var pagesize = req.query.pagesize ? req.params.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query3 = " LIMIT " + pagesize + " OFFSET " + offset_page_size
        var query = query1 + cond1 + cond2 + cond3 + cond4
        res.json({ results: query })
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    } else {
        res.json([])
    }

}

module.exports = {
    hello,
    price,
    sector,
    all_sectors,
    all_price,
    all_stocks
    stock,
    price,
    search_prices,
    search_stocks
    //all_industry,
    //jersey,
    //all_matches,
    //all_players,
    //match,
    //player,
    //search_matches,
    //search_players
}