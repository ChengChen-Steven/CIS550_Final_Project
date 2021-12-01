const config = require('./config.json')
const mysql = require('mysql');
const e = require('express');
const yahooStockPrices = require('yahoo-stock-prices');

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
          SELECT date_format(p.date, "%Y-%m-%d") as date, p.open, p.high, p.low, p.close, p.volume
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

// Route 2.1 (S&P 500)
// Route 2 (handler)
async function indexPrice(req, res) {
    // symbol = ^IXIC, ^DJI, ^GSPC
    const symbol = req.params.symbol
    if (symbol) {
        const price = await yahooStockPrices.getCurrentPrice(symbol);
        console.log(price);
        res.json({results: price})
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
               a1.change AS d1_change,
               (a1.close-a2.close)/a2.close AS d10_change
            FROM a AS a1
           INNER JOIN a AS a2
              ON a1.symbol = a2.symbol
             AND a1.rk = 1
             AND a2.rk = 11
    )
    SELECT f.sector,
           CONCAT(ROUND(100 * AVG(b.d1_change), 3), '%') AS d1_change,
           CONCAT(ROUND(100 * AVG(b.d10_change), 3), '%') AS d10_change
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


// Route a1 for SectorPage
async function top_upchange(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Close, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date) 
            FROM Price   
        )
    )
    SELECT fund.Symbol, fund.shortName AS Name, ROUND(target.Close, 2) AS Close, CONCAT(ROUND(target.Change*100, 2),'%') AS '%Change'
    FROM Fundamentals AS fund
    INNER JOIN target
    ON fund.symbol = target.symbol
    ORDER BY target.change DESC
    LIMIT 5;
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


// Route b2 for SectorPage
async function top_downchange(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Close, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date) 
            FROM Price   
        )
    )
    SELECT fund.Symbol, fund.shortName AS Name, ROUND(target.Close, 2) AS Close, CONCAT(ROUND(target.Change*100, 2),'%') AS '%Change'
    FROM Fundamentals AS fund
    INNER JOIN target
    ON fund.symbol = target.symbol
    ORDER BY target.change ASC
    LIMIT 5;
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


// Route c3 for SectorPage
async function top_amplitude(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Close, p.High, p.Low
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date) 
            FROM Price   
        )
    )
    SELECT fund.Symbol, fund.shortName AS Name, ROUND(target.Close, 2) AS Close, CONCAT(ROUND((target.High-target.Low)*100/target.Close, 2),'%') AS '%Amplitude'
    FROM Fundamentals AS fund
    INNER JOIN target
    ON fund.symbol = target.symbol
    ORDER BY ROUND((target.High-target.Low)*100/target.Close, 2) DESC
    LIMIT 5;
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


// Route d4 for SectorPage
async function top_turnover(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Close, p.Volume
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date) 
            FROM Price   
        )
    )
    SELECT fund.Symbol, fund.shortName AS Name, ROUND(target.Close, 2) AS Close, CONCAT(ROUND(target.Volume*100/fund.floatshares, 2),'%') AS '%Turnover'
    FROM Fundamentals AS fund
    INNER JOIN target
    ON fund.symbol = target.symbol
    ORDER BY ROUND(target.Volume*100/fund.floatshares, 2) DESC
    LIMIT 5;
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


// Route e5 for SectorPage
async function top_sector(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date) 
            FROM Price   
        )
    )
    SELECT fund.sector, CONCAT(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2),'%') AS '%SectorChange'
    FROM Fundamentals AS fund
    INNER JOIN target
    ON fund.symbol = target.Symbol
    GROUP BY fund.sector
    ORDER BY ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2) DESC
    LIMIT 5;
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


// Route f6 for SectorPage
async function condition_sector(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS (
        SELECT fund.sector, CONCAT(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2),'%') AS '%SectorChange',
           IF(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2)>0,1, 0 ) AS positive,
           IF(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2)<0,1, 0 ) AS negative
        FROM Fundamentals AS fund
        INNER JOIN target
        ON fund.symbol = target.Symbol
        GROUP BY fund.sector
        )
    SELECT SUM(positive) AS positive, SUM(negative) AS negative, COUNT(*)-SUM(positive)-SUM(negative) AS neutral
    FROM compute
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


// Route g7 for SectorPage
async function top_industry(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date) 
            FROM Price   
        )
    )
    SELECT fund.industry, CONCAT(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2),'%') AS '%IndustryChange'
    FROM Fundamentals AS fund
    INNER JOIN target
    ON fund.symbol = target.Symbol
    GROUP BY fund.industry
    ORDER BY ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2) DESC
    LIMIT 5;
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


// Route h8 for SectorPage
async function condition_industry(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS (
        SELECT fund.industry, CONCAT(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2),'%') AS '%IndustryChange',
           IF(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2)>0,1, 0 ) AS positive,
           IF(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2)<0,1, 0 ) AS negative
        FROM Fundamentals AS fund
        INNER JOIN target
        ON fund.symbol = target.Symbol
        GROUP BY fund.industry
        )
    SELECT SUM(positive) AS positive, SUM(negative) AS negative, COUNT(*)-SUM(positive)-SUM(negative) AS neutral
    FROM compute
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


// Route i9 for SectorPage
async function first_sector(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    )
    SELECT target.Symbol, CONCAT(ROUND(target.Change*100, 2),'%') AS '%Change'
    FROM Fundamentals AS fund
    INNER JOIN target
    ON fund.symbol = target.Symbol
    WHERE fund.sector = (
        SELECT fund.sector
        FROM Fundamentals AS fund
        INNER JOIN target
        ON fund.symbol = target.Symbol
        GROUP BY fund.sector
        ORDER BY ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2) DESC
        LIMIT 1
    )
    ORDER BY target.Change DESC
    LIMIT 5
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


// Route j10 for SectorPage
async function condition_firstsector(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS (
        SELECT target.Symbol, CONCAT(ROUND(target.Change*100, 2),'%') AS '%Change',
           IF(ROUND(target.Change*100, 2)>0,1, 0 ) AS positive,
           IF(ROUND(target.Change*100, 2)<0,1, 0 ) AS negative
        FROM Fundamentals AS fund
        INNER JOIN target
        ON fund.symbol = target.Symbol
        WHERE fund.sector = (
            SELECT fund.sector
            FROM Fundamentals AS fund
            INNER JOIN target
            ON fund.symbol = target.Symbol
            GROUP BY fund.sector
            ORDER BY ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2) DESC
            LIMIT 1
        )
    )            
    SELECT SUM(positive) AS positive, SUM(negative) AS negative, COUNT(*)-SUM(positive)-SUM(negative) AS neutral
    FROM compute
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


// Route k11 for SectorPage
async function first_industry(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    )
    SELECT target.Symbol, CONCAT(ROUND(target.Change*100, 2),'%') AS '%Change'
    FROM Fundamentals AS fund
    INNER JOIN target
    ON fund.symbol = target.Symbol
    WHERE fund.industry = (
        SELECT fund.industry
        FROM Fundamentals AS fund
        INNER JOIN target
        ON fund.symbol = target.Symbol
        GROUP BY fund.industry
        ORDER BY ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2) DESC
        LIMIT 1
    )
    ORDER BY target.Change DESC
    LIMIT 5
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


// Route l12 for SectorPage
async function condition_firstindustry(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS (
        SELECT target.Symbol, CONCAT(ROUND(target.Change*100, 2),'%') AS '%Change',
           IF(ROUND(target.Change*100, 2)>0,1, 0 ) AS positive,
           IF(ROUND(target.Change*100, 2)<0,1, 0 ) AS negative
        FROM Fundamentals AS fund
        INNER JOIN target
        ON fund.symbol = target.Symbol
        WHERE fund.industry = (
            SELECT fund.industry
            FROM Fundamentals AS fund
            INNER JOIN target
            ON fund.symbol = target.Symbol
            GROUP BY fund.industry
            ORDER BY ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2) DESC
            LIMIT 1
        )
    )            
    SELECT SUM(positive) AS positive, SUM(negative) AS negative, COUNT(*)-SUM(positive)-SUM(negative) AS neutral
    FROM compute
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

/////////////////////////////////////// Stock Page Update ///////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//route 1 search price for StockPage
async function search_prices(req, res) {
    const symbol = req.params.symbol
    // search for price history within the dates specified by user
    var query = `SELECT p.Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Symbol = '${symbol}'
                 ORDER BY p.Date DESC`
    if (req.query.StartDate && req.query.EndDate) {
        query = `SELECT p.Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Date > '${req.query.StartDate}' AND Date < '${req.query.StartDate}' AND Symbol = '${symbol}'
                 ORDER BY p.Date DESC`
    } else if (req.query.StartDate) {
        query = `SELECT p.Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Date > '${req.query.StartDate}' AND Symbol = '${symbol}'
                 ORDER BY p.Date DESC`
    } else if (req.query.EndDate) {
        query = `SELECT p.Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Date < '${req.query.StartDate}' AND Symbol = '${symbol}'
                 ORDER BY p.Date DESC`
    } else {
        query = `SELECT p.Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Symbol = '${symbol}'
                 ORDER BY p.Date DESC`
    }
    if (req.query.page && !isNaN(req.query.page)) {
        var pagesize = req.query.pagesize ? req.query.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query1 = `SELECT p.Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Symbol = '${symbol}'
                 ORDER BY p.Date DESC
                 LIMIT '${pagesize}' OFFSET '${offset_page_size}'`
        //res.json({results: query})
        connection.query(query1, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                res.json({ results: results })
            }
        });
    } else {
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


//route 2 stock specs for StockPage
async function stock(req, res) {
    // display details of specified stock
    const symbol = req.params.symbol
    var query = `
          SELECT symbol,shortName,exchange,sector,industry,fullTimeEmployees,longBusinessSummary, country
          FROM Fundamentals
          WHERE symbol = '${symbol}';`
            ;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else {
                res.json({ results: results })
            }
        });


}

//route 3 stock performance for StockPage
async function stock_outperformance_sector(req,res){
    const symbol = req.params.symbol
    var query = `
    WITH target AS (
        SELECT p.Symbol, f.Sector, p.Change
        FROM Price p JOIN Fundamentals f ON p.Symbol = f.Symbol
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS(
        SELECT f.Sector, AVG(p.Change) AS sectorChange
        FROM Price p JOIN Fundamentals f ON f.Symbol = p.Symbol
        WHERE p.Date = (
            SELECT MAX(Date)
            FROM Price
        )
        group by f.Sector
    )
    SELECT t.Change - cp.sectorChange AS beatBySector
    FROM target t JOIN compute cp ON t.Sector = cp.Sector
    WHERE t.Symbol = '${symbol}';
    `;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}


//route 4 stock performance vs SP500 for StockPage
async function stock_outperformance_all(req,res){
    const symbol = req.params.symbol
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS(
        SELECT AVG(p.Change) AS avgChange
        FROM Price p
        WHERE p.Date = (
            SELECT MAX(Date)
            FROM Price
        )
    )
    SELECT t.Change - cp.avgChange AS beatByAll
    FROM target t JOIN compute cp
    WHERE t.Symbol = '${symbol}';
    `;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}

//route 5 stock rank in sector for StockPage
async function stock_rank_sector(req,res){
    const symbol = req.params.symbol
    var query = `
    WITH target AS (
        SELECT p.Symbol, f.Sector, p.Change
        FROM Price p JOIN Fundamentals f ON p.Symbol = f.Symbol
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS(
        SELECT t.Symbol, t.Sector, t.Change
        FROM target t JOIN Fundamentals f ON f.Sector = t.Sector
        WHERE f.Symbol = '${symbol}'
    )
    SELECT COUNT(*) AS sectorRank
    FROM compute cp
    WHERE cp.Change > (SELECT t.Change FROM target t WHERE t.Symbol = '${symbol}');
    `;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}

//route 6 stock rank in SP500 for StockPage
async function stock_rank_all(req,res){
    const symbol = req.params.symbol
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Change
        FROM Price p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    )
    SELECT COUNT(*) AS allRank
    FROM target t
    WHERE t.Change > (SELECT t.Change FROM target t WHERE t.Symbol = '${symbol}');
    `;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}

//route 7 stock momentum vs sector for StockPage
async function stock_momentum_sector(req,res){
    const symbol = req.params.symbol
    var query = `
    WITH target AS (
        SELECT p.Symbol, f.Sector, p.Volume
        FROM Price p JOIN Fundamentals f ON p.Symbol = f.Symbol
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS(
        SELECT f.Sector, AVG(p.Volume) AS sectorVolume
        FROM Price p JOIN Fundamentals f ON f.Symbol = p.Symbol
        WHERE p.Date = (
            SELECT MAX(Date)
            FROM Price
        )
        group by f.Sector
    )
    SELECT t.Volume - cp.sectorVolume AS volumeBeat
    FROM target t JOIN compute cp ON t.Sector = cp.Sector
    WHERE t.Symbol = '${symbol}';
    `;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}


//route 8 stock performance vs SP500 for StockPage
async function stock_momentum_all(req,res){
    const symbol = req.params.symbol
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Volume
        FROM Price p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS(
        SELECT AVG(p.Volume) AS avgVolume
        FROM Price p
        WHERE p.Date = (
            SELECT MAX(Date)
            FROM Price
        )
    )
    SELECT t.Volume - cp.avgVolume AS volumeBeatAll
    FROM target t JOIN compute cp
    WHERE t.Symbol = '${symbol}';
    `;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}

//route 9 stock rank in sector for StockPage
async function stock_rankm_sector(req,res){
    const symbol = req.params.symbol
    var query = `
    WITH target AS (
        SELECT p.Symbol, f.Sector, p.Volume
        FROM Price p JOIN Fundamentals f ON p.Symbol = f.Symbol
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS(
        SELECT t.Symbol, t.Sector, t.Volume
        FROM target t JOIN Fundamentals f ON f.Sector = t.Sector
        WHERE f.Symbol = '${symbol}'
    )
    SELECT COUNT(*) AS volumeRankSector
    FROM compute cp
    WHERE cp.Volume > (SELECT t.Volume FROM target t WHERE t.Symbol = '${symbol}');
    `;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}

//route 10 stock rank in SP500 for StockPage
async function stock_rankm_all(req,res){
    const symbol = req.params.symbol
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Volume
        FROM Price p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    )
    SELECT COUNT(*) AS volumeRankAll
    FROM target t
    WHERE t.Volume > (SELECT t.Volume FROM target t WHERE t.Symbol = '${symbol}');
    `;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.json({ error: error })
        } else if (results) {
            res.json({ results: results })
        }
    });
}

module.exports = {
    hello,
    price,
    indexPrice,
    sector,
    all_sectors,

    top_upchange,
    top_downchange,
    top_amplitude,
    top_turnover,
    top_sector,
    condition_sector,
    top_industry,
    condition_industry,
    first_sector,
    condition_firstsector,
    first_industry,
    condition_firstindustry,

    search_prices,
    stock,
    stock_outperformance_sector,
    stock_outperformance_all,
    stock_rank_sector,
    stock_rank_all,
    stock_momentum_sector,
    stock_momentum_all,
    stock_rankm_sector,
    stock_rankm_all
}
