# API Specification

__Route 1__: /price/:{symbol}  
__Description__: price history of S&P 500 symbol  
__Route Parameter(s)__: symbol(string)  
__Query Parameter(s)__: None  
__Route Handler__: price(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { date (string), open (float), high (float), low (float), close (float), volume (int) }) }  
  

__Route 2__: /indexPrice/:{symbol}  
__Description__: current price three majory index: S&P 500, Dow, Nasdaq  
__Route Parameter(s)__: symbol(string)  
__Query Parameter(s)__: None  
__Route Handler__: indexPrice(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { price (float) }) }  


__Route 3__: /sector  
__Description__: Past 1 day and past 10 days change of each sector  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: all_sectors(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { sector (string), d1_change (string), d10_change (string) }) }  


__Route 4__: /sector/:{sector}  
__Description__: Past 1 day change of specified sector  
__Route Parameter(s)__: sector  
__Query Parameter(s)__: None  
__Route Handler__: sector(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { sector (string), d1_change (string) }) }  




__Route 5__: /sectorpage/upchange  
__Description__: stock with the top 5 increase  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: top_upchange(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { symbol (string), name (string), close (float), %change (string) }) }  


__Route 6__: /sectorpage/downchange  
__Description__: stock with the top 5 decrease  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: top_downchange(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { symbol (string), name (string), close (float), %change (string) }) }  


__Route 7__: /sectorpage/amplitude  
__Description__: stock with the top 5 day movement amplitude  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: top_amplitude(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { symbol (string), name (string), close (float), %Amplitude (string) }) }  


__Route 8__: /sectorpage/turnover  
__Description__: stock with the top 5 day turnover  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: top_turnover(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { symbol (string), name (string), close (float), %Turnover (string) }) }  






__Route 9__: /sectorpage/sector   
__Description__: sector with top 5 marketcap change  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: top_sector(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { sector (string), %SectorChange (string) }) }  


__Route 10__: /sectorpage/conditionsector  
__Description__: number of sectors with positive, negative, neutral change on marketcap  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: condition_sector(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { positive (int), negative (int), neutral (int) }) }  


__Route 11__: /sectorpage/industry  
__Description__: industry with top 5 change on marketcap  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: top_industry(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { industry (string), %IndustryChange (string) }) }  


__Route 12__: /sectorpage/conditionindustry  
__Description__: number of industries with positive, negative, neutral change on marketcap  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: condition_industry(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { positive (int), negative (int), neutral (int) }) }  


__Route 13__: /sectorpage/firstsector  
__Description__: top symbol change in top sector marketcap change   
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: first_sector(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { symbol (string), %Change (string) }) }   


__Route 14__: /sectorpage/conditionfirstsector  
__Description__: number of symbols with positive, negative, neutral change in top sector marketcap change  
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: condition_firstsector(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { positive (int), negative (int), neutral (int) }) }  


__Route 15__: /sectorpage/firstindustry  
__Description__: top symbol change in top industry marketcap change   
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: first_industry(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { symbol (string), %Change (string) })   


__Route 16__: /sectorpage/conditionfirstindustry  
__Description__: number of symbols with positive, negative, neutral change in top industry marketcap change   
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: condition_firstindustry(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { positive (int), negative (int), neutral (int) }) }  


__Route 17__: /stockpage/stock 
__Description__: stock info    
__Route Parameter(s)__: None  
__Query Parameter(s)__: None  
__Route Handler__: stock(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { symbol (string), shortName (string), exchange (string), sector (string), industry (string), fullTimeEmployees (int), longBusinessSummary (string), country (string) }) }  


__Route 18__: /stockpage/stockvssector/  
__Description__: stock price change versus sector price change     
__Route Parameter(s)__: symbol(string)  
__Query Parameter(s)__: None  
__Route Handler__: stock_outperformance_sector(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { Change (float) }) }  


__Route 19__: /stockpage/stockvsall/:{symbol}  
__Description__: stock price change versus s&p 500 price change   
__Route Parameter(s)__: symbol(string)  
__Query Parameter(s)__: None  
__Route Handler__: stock_outperformance_all(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { Change (float) }) }  


__Route 20__: /stockpage/stockranksector/:{symbol}  
__Description__: stock change rank in sector   
__Route Parameter(s)__: symbol(string)  
__Query Parameter(s)__: None  
__Route Handler__: stock_rank_sector(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { rank (float) }) }  


__Route 21__: /stockpage/stockrankall/:{symbol}  
__Description__: stock change rank in s&p 500    
__Route Parameter(s)__: symbol(string)  
__Query Parameter(s)__: None  
__Route Handler__: stock_rank_all(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { rank (float) }) }  


__Route22__: /search/prices/:{symbol}  
__Description__: current price three majory index: S&P 500, Dow, Nasdaq    
__Route Parameter(s)__: symbol(string)    
__Query Parameter(s)__: StartDate (string), EndDate (string)  
__Route Handler__: search_prices(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { date (string), symbol (string), open (float), close (float), high (float), close (high), low (float),, volume (int) }) }  


__Route 23__: /stockpage/stockmvssector/:{symbol}  
__Description__: volume versus sector avg volume  
__Route Parameter(s)__: symbol(string)  
__Query Parameter(s)__: None  
__Route Handler__: stock_momentum_sector(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { diff (float) }) }  


__Route 24__: /stockpage/stockmvsall/:{symbol}  
__Description__: volume versus s&p 500 avg volume   
__Route Parameter(s)__: symbol(string)    
__Query Parameter(s)__: None  
__Route Handler__: stock_momentum_all(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { diff (float) }) }  


__Route 25__: /stockpage/stockrankmsector/:{symbol}  
__Description__: current volume rank in sector   
__Route Parameter(s)__: symbol(string)    
__Query Parameter(s)__: None  
__Route Handler__: stock_rankm_sector(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { rank (float) }) }  


__Route 26__: /stockpage/stockrankmall/:{symbol}  
__Description__: current volume rank in sector S&P 500    
__Route Parameter(s)__: symbol(string)  
__Query Parameter(s)__: None  
__Route Handler__: stock_rankm_all(req, res)  
__Return Type__: JSON  
__Return Parameters__: { results (JSON array of { rank (float) }) }  

