import sort from "../assets/sort.svg"
import {useSelector, useDispatch} from 'react-redux';

import {
    fillOrder
} from "../store/interactions";

import{
    orderBookSelector,
} from "../store/selectors";

const Orderbook = ()=> {

    const symbols = useSelector(state => state.tokens.symbols);
    const orderBook = useSelector(orderBookSelector);
    const exchange = useSelector(state => state.exchange.contract);
    const provider = useSelector(state => state.provider.connection);

    const dispatch = useDispatch();

    const fillOrderHandler = (order)=>{
        if(dispatch && provider && exchange && order) fillOrder(dispatch,provider,exchange,order);
        
    }

    
    return(
        <div className="component exchange__orderbook">
            <div className="component__header flex-between">
                <h2>Order Book</h2>
            </div>

            <div className="flex">

                {
                    orderBook && orderBook.sellOrders.length?(
                        <table className="exchange__orderbook--sell">
                        <caption>Selling</caption>
                        <thead>
                            <tr>
                                <th>{symbols && symbols[0]} <img src={sort} alt="sort" /> </th>
                                <th>{symbols && symbols[0]}/{symbols && symbols[1]} <img src={sort} alt="sort" /> </th>
                                <th>{symbols && symbols[1]} <img src={sort} alt="sort" /> </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                orderBook && orderBook.sellOrders.map((order,index)=>{
                                    return(
                                        <tr key={index} onClick={()=> fillOrderHandler(order)} >
                                            <td>{order.token0amount} </td>
                                            <td style={{color: `${order.orderTypeClass}`}}>{order.tokenPrice} </td>
                                            <td>{order.token1amount}</td>
                                        </tr>
                                    )
                                })
                            }
                            
                        </tbody>
                    </table>

                    ):(
                        <p className="flex-center">NO SELL ORDERS!!</p>
                    )
                }

                
                <div className="divider"></div>
                    {
                        orderBook && orderBook.buyOrders.length ?(
                            <table className="exchange__orderbook--buy">
                                <caption>Buying</caption>
                                <thead>
                                    <tr>
                                            <th>{symbols && symbols[0]} <img src={sort} alt="sort" /> </th>
                                            <th>{symbols && symbols[0]}/{symbols && symbols[1]} <img src={sort} alt="sort" /> </th>
                                            <th>{symbols && symbols[1]} <img src={sort} alt="sort" /> </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        orderBook && orderBook.buyOrders.map((order,index)=>{
                                            return (
                                                <tr key={index} onClick={()=> fillOrderHandler(order)} >
                                                    <td>{order.token0amount} </td>
                                                    <td style={{color: `${order.orderTypeClass}`}}>{order.tokenPrice} </td>
                                                    <td>{order.token1amount}</td>
                                                </tr>
                                            )
                                        })
                                    
                                    }
                                </tbody>
                            </table>
                        ):(
                            <p className="flex-center" >No BUY ORDERS!!!</p>
                        )
                    }

                

            </div>
        </div>
    );
}


export default Orderbook;