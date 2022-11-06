import { useEffect } from 'react';
import config from './config.json';
import Navbar from "./components/Navbar";
import Markets from "./components/Markets";
import Balance from "./components/Balance";
import Order from "./components/Order";
import OrderBook from "./components/Orderbook";
import PriceChart from "./components/PriceChart";
import Trades from "./components/Trades";
import Transactions from "./components/Transactions";
import Alert from "./components/Alert";
import {useDispatch} from "react-redux";
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents,
  loadAllOrders
} from "./store/interactions";

function App() {

  const dispatch = useDispatch();

  const loadBlockchainData=async()=>{
    const provider = await loadProvider(dispatch);
    const chainId = await loadNetwork(dispatch, provider);



    window.ethereum.on('chainChanged',async()=>{
      window.location.reload();
    })

    // load the account
    window.ethereum.on('accountsChanged',async()=>{
      await loadAccount(dispatch,provider);
    })



    const epicConfig = config[chainId].epic;
    const mETHConfig = config[chainId].mEth;
    const exchangeConfig = config[chainId].exchange;

    // load the tokens according to the market
    await loadTokens(dispatch,provider,[epicConfig.address,mETHConfig.address]);

    // load the exchange 
    const exchange = await loadExchange(dispatch,exchangeConfig.address,provider);

    // fetch all the orders
    loadAllOrders(provider,exchange, dispatch);

    subscribeToEvents(dispatch, exchange);
  }

  useEffect(()=>{
    loadBlockchainData();
  })


  return (
    <div>
      <Navbar />

      <main className='exchange grid'>
        {/* // left section */}
        <section className='exchange__section--left grid'>
          <Markets />
          <Balance />
          <Order />


           {/* Orders */}
          {/* {orders}  */}

        </section>

        <section className='exchange__section--right grid'>
          
          <PriceChart />
          <Transactions /> 
          <Trades /> 
          <OrderBook /> 
          {/* {PriceChart}
          {Transactions}
          {Trades}
          {Orderbook} */}
        </section>
      </main>

      <Alert />
    </div>
  );

}

export default App;
