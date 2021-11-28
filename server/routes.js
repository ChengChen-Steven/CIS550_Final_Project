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

/////////////////////////////////////// HW2  ///////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Route 2 (handler)
async function jersey(req, res) {
    const colors = ['red', 'blue']
    const jersey_number = Math.floor(Math.random() * 20) + 1
    const name = req.query.name ? req.query.name : "player"

    if (req.params.choice === 'number') {
        // TODO: TASK 1: inspect for issues and correct 
        res.json({ message: `Hello, ${name}!`, jersey_number: jersey_number })
    } else if (req.params.choice === 'color') {
        var lucky_color_index = Math.floor(Math.random() * 2);
        // TODO: TASK 2: change this or any variables above to return only 'red' or 'blue' at random (go Quakers!)
        res.json({ message: `Hello, ${name}!`, jersey_color: colors[lucky_color_index] })
    } else {
        // TODO: TASK 3: inspect for issues and correct
        res.json({ message: `Hello, ${name}, we like your jersey!` })
    }
}

// Route 3 (handler)
async function all_matches(req, res) {
    // TODO: TASK 4: implement and test, potentially writing your own (ungraded) tests
    // We have partially implemented this function for you to 
    // parse in the league encoding - this is how you would use the ternary operator to set a variable to a default value
    // we didn't specify this default value for league, and you could change it if you want! 
    const league = req.params.league ? req.params.league : 'D1'
    // use this league encoding in your query to furnish the correct results

    if (req.query.page && !isNaN(req.query.page)) {
        // This is the case where page is defined.
        // The SQL schema has the attribute OverallRating, but modify it to match spec! 
        // TODO: query and return results here:
        var pagesize = req.query.pagesize ? req.params.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query = `
          SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals    
          FROM Matches
          WHERE Division = '${league}'
          ORDER BY Home, Away
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
        // The SQL schema has the attribute OverallRating, but modify it to match spec! 
        // we have implemented this for you to see how to return results by querying the database
        var query = `
          SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals  
          FROM Matches 
          WHERE Division = '${league}'
          ORDER BY HomeTeam, AwayTeam;`
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

// Route 4 (handler)
async function all_players(req, res) {
    // TODO: TASK 5: implement and test, potentially writing your own (ungraded) tests
    if (req.query.page && !isNaN(req.query.page)) {
        var pagesize = req.query.pagesize ? req.params.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query = `
          SELECT PlayerId, Name, Nationality, OverallRating AS Rating, Potential, Club, Value
          FROM Players
          ORDER BY Name
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
          SELECT PlayerId, Name, Nationality, OverallRating AS Rating, Potential, Club, Value
          FROM Players
          ORDER BY Name;`
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
async function match(req, res) {
    // TODO: TASK 6: implement and test, potentially writing your own (ungraded) tests
    if (req.query.id && !isNaN(req.query.id)) {
        var query = `
          SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, 
                 FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals , 
                 HalfTimeGoalsH AS HTHomeGoals, HalfTimeGoalsA AS HTAwayGoals, 
                 ShotsH AS ShotsHome, ShotsA AS ShotsAway, 
                 ShotsOnTargetH AS ShotsOnTargetHome, ShotsOnTargetA AS ShotsOnTargetAway, 
                 FoulsH AS FoulsHome, FoulsA AS FoulsAway, 
                 CornersH AS CornersHome, CornersA AS CornersAway,
                 YellowCardsH AS YCHome, YellowCardsA AS YCAway, 
                 RedCardsH AS RCHome, RedCardsA AS RCAway
          FROM Matches
          WHERE MatchId = ${req.query.id};`
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
async function player(req, res) {
    // TODO: TASK 7: implement and test, potentially writing your own (ungraded) tests
    if (req.query.id && !isNaN(req.query.id)) {
        var query = `
          SELECT PlayerId, Name, Age, Photo, Nationality, Flag, 
                 OverallRating AS Rating, Potential, Club, ClubLogo, Value,
                 Wage, InternationalReputation, Skill, JerseyNumber, ContractValidUntil, 
                 Height, Weight, BestPosition, BestOverallRating, ReleaseClause,
                 GKPenalties, GKDiving, GKHandling, GKKicking, GKPositioning, GKReflexes 
          FROM Players
          WHERE PlayerId = ${req.query.id} 
          AND BestPosition = 'GK';`
            ;
        connection.query(query, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.json({ error: error })
            } else if (results.length == 1) {
                res.json({ results: results })
            } else if (results.length == 0) {
                var query2 = `
            SELECT PlayerId, Name, Age, Photo, Nationality, Flag, 
                   OverallRating AS Rating, Potential, Club, ClubLogo, Value,
                   Wage, InternationalReputation, Skill, JerseyNumber, ContractValidUntil, 
                   Height, Weight, BestPosition, BestOverallRating, ReleaseClause,
                   NPassing, NBallControl, NAdjustedAgility, NStamina, NStrength, NPositioning 
            FROM Players
            WHERE PlayerId = ${req.query.id} 
            AND BestPosition <> 'GK';`
                    ;
                connection.query(query2, function (error, results, fields) {
                    if (error) {
                        console.log(error)
                        res.json({ error: error })
                    } else if (results) {
                        res.json({ results: results })
                    }
                });
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
async function search_matches(req, res) {
    // TODO: TASK 8: implement and test, potentially writing your own (ungraded) tests
    // IMPORTANT: in your SQL LIKE matching, use the %query% format to match the search query to substrings, not just the entire string    
    var query1 = "SELECT MatchId, Date, Time, HomeTeam AS Home, AwayTeam AS Away, FullTimeGoalsH AS HomeGoals, FullTimeGoalsA AS AwayGoals FROM Matches "
    var query2 = " ORDER BY Home, Away"
    if (req.query.Home && req.query.Away) {
        var where_clause = "WHERE HomeTeam LIKE '" + req.query.Home + "%' AND " + " AwayTeam LIKE '" + req.query.Away + "%'"
    } else if (req.query.Home) {
        var where_clause = "WHERE HomeTeam LIKE '" + req.query.Home + "%'"
    } else if (req.query.Away) {
        var where_clause = "WHERE AwayTeam LIKE '" + req.query.Away + "%'"
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
async function search_players(req, res) {
    // TODO: TASK 9: implement and test, potentially writing your own (ungraded) tests
    // IMPORTANT: in your SQL LIKE matching, use the %query% format to match the search query to substrings, not just the entire string
    var query1 = "SELECT PlayerId, Name, Nationality, OverallRating AS Rating, Potential, Club, Value From Players WHERE "
    var cond1 = req.query.Name ? " AND Name LIKE '" + req.query.Name + "%'" : ""
    var cond2 = req.query.Nationality ? " AND Nationality = '" + req.query.Nationality + "'" : ""
    var cond3 = req.query.Club ? " AND Club = '" + req.query.Club + "'" : ""
    var cond4 = req.query.RatingLow ? " OverallRating >= " + req.query.RatingLow : " OverallRating >= 0 "
    var cond5 = req.query.RatingHigh ? " AND OverallRating <= " + req.query.RatingHigh : " AND OverallRating <= 100 "
    var cond6 = req.query.PotentialLow ? " AND Potential >= " + req.query.PotentialLow : " AND Potential >= 0 "
    var cond7 = req.query.PotentialHigh ? " AND Potential <= " + req.query.PotentialHigh : " AND Potential <= 100 "
    var query2 = " ORDER BY Name "

    if (req.query.page && !isNaN(req.query.page)) {
        var pagesize = req.query.pagesize ? req.params.pagesize : 10
        var offset_page_size = pagesize * (req.query.page - 1)
        var query3 = " LIMIT " + pagesize + " OFFSET " + offset_page_size
        var query = query1 + cond4 + cond5 + cond6 + cond7 + cond1 + cond2 + cond3 + query2 + query3
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
        var query = query1 + cond4 + cond5 + cond6 + cond7 + cond1 + cond2 + cond3 + query2
        //res.json({results: query})
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
    top_amplitude,
    top_turnover,
    top_sector,
    condition_sector,
    top_industry,
    condition_industry,
    first_sector,
    condition_firstsector,
    first_industry,
    condition_firstindustry


}