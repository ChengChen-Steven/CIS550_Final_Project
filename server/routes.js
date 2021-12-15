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
    SELECT fund.Symbol, ROUND(target.Close, 2) AS Close, CONCAT(ROUND(target.Change*100, 2),'%') AS vary
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
    SELECT fund.Symbol, ROUND(target.Close, 2) AS Close, CONCAT(ROUND(target.Change*100, 2),'%') AS vary
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

async function top_maxdropdown(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol, p.Close, p.High, p.Low
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date) 
            FROM Price   
        )
    )
    SELECT fund.Symbol, ROUND(target.Close, 2) AS Close, CONCAT(ROUND((target.High-target.Low)*100/target.Close, 2),'%') AS MaxDropDown
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
    SELECT fund.Symbol, ROUND(target.Close, 2) AS Close, CONCAT(ROUND(target.Volume*100/fund.floatshares, 2),'%') AS Turnover
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
    SELECT SUBSTRING(fund.sector, 1, 14) AS Sector, CONCAT(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2),'%') AS SectorChange
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
        SELECT SUBSTRING(fund.sector, 1, 14) AS Sector, CONCAT(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2),'%') AS SectorChange,
           IF(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2)>0,1, 0 ) AS positive,
           IF(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2)<0,1, 0 ) AS negative
        FROM Fundamentals AS fund
        INNER JOIN target
        ON fund.symbol = target.Symbol
        GROUP BY fund.sector
        )
    SELECT SUM(positive) AS positive, SUM(negative) AS negative, COUNT(*) AS total
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
    SELECT SUBSTRING(fund.industry, 1, 14) AS Industry, CONCAT(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2),'%') AS IndustryChange
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
        SELECT SUBSTRING(fund.industry, 1, 14) AS Industry, CONCAT(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2),'%') AS IndustryChange,
           IF(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2)>0,1, 0 ) AS positive,
           IF(ROUND(SUM(target.Change*fund.marketcap*100)/SUM(fund.marketcap), 2)<0,1, 0 ) AS negative
        FROM Fundamentals AS fund
        INNER JOIN target
        ON fund.symbol = target.Symbol
        GROUP BY fund.industry
        )
    SELECT SUM(positive) AS positive, SUM(negative) AS negative, COUNT(*) AS total
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
        SELECT p.Symbol, p.Close, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    )
    SELECT target.Symbol AS Symbol, ROUND(target.Close, 2) AS Close, CONCAT(ROUND(target.Change*100, 2),'%') AS vary
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
        SELECT target.Symbol, CONCAT(ROUND(target.Change*100, 2),'%') AS vary,
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
    SELECT SUM(positive) AS positive, SUM(negative) AS negative, COUNT(*) AS total
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
        SELECT p.Symbol, p.Close, p.Change
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    )
    SELECT target.Symbol AS Symbol, ROUND(target.Close, 2) AS Close, CONCAT(ROUND(target.Change*100, 2),'%') AS vary
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
        SELECT target.Symbol, CONCAT(ROUND(target.Change*100, 2),'%') AS vary,
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
    SELECT SUM(positive) AS positive, SUM(negative) AS negative, COUNT(*) AS total
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

// Route m13 for SectorPage
async function stock_condition(req, res) {
    var query = `
    WITH target AS (
        SELECT p.Symbol,
        IF(ROUND(p.Change*100, 2)>0,1, 0 ) AS positive,
        IF(ROUND(p.Change*100, 2)<0,1, 0 ) AS negative        
        FROM Price AS p
        WHERE Date = (
            SELECT MAX(Date) 
            FROM Price   
        )
    )          
    SELECT SUM(positive) AS positive, SUM(negative) AS negative, COUNT(*) AS total
    FROM target
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
async function search_prices_reversal(req, res) {
    const symbol = req.params.symbol
    // search for price history within the dates specified by user
    var query = `SELECT date_format(p.date, "%Y-%m-%d") as Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Symbol = '${symbol}'
                 `
    if (req.query.StartDate && req.query.EndDate) {
        query = `SELECT date_format(p.date, "%Y-%m-%d") as Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Date > '${req.query.StartDate}' AND Date < '${req.query.EndDate}' AND Symbol = '${symbol}'
                 ORDER BY Date`
    } else if (req.query.StartDate) {
        query = `SELECT date_format(p.date, "%Y-%m-%d") as Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Date > '${req.query.StartDate}' AND Symbol = '${symbol}'
                 ORDER BY Date`
    } else if (req.query.EndDate) {
        query = `SELECT date_format(p.date, "%Y-%m-%d") as Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Date < '${req.query.EndDate}' AND Symbol = '${symbol}'
                 ORDER BY Date`
    } else {
        query = `SELECT date_format(p.date, "%Y-%m-%d") as Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Symbol = '${symbol}'
                 ORDER BY Date`
    }
    if (req.query.page && !isNaN(req.query.page)) {
        var pagesize = req.query.pagesize ? req.query.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query1 = `SELECT date_format(p.date, "%Y-%m-%d") as Date, p.Symbol, p.Open, p.Close, p.High, p.Low, p.Volume
                 FROM Price p
                 WHERE Symbol = '${symbol}'
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
          SELECT symbol,shortName,exchange,sector,industry,longBusinessSummary,fullTimeEmployees,country,fiftyTwoWeekHigh,fiftyTwoWeekLow,marketCap,trailingPE,priceToSalesTrailing12Months,returnOnEquity,pegRatio, enterpriseValue, bookValue, beta, trailingEps,priceToBook, heldPercentInstitutions
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
async function stock_outperformance(req,res){
    const symbol = req.params.symbol
    var query = `
    WITH target AS (
        SELECT p.Symbol, f.Sector, p.Change,p.Volume, AVG(p.Change) OVER() AS avgChange, AVG(p.Volume) OVER() AS avgVolume
        FROM Price p JOIN Fundamentals f ON p.Symbol = f.Symbol
        WHERE Date = (
            SELECT MAX(Date)
            FROM Price
        )
    ),
    compute AS(
        SELECT f.Sector, AVG(p.Change) AS sectorChange, AVG(p.Volume) AS sectorVolume
        FROM target p JOIN Fundamentals f ON f.Symbol = p.Symbol
        group by f.Sector
    )
    SELECT t.Change, t.Volume, t.Change - cp.sectorChange AS beatBySector, t.Volume - cp.sectorVolume AS beatVBySector, t.Change-t.avgChange AS beatByAll, t.Volume-t.avgVolume AS beatVByAll
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


//route 11 get a table of all stocks
async function all_stocks(req, res) {
    var query = `WITH temp AS (
        SELECT p.Symbol, p.Close AS Price, p.Change, p.Volume
        FROM Price AS p
        WHERE date = (SELECT MAX(Date) FROM Price)),
        MC AS (
            SELECT m.symbol, CASE 
            WHEN m.marketCap between 0 and 2000000000 then 'SmallCap' 
            WHEN m.marketCap between 2000000000 and 10000000000 then 'MidCap' 
            WHEN m.marketCap between 10000000000 and 100000000000 then 'LargeCap' 
            else 'MegaCap' 
            end as size 
            from Fundamentals AS m)
        SELECT row_number() OVER (ORDER BY f.symbol) NO, f.symbol AS Ticker, shortName AS Company, sector AS Sector, 
        industry AS Industry, country AS Country, size AS Size, ROUND(marketCap, 0) AS MarketCap,
        ROUND(trailingPE, 2) AS PE, ROUND(Price, 2) AS Price, 
        CONCAT(ROUND(100.00 * temp.Change, 2), '%') AS 'Change', ROUND(temp.Volume, 0) AS Volume
        FROM Fundamentals AS f
        INNER JOIN temp ON temp.Symbol = f.symbol
        INNER JOIN MC ON MC.Symbol = f.symbol
        ORDER BY f.symbol`
    if (req.query.page && !isNaN(req.query.page)) {
        const page = req.query.page
        const pagesize = req.query.pagesize ? req.query.pagesize : 20
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results) {
                const paginatedData = results.slice(pagesize * (page - 1), pagesize * page)
                res.json({ results: paginatedData})
            }
        })
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

//route 12 select a certain ticker
async function ticker(req, res) {
    if (req.query.ticker && !isNaN(req.query.ticker)) {
        var query = `
            WITH temp AS (
                SELECT p.Symbol, p.Close AS Price, p.Change, p.Volume
                FROM Price AS p
                WHERE date = (SELECT MAX(Date) FROM Price)
            )
            SELECT row_number() OVER (ORDER BY f.symbol) NO, f.symbol AS Ticker, shortName AS Company, sector AS Sector, 
            industry AS Industry, country AS Country, ROUND(marketCap, 0) AS MarketCap,
            ROUND(trailingPE, 2) AS PE, ROUND(Price, 2) AS Price, 
            CONCAT(ROUND(100.00 * temp.Change, 2), '%') AS 'Change', ROUND(temp.Volume, 0) AS Volume
            FROM Fundamentals AS f
            INNER JOIN temp ON temp.Symbol = f.symbol
            WHERE f.symbol = ${req.query.ticker};`
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

//route 13 search stocks by applying some filters
async function search_stocks(req, res) {
    var query1 = "WITH temp AS (SELECT p.Symbol, p.Close AS Price, p.Change, p.Volume FROM Price AS p WHERE date = (SELECT MAX(Date) FROM Price)), MC AS (SELECT m.symbol, CASE WHEN m.marketCap between 0 and 2000000000 then 'SmallCap' when m.marketCap between 2000000000 and 10000000000 then 'MidCap' when m.marketCap between 10000000000 and 100000000000 then 'LargeCap' else 'MegaCap' end as size from Fundamentals AS m) SELECT row_number() OVER (ORDER BY f.symbol) NO, f.symbol AS Ticker, shortName AS Company, sector AS Sector, industry AS Industry, country AS Country, size AS Size, ROUND(f.marketCap, 0) AS MarketCap, ROUND(trailingPE, 2) AS PE, ROUND(Price, 2) AS Price, CONCAT(ROUND(100.00 * temp.Change, 2), '%') AS 'Change', ROUND(temp.Volume, 0) AS Volume FROM Fundamentals AS f INNER JOIN temp ON temp.Symbol = f.symbol INNER JOIN MC ON MC.Symbol = f.symbol"
    var cond1 = req.query.Ticker ? " AND f.symbol LIKE '" + req.query.Ticker + "%'" : ""
    var cond2 = req.query.Company ? " AND shortName LIKE '%" + req.query.Company + "%'" : ""
    var cond3 = req.query.Sector ? " AND sector = '" + req.query.Sector + "'" : ""
    var cond8 = req.query.Industry ? " AND industry LIKE '%" + req.query.Industry + "%'" : ""
    var cond9 = req.query.Country ? " AND country LIKE '%" + req.query.Country + "%'" : ""
    var cond10 = req.query.Size ? " AND MC.Size = '" + req.query.Size + "'" : ""
    var cond4 = req.query.PriceLow ? " Price >= " + req.query.PriceLow : " Price >= 0 "
    var cond5 = req.query.PriceHigh ? " AND Price <= " + req.query.PriceHigh : " AND Price <= 100 "
    var query2 = " ORDER BY f.symbol"
    if (req.query.page && !isNaN(req.query.page)) {
        var pagesize = req.query.pagesize ? req.params.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query3 = " LIMIT " + pagesize + " OFFSET " + offset_page_size
        var query = query1 + cond8 + cond9 + cond10 + cond1 + cond2 + cond3 + query2 + query3
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
        var query = query1 + cond8 + cond9 + cond10 + cond1 + cond2 + cond3 + query2
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


module.exports = {
    hello,
    price,
    indexPrice,
    sector,
    all_sectors,

    top_upchange,
    top_downchange,
    top_maxdropdown,
    top_turnover,
    top_sector,
    condition_sector,
    top_industry,
    condition_industry,
    first_sector,
    condition_firstsector,
    first_industry,
    condition_firstindustry,
    stock_condition,

    search_prices_reversal,
    stock,
    stock_outperformance,

    all_stocks,
    ticker,
    search_stocks
}
