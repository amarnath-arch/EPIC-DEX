import { useSelector } from "react-redux";
import sort from "../assets/sort.svg";
import Banner from "./Banner";

import { FilledOrderSelector } from "../store/selectors";


const Trades = ()=>{
    const symbols = useSelector(state => state.tokens.symbols);
    const filledOrders = useSelector(FilledOrderSelector);

    return(
        <div className="component exchange__trades">
            <div className="component__header flex-between">
                <h2>Trades</h2>
            </div>

            {
                (filledOrders && filledOrders.length ==0) ?(
                    <Banner text={'No Transactions'} />
                ):(
                    <table>
                        <thead>
                            <tr>
                                <th> Time <img src={sort} alt="sort" /></th>
                                <th>{symbols && symbols[0]} <img src={sort} alt="sort" /></th>
                                <th>{`${symbols && symbols[0]} / ${symbols && symbols[1]}`} <img src={sort} alt="sort" /></th>
                            </tr>
                        </thead>
                    
                        <tbody>
                            {
                                filledOrders && filledOrders.map((order,index) =>{
                                    return(
                                        <tr key={index}>
                                            <td>{order.formattedTimestamp} </td>
                                            <td style={{color: `${order.tokenPriceClass}`}}> {order.token0amount} </td>
                                            <td>{order.tokenPrice } </td>
                                        </tr>    
                                    )
                                    
                                })
                            }
                            
                        </tbody>
                    </table>
                )
            }
            
        </div>
    );
}

export default Trades;