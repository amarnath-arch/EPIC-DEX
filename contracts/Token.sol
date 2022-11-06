// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;


import "hardhat/console.sol";

contract Token{
    string public name="My Token";
    string public symbol;
    uint8 public decimals= 18;
    uint256 public totalSupply;
    address owner;

    //mappings
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    //events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner,address indexed spender, uint256 value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply 
    ){
        name = _name;
        symbol = _symbol;
        totalSupply=_totalSupply * (10 ** decimals);
        balanceOf[msg.sender]= totalSupply;
        owner = msg.sender;
    }


    function mint(address _to,uint256 _value) public returns(bool){
        require(msg.sender == owner,"Not Authorised");
        balanceOf[_to]+=_value;
        return true;
    }


    function transfer(address _to, uint256 _value) public returns(bool){
        require(balanceOf[msg.sender] >= _value,"Not enough balance");
        _transfer(msg.sender,_to,_value);
        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal {
        require(_to != address(0),'The recipient address cannot be a zero address');
        balanceOf[_from]-=_value;
        balanceOf[_to]+=_value;
        emit Transfer(_from,_to,_value);
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )public returns(bool success){
        // check approval 
        require(allowance[_from][msg.sender]>= _value, "Check the allowance");
        require(balanceOf[_from] >= _value, "Account owner has not sufficient Balance");

        allowance[_from][msg.sender] -= _value;
        // transfer the funds
        _transfer(_from,_to,_value);

        return true;
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns(bool _success){
        require(balanceOf[msg.sender] >= _value,"Insufficient Balance");
        allowance[msg.sender][_spender]=_value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }







}

