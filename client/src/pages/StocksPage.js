import React from 'react';
import { Form, FormInput, FormGroup, Button, Card, CardBody, CardTitle, Progress } from "shards-react";

import {
    Table,
    Pagination,
    Select,
    Row,
    Col,
    Divider,
    Slider,
    Rate 
} from 'antd'
import { RadarChart } from 'react-vis';
import { format } from 'd3-format';



import MenuBar from '../components/MenuBar';
import { getStockSearch, getTicker } from '../fetcher'
const wideFormat = format('.3r');
const { Option } = Select;

const stockColumns = [
    {
        title: 'No.',
        dataIndex: 'NO',
        key: 'NO',
        sorter: (a, b) => a.NO - b.NO 
    },
    {
        title: 'Ticker',
        dataIndex: 'Ticker',
        key: 'Ticker',
        sorter: (a, b) => a.Ticker.localeCompare(b.Ticker),
        render: (text, row) => <a href={`/price/${row.Ticker}`}>{text}</a>//////
    },
    {
        title: 'Company',
        dataIndex: 'Company',
        key: 'Company',
        sorter: (a, b) => a.Company.localeCompare(b.Company)
        
    },
    {
        title: 'Sector',
        dataIndex: 'Sector',
        key: 'Sector',
        sorter: (a, b) => a.Sector.localeCompare(b.Sector)
        
    },
    {
        title: 'Industry',
        dataIndex: 'Industry',
        key: 'Industry',
        sorter: (a, b) => a.Industry.localeCompare(b.Industry)
    }, 
    {
        title: 'Country',
        dataIndex: 'Country',
        key: 'Country',
        sorter: (a, b) => a.Country.localeCompare(b.Country)
    },
    // {
    //     title: 'Size',
    //     dataIndex: 'Size',
    //     key: 'Size',
    // },
    {
        title: 'MarketCap',
        dataIndex: 'MarketCap',
        key: 'MarketCap',
        sorter: (a, b) => a.MarketCap - b.MarketCap
    },
    {
        title: 'P/E',
        dataIndex: 'PE',
        key: 'PE',
        sorter: (a, b) => a.PE - b.PE
    },
    {
        title: 'Price',
        dataIndex: 'Price',
        key: 'Price',
        sorter: (a, b) => a.Price - b.Price
    },
    {
        title: 'Change',
        dataIndex: 'Change',
        key: 'Change'
    },
    {
        title: 'Volume',
        dataIndex: 'Volume',
        key: 'Volume',
        sorter: (a, b) => a.Volume - b.Volume
    }
];


class StocksPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tickerQuery: '',
            companyQuery: '',
            sectorQuery: '',
            industryQuery: '',
            countryQuery: '',
            sizeQuery:'',
            marketCapQuery: '',
            selectedTicker: window.location.search ? window.location.search.substring(1).split('=')[1] : 229594,
            selectedTickerDetails: null,
            stocksResults: []

        }

        this.updateSearchResults = this.updateSearchResults.bind(this)
        this.handleTickerQueryChange = this.handleTickerQueryChange.bind(this)
        this.handleCompanyQueryChange = this.handleCompanyQueryChange.bind(this)
        this.handleIndustryQueryChange = this.handleIndustryQueryChange.bind(this)
        this.handleCountryQueryChange = this.handleCountryQueryChange.bind(this)
        this.sectorOnChange = this.sectorOnChange.bind(this)/////////
        this.sizeOnChange = this.sizeOnChange.bind(this)
    }


    handleTickerQueryChange(event) {
        this.setState({ tickerQuery: event.target.value })
    }

    handleCompanyQueryChange(event) {
        this.setState({ companyQuery: event.target.value })
    }

    handleIndustryQueryChange(event) {
        this.setState({ industryQuery: event.target.value })
    }

    handleCountryQueryChange(event) {
        this.setState({ countryQuery: event.target.value })
    }

    sectorOnChange(value) {
        this.setState({sectorQuery: value});
      }

    sizeOnChange(value) {
        this.setState({sizeQuery: value});
        }



    updateSearchResults() {
        getStockSearch(this.state.tickerQuery, this.state.companyQuery, this.state.sectorQuery, this.state.industryQuery, this.state.countryQuery, this.state.sizeQuery, this.state.marketCapQuery, this.state.priceHighQuery, this.state.priceLowQuery, null, null).then(res => {
            this.setState({ stocksResults: res.results })
        })

    }

    componentDidMount() {
        getStockSearch(this.state.tickerQuery, this.state.companyQuery, this.state.sectorQuery, this.state.industryQuery,this.state.countryQuery, this.state.sizeQuery, this.state.marketCapQuery, this.state.priceHighQuery, this.state.priceLowQuery, null, null).then(res => {
            this.setState({ stocksResults: res.results })
        })

        getTicker(this.state.selectedTicker).then(res => {
            this.setState({ selectedTickerDetails: res.results[0] })
        })
    }

    render() {
        return (

            <div>

                <MenuBar />
                <Form style={{ width: '80vw', margin: '0 auto', marginTop: '5vh' }}>
                    <Row>
                        <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
                            <label>Ticker</label>
                            <FormInput placeholder="Ticker" value={this.state.tickerQuery} onChange={this.handleTickerQueryChange} />
                        </FormGroup></Col>
                        <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
                            <label>Company</label>
                            <FormInput placeholder="Company" value={this.state.companyQuery} onChange={this.handleCompanyQueryChange} />
                        </FormGroup></Col>
                        <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
                            <label>Sector</label><br></br>
                            <Select defaultValue="Any" style={{ width: 210 }} onChange={this.sectorOnChange}>
                                <Option value="Basic Materials">Basic Materials</Option>
                                <Option value="Communication Services">Communication Services</Option>
                                <Option value="Consumer Cyclical">Consumer Cyclical</Option>
                                <Option value="Consumer Defensive">Consumer Defensive</Option>
                                <Option value="Energy">Energy</Option>
                                <Option value="Financial Services">Financial Services</Option>
                                <Option value="Healthcare">Healthcare</Option>
                                <Option value="Industrials">Industrials</Option>
                                <Option value="Real Estate">Real Estate</Option>
                                <Option value="Technology">Technology</Option>
                                <Option value="Utilities">Utilities</Option>
                              </Select>
                        </FormGroup></Col>

                    </Row>

                    <br></br>
                    <Row>
                        <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
                            <label>Industry</label>
                            <FormInput placeholder="Industry" value={this.state.industryQuery} onChange={this.handleIndustryQueryChange} />
                        </FormGroup></Col>
                        <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
                            <label>Country</label>
                            <FormInput placeholder="Country" value={this.state.countryQuery} onChange={this.handleCountryQueryChange} />
                        </FormGroup></Col>

                        <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
                            <label>MarketCapSize</label><br></br>
                            <Select defaultValue="Any" style={{ width: 210 }} onChange={this.sizeOnChange}>
                                <Option value="SmallCap">Small Cap (&lt; $2 billion)</Option>
                                <Option value="MidCap">Mid Cap ($2 - $10 billion)</Option>
                                <Option value="LargeCap">Large Cap ($10 - $200 billion)</Option>
                                <Option value="MegaCap">Mega Cap (&gt; $200 billion)</Option>
                              </Select>
                        </FormGroup></Col>
                    </Row>

                    <br></br>
                    <Row>
                        <Col flex={15}></Col>
                        <Col flex={0}><FormGroup style={{ width: '15vw' }}>
                            <Button style={{ marginTop: '4vh'}} onClick={this.updateSearchResults}>Find Stocks</Button>
                        </FormGroup></Col>

                        <Col flex={2}><FormGroup style={{ width: '8vw', marginTop: '2.2vw' }}>
                            <button class="button" onClick="window.location.reload();">Reset</button>
                        </FormGroup></Col>

                    </Row>

                </Form>
                <Divider />
                <div style={{ width: '90vw', margin: '0 auto', marginTop: '2vh' }}>
                    <h3>Stocks</h3>
                    <Table dataSource={this.state.stocksResults} columns={stockColumns} pagination={{ pageSizeOptions:[5, 10, 20], defaultPageSize: 10, showQuickJumper:true}} bordered={true}/>
                </div>

            </div>
        )
    }
}




export default StocksPage

