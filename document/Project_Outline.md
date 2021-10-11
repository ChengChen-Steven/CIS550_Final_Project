### CIS 550 Project Proposal  
https://github.com/ChengChen-Steven/CIS550_Final_Project/blob/main/document/Project_Proposal.md 
<br><br>


### __Table of Contents__
- [1. Motivation for the idea/description of the problem the application solves](#1-motivation-for-the-idea/description-of-the-problem-the-application-solves)
- [2. List of features you will definitely implement in the application](#2-list-of-features-you-will-definitely-implement-in-the-application)
- [3. List of features you might implement in the application, given enough time](#3-list-of-features-you-might-implement-in-the-application,-given-enough-time)
- [4. List of pages the application will have and a 1-2 sentence description of each page](#4-list-of-pages-the-application-will-have-and-a-1-2-sentence-description-of-each-page)
- [5. ER diagram](#5-ER-diagram)
- [6. SQL DDL for creating the database](#6-SQL-DDL-for-creating-the-database)
- [7. Explanation of how you will clean and pre-process the data](#7-explanation-of-how-you-will-clean-and-pre-process-the-data)
- [8. List of technologies you will use](#8-list-of-technologies-you-will-use)
- [9. Description of what each group member will be responsible for](#9-description-of-what-each-group-member-will-be-responsible-for)

<br>

### __1. Motivation for the idea/description of the problem the application solves__

Nowadays we have seen plenty of stock trading apps and stock information sites in the market but they are getting more and more complex and heavyweight as we use them. We are trying to build a simple but useful site for people to look up and track the stock performance of the companies of their choice. We will have a clean and easy-to-read dashboard for people to customize their own portfolio/watchlist and obtain useful information for the stocks on the website. <br><br>

### __2. List of features you will definitely implement in the application__

* __Feature #1__: An overview of SP500 market performance by industry
* __Feature #2__: A side-to-side comparison for people to view a key metrics comparison between two (or more) stocks
* __Feature #3__: A stock filtering page to filter candidate stocks based on specified criterias 
* __Feature #4__: A detailed page includes specific information for any specific stock in SP500 <br><br>

### __3. List of features you might implement in the application, given enough time__

* A recommendation engine that provides recommendation to users for similar stocks and popular companies
* User authentification and user-level information
* News feed for each specific stock 
<br><br>

### __4. List of pages the application will have and a 1-2 sentence description of each page__
* __Home Page__: market overview of index such as S&P500 and performance chart
* __Stock Screener__: a stock screening page to select stock based on different criterias  
* __Detail Page__: a display of full details of each stock and their financial performance
* __Comparison Page__: a side-to-side comparison to show people of any two stocks they like to compare
* __Watchlist Page__: a dynamic customized watchlist for user to add/delete stocks they follow
<br><br>

### __5. ER diagram__
![ER Diagram (use pandoc in vs code to render)](/document/material/er_diagram.png)

### __6. SQL DDL for creating the database__
* __Fundamentals__ (symbol, description, name, asset_type, exchange, currency, country, sector, industry, trailingPE, forwardPE, PEG, beta, 52wkhigh, 52wklow, pct_insider, pct_institution, analyst_target, marketcap, profit_margin, short_ratio, PS, PB, book_value)
* __Stock_Price__ (symbol, date, open, high, low, close, volume, macd, rsi)
* __Stock_News__ (symbol, date, content, sentiment)
<br><br>

### __7. Explanation of how you will clean and pre-process the data__
* We will implement a python program to perform the data processing.
* __Step 1__: Put together a list of all the tickers that we want to input into our tables in the server and the time interval that we would like to use to extract our data. 
* __Step 2__: Establish a database instance on AWS and then make connection to the server.
* __Step 3__: Perform a fetch request to the Alpha Vantage API to obtain the all the related stock data and export as a csv file in local drive (we will have a 12 second interval between each api call because the API allows only 5 calls per minute for free account)
* __Step 4__: Create a table in our database that contains columns with fields like ticker, date, price, high, low, etc.
* __Step 5__: Insert data from csv file for each ticker in the list into the table and remove any rows with empty fields or illegal format of data.
* __Step 6__: We think our data should be naturally straightforward with a unique ticker for each stock and all basic required data field in correct format.
* __Step 7__: Perform step 1,3,4,5 for a list of all industries of SP500 to generate a data table for industries and companies in each industry.
* __Step 8__: Make sure that the name of data fields in two tables are consisten(such as ticker/company name,etc.)<br><br>
 
### __8. List of technologies you will use__
* __Front-end__: React 
* __Back-end__: NodeJs Express, Python for data processing
* __Database__: MySQL & MongoDB hosted on AWS
<br><br>

### __9. Description of what each group member will be responsible for__
* Wenting Zhao, backend, frontend <br>
* Ruikang Liu, data processing, front-end <br>
* Puran Zhang, data process & backend, frontend  <br>
* Cheng Chen, data processing, frontend <br><br>
