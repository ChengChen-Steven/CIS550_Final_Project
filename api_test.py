import requests

# replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
url = 'https://www.alphavantage.co/query?function=OVERVIEW&symbol=IBM&apikey=FP8X2FODUBKQZ37B'
url = 'https://www.alphavantage.co/query?function=EARNINGS&symbol=IBM&apikey=FP8X2FODUBKQZ37B'

r = requests.get(url)
data = r.json()

print(data)