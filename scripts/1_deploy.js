

async function main(){

    const [deployer] = await ethers.getSigners();
    const Epic = await ethers.getContractFactory("Token");
    const epic = await Epic.deploy('Epicenter','EPIC','1000000');
    await epic.deployed();

    console.log(`Epic deployed to : ${epic.address}`);

    const METH = await ethers.getContractFactory("Token");
    const mEth = await METH.deploy('MockEther','mETH','1000000');
    await mEth.deployed();
    console.log(`mETh deployed to : ${mEth.address}`);


    const MDAI = await ethers.getContractFactory("Token");
    const mDAI = await MDAI.deploy('MockDAI','mDAI','1000000');
    await mDAI.deployed();

    console.log(`mDAI deployed to : ${mDAI.address}`);


    const Exchange = await ethers.getContractFactory("Exchange");
    const exchange = await Exchange.deploy(deployer.address,10);
    await exchange.deployed();

    console.log(`Exchagne deployed at: ${exchange.address}`);



}

main().
    then(()=>{ process.exit(0)})
    .catch(error =>{
        console.error(error);
        process.exit(1);
    })