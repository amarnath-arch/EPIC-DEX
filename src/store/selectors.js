import { createSelector } from "reselect";
import {get, groupBy, reject, maxBy, minBy} from "lodash";
import {ethers} from "ethers";
import moment from 'moment';

const tokens = state => get(state,'tokens.contracts');
const account = state => get(state,'provider.account');
const allOrders = state => get(state, 'exchange.allOrders.data',[]);
const cancelledOrders = state => get(state,'exchange.cancelledOrders.data',[]);
const filledOrders = state => get(state,'exchange.filledOrders.data',[]);
const events = state => get(state, 'exchange.events',[]);


const openOrders = state => {
    const all = allOrders(state);
    const filled = filledOrders(state);
    const cancelled = cancelledOrders(state);

    let openOrders = reject(all, (order)=>{
        const orderFilled = filled.some( o => o.orderId.toString() === order.orderId.toString())
        return orderFilled;
    })


    openOrders = reject(openOrders, (order)=>{
        const ordercancelled = cancelled.some( o => o.orderId.toString() === order.orderId.toString())
        return ordercancelled;
    })


    return openOrders;
    
}





const GREEN = '#25CE8F'
const RED = "#F45353"

const decorateOrder= (order,tokens)=>{
    let token0amount, token1amount;

    if(order.tokengive === tokens[1].address){
        token0amount = order.amountget;
        token1amount = order.amountgive;
    }else{
        token0amount = order.amountgive;
        token1amount = order.amountget;
    }

    let tokenPrice = token1amount / token0amount;
    tokenPrice = Math.round(tokenPrice * 100000) / 100000;

    return {
        ...order,
        token0amount: ethers.utils.formatEther(token0amount),
        token1amount: ethers.utils.formatEther(token1amount),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format("h:mm:ssa y/M/D")
    }   
}





const decorateOrderBookOrder = (order, tokens)=>{
    const orderType = (order.tokengive === tokens[1].address ? 'buy' : 'sell');

    return {
        ...order,
        orderType, 
        orderTypeClass: (orderType === 'buy'? GREEN: RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    }
}

const decorateOrderBookOrders = (orders,tokens) =>{
    return(
        orders.map((order)=>{
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order,tokens)
            return order;
        })
    );
}

// -----------------------------
// My EVents Selector

export const myEventsSelector= createSelector(
    account,
    events,
    (account,events)=>{
        if(events.length === 0) { return }
        events = events.filter(e => e.args.user === account || e.args.creator === account);

        return events;

    }
)


export const orderBookSelector = createSelector(openOrders,tokens,(orders,tokens)=>{
    if(!tokens[0] || !tokens[1]) { return  }

    orders = orders.map(order =>{
        return{
            ...order,
            tokengive: order.tokengive ? order.tokengive: order._tokengive,
            amountgive: order.amountgive ? order.amountgive: order._amountgive,
            tokenget: order.tokenget ? order.tokenget: order._tokenget,
            amountget: order.amountget ? order.amountget: order._amountget,
        }
    })
    
    
    orders = orders.filter(o=> (o.tokengive === tokens[0].address || o.tokengive === tokens[1].address));
    orders = orders.filter(o=> (o.tokenget === tokens[0].address || o.tokenget === tokens[1].address));



    orders = decorateOrderBookOrders(orders,tokens);


    // group by orderType
    orders = groupBy(orders,'orderType');

    // fetch the buyOrders
    const buyOrders = get(orders,'buy',[]);

    // fetch the sell orders
    const sellOrders = get(orders,'sell',[]);


    // sort the orders
    orders= {
        ...orders,
        buyOrders: buyOrders.sort((a,b)=> b.tokenPrice - a.tokenPrice), 
        sellOrders: sellOrders.sort((a,b)=> b.tokenPrice - a.tokenPrice) 
    }
    
    return orders;
    

});


// ------------------------------------------
// My Open orders Selector

export const myOpenOrdersSelector = createSelector(
    openOrders,
    tokens,
    account,
    (orders,tokens,account)=>{
        if(!tokens[0] || !tokens[1] || !account) { return }

        orders = orders.map(order =>{
            return{
                ...order,
                tokengive: order.tokengive ? order.tokengive: order._tokengive,
                amountgive: order.amountgive ? order.amountgive: order._amountgive,
                tokenget: order.tokenget ? order.tokenget: order._tokenget,
                amountget: order.amountget ? order.amountget: order._amountget,
            }
        })

        // filter the orders
        orders = orders.filter(o=> o.user === account);

        orders = orders.filter(o=> (o.tokengive === tokens[0].address || o.tokengive === tokens[1].address));
        orders = orders.filter(o=> (o.tokenget === tokens[0].address || o.tokenget === tokens[1].address));

        orders = decorateMyOpenOrders(orders,tokens);
        
        // sort the orders
        orders.sort((a,b)=> b.timestamp - a.timestamp);

        return orders;


})

const decorateMyOpenOrders= (orders, tokens)=>{
    return(
        orders.map(order=>{
            order = decorateOrder(order, tokens)
            order = decorateMyOpenOrder(order,tokens)
            return order
        })
    )
}

const decorateMyOpenOrder=(order,tokens)=>{
    let orderType = (order.tokengive === tokens[1].address?'buy':'sell');

    return {
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy'?GREEN:RED)
    }
}


// ------------------------------------------
// My filled orders Selector

export const myFilledOrdersSelector = createSelector(
    filledOrders,
    tokens,
    account,
    (orders,tokens,account)=>{
        if(!tokens[0] || !tokens[1] || !account) { return }

        // filter the orders
        orders = orders.filter(o=> o.user === account || o.creator === account);

        orders = orders.filter(o=> (o.tokengive === tokens[0].address || o.tokengive === tokens[1].address));

        orders = orders.filter(o=> (o.tokenget === tokens[0].address || o.tokenget === tokens[1].address));

        orders = decorateMyFilledOrders(orders,tokens, account);
        
        // // sort the orders
        orders.sort((a,b)=> b.timestamp - a.timestamp);

        return orders;


})

const decorateMyFilledOrders= (orders, tokens, account )=>{
    return(
        orders.map(order=>{
            order = decorateOrder(order, tokens)
            order = decorateMyFilledOrder(order,tokens, account)
            return order
        })
    )
}

const decorateMyFilledOrder=(order,tokens,account)=>{
    const myOrder = order.creator === account;

    let orderType
    if(myOrder){
        orderType = (order.tokengive === tokens[1].address?'buy':'sell');
    }else{
        orderType = (order.tokengive === tokens[1].address?'sell':'buy');
    }

    return {
        ...order,
        orderType,
        orderClass: (orderType === 'buy'?GREEN:RED),
        orderSign: (orderType === 'buy'?'+':'-')
    }
}





// ------------------------------------------
// Filled Order selector  

export const FilledOrderSelector = createSelector(
    filledOrders,
    tokens,
    (orders,tokens)=>{
        if(!tokens[0] || !tokens[1]) { return }

        // filter the orders
        orders = orders.filter(o=> (o.tokengive === tokens[0].address || o.tokengive === tokens[1].address));
        orders = orders.filter(o=> (o.tokenget === tokens[0].address || o.tokenget === tokens[1].address));

        // sort the orders 
        orders.sort((a,b) => a.timestamp - b.timestamp);



        //decorate the orders
        orders = decorateFilledOrders(orders,tokens);

        // sort the orders in descending order
        orders.sort((a,b)=> b.timestamp - a.timestamp);


        return orders;
})

const decorateFilledOrders = (orders, tokens)=>{
    let previousOrder = orders[0];
    return (
        orders.map(order =>{
            order = decorateOrder(order,tokens)
            order = decorateFilledOrder(order, previousOrder)
            previousOrder = order
            return order;
        })
    )
}

const decorateFilledOrder = (order, previousOrder)=>{
    return ({
        ...order,
        tokenPriceClass: (order.tokenPrice >= previousOrder.tokenPrice? GREEN : RED)
    })
}




// ------------------------------------------
// Price Chart 

export const PriceChartSelector = createSelector(
    filledOrders,
    tokens,
    (orders,tokens)=>{
        
        if(!tokens[0] || !tokens[1]) { return }

        // filter the orders
        orders = orders.filter(o=> (o.tokengive === tokens[0].address || o.tokengive === tokens[1].address));
        orders = orders.filter(o=> (o.tokenget === tokens[0].address || o.tokenget === tokens[1].address));

        orders = orders.sort((a,b) => a.timestamp - b.timestamp);

        // decorate the orders
        orders = orders.map(order => {
            order = decorateOrder(order,tokens)
            return order
        })

        const [secondlastOrder, lastOrder ] = orders.slice(orders.length - 2, orders.length);
        const lastPrice = get(lastOrder, 'tokenPrice');
        const secondLastPrice = get (secondlastOrder, 'tokenPrice');
        const lastPriceChange = (lastPrice >= secondLastPrice?'+':'-');


        return ({
            lastPrice,
            lastPriceChange,
            series:[{
                    data: buildGraphData(orders)
                }]
        })
})


const buildGraphData = (orders) =>{
    
    orders = groupBy(orders,(o)=> moment.unix(o.timestamp).startOf('hour').format())

    const hours = Object.keys(orders);

    const graphData = hours.map(hour =>{
        const group = orders[hour];
        // calculate open,high, low, close
        const open = group[0];
        const high = maxBy(group, 'tokenPrice');
        const low = minBy(group, 'tokenPrice');
        const close = group[group.length -1];

        return{
            x: new Date(hour),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        }
    })
    
    return graphData;
}

