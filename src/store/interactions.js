import { ethers } from "ethers";
import Token_abi from "../abis/Token.json";
import Exchange_abi from "../abis/Exchange.json";

export const loadProvider = async(dispatch)=>{
    // load the provider;
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({type: "PROVIDER_LOADED", connection});

    return connection;
}


export const loadNetwork = async(dispatch,provider)=>{
    // load the network
    const {chainId} = await provider.getNetwork();
    dispatch({type: "NETWORK_LOADED", chainId});

    return chainId;
}

export const loadAccount = async(dispatch,provider)=>{
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    const account = ethers.utils.getAddress(accounts[0]);


    dispatch({type:"ACCOUNT_LOADED", account});

    let balance = await provider.getBalance(account);
    balance = await ethers.utils.formatEther(balance,'ether');

    dispatch({type: "ETH_BALANCE_LOADED", balance});

    return account;
}

export const loadTokens = async(dispatch, provider, addresses)=>{


    let token = new ethers.Contract(addresses[0],Token_abi,provider);
    let symbol = await token.symbol();
    dispatch({type: 'TOKEN1_LOADED', token, symbol});

    token = new ethers.Contract(addresses[1],Token_abi,provider);
    symbol = await token.symbol();
    dispatch({type: "TOKEN2_LOADED",token,symbol});

    return token;

}


export const loadExchange= async(dispatch,address,provider)=>{
    const exchange = new ethers.Contract(address,Exchange_abi,provider);
    dispatch({type:"EXCHANGE_LOADED", exchange});
    return exchange;
}

export const subscribeToEvents= async(dispatch, exchange)=>{
    
    exchange.on('OrderCancelled',(id,user,tokengive,amountgive,tokenget,amountget,timestamp,event)=>{
        let o={
            ...event.args,
            user,
            tokengive,
            amountgive,
            tokenget,
            amountget,
            timestamp
        }
        event.args = o;
        const order = event.args;
        
        dispatch({type:"ORDER_CANCEL_SUCCESS",event,order})

    })

    exchange.on('Trade',(id,user,tokenget,amountget,tokengive,amountgive,creator,timestamp,event)=>{
        let o={
            ...event.args,
            user,
            tokengive,
            amountgive,
            tokenget,
            amountget,
            creator,
            timestamp
        }
        event.args = o;
        const order = event.args;
        dispatch({type:"ORDER_FILL_SUCCESS",event, order,orderId: id});
    })

    exchange.on('Deposit',(token, user, amount, balance, event)=>{
        let o={
            ...event.args,
            user,
            token,
            amount,
            balance
        }
        event.args = o;
        dispatch({type:"TRANSFER_SUCCESS", event});
    })

    exchange.on('Withdraw',(token, user, amount, balance, event)=>{
        let o= event.args={
            ...event.args,
            user,
            token,
            amount,
            balance
        }
        event.args = o;
        dispatch({type:"TRANSFER_SUCCESS", event});
    })

    exchange.on('OrderCreated',(id,user,tokengive,amountgive,tokenget,amountget,timestamp,event)=>{
        const o={
            ...event.args,
            user,
            tokengive,
            amountgive,
            tokenget,
            amountget,
            timestamp
        }
        event.args = o;
        const order = event.args;

        dispatch({type:"NEW_ORDER_SUCCESS",order,event, orderId: id})
    })
}

export const loadAllOrders=async(provider, exchange, dispatch)=>{
    const block = provider.getBlockNumber();

    const orderStream = await exchange.queryFilter('OrderCreated',0,block);
    const orders = orderStream.map(event => event.args)
    dispatch({type: "ALL_ORDERS_LOADED", orders});


    const cancelledOrderStream = await exchange.queryFilter('OrderCancelled',0,block);
    const cancelledOrders = cancelledOrderStream.map(event => event.args);
    dispatch({type: "CANCELLED_ORDERS_LOADED", cancelledOrders});

    
    const filledOrdersStream = await exchange.queryFilter('Trade',0,block);
    const filledOrders = filledOrdersStream.map(event => event.args);
    dispatch({type: "FILLED_ORDERS_LOADED", filledOrders});
}


export const loadBalances = async(dispatch, tokens, user,exchange)=>{

    // let balance = await tokens[0].balanceOf(user);
    // balance = ethers.utils.formatUnits(balance.toString(),18);
    // dispatch({type:"TOKEN1_BALANCELOADED",balance});

    let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(user),18);
    dispatch({type: "TOKEN1_BALANCELOADED", balance});

    // console.log("-----------------------------------------")
    // console.log(await exchange.feePercentage());

    // exchange deposit balance 
    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address,user),18);
    dispatch({type: "EXCHANGE_TOKEN1BALANCELOADED", balance});

    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(user),18);
    dispatch({type: "TOKEN2_BALANCELOADED", balance});

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address,user),18);
    dispatch({type: "EXCHANGE_TOKEN2BALANCELOADED", balance});
    

}


export const transferTokens = async(dispatch, provider, exchange, transferType, token, amount)=>{

    dispatch({type: "TRANSFER_REQUEST"})

    try{
        const signer = provider.getSigner();
        amount = ethers.utils.parseUnits(amount,'ether');
        let transaction;

        if(transferType === "Deposit"){
            transaction = await token.connect(signer).approve(exchange.address, amount);
            await transaction.wait();

            transaction = await exchange.connect(signer).depositTokens(token.address, amount);
            await transaction.wait();
        }else if( transferType === 'Withdraw'){
            transaction = await exchange.connect(signer).withdrawTokens(token.address,amount);
            transaction.wait();
        }

        
    }catch(error){
        dispatch({type: "TRANSFER_FAIL"});
    }


}


// Creating the orders

export const makeBuyOrder=async(dispatch, provider, tokens, order, exchange)=>{
    const tokengive = tokens[1].address;
    const amountgive= ethers.utils.parseUnits((order.amount * order.price).toString(),'ether');
    const tokenget = tokens[0].address;
    const amountget = ethers.utils.parseUnits(order.amount,'ether');


    dispatch({type:"NEW_ORDER_REQUEST"});

    const signer = provider.getSigner();

    try{
        let transaction = await exchange.connect(signer).makeOrder(tokengive,amountgive,tokenget,amountget);
        await transaction.wait();
    }catch(error){
        dispatch({type:"NEW_ORDER_FAIL"});
    }


}

export const makeSellOrder=async(dispatch, provider, tokens, order, exchange)=>{
    const tokengive = tokens[0].address;
    const amountgive= ethers.utils.parseUnits(order.amount,'ether');
    const tokenget = tokens[1].address;
    const amountget = ethers.utils.parseUnits((order.amount * order.price).toString(),'ether');


    dispatch({type:"NEW_ORDER_REQUEST"});

    const signer = provider.getSigner();

    try{
        let transaction = await exchange.connect(signer).makeOrder(tokengive,amountgive,tokenget,amountget);
        await transaction.wait();
    }catch(error){
        dispatch({type:"NEW_ORDER_FAIL"});
    }


}


export const cancelOrder = async(dispatch, provider, exchange, order)=>{

    dispatch({type:"ORDER_CANCEL_REQUEST"});

    const signer = provider.getSigner();

    try{
        let transaction = await exchange.connect(signer).cancelOrder(order.orderId);
        await transaction.wait();
    }catch(error){
        dispatch({type:"ORDER_CANCEL_FAIL"});
    }

}


export const fillOrder = async(dispatch, provider, exchange, order)=>{
    dispatch({type:"ORDER_FILL_REQUEST"});

    const signer = provider.getSigner();

    try{
        let transaction = await exchange.connect(signer).fillOrder(order.orderId);
        await transaction.wait();
    }catch(error){
        dispatch({type:"ORDER_FILL_FAIL"});
    }
}

