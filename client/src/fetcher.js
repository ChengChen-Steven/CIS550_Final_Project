import config from './config.json'


const getPrice = async (symbol) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/price/${symbol}`, {
        method: 'GET',
    })  
    return res.json()
}

const getIndexPrice = async (symbol) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/indexPrice/${symbol}`, {
        method: 'GET',
    })  
    return res.json()
}

const getSector = async (sector) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sector/${sector}`, {
        method: 'GET',
    })  
    return res.json()
}

const getAllSectors = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sector`, {
        method: 'GET',
    })  
    return res.json()
}

const getPriceReverseSearch = async (symbol,StartDate,EndDate,page,pagesize) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/search/pricesreverse/${symbol}?StartDate=${StartDate}&EndDate=${EndDate}&page=${page}&pagesize=${pagesize}`, {
        method: 'GET',
    })
    return res.json()
}

const getStock = async (symbol,page, pagesize) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/stock/${symbol}`, {
        method: 'GET',
    })
    return res.json()
}

const getStockOutperform = async (symbol,page, pagesize) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/stockoutperform/${symbol}`, {
        method: 'GET',
    })
    return res.json()
}



const getStockSearch = async (ticker, company, sector, industry, country, size, market_cap, page, pagesize) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/search/stocks?Ticker=${ticker}&Company=${company}&Sector=${sector}&Industry=${industry}&Country=${country}&Size=${size}&MarketCap=${market_cap}&page=${page}&pagesize=${pagesize}`, {
        method: 'GET',
    })
    return res.json()
}

const getTicker = async (ticker) => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/stock?ticker=${ticker}`, {
        method: 'GET',
    })
    return res.json()
}

const getTopWinner = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/upchange`, {
        method: 'GET',
    })  
    return res.json()
}

const getTopLoser = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/downchange`, {
        method: 'GET',
    })  
    return res.json()
}

const getTopAmplitude = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/maxdropdown`, {
        method: 'GET',
    })  
    return res.json()
}
const getTopTurnover = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/turnover`, {
        method: 'GET',
    })  
    return res.json()
}
const getTopSector = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/sector`, {
        method: 'GET',
    })  
    return res.json()
}
const getSectorCondition = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/conditionsector`, {
        method: 'GET',
    })  
    return res.json()
}
const getTopIndustry = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/industry`, {
        method: 'GET',
    })  
    return res.json()
}

const getIndustryCondition = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/conditionindustry`, {
        method: 'GET',
    })  
    return res.json()
}

const getBestSector = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/firstsector`, {
        method: 'GET',
    })  
    return res.json()
}

const getBestSectorCondition = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/conditionfirstsector`, {
        method: 'GET',
    })  
    return res.json()
}

const getBestIndustry = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/firstindustry`, {
        method: 'GET',
    })  
    return res.json()
}

const getBestIndustryCondition = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/conditionfirstindustry`, {
        method: 'GET',
    })  
    return res.json()
}

const getStockCondition = async () => {
    var res = await fetch(`http://${config.server_host}:${config.server_port}/sectorpage/stockcondition`, {
        method: 'GET',
    })  
    return res.json()
}

export {
    getPrice,
    getIndexPrice,
    getSector,
    getAllSectors,

    getPriceReverseSearch,
    getStock,
    getStockOutperform,


    getTicker,
    getStockSearch,

    getTopWinner,
    getTopLoser,
    getTopAmplitude,
    getTopTurnover,
    getTopSector,
    getSectorCondition,
    getTopIndustry,
    getIndustryCondition,
    getBestSector,
    getBestSectorCondition,
    getBestIndustry,
    getBestIndustryCondition,
    getStockCondition       
}
