import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
    loadTokens
} from "../store/interactions";

import config from "../config.json";
import { useEffect } from "react";

const Markets = ()=>{
    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);
    const dispatch = useDispatch();

    const marketHandler = (event)=>{
         if(dispatch && provider && event)  loadTokens(dispatch,provider,(event.target.value).split(','));
    }


    return(
        <div className="component exchange__markets">
            <div className="component__header">
                <h2> Select Market</h2>
            </div>
            {
                chainId && config[chainId]?(
                    <select name="markets" id="markets" onChange={marketHandler} >
                        <option value={`${config[chainId].epic.address},${config[chainId].mEth.address}`} > Epic/mETH </option>
                        <option value={`${config[chainId].epic.address},${config[chainId].mDAI.address}`} > Epic/mDAI </option>
                    </select>
                ):(
                    <div>
                        <p> Market not deployed </p>
                    </div>
                )
            }
            
            <hr />

        </div>
    );
}

export default Markets;