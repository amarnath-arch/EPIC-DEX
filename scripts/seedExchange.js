const { ethers } = require("hardhat");

const config = require('../src/config.json');

const change = (n)=>{
    return ethers.utils.parseUnits(n.toString(),'ether');
}

const wait = (seconds)=>{
    const milliseconds = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve,milliseconds));
}

const main= async()=>{
    // fetch the accounts
    const accounts = await ethers.getSigners();

    const deployer = accounts[0];
    const user1= accounts[0];
    const user2= accounts[1];

    let transaction,result;

    const {chainId} = await ethers.provider.getNetwork();

    // get the contracts 
    const exchange = await ethers.getContractAt("Exchange",config[chainId].exchange.address);
    const epic = await ethers.getContractAt("Token",config[chainId].epic.address);
    const mEth = await ethers.getContractAt("Token",config[chainId].mEth.address);
    const mDai = await ethers.getContractAt("Token",config[chainId].mDAI.address);

    console.log(`
    Exchange Address:${exchange.address}\n
    Epic Address:${epic.address}\n
    mEth Address:${mEth.address}\n
    mDai Address:${mDai.address}\n
    `)
    
    // transfer the tokens
    // await epic.connect(deployer).transfer(user1.address,change(10000));
    await mEth.connect(deployer).transfer(user2.address,change(100000));

    console.log(`balance user1: ${await epic.balanceOf(user1.address)}`);
    console.log(`balance user2: ${await mEth.balanceOf(user2.address)}`);

    // approve the exchange contract 
    await epic.connect(user1).approve(exchange.address,change(1000));
    await mEth.connect(user2).approve(exchange.address,change(2000));

    // deposit the balances
    await exchange.connect(user1).depositTokens(epic.address,change(1000));
    await exchange.connect(user2).depositTokens(mEth.address,change(2000));

    console.log(`After depositing balance of user1:${await exchange.balanceOf(epic.address,user1.address)}`);
    console.log(`After depositing balance of user2:${await exchange.balanceOf(mEth.address,user2.address)}`);

    // make Order

    transaction = await exchange.connect(user1).makeOrder(epic.address,change(10),mEth.address,change(5));
    result = await transaction.wait();
    console.log(`Order made from ${user1.address}`);
    let orderId= result.events[0].args.orderId;

    // cancel Order
    transaction = await exchange.connect(user1).cancelOrder(orderId);
    console.log(`Order Cancelled from ${user1.address}`);

    await wait(1);

    transaction = await exchange.connect(user1).makeOrder(epic.address,change(10),mEth.address,change(5));
    result = await transaction.wait();
    orderId= result.events[0].args.orderId;
    console.log(`Order made from ${user1.address}`);

    transaction = await exchange.connect(user2).fillOrder(orderId);
    result= await transaction.wait();
    console.log(`Filled Order from :${user2.address}`);

    await wait(1);


    transaction = await exchange.connect(user1).makeOrder(epic.address,change(20),mEth.address,change(30));
    result = await transaction.wait();
    orderId= result.events[0].args.orderId;
    console.log(`Order made from ${user1.address}`);

    transaction = await exchange.connect(user2).fillOrder(orderId);
    result= await transaction.wait();
    console.log(`Filled Order from :${user2.address}`);

    await wait(1);

    transaction = await exchange.connect(user1).makeOrder(epic.address,change(30),mEth.address,change(50));
    result = await transaction.wait();
    orderId= result.events[0].args.orderId;
    console.log(`Order made from ${user1.address}`);

    transaction = await exchange.connect(user2).fillOrder(orderId);
    result= await transaction.wait();
    console.log(`Filled Order from :${user2.address}`);

    for( let i=1;i<=10;++i){    
        transaction = await exchange.connect(user1).makeOrder(epic.address,change(10*i),mEth.address,change(10));
        result = await transaction.wait();
        orderId= result.events[0].args.orderId;
        console.log(`Order made from ${user1.address}`);

        await wait(1);
    }

    for( let i=1;i<=10;++i){    
        transaction = await exchange.connect(user2).makeOrder(mEth.address,change(10*i),epic.address,change(10));
        result = await transaction.wait();
        orderId= result.events[0].args.orderId;
        console.log(`Order made from ${user2.address}`);

        await wait(1);
    }

}


main()
    .then(()=> process.exit(0))
    .catch((error)=>{
        console.error(error);
        process.exit(1);
    })