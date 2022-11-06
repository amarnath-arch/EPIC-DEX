const {expect} = require('chai');
const { ethers } = require('hardhat');
const { relativeTimeThreshold } = require('moment/moment');


describe('Exchange',()=>{
    let token1,token2,exchange,deployer,user1,user2;

    beforeEach(async()=>{
        const Token = await ethers.getContractFactory('Token');
        const Exchange= await ethers.getContractFactory("Exchange");

        [deployer,user1,user2]= await ethers.getSigners();
        
        token1 = await Token.deploy(
            'Epicenter',
            'EPIC',
            '1000000'
        ); 

        token2 = await Token.deploy(
            'MockEther',
            'meth',
            '1000000'
        );

        await token1.deployed();
        await token2.deployed();

        exchange = await Exchange.deploy(
            deployer.address,
            10
        );

        await exchange.deployed();

    })

    describe('Depositing and Withdrawing Tokens',()=>{
        let amount;

        beforeEach(async()=>{
            amount = ethers.utils.parseUnits('100','ether')

            await token1.connect(deployer).transfer(
                user1.address,
                amount.toString()
            );

            await token1.connect(user1).approve(
                exchange.address,
                amount.toString()
            );
        })

        it('Successful depositing and withdrawing of the tokens',async()=>{

            console.log(`Hey how aree you`);

            await exchange.connect(user1).depositTokens(
                token1.address,
                amount.toString()
            );

            expect(await exchange.balanceOf(token1.address,user1.address)).to.be.equal(amount);

            await exchange.connect(user1).withdrawTokens(
                token1.address,
                amount.toString()
            )

            expect(await exchange.balanceOf(token1.address,user1.address)).to.be.equal(0);

        })
    })

    describe('Orders',()=>{
        let amount;

        function change(n){
            return ethers.utils.parseUnits(n.toString(),'ether')
        }

        beforeEach(async()=>{
            amount = change('100');
            
            await token1.connect(deployer).transfer(user1.address,change('100'));
            await token2.connect(deployer).transfer(user2.address,change('100'));

            // approve
            await token1.connect(user1).approve(exchange.address,change('1'));
            await token2.connect(user2).approve(exchange.address,change('2'));



            await exchange.connect(user1).depositTokens(token1.address,change('1'));
            await exchange.connect(user2).depositTokens(token2.address,change('2'));
            
        });

        it('create the order',async()=>{
            await exchange.connect(user1).makeOrder(
                token1.address,
                change('1'),
                token2.address,
                change('1')                
            );

            expect(await exchange.orderCount()).to.be.equal(1);
        })

        it('cancel the order',async ()=>{
            await exchange.connect(user1).makeOrder(
                token1.address,
                change('1'),
                token2.address,
                change('1')                
            );
            await exchange.connect(user1).cancelOrder(1);
        });

        it('create a trade',async()=>{
            await exchange.connect(user1).makeOrder(
                token1.address,
                change('1'),
                token2.address,
                change('1')                
            );

            await exchange.connect(user2).fillOrder(1);

            expect(await exchange.filledOrders(1)).to.be.equal(true);
            expect(await exchange.balanceOf(token2.address,user1.address)).to.be.equal(change('1'));
            expect(await exchange.balanceOf(token1.address,user1.address)).to.be.equal(change('0'));

            expect(await exchange.balanceOf(token2.address,user2.address)).to.be.equal(change('0.9'));
            expect(await exchange.balanceOf(token1.address,user2.address)).to.be.equal(change('1'));

        });


    });
});