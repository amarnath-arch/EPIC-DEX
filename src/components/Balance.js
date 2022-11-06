import { useEffect, useState, useRef } from "react";
import TokenLogo from "../assets/dapp.svg";
import eth from "../assets/eth.svg";
import {useSelector, useDispatch} from "react-redux";

import {
    loadBalances,
    transferTokens
} from "../store/interactions";

const Balance = ()=>{
    const [token1TransferAmount,settoken1TransferAmount] = useState(0);
    const [token2TransferAmount,settoken2TransferAmount] = useState(0);
    const [isDeposit , setisDeposit] = useState(true);

    const depositRef= useRef(null);
    const withdrawRef= useRef(null);

    const symbols = useSelector(state => state.tokens.symbols);
    const account = useSelector(state => state.provider.account);
    const tokens = useSelector( state => state.tokens.contracts);
    const exchange = useSelector(state => state.exchange.contract);
    const tokenBalances = useSelector(state => state.tokens.balances);
    const exchangeBalances = useSelector(state => state.exchange.balances);
    const provider = useSelector(state => state.provider.connection);
    const transferInProgress = useSelector(state => state.exchange.transferInProgress);

    const dispatch = useDispatch();


    useEffect(()=>{        
        if(tokens[0] && tokens[1] && account && exchange ) loadBalances(dispatch,tokens,account, exchange);  
    },[tokens, account, exchange, transferInProgress])


    const amountHandler = async(e, token)=>{
        if(token.address == tokens[0].address){
            settoken1TransferAmount(e.target.value);
        }else{
            settoken2TransferAmount(e.target.value);
        }
    }

    const depositHandler = async(e,token)=>{
        e.preventDefault();

        if(token.address == tokens[0].address){
            transferTokens(dispatch, provider, exchange, 'Deposit', token, token1TransferAmount);
            settoken1TransferAmount(0);
        }else{
            transferTokens(dispatch, provider, exchange, 'Deposit', token, token2TransferAmount);
            settoken2TransferAmount(0);
        }
    }

    const withdrawHandler = async(e,token)=>{
        e.preventDefault();

        if(token.address == tokens[0].address){
            transferTokens(dispatch, provider, exchange, 'Withdraw', token, token1TransferAmount);
            settoken1TransferAmount(0);
        }else{
            transferTokens(dispatch, provider, exchange, 'Withdraw', token, token2TransferAmount);
            settoken2TransferAmount(0);
        }
    }

    const tabHandler= (e)=>{
        if(e.target.className !== depositRef.current.className){
            depositRef.current.className = 'tab';
            setisDeposit(false);
        }else{
            withdrawRef.current.className = 'tab';
            setisDeposit(true);
        }
        e.target.className = 'tab tab--active';

    }

    return(
        <div className="component exchange__transfers">
            <div className="component__header flex-between" >
                <h2>Balance</h2>
                <div className="tabs">
                    <button onClick={tabHandler} ref={depositRef} className="tab tab--active">Deposit</button>
                    <button onClick={tabHandler} ref={withdrawRef} className="tab">Withdraw</button>
                </div>
            </div>
            
            {/* Deposit/Withdraw for token1 i.e epic token */}
            <div className="exchange__transfers--form" >
                <div className="flex-between" >
                    <p> <small>Token</small> <br/> <img src={eth} alt="TokenLogo" /> {symbols && symbols[0] } </p>
                    <p> <small>Wallet</small> <br /> {tokenBalances && Number(tokenBalances[0]).toFixed(4) } </p>
                    <p> <small>Deposit</small> <br /> {exchangeBalances && Number(exchangeBalances[0]).toFixed(4)} </p>
                </div>

                <form onSubmit = {isDeposit? (e)=> depositHandler(e,tokens[0]) : (e)=> withdrawHandler(e, tokens[0])} >
                    <label htmlFor="token0">{`${symbols && symbols[0]} Amount`} </label>
                    <input 
                    type="text" 
                    id="token0" 
                    placeholder="0.0000" 
                    value={token1TransferAmount === 0? '': token1TransferAmount}
                    onChange={(e)=> amountHandler(e,tokens[0]) } />

                    <button className="button" type="submit">
                        {
                            isDeposit ?(
                                <span>Deposit</span>
                            ):(
                                <span>Withdraw</span>
                            )
                        }
                    </button>
                </form>
            </div>

            <hr />

            {/* Deposit/Withdraw for token2 i.e mETH */}
            <div className="exchange__transfers--form" >
                <div className="flex-between" >
                    <p> <small>Token</small> <br/> <img src={eth} alt="TokenLogo" /> {symbols && symbols[1] } </p>
                    <p> <small>Wallet</small> <br /> {tokenBalances && Number(tokenBalances[1]).toFixed(4) } </p>
                    <p> <small>Deposit</small> <br /> {exchangeBalances && Number(exchangeBalances[1]).toFixed(4)} </p>
                </div>

                <form onSubmit = {isDeposit? (e)=> depositHandler(e,tokens[1]) : (e)=> withdrawHandler(e, tokens[1])}>
                    <label htmlFor="token1">{`${symbols && symbols[1]} Amount`}</label>
                    <input 
                    type="text" 
                    id="token1" 
                    placeholder="0.0000" 
                    value={token2TransferAmount===0?'':token2TransferAmount}
                    onChange={(e)=> amountHandler(e,tokens[1]) }
                    />

                    <button className="button" type="submit">
                        {
                            isDeposit ?(
                                <span>Deposit</span>
                            ):(
                                <span>Withdraw</span>
                            )
                        }
                    </button>
                </form>
            </div>

            <hr />



        </div>

    );
}

export default Balance;