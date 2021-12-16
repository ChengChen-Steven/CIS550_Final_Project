import React from 'react';
import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
  } from "shards-react";

class MenuBar extends React.Component {
    render() {
        return(
            <Navbar type="dark" theme="primary" expand="md">
        <NavbarBrand href="/">Buzz S&amp;P 500</NavbarBrand>
          <Nav navbar>
          <NavItem>
              <NavLink active href="/">
                Home
              </NavLink>
            </NavItem>
          <NavItem>
              <NavLink active href="/price/AAPL">
                Stock
              </NavLink>
            </NavItem>
          <NavItem>
              <NavLink active href="/stocks">
                SearchStocks
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink active href="/sectorpage">
                MarketView
              </NavLink>
            </NavItem>
          </Nav>
      </Navbar>
        )
    }
}

export default MenuBar
