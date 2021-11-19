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
    sector,
    all_sectors,
    //all_industry,
    //jersey,
    //all_matches,
    //all_players,
    //match,
    //player,
    //search_matches,
    //search_players
}