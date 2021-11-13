import pymysql 
import config as cfg
from sqlalchemy import create_engine
import mysql.connector
import pandas as pd
import requests 
import random
import warnings
warnings.filterwarnings("ignore")
import os
os.environ["TZ"] = "America/New_York" 
import time

# connect to mysql db
mydb = mysql.connector.connect(
    host=cfg.db_stock["host"],
    port=cfg.db_stock["port"],
    user=cfg.db_stock["user"],
    password=cfg.db_stock["password"],
    database=cfg.db_stock["database"],
)

# S&P 
sp500 = pd.read_html(cfg.sp500_wiki)[0]
#print(sp500)  # GICS Sector is a good sector to use 
#sp500.to_csv("sp500.csv")

# key generator
def gen_apikey(keys=None):
    idx = random.randint(0, len(keys)-1)
    print(keys[idx])
    return(keys[idx])

# stock price
# pull historical data for a symbol
def get_history_stock_price(symbol, max_num=1000, apikeys=None):
    # get adjusted daily time series value
    url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={0}&outputsize=full&apikey={1}&datatype=csv".format(symbol, gen_apikey(keys=apikeys))
    df = pd.read_csv(url).loc[0:max_num+1, ]
      
    # approx logic - adjusted close not just calculated by dividen & split, stock buyback could affect
    df["adjusted_ratio"] = df["adjusted_close"] / df["close"]
    df["open"] = df["open"] * df["adjusted_ratio"]
    df["high"] = df["high"] * df["adjusted_ratio"]
    df["low"] = df["low"] * df["adjusted_ratio"]
    df["close"] = df["adjusted_close"]
    df["volume"] = df["volume"] / df["adjusted_ratio"]

    df["last_close"] = df["close"].shift(-1)
    df["change"] = (df["close"] - df["last_close"]) / df["last_close"]
    df["date"] = df["timestamp"]
    df = df.loc[0:max_num, ]
    time.sleep(12)

    # macd
    url = "https://www.alphavantage.co/query?function=MACD&symbol={0}&interval=daily&series_type=close&apikey={1}&datatype=csv".format(symbol, gen_apikey(keys=apikeys))
    df_macd = pd.read_csv(url).loc[0:max_num, ]
    df_macd["MACD_Hist"] = df_macd["MACD_Hist"] * 2
    df_macd.columns = ["date", "DIF", "MACD", "DEA"]
    time.sleep(12)

    # rsi
    url = "https://www.alphavantage.co/query?function=RSI&symbol={0}&interval=daily&time_period=6&series_type=close&apikey={1}&datatype=csv".format(symbol, gen_apikey(keys=apikeys))
    df_rsi = pd.read_csv(url).loc[0:max_num, ]
    df_rsi.columns = ["date", "RSI"]
    df_signal = pd.merge(df_macd, df_rsi, how="inner", on="date")
    time.sleep(12)

    # combine all
    df = pd.merge(df, df_signal, how="inner", on="date")
    df["symbol"] = symbol
    df = df[["date", "symbol", "open", "high", "low", "close", "volume", "change", "DIF", "DEA", "MACD", "RSI"]]
    return(df)

def get_sp500_history_stock_price(sp500_list, max_num=1000):
    df = pd.DataFrame()
    for symbol in sp500_list:
        df_symbol = get_history_stock_price(symbol, max_num=max_num)
        df = df.append([df_symbol])
    print(df)
    return(df)

# get_sp500_history_stock_price(["AAPL", "PYPL", "T", "TSLA"], max_num=10)


## stock fundamentals 
# pull stock basic info for a symbol
def get_stock_fundamentals(symbol, apikeys):
    url = "https://www.alphavantage.co/query?function=OVERVIEW&symbol={0}&apikey={1}".format(symbol, gen_apikey(keys=apikeys))
    r = requests.get(url)
    data = r.json()
    return(data)

def get_sp500_funamentals(sp500_list, apikeys):
    info = []
    for symbol in sp500_list:
        time.sleep(12)
        data = get_stock_fundamentals(symbol, apikeys)
        info.append(data)
    df = pd.DataFrame(info)
    return(df)


print(get_sp500_funamentals(sp500_list=["AAPL", "PYPL", "T", "TSLA"], apikeys=cfg.api_keys))



# GAP detection script - SQL
# GAP down list, GAP UP list 



"""
    CREATE TABLE Fundamentals(
        symbol varchar(8),
        asset_type varchar(20),
        name varchar(255),
        exchange varchar(20),
        currency varchar(20), 
        country varchar(20), 
        sector varchar(20),
        industry varchar(20),
        MarketCapitalization decimal(16,1),
        EBITDA decimal(10,2),
        PERatio decimal(10,2),
        PEGRatio decimal(10,2),
        BookValue decimal(16,1),
        DividendPerShare decimal(10,2),
        DividendYield decimal(10,2),
        EPS decimal(10,2),
        RevenuePerShareTTM decimal(10,2),
        ProfitMargin decimal(10,2),
        RevenueTTM decimal(16,1),
        GrossProfitTTM decimal(16,1),
        DilutedEPSTTM (16,2),
        QuarterlyEarningsGrowthYOY (16,3),
        QuarterlyRevenueGrowthYOY (16,3),
        AnalystTargetPrice decimal(16,1),
        TrailingPE decimal(16,1),
        ForwardPE decimal(16,1),
        PriceToSalesRatioTTM decimal(16,1),
        PriceToBookRatio decimal(16,1),
        EVToRevenue decimal(16,1),
        EVToEBITDA decimal(16,1),
        Beta decimal(16,1),
        52WeekHigh decimal(16,1),
        52WeekLow decimal(16,1),
        50DayMovingAverage decimal(16,1),
        200DayMovingAverage decimal(16,1),
        SharesOutstanding int
        PRIMARY KEY (symbol));
        """