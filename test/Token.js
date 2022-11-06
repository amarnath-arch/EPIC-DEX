const {expect} = require('chai');
const { ethers } = require('hardhat');

describe('Token',()=>{
    let token,deployer,recipient,exchange;
    beforeEach(async()=>{
    //    const Token= await ethers.getContractFactory("Token");
    //    token = await Token.deploy('My Token','Epicenter','1000000');
    //    await token.deployed();

        token = await ethers.getContractAt('Token','0x282d7FCB4796f8A7e46C3A2149d86e28bC135e85');
        console.log(token);

       [deployer] = await ethers.getSigners();
    });

    describe('deployment',async()=>{

        it('should be the correct name',async()=>{
            expect(await token.name()).to.equal('Epicenter');
        });

        it('should be the correct symbol',async()=>{
            expect(await token.symbol()).to.equal('EPIC');
        })

        it('should be the correct decimals',async()=>{
            expect(await token.decimals()).to.equal(18);
        });

        it('should assign the totalSupply to the deployer',async()=>{
            const balance = ethers.utils.parseUnits('1000000','ether');
            expect(await token.balanceOf(deployer.address)).to.equal(balance.toString());
        });

    })

    // describe('Spending Tokens',()=>{
    //     let result,transferamount;

    //     beforeEach(async()=>{
    //         transferamount = await ethers.utils.parseUnits('100','ether');
    //         const transaction = await token.connect(deployer).transfer(recipient.address,transferamount);
    //         result = await transaction.wait();
    //     })

    //     describe('Success',()=>{
    //         it('Successfully transfer the tokens',async()=>{
    //             expect(await token.balanceOf(recipient.address)).to.equal(transferamount);    
    //         });
    
    //         it('Should emit Transfer event',async()=>{
    //             expect(result.events[0].event).to.be.equal('Transfer');
    //             console.log(result.events[0].args._from);
    //             console.log(result.events[0].args._to);
    //             console.log(result.events[0].args.value);
    //         })
    //     });

    //     describe('Failure',()=>{
    //         it('Insufficient Balance',async()=>{
    //             // const transaction = await token.connect(recipient).transfer(recipient.address, transferamount);
    //             // await transaction.wait();
    //             // console.log(`Transfer amount is ${transferamount} & Balance of recipient is ${await token.balanceOf(recipient.address)}`)
    //             await expect(token.connect(recipient).transfer(deployer.address,
    //                     ethers.utils.parseUnits('200','ether'))).to.be.reverted;
    //         })
    //     })
    // })

        
    
    // describe('Approving Tokens',()=>{
    //     let approvalAmount,result;

    //     beforeEach(async()=>{
    //         approvalAmount = ethers.utils.parseUnits('100','ether');
    //         const transaction = await token.connect(deployer).approve(exchange.address,approvalAmount);
    //         result = transaction.wait();
    //     });

    //     it('Check the alllowance after the approval',async()=>{
    //         console.log(approvalAmount);
    //         // approvalAmount = approvalAmount.toString();
    //         // console.log(await token.allowance(deployer.address,exchange.address));
    //         expect(await token.allowance(deployer.address,exchange.address)).to.be.equal(approvalAmount.toString());

    //     })

    // })

    // describe('Delegated Transfers',()=>{
    //     let approvalAmount,result;
        
    //     beforeEach(async()=>{
    //         approvalAmount= ethers.utils.parseUnits('100','ether');
    //         const transaction = await token.connect(deployer).approve(exchange.address,approvalAmount);
    //         result = transaction.wait();
    //     })

    //     it('Successful transfer of the funds',async()=>{
    //         await token.connect(exchange).transferFrom(deployer.address,exchange.address,approvalAmount);
    //         expect(await token.balanceOf(exchange.address)).to.be.equal(approvalAmount.toString());

    //     })

    //     it('do it again and again',async()=>{
    //         await token.connect(exchange).transferFrom(deployer.address,exchange.address,approvalAmount);
    //         await expect(token.connect(exchange).transferFrom(deployer.address,exchange.address,approvalAmount)).to.be.reverted;
    //     })
    // })


})