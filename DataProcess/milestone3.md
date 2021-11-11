DDL: Tables as Quotes,  EarningCalendar, Fundamental
```SQL
create table Quotes
(
    symbol        varchar(20)   not null
        primary key,
    open          decimal(5, 2) null,
    close         decimal(5, 2) null,
    high          decimal(5, 2) null,
    low           decimal(5, 2) null,
    volume        int           null,
    changePercent decimal(5, 2) null
);
create table EarningCalendar
(
    symbol     varchar(20)  not null
        primary key,
    name       varchar(200) null,
    reportDate varchar(20)         null
);
create table Fundamental
(
    symbol  varchar(20)   not null
        primary key,
    name    varchar(200)  null,
    sector  varchar(20)   null,
    peratio decimal(5, 2) null,
    roe     decimal(5, 2) null,
    psratio decimal(5, 2) null
);
```
Query1: The top 5 gainers of each sector 
```SQL
with cte as (
    select f.sector, row_number() over (partition by f.sector order by q.changePercent desc) as rk
    from quotes as q
    inner join fundamental as f
    on q.symbol = f.symbol 
)
select sector, rk
from cte
where rk <= 5 
order by sector, rk
```

Query2: The top 5 losers of each sector
```SQL
with cte as (
    select f.sector, row_number() over (partition by f.sector order by q.changePercent asc) as rk
    from quotes as q
    inner join fundamental as f
    on q.symbol = f.symbol 
)
select sector, rk
from cte
where rk <= 5 
order by sector, rk
```

Query3: The top 10 gainers of the day for sector filtered by user:
```SQL
SELECT q.symbol AS ticker, c.Name AS company, q.changePercent AS percentage
FROM Quotes q join Fundamental c on q.Symbol = c.Symbol
WHERE c.sector = "Technology"
ORDER BY q.changePercent DESC
LIMIT 10
```

Query4: The top 10 losers of the day for the sector filtered by user
```SQL
SELECT q.symbol AS ticker, c.Name AS company, q.changePercent AS percentage
FROM Quotes q join Fundamental c on q.Symbol = c.Symbol
WHERE c.sector = "Technology"
ORDER BY q.changePercent
LIMIT 10
```

Query5: The distribution of top 100 most traded stocks across all sectors 
```SQL
WITH ac AS(
	SELECT q.symbol, c.sector
	FROM Quotes q join Fundamental c on q.Symbol = c.Symbol
	ORDER BY q.volume DESC
	LIMIT 100)
SELECT sector AS most_active, COUNT(*) AS freq FROM ac
GROUP BY sector
ORDER BY freq
```

Query6: The average return of the day for overvalued stocks in each sector
```SQL
WITH value AS(
	SELECT symbol, sector
	FROM Fundamental c
	WHERE c.psratio > 10 OR c.peratio > 100
	)
SELECT sector, AVG(q.changePercent)
FROM value join Quotes q on q.symbol = value.symbol
GROUP BY sector
```

Query7: The list of all the earnings coming up of popular stocks sorted by popularity
```SQL
WITH most_freq AS(
	SELECT symbol, volume
	FROM Quotes q
	ORDER BY q.volume DESC
	LIMIT 10)

SELECT ec.symbol, ec.name,ec.reportDate
FROM EarningCalendar ec JOIN most_freq ON ec.symbol = most_freq.symbol
ORDER BY most_freq.volume
```
