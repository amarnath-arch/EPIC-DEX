export const provider = (state = {}, action)=>{
    switch(action.type){
        case "PROVIDER_LOADED":
                return{
                    ...state,
                    connection: action.connection
                }
        
        case "NETWORK_LOADED":
            return{
                ...state,
                chainId: action.chainId
            }
        
        case "ACCOUNT_LOADED":
            return{
                ...state,
                account : action.account
            }
        
        case "ETH_BALANCE_LOADED":
            return{
                ...state,
                balance: action.balance
            }
            

        default:
            return state;
    }
}

const DefaultTokenState= {
    loaded:false,
    contracts:[],
    symbols:[],
    balances:[]
}

export const tokens=(state= DefaultTokenState,action)=>{
    switch(action.type){
        case "TOKEN1_LOADED":
            return{
                ...state,
                loaded:true,
                contracts: [action.token],
                symbols: [action.symbol]
            }

        case "TOKEN1_BALANCELOADED":
            return{
                ...state,
                balances:[action.balance]
            }
        
        case "TOKEN2_LOADED":
            return{
                ...state,
                loaded:true,
                contracts: [...state.contracts ,action.token],
                symbols: [...state.symbols ,action.symbol]
            }

        case "TOKEN2_BALANCELOADED":
            return{
                ...state,
                balances:[...state.balances,action.balance]
            }
        
        
        default:
            return state
    }
}

const exchangeDefaultState = {
    loaded: false,
    contract: null,
    transaction:{
        isSuccessful: false
    },
    allOrders:{
        loaded: false,
        data:[]
    },
    filledOrders:{
        loaded:false,
        data:[]
    },
    cancelledOrders:{
        loaded:false,
        data:[]
    },
    events:[]
}

export const exchange = (state = exchangeDefaultState,action)=>{
    let index, data;
    switch (action.type){
        case "EXCHANGE_LOADED":
            return{
                ...state,
                loaded: true,
                contract: action.exchange
            }

        case "EXCHANGE_TOKEN1BALANCELOADED":
            return{
                ...state,
                balances:[action.balance]
            }

        case "EXCHANGE_TOKEN2BALANCELOADED":
            return{
                ...state,
                balances:[...state.balances,action.balance]
            }

        case "TRANSFER_REQUEST":
            return{
                ...state,
                transaction:{
                    isPending : true,
                    isSuccessful: false,
                    transactionType: 'Transfer'
                },
                transferInProgress: true
            }

        case "TRANSFER_SUCCESS":
            return {
                ...state,
                transaction:{
                    isPending : false,
                    isSuccessful: true,
                    transactionType: 'Transfer'
                }, 
                transferInProgress: false,
                events: [action.event,...state.events]

            }

        case "TRANSFER_FAIL":
            return{
                ...state,
                transaction:{
                    isPending: false,
                    isSuccessful: false,
                    transactionType: 'Transfer',
                    isError: true
                },
                transferInProgress: false
            }

        // --------------------------------
        // ORDER CASES

        case "ALL_ORDERS_LOADED":
            return{
                ...state,
                allOrders:{
                    loaded:true,
                    data: action.orders
                }
            }

        case "CANCELLED_ORDERS_LOADED":
            return{
                ...state,
                cancelledOrders:{
                    loaded:true,
                    data: action.cancelledOrders
                }
            }    

        case "FILLED_ORDERS_LOADED":
            return{
                ...state,
                filledOrders:{
                    loaded: true,
                    data: action.filledOrders
                }
            }

        // =======================
        // Cancel Order Cases

        case "ORDER_CANCEL_REQUEST":
            return {
                ...state,
                transaction:{
                    transactionType: 'CANCEL',
                    isPending: true,
                    isSuccessful: false
                }
            }

        case "ORDER_CANCEL_SUCCESS":
            return {
                ...state,
                transaction:{
                    isPending: false,
                    isSuccessful: true,
                    transactionType: 'CANCEL'
                },
                events: [action.event,...state.events],
                cancelledOrders:{
                    ...state.cancelledOrders,
                    data:[
                        ...state.cancelledOrders.data,
                        action.order
                    ]
                }
            }

        case "ORDER_CANCEL_FAIL":
            return{
                ...state,
                transaction: {
                    transactionType: 'CANCEL',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                }
            }

        // ------------------------------
        // Fill CASES

        case "ORDER_FILL_REQUEST":
            return{
                ...state,
                transaction:{
                    isPending: true,
                    isSuccessful: false,
                    transactionType:"FILL ORDER"
                }

            }

        case "ORDER_FILL_SUCCESS":
            // prevent the duplication 
            index = state.filledOrders.data.findIndex(order => order.orderId.toString() === action.orderId.toString())
            
            if(index === -1){
                data = [...state.filledOrders.data, action.order];
            }else{
                data = state.filledOrders.data;
            }
            
            return{
                ...state,
                transaction:{
                    isPending: false,
                    isSuccessful: true,
                    transactionType: "FILL ORDER"
                },
                filledOrders:{
                    ...state.filledOrders,
                    data
                },
                events: [action.event,...state.events]
            }

        case "ORDER_FILL_FAIL":
            return{
                ...state,
                transaction:{
                    transactionType:"FILL ORDER",
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                }
            }


        // ------------------------------
        // NEW Order CASES


        case "NEW_ORDER_REQUEST":
            return{
                ...state,
                transaction:{
                    isPending: true,
                    isSuccessful: false,
                    transactionType: "NEW ORDER"
                }
            }

        


        case "NEW_ORDER_SUCCESS":
            // prevent the duplication 
            index = state.allOrders.data.findIndex(order => order.orderId.toString() === action.orderId.toString())
            
            if(index === -1){
                data = [...state.allOrders.data, action.order];
            }else{
                data = state.allOrders.data;
            }
            
            return{
                ...state,
                transaction:{
                    isPending: false,
                    isSuccessful: true,
                    transactionType: "NEW ORDER"
                },
                allOrders:{
                    ...state.allOrders,
                    data
                },
                events: [action.event,...state.events]
            }

        case "NEW_ORDER_FAIL":
            return{
                ...state,
                transaction:{
                    isPending: false,
                    isSuccessful: false,
                    transactionType: "NEW ORDER",
                    isError: true
                }
            }
        
        
        
        default: 
            return state
    }
}