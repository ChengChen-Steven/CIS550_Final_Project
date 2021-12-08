import React from 'react';
import { ComposedChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts';
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
import {getPriceSearch, getPriceReverseSearch,getStock,getVsAll,getVsSector,getRankSector,getRankAll} from '../fetcher'
const wideFormat = format('.3r');



const priceColumns = [
  {
    title: 'Date',
    dataIndex: 'Date',
    key: 'Date',
    sorter: (a, b) => new Date(a.Date) - new Date(b.Date)
  },
    {
        title: 'Symbol',
        dataIndex: 'Symbol',
        key: 'Symbol',
        sorter: (a, b) => a.symbol.localeCompare(b.symbol)
    },
    {
        title: 'Open',
        dataIndex: 'Open',
        key: 'Open',
        render: props => props.toLocaleString(undefined, {maximumFractionDigits:2}),
        sorter: (a, b) => a.Open - b.Open
    },
    {
        title: 'Close',
        dataIndex: 'Close',
        key: 'Close',
        render: props => props.toLocaleString(undefined, {maximumFractionDigits:2}),
        sorter: (a, b) => a.Close - b.Close

    },
      {
    title: 'Volume',
    dataIndex: 'Volume',
    key: 'Volume',
    render: props => props.toLocaleString(undefined, {maximumFractionDigits:2}),
    sorter: (a, b) => a.Volume - b.Volume

  },
  {
    title: 'High',
    dataIndex: 'High',
    key: 'High',
    render: props => props.toLocaleString(undefined, {maximumFractionDigits:2}),
    sorter: (a, b) => a.High - b.High
  },
  {
    title: 'Low',
    dataIndex: 'Low',
    key: 'Low',
    render: props => props.toLocaleString(undefined, {maximumFractionDigits:2}),
    sorter: (a, b) => a.Low - b.Low
  }
    // TASK 19: copy over your answers for tasks 7 - 9 to add columns for potential, club, and value
];


const DataFormater = (number) => {
  if(number > 1000000000){
    return (number/1000000000).toString() + 'B';
  }else if(number > 1000000){
    return (number/1000000).toString() + 'M';
  }else if(number > 1000){
    return (number/1000).toString() + 'K';
  }else{
    return number.toString();
  }
}

class PricePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            symbolQuery: '',
            startDateQuery: '',
            endDateQuery: '',
            vsAllResults: null
        }

        this.updateSearchResults = this.updateSearchResults.bind(this)
        this.handleSymbolChange = this.handleSymbolChange.bind(this)
        this.handleStartDateChange = this.handleStartDateChange.bind(this)
        this.handleEndDateChange = this.handleEndDateChange.bind(this)
    }

    handleSymbolChange(event) {
        this.setState({ symbolQuery: event.target.value })
    }

    handleStartDateChange(event) {
        this.setState({ startDateQuery: event.target.value })
        // TASK 20: update state variables appropriately. See handleNameQueryChange(event) for reference
    }

    handleEndDateChange(event) {
        this.setState({ endDateQuery: event.target.value })
        // TASK 21: update state variables appropriately. See handleNameQueryChange(event) for reference
    }



    updateSearchResults() {
        getVsSector(this.state.symbolQuery,null,null).then(res =>{
            this.setState({ vsSectorResult: res.results[0]})
        })
        getRankSector(this.state.symbolQuery,null,null).then(res =>{
            this.setState({ rankSectorResult: res.results[0]})
        })
        getRankAll(this.state.symbolQuery,null,null).then(res =>{
            this.setState({ rankAllResult: res.results[0]})
        })
        getVsAll(this.state.symbolQuery,null,null).then(res => {
            this.setState({ vsAllResults: res.results[0] })
        })

        getPriceSearch(this.state.symbolQuery, this.state.startDateQuery, this.state.endDateQuery,null, null).then(res => {
            this.setState({ priceResults: res.results })
        })

        getPriceReverseSearch(this.state.symbolQuery, this.state.startDateQuery, this.state.endDateQuery, null, null).then(res => {
            this.setState({ priceReverseResults: res.results })
        })

        getStock(this.state.symbolQuery,null,null).then(res => {
            this.setState({ stockResults: res.results[0] })
        })
        //TASK 23: call getPlayerSearch and update playerResults in state. See componentDidMount() for a hint

    }

    componentDidMount() {
        getVsAll(this.state.symbolQuery).then(res => {
            this.setState({ vsAllResults: res.results[0] })
        })

        getVsSector(this.state.symbolQuery,null,null).then(res =>{
            this.setState({ vsSectorResult: res.results[0]})
        })
        getRankAll(this.state.symbolQuery,null,null).then(res =>{
            this.setState({ rankAllResult: res.results[0]})
        })
        getRankSector(this.state.symbolQuery,null,null).then(res =>{
            this.setState({ rankSectorResult: res.results[0]})
        })


        getPriceSearch(this.state.symbolQuery, this.state.startDateQuery, this.state.endDateQuery, null, null).then(res => {
            this.setState({ priceResults: res.results })
        })

        getPriceReverseSearch(this.state.symbolQuery, this.state.startDateQuery, this.state.endDateQuery, null, null).then(res => {
            this.setState({ priceReverseResults: res.results })
        })

        getStock(this.state.symbolQuery,null,null).then(res => {
            this.setState({ stockResults: res.results[0] })
        })

        // TASK 25: call getPlayer with the appropriate parameter and set update the correct state variable.
        // See the usage of getMatch in the componentDidMount method of MatchesPage for a hint!

    }

    render() {
        return (

            <div>

                <MenuBar />
                <Form style={{ width: '80vw', margin: '0 auto', marginTop: '5vh' }}>
                    <Row>
                        <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
                            <label>Symbol</label>
                            <FormInput placeholder="Symbol" value={this.state.symbolQuery} onChange={this.handleSymbolChange} />
                        </FormGroup></Col>
                        <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
                            <label>StartDate</label>
                            <FormInput placeholder="YYYY-MM-DD" value={this.state.startDateQuery} onChange={this.handleStartDateChange} />
                        </FormGroup></Col>
                        <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
                            <label>EndDate</label>
                            <FormInput placeholder="YYYY-MM-DD" value={this.state.endDateQuery} onChange={this.handleEndDateChange} />
                        </FormGroup></Col>
                        {/* TASK 26: Create a column for Club, using the elements and style we followed in the above two columns. Use the onChange method (handleClubQueryChange)  */}

                    </Row>
                    <br></br>
                     <Row>
                        {/* TASK 27: Create a column with a label and slider in a FormGroup item for filtering by Potential. See the column above for reference and use the onChange method (handlePotentialChange)  */}
                        <Col flex={2}><FormGroup style={{ width: '10vw' }}>
                            <Button style={{ marginTop: '4vh' }} onClick={this.updateSearchResults}>Search</Button>
                        </FormGroup></Col>

                    </Row>
                </Form>
                <ResponsiveContainer width="100%" height={500} Align = 'right' >
                <ComposedChart
                    margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
                    data={this.state.priceReverseResults}
                >
                    <Line yAxisId="left"  type="monotone" dataKey="Close" stroke="#8884d8" dot={false} />
                    <Area yAxisId="right" type = "monotone" dataKey = 'Volume' fill="#c4f0ff"/>
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="Date" />
                    <YAxis yAxisId="left"/>
                    <YAxis yAxisId="right" orientation="right" tickFormatter={DataFormater}/>
                    <Tooltip />
                </ComposedChart>
            </ResponsiveContainer>
                {this.state.stockResults ?<div style={{display: 'flex', flexDirection: 'row', width: '70vw', margin: '0 auto',marginTop: '2vh' }}>
                    <Card style={{flex: 2, marginRight: '2vh'}}>

                        <CardBody>
                        <Row gutter='30' align='middle' justify = 'center'>
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h5>Company Info</h5>
                            <h7> <b>Name:</b> {this.state.stockResults.shortName}</h7>
                            </Col>

                        </Row>
                        <Row gutter='30' align='middle' justify = 'center'>
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h7><b>Sector:</b> {this.state.stockResults.sector}</h7>
                            </Col>
                        </Row>
                        <Row gutter='30' align='middle' justify = 'center' >
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h7><b>Country: </b>{this.state.stockResults.country}</h7>
                            </Col>
                        </Row>
                        <Row gutter='30' align='middle' justify = 'center' >
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h7><b>Full Time Employees: </b>{this.state.stockResults.fullTimeEmployees.toLocaleString(undefined, {maximumFractionDigits:2})}</h7>
                            </Col>
                        </Row>
                        <br></br>
                       </CardBody>

                    </Card>

                    <Card style={{flex: 2,marginRight: '2vh'}}>

                        <CardBody>
                        <Row gutter='30' align='middle' justify = 'center'>
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h5>Key Metrics</h5>
                            <h7> <b>52 Week High:</b> {this.state.stockResults.fiftyTwoWeekHigh.toLocaleString(undefined, {maximumFractionDigits:2})}</h7>
                            </Col>

                        </Row>
                        <Row gutter='30' align='middle' justify = 'center'>
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h7><b>52 Week Low:</b> {this.state.stockResults.fiftyTwoWeekLow.toLocaleString(undefined, {maximumFractionDigits:2})}</h7>
                            </Col>
                        </Row>
                        <Row gutter='30' align='middle' justify = 'center' >
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h7><b>Market Cap: </b>{this.state.stockResults.marketCap.toLocaleString(undefined, {maximumFractionDigits:2})}</h7>
                            </Col>
                        </Row>
                        <Row gutter='30' align='middle' justify = 'center' >
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h7><b>PE Ratio: </b>{this.state.stockResults.trailingPE.toLocaleString(undefined, {maximumFractionDigits:2})}</h7>
                            </Col>
                        </Row>
                        <br></br>
                       </CardBody>

                    </Card>


                 </div> : null}

               {this.state.vsAllResults ?<div style={{display: 'flex', flexDirection: 'row', width: '70vw', margin: '0 auto',marginTop: '2vh' }}>

                    <Card style={{flex: 1}}>

                        <CardBody>
                        <Row gutter='30' align='middle' justify = 'center'>
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h5>Benchmarking:</h5>
                            <h7> <b>Beat Market By:</b> {this.state.vsAllResults.beatByAll.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2})}</h7>
                            </Col>

                        </Row>
                        <Row gutter='30' align='middle' justify = 'center'>
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h7><b>Beat Sector By:</b> {this.state.vsSectorResult.beatBySector.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2})}</h7>
                            </Col>
                        </Row>
                        <Row gutter='30' align='middle' justify = 'center' >
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h7><b>Ranking in Market: </b>{this.state.rankAllResult.allRank}</h7>
                            </Col>
                        </Row>
                        <Row gutter='30' align='middle' justify = 'center' >
                            <Col flex={2} style={{ textAlign: 'left' }}>
                            <h7><b>Ranking in Sector: </b>{this.state.rankSectorResult.sectorRank}</h7>
                            </Col>
                        </Row>

                        <br></br>
                       </CardBody>

                    </Card>


                 </div> : null}


                <Divider />
                {/* TASK 24: Copy in the players table from the Home page, but use the following style tag: style={{ width: '70vw', margin: '0 auto', marginTop: '2vh' }} - this should be one line of code! */}
                <Table dataSource={this.state.priceResults} columns={priceColumns} pagination={{ pageSizeOptions:[5, 10], defaultPageSize: 5, showQuickJumper:true }} style={{ width: '70vw', margin: '0 auto', marginTop: '2vh' }}/>
                <Divider />


               {/*below is need to be update:*/}




            </div>
        )
    }
}

export default PricePage

