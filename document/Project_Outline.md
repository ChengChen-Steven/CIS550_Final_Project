### CIS 550 Project Proposal 

1.Motivation for the idea/description of the problem the application solves

* Nowadays we have seen plenty of stock trading apps and stock information sites in the market but they are getting more and more complex and heavyweight as we use them. We are trying to build a simple but useful site for people to look up and track the stock performance of the companies of their choice. We will have a clean and easy-to-read dashboard for people to customize their own portfolio/watchlist and obtain useful information for the stocks on the website.

2. List of features you will definitely implement in the application

* Feature #1: An overview of SP500 Market Performance Filtered by Industry
* Feature #2: A dynamic table for people to add/remove companies they follow in Watchlist/Portfolio
* Feature #3: A side-to-side comparison for people to view a key metrics comparison between two stocks
* Feature #4: A detailed page includes specific information for any specific stock in SP500

3. List of features you might implement in the application, given enough time

* A recommendation engine that provides recommendation to users for similar stocks and popular companies
* User authentification
* News feed for each specific stock

4. List of pages the application will have and a 1-2 sentence description of each page
* Home Page: Market Overview of SP500 and Performance Chart
* Watchlist Page: Dynamic customized watchlist for user to add/delete stocks they follow
* Detail Page: A display of full details of each stock and their financial performance
* Comparison Page: A side-to-side comparison to show people of any two stocks they like to compare

5. ER diagram (TO BE UPDATED)

6. SQL DDL for creating the database
* create table stock: ticker, current price, daily low, daily high, volume, EPS, PE ratio...
* Create table industry: name, weighted average performance...

7.Explanation of how you will clean and pre-process the data
* We will implement a python program to perform the data processing.
* Step 1: Put together a list of all the tickers that we want to input into our tables in the server and the time interval that we would like to use to extract our data. 
* Step 2: Establish a database instance on AWS and then make connection to the server.
* Step 3: Perform a fetch request to the Alpha Vantage API to obtain the all the related stock data and export as a csv file in local drive (we will have a 12 second interval between each api call because the API allows only 5 calls per minute for free account)
* Step 4: Create a table in our database that contains columns with fields like ticker, date, price, high, low, etc.
* Step 5: Insert data from csv file for each ticker in the list into the table and remove any rows with empty fields or illegal format of data.
* step 6: We think our data should be naturally straightforward with a unique ticker for each stock and all basic required data field in correct format.
* step 7: Perform step 1,3,4,5 for a list of all industries of SP500 to generate a data table for industries and companies in each industry.
* Step 8: Make sure that the name of data fields in two tables are consisten(such as ticker/company name,etc.)
 
8.List of technologies you will use:
* Front End: React 
* Back End: NodeJs Express

9.Description of what each group member will be responsible for(TO BE UDPATED)
