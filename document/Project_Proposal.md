### CIS 550 Project Proposal
<br>


### __Table of Contents__

- [1. Team Member](#1-team-member)
- [2. Application Description](#2-application-description)
- [3. Dataset Overview](#3-dataset-overview)
    - [3.1 Data Source](#31-data-source)
    - [3.2 Database Tables](#32-database-tables)
    - [3.3 Outlook](#33-outlook)
- [4. Example Queries](#4-example-queries)

<br>

### __1. Team Member__

* Wenting Zhao, Email: wentingz@seas.upenn.edu, GitHub: Wentinggg  <br>
* Ruikang Liu, Email: liurk@seas.upenn.edu,  GitHub: ruikangpenn  <br>
* Puran Zhang, Email: puran@seas.upenn.edu, GitHub: puran-debugger  <br>
* Cheng Chen, Email: cheng24@seas.upenn.edu, GitHub: ChengChen-Steven  <br><br>


### __2. Application Description__
The application we are building is a multifunctional web app that allows users to quickly retrieve information of stock price, financials and other key stats for the companies of their choice. The app will also provide service for users to search similar stocks to follow or push recommendation of stocks/news to users based on their preference. <br><br>


### __3. Dataset Overview__
#### __3.1 Data Source__
We will use a dataset from financial market sites API like Yahoo Finance/AlphaVantage and a dataset from financial news sites API like twitter/bloomberg to filter data to actively inform users with price alert and news/tweets of the companies they follow.

We will fetch data from a variety of datasource, including but not limitted to the following:

__Yahoo Finance API:__
* Description: API that contains stock price information and company information
* Link: https://github.com/ranaroussi/yfinance 

__Alpha Vantage API:__
* Description: API that contains stock price information and company information. 
* Link: https://www.alphavantage.co/support/#api-key 

__Twitter Developer API:__ 
* Description: API developed by Twitter where we can search for the related tweets and news about a stock on Twitter, which can be further used for sentiment calculation and news feed information retrieval: 
* Link: https://developer.twitter.com/en/products/twitter-api/enterprise 

__Google Trends API:__ 
* Description: API developed by Google to provide some information on the popularity of the company
* Link: https://trends.google.com/trends/?geo=US 
<br><br>

#### __3.2 Database Tables__
We will create a few tables in our own database.
* Stock/Company basic information (MySQL or MongoDB). 
* Stock historical trading information (MySQL).
* Stock social feed information and news feed information (MySQL or MongoDB).
* (TBD) User-level information, login credentials, login history, favoriate stocks, portfolio management. (MySQL or MongoDB).
<br><br>

#### __3.3 Outlook__
Our data collection process is very chanlleging given the complexity in data source unification, data quality sanity check, api reliability, job scheduling and failure retry. Considering different API might have constrains in usage, we will change our data injection accordingly based on the requirement so that we can retain some resilience should error happens. 

In our application, we currently won't focus on intra-day minute level data availability given the resource restriction, we will first fetch data after the market closes on each trading day. So we will schedule a cronjob to fetch trading data from the data sources on a daily basis, and first inject the data into our database. Our application will utilize trading data directly from the our own database. 

We will likely start from a subset of US stocks, for example S&P 500 and later on ramp to all US stocks. In the future, we will consider the expansion to other asset categories, for example, international stocks, Gold/Silver, Futures, Crypto, OTC. We will also consider to integrate with intra-day data and possibly enable trading API to place asset orders. In the meantime, we will be exploring some open source information that we can collect from different sources. <br><br>

### __4. Example Queries__

__Query #1__: <br>
Search for specific stock/company basic information/updates based on user's condition filter.

__Query #2__: <br>
Inter join to get year-to-date cumulating return-on-investment of each stock.

__Query #3__: <br>
Select top/bottom 20 performing stocks of the latest trading day to display on homepage.

__Query #4__: <br>
Select top/bottom 3 performing stocks in each industry of the latest trading day to disply on homepage. 

__Query #5__: <br>
Provide recommendations of similar stocks/companies based on similarity calculation (we will measure and quantify each stock from different aspects.)

