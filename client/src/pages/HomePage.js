import React from 'react';
import {
  Row,
  Col,
  Table,
  Pagination,
  Select
} from 'antd'

import MenuBar from '../components/MenuBar';
import { Line } from '@ant-design/charts';
import { getPrice, getAllSectors } from '../fetcher'
import { Form, FormInput, FormGroup, Button, Card, CardBody, CardTitle, Progress } from "shards-react";
const { Column, ColumnGroup } = Table;
const { Option } = Select;


const sectorColumns = [
  {
    title: 'Sector',
    dataIndex: 'sector',
    key: 'sector',
    sorter: (a, b) => a.sector.localeCompare(b.sector)
  },
  {
    title: '1 Day Change',
    dataIndex: 'd1_change',
    key: 'd1_change',
    sorter: (a, b) => a.d1_change.localeCompare(b.d1_change)
  },
  {
    title: '10 Days Change',
    dataIndex: 'd10_change',
    key: 'd10_change',
    sorter: (a, b) => a.d10_change.localeCompare(b.d10_change)
  },
];

class HomePage extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      symbol: "AAPL",
      symbolResults: [],
      sectorsResults: [],
      pagination: null
    }

    this.updateSearchResults = this.updateSearchResults.bind(this)
    this.handleSymbolQueryChange = this.handleSymbolQueryChange.bind(this)
  }

  handleSymbolQueryChange(event) {
    this.setState({ symbol: event.target.value })
  }

  updateSearchResults() {
    getPrice(this.state.symbol).then(res => {
      this.setState({ symbolResults: res.results })
    })
  }

  componentDidMount() {
    getPrice(this.state.symbol).then(res => {
      this.setState({ symbolResults: res.results })
    })

    getAllSectors().then(res => {
      console.log(res.results)
      this.setState({ sectorsResults: res.results })
    })
  }

  render() {
    return (
      <div>
        <MenuBar />
        <div style={{ width: '70vw', margin: '0 auto', marginTop: '5vh' }}>
          <Row>
            <Col flex={2}><FormGroup style={{ width: '20vw', margin: '0 auto' }}>
              <label>Select symbol to display</label>
              <FormInput placeholder="Example: AAPL" value={this.state.symbol} onChange={this.handleSymbolQueryChange} />
            </FormGroup></Col>
            <Col flex={2}><FormGroup style={{ width: '10vw' }}>
              <Button style={{ marginTop: '4vh' }} onClick={this.updateSearchResults}>Search</Button>
            </FormGroup></Col>
          </Row>
        </div>
        <div style={{ width: '70vw', margin: '0 auto', marginTop: '5vh' }}>
          <h3>Chart</h3>
          <Line data={this.state.symbolResults} padding='auto' xField='date' yField='close' xAxis={{ tickCount: 5 }} slider={{ start: 0.7, end: 1.0 }} />
        </div>
        <div style={{ width: '70vw', margin: '0 auto', marginTop: '5vh' }}>
          <h3>Sectors</h3>
          <Table dataSource={this.state.sectorsResults} columns={sectorColumns} pagination={{ pageSizeOptions: [10, 20], defaultPageSize: 10, showQuickJumper: true }} />
        </div>
      </div>
    )
  }
}

export default HomePage

