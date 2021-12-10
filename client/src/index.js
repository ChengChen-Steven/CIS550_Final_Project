import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Route,
	Switch
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import PricePage from './pages/PricePage';
import StocksPage from './pages/StocksPage';
import 'antd/dist/antd.css';

import "bootstrap/dist/css/bootstrap.min.css";
import "shards-ui/dist/css/shards.min.css"
//import MatchesPage from './pages/MatchesPage';

ReactDOM.render(
	<div>
		<Router>
			<Switch>
				<Route exact
					path="/"
					render={() => (
						<HomePage />
					)} />
		<Route exact
							path="/stock"
							render={() => (
								<PricePage />
							)}/>
		<Route exact
							path="/stocks"
							render={() => (
								<StocksPage />
							)}/>
			</Switch>
		</Router>
	</div>,
	document.getElementById('root')
);

