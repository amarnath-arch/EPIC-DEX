import {useRef, useState} from 'react';
import { useDispatch, useSelector } from "react-redux";
import { myOpenOrdersSelector, myFilledOrdersSelector } from "../store/selectors"; 
import sort from "../assets/sort.svg";
import Banner from "./Banner";

import {
  cancelOrder
} from "../store/interactions";

const Transactions = () => {
    const [showMyOrders, setshowMyOrders] = useState(true);
    const provider = useSelector(state => state.provider.connection);
    const exchange = useSelector(state => state.exchange.contract);
    const symbols = useSelector(state => state.tokens.symbols)
    const myOpenOrders = useSelector(myOpenOrdersSelector);
    const myFilledOrders = useSelector(myFilledOrdersSelector);

    const dispatch = useDispatch();
    const orderRef = useRef(null);
    const tradeRef = useRef(null);


    const tagHandler = (e)=>{
      if(e.target.className !== orderRef.current.className){
        orderRef.current.className = 'tab';
        setshowMyOrders(false);
      }else{
        tradeRef.current.className = 'tab';
        setshowMyOrders(true);

      }
      e.target.className = 'tab tab--active';
    }

    const cancelHandler = (order)=>{
      if(dispatch && provider && exchange && order) cancelOrder(dispatch,provider,exchange,order);
    }

    return (
      <div className="component exchange__transactions">

        {
          showMyOrders? (
            <div>
            <div className='component__header flex-between'>
              <h2>My Orders</h2>
    
              <div className='tabs'>
                <button onClick={tagHandler} ref={orderRef} className='tab tab--active'>Orders</button>
                <button onClick={tagHandler} ref={tradeRef} className='tab'>Trades</button>
              </div>
            </div>

            {
              (myOpenOrders && myOpenOrders.length) ?(
                    <table>
                        <thead>
                          <tr>
                            <th>{symbols && symbols[0]} <img src={sort} alt="sort" /></th>
                            <th>{`${symbols && symbols[0]} / ${symbols && symbols[1]}`}<img src={sort} alt="sort" /></th>
                            <th></th>
                          </tr>
                        </thead>

                        <tbody>
                          {
                            myOpenOrders && myOpenOrders.map((order,index) =>{
                              return (
                                <tr key={index}>
                                  <td style={{ color: `${order.orderTypeClass}`}}> {order.token0amount} </td>
                                  <td>{order.tokenPrice} </td>
                                  <td><button className='button--sm' onClick={()=> cancelHandler(order)} >Cancel</button></td>
                                </tr>
                              )   
                            })
                          }
                        </tbody>
                    </table>
              ):(
                <Banner text={'No Open Orders'} />
              )
            }
    
    
          </div>



          ) :   (
            <div>
            <div className='component__header flex-between'>
              <h2>My Transactions</h2>
    
              <div className='tabs'>
                <button onClick={tagHandler} ref={orderRef} className='tab tab--active'>Orders</button>
                <button onClick={tagHandler} ref={tradeRef} className='tab'>Trades</button>
              </div>
            </div>

            {
              myFilledOrders && myFilledOrders.length?(
                <table>
                  <thead>
                    <tr>
                      <th>Time<img src={sort} alt="sort" /> </th>
                      <th>{symbols && symbols[0]} <img src={sort} alt="sort" /></th>
                      <th>{`${symbols && symbols[0]} / ${symbols && symbols[1]}`}<img src={sort} alt="sort" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      myFilledOrders && myFilledOrders.map((order,index) =>{
                        return(
                          <tr key={index}>
                            <td>{order.formattedTimestamp} </td>
                            <td style={{ color: `${order.orderClass}`}}>{order.orderSign}{order.token0amount} </td>
                            <td>{order.tokenPrice} </td>
                          </tr>
                        );
                      })
                    }
                    
        
                  </tbody>
                </table>
              ):(
                <Banner text={'No Trades'} />
              )
            }
    
                
    
          </div>
          )
        }

          
    
          
      </div>
    )
  }
  
  export default Transactions;