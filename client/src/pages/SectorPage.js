import React from 'react';
import { ComposedChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Form, FormInput, FormGroup, Button, Card, CardHeader, CardImg, CardBody, CardTitle, Progress } from "shards-react";

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
import {getTopWinner, getTopLoser, getTopAmplitude, getTopTurnover, getTopSector, getSectorCondition, getTopIndustry, getIndustryCondition, getBestSector, getBestSectorCondition, getBestIndustry, getBestIndustryCondition, getStockCondition} from '../fetcher'
const wideFormat = format('.3r');


const DataFormatter = (number) => {
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

class SectorPage extends React.Component {

    constructor(props)
    {
        super(props)
        this.state= {
            result1: [],
            result2: [],
            result3: [],
            result4: [],
            result5: [],
            result6: [],
            result7: [],
            result8: [],
            result9: [],
            result10: [],
            result11: [],
            result12: [],
            result13: []           
        }

    }

    componentDidMount() {
        getTopWinner().then(res => {
            console.log(res.results)
            this.setState({result1: res.results})
        })

        getTopLoser().then(res => {
            console.log(res.results)
            this.setState({result2: res.results})
        })
        
        getTopAmplitude().then(res => {
            console.log(res.results)
            this.setState({result3: res.results})
        })
        
        getTopTurnover().then(res => {
            console.log(res.results)
            this.setState({result4: res.results})
        })
        
        getTopSector().then(res => {
            console.log(res.results)
            this.setState({result5: res.results})
        }) 

        getSectorCondition().then(res => {
            console.log(res.results)
            this.setState({result6: res.results[0]})
        })

        getTopIndustry().then(res => {
            console.log(res.results)
            this.setState({result7: res.results})
        })

        getIndustryCondition().then(res => {
            console.log(res.results)
            this.setState({result8: res.results[0]})
        })

        getBestSector().then(res => {
            console.log(res.results)
            this.setState({result9: res.results})
        }) 

        getBestSectorCondition().then(res => {
            console.log(res.results)
            this.setState({result10: res.results[0]})
        })

        getBestIndustry().then(res => {
            console.log(res.results)
            this.setState({result11: res.results})
        })

        getBestIndustryCondition().then(res => {
            console.log(res.results)
            this.setState({result12: res.results[0]})
        })
        
        getStockCondition().then(res => {
            console.log(res.results)
            this.setState({result13: res.results[0]})
        })          

    }


    render() {
        return (

            <div>
            <MenuBar />
            
                <div style = {{display: 'flex', flexDirection: 'row', width: '70vw', margin: '10vh',marginTop: '5vh' }}>
                    <Col span={8}>
                        <Card style={{ width: '18rem' }}>
                            <CardHeader>Gainers
                            <Progress style = {{width: '16vw'}} theme="success" value={this.state.result13.positive} max = {this.state.result13.total}>{this.state.result13.positive}       
                            </Progress>
                            </CardHeader>
                            <CardBody>
                                <CardTitle>Stock Price Change</CardTitle>
                                
                                <h7>
                                    {this.state.result1.map(x => <div>{x.Symbol} {x.Close} {x.vary}</div>)}
                                </h7>

                            </CardBody>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card style={{ width: '18rem' }}>
                            <CardHeader>Losers
                            <Progress style = {{width: '16vw'}} theme="danger" value={this.state.result13.negative} max = {this.state.result13.total}>{this.state.result13.negative}       
                            </Progress>
                            </CardHeader>
                            <CardBody>
                                <CardTitle>Stock Price Change</CardTitle>
                                <h7>
                                    {this.state.result2.map(x => <div>{x.Symbol}  {x.Close}  {x.vary} </div>)}
                                </h7>
                            
                            </CardBody>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card style={{ width: '18rem' }}>
                            <CardHeader>Surprise</CardHeader>
                            <CardBody>
                                <CardTitle>Stock Price Amplitude</CardTitle>
                                <h7>
                                {this.state.result3.map(x => <div>{x.Symbol} {x.Close} {x.MaxDropDown}</div>)}
                                </h7>
                        
                            </CardBody>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card style={{ width: '18rem' }}>
                            <CardHeader>Trending</CardHeader>
                            <CardBody>
                                <CardTitle>Stock Price Turnover</CardTitle>
                                <h7>
                                {this.state.result4.map(x => <div>{x.Symbol} {x.Close} {x.Turnover}</div>)}
                                </h7>
                    
                            </CardBody>
                        </Card>
                    </Col>
                </div>

                <div style = {{display: 'flex', flexDirection: 'row', width: '70vw', margin: '10vh',marginTop: '2vh' }}>
                    <Col span={8}>
                        <Card style={{ width: '18rem' }}>
                        <CardHeader>Sector View
                        <Progress style = {{width: '16vw'}} multi>
                                    <Progress bar theme="success" value={this.state.result6.positive} max = {this.state.result6.total}>{this.state.result6.positive}</Progress>
                                    <Progress bar theme="danger" value={this.state.result6.negative} max = {this.state.result6.total}>{this.state.result6.negative}</Progress>
                        </Progress>
                        </CardHeader>
                            <CardBody>
                                <CardTitle>Top 5 Sectors</CardTitle>
                                <h7>
                                {this.state.result5.map(x => <div>{x.Sector} {x.SectorChange} </div>)}
                                </h7>
                                
                            </CardBody>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card style={{ width: '18rem' }}>
                        <CardHeader>Industry View
                        <Progress style = {{width: '16vw'}} multi>
                                    <Progress bar theme="success" value={this.state.result8.positive} max = {this.state.result8.total}>{this.state.result8.positive}</Progress>
                                    <Progress bar theme="danger" value={this.state.result8.negative} max = {this.state.result8.total}>{this.state.result8.negative}</Progress>
                        </Progress>
                        </CardHeader>
                            <CardBody>
                                <CardTitle>Top 5 Industries</CardTitle>
                                
                                <h7>
                                {this.state.result7.map(x => <div>{x.Industry} {x.IndustryChange} </div>)}
                                </h7>   
                            </CardBody>
                        </Card>
                    </Col> 
                    <Col span={8}>
                        <Card style={{ width: '18rem' }}>
                        <CardHeader>Stocks of Best Sector
                        <Progress style = {{width: '16vw'}} multi>
                                    <Progress bar theme="success" value={this.state.result10.positive} max = {this.state.result10.total}>{this.state.result10.positive}</Progress>
                                    <Progress bar theme="danger" value={this.state.result10.negative} max = {this.state.result10.total}>{this.state.result10.negative}</Progress>
                        </Progress>
                        </CardHeader>
                            <CardBody>
                                <CardTitle>Stock Price Change</CardTitle>
                                <h7>
                                {this.state.result9.map(x => <div>{x.Symbol} {x.Close} {x.vary} </div>)}
                                </h7>
                                
                            </CardBody>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card style={{ width: '18rem' }}>
                        <CardHeader>Stocks of Best Industry
                        <Progress style = {{width: '16vw'}} multi>
                                    <Progress bar theme="success" value={this.state.result12.positive} max = {this.state.result12.total}>{this.state.result12.positive}</Progress>
                                    <Progress bar theme="danger" value={this.state.result12.negative} max = {this.state.result12.total}>{this.state.result12.negative}</Progress>
                        </Progress>
                        </CardHeader>
                            <CardBody>
                                <CardTitle>Stock Price Change</CardTitle>
                                <h7>
                                {this.state.result11.map(x => <div>{x.Symbol} {x.Close} {x.vary} </div>)}
                                </h7>
                                
                            </CardBody>
                        </Card>
                    </Col>                                                                  
                </div>

            </div>
        )
    }
}

export default SectorPage

