import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
    myEventsSelector
} from "../store/selectors";

import config from '../config.json';


const Alert = ()=>{
    const network = useSelector(state => state.provider.chainId);
    const isPending = useSelector(state => state.exchange.transaction.isPending);
    const account = useSelector( state => state.provider.account);
    const isError = useSelector(state => state.exchange.transaction.isError);
    const events = useSelector(myEventsSelector);
    
    const alertRef = useRef(null);

    useEffect(()=>{
        if(( (events && events[0]) || isPending || isError) && account){
            alertRef.current.className = 'alert';
        }
    },[events,isPending, isError, account])


    const removeHandler = ()=>{
        alertRef.current.className = 'alert--remove';
    }

    return(
        <div>

            {
                isPending?(
                    <div ref={alertRef} onClick={removeHandler} className="alert alert--remove" >
                        <h1>Transaction Pending...</h1>
                    </div>
                ): isError ? (
                    <div className="alert alert--remove" ref={alertRef} onClick={removeHandler}> 
                        <h1>Transaction will Fail</h1>
                    </div>
                ): !isPending && (events &&events[0]) ?(
                    <div className="alert alert--remove" ref={alertRef} onClick={removeHandler}>
                        <h1>Transaction Successful</h1>
                        <a
                        href={config[network]? `${config[network].explorerUrl}/tx/${events[0].transactionHash}`:'#'}
                        target='_blank'
                        rel='noreferrer'
                        >
                            {events[0].transactionHash.slice(0,6)+'...'+events[0].transactionHash.slice(60,66)}
                        </a>
                    </div>
                ):(
                    <div className="alert alert--remove" ref={alertRef} onClick={removeHandler} > </div>
                )
            }
            
            
            
        </div>
    );

}

export default Alert;