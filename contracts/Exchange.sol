//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange{
    address payable feeCollector;
    uint256 public feePercentage;
    uint256 public orderCount;


    // structs
    struct _Order{
        uint256 orderId;
        address user;
        address tokengive;
        uint256 amountgive;
        address tokenget;
        uint256 amountget;
        uint256 timestamp;
    } 

    // mappings
    mapping(address => mapping(address => uint256)) Tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public cancelledOrders;
    mapping(uint256 => bool) public filledOrders;

    //events
    event Deposit(
        address indexed token,
        address indexed user,
        uint256 amount, 
        uint256 balance
    );
    
    event Withdraw(
        address indexed token, 
        address indexed user,
        uint256 amount, 
        uint256 balance
    );
    
    event OrderCreated(
        uint256 indexed orderId,
        address indexed user,
        address tokengive,
        uint256 amountgive,
        address tokenget,
        uint256 amountget,
        uint256 timestamp
    );

    event OrderCancelled(
        uint256 indexed orderId,
        address indexed user,
        address tokengive,
        uint256 amountgive,
        address tokenget,
        uint256 amountget,
        uint256 timestamp
    );

    event Trade(
        uint256 orderId,
        address user,
        address tokenget,
        uint256 amountget,
        address tokengive,
        uint256 amountgive,
        address creator,
        uint256 timestamp
    );


    constructor(
        address payable _feeCollector,
        uint256 _feePercentage
    ){
        feeCollector= _feeCollector;
        feePercentage = _feePercentage;
    }

    // Deposit and withdraw the funds
    function depositTokens(
        address _token,
        uint256 _amount
    )public returns(bool){
        require(_amount > 0, "Minimum amount should be greater than zero");

        // deposit the tokens
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        // update the balances
        Tokens[_token][msg.sender]+=_amount;
        // emit the event
        emit Deposit(_token,msg.sender,_amount,Tokens[_token][msg.sender]); 

        return true;
    }

    function withdrawTokens(
        address _token,
        uint256 _amount
    )public returns(bool){
        require(_amount <= Tokens[_token][msg.sender], "Insufficient Deposited Tokens");
        
        // update the balances
        Tokens[_token][msg.sender] -= _amount;
        //withdraw the funds
        Token(_token).transfer(msg.sender, _amount);
        // emit the event
        emit Withdraw(_token,msg.sender,_amount, Tokens[_token][msg.sender]);

        return true;
    }

    // Check balances
    function balanceOf(
        address _token,
        address _user
    )public view returns(uint256){
        return Tokens[_token][_user];
    }


    //making the orders
    function makeOrder(
        address _tokengive,
        uint256 _amountgive,
        address _tokenget,
        uint256 _amountget
    )public returns(bool success){
        // necessary validations
        require(_amountgive > 0,"Amount of tokens given should be greater than zero");
        require(_tokengive!= address(0) && _tokenget!= address(0), "Address of tokens should not be a zero address");
        require(Tokens[_tokengive][msg.sender] >= _amountgive,"Insufficient deposits to create an Order");


        // create an order
        orderCount+=1;
        orders[orderCount]= _Order({
            orderId: orderCount,
            user: msg.sender,
            tokengive: _tokengive,
            amountgive: _amountgive,
            tokenget: _tokenget,
            amountget: _amountget,
            timestamp: block.timestamp
        });

        // emit an event 
        emit OrderCreated(
            orderCount,
            msg.sender,
            _tokengive, 
            _amountgive, 
            _tokenget, 
            _amountget, 
            block.timestamp
        );

        return true;
    }

    // cancel the order
    function cancelOrder(
        uint256 _orderId
    )public returns(bool success){
        // necessary validations
        require(_orderId> 0 && _orderId <= orderCount,"Invalid orderId");
        require(orders[_orderId].user == msg.sender,"Not Authorised to cancel the order");

        // cancel the order
        cancelledOrders[_orderId] = true;

        // emit an event
        emit OrderCancelled(
                orders[_orderId].orderId, 
                orders[_orderId].user, 
                orders[_orderId].tokengive, 
                orders[_orderId].amountgive, 
                orders[_orderId].tokenget, 
                orders[_orderId].amountget, 
                block.timestamp
        );

        return true;
    }


    // fill the order
    function fillOrder(
        uint256 _orderId
    ) public returns(bool success){
        require(_orderId > 0 && _orderId <= orderCount, "Invalid Order Id");
        require(!cancelledOrders[_orderId] , "Order has already been cancelled");
        require(!filledOrders[_orderId],"Order has already been filled");

        // execute the trade
        trade(
            _orderId,
            msg.sender,
            orders[_orderId].user,
            orders[_orderId].tokengive,
            orders[_orderId].amountgive,
            orders[_orderId].tokenget,
            orders[_orderId].amountget
        );

        filledOrders[_orderId] = true;

        return true;
    }


    function trade(
        uint256 _orderId,
        address user,
        address creator,
        address tokengive,
        uint256 amountgive,
        address tokenget,
        uint256 amountget

    )private{

        uint256 feeAmount = (feePercentage * amountget) / 100;


        require(Tokens[tokenget][user] >= (feeAmount + amountget),"Not sufficient deposits to execute the trade");

        // change the balances
        Tokens[tokengive][user] = Tokens[tokengive][user]+ amountgive;
        Tokens[tokengive][creator] = Tokens[tokengive][creator] - amountgive;
        
        Tokens[tokenget][creator] += amountget;
        Tokens[tokenget][user]-= (amountget + feeAmount);

        // charge fees
        Tokens[tokenget][feeCollector] += feeAmount;

        //emit trade event
        emit Trade(
            _orderId,
            user,
            tokenget,
            amountget,
            tokengive,
            amountgive,
            creator,
            block.timestamp
        );
    }




}