import { useSelector } from "react-redux";
import Logo from "../assets/EPIC1.png";
import eth from "../assets/eth.svg";
import Blockies from "react-blockies";
import {useDispatch} from 'react-redux';
import config from "../config.json";

import {
    loadAccount
} from "../store/interactions";

const Navbar = ()=>{
    const account = useSelector(state => state.provider.account);
    const chainId = useSelector(state => state.provider.chainId);
    const balance = useSelector(state=> state.provider.balance);
    const provider = useSelector(state => state.provider.connection);
    const dispatch = useDispatch();

    const connectHandler=async()=>{
        // load the account
        await loadAccount(dispatch,provider);
    }

    const networkHandler = async(event)=>{

        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params:[{chainId: event.target.value}]
        })


    }


    return(
        <div className="exchange__header grid">
            <div className="exchange__header--brand flex">
                <img  src={Logo} className="logo" alt="Logo"></img>
                <h1 style={{fontFamily: 'PopArt'}}>EPIC DeX</h1>
            </div>

            <div className="exchange__header--networks flex">

                <img  src={eth} alt="ETH Logo" className="Eth Logo" ></img>
                {
                    chainId && 
                    (
                    <select name="networks" id="networks" value={config[chainId]? `0x${chainId.toString(16)}`:`0`} onChange = {networkHandler}>
                        <option value="0" disabled> Select Network</option>
                        <option value="0x7a69"> Localhost </option>
                        <option value="0x5"> Goerli </option>
                        <option value="0x13881"> Mumbai </option>
                    </select>
                    )
                }
                
            </div>

            <div className="exchange__header--account flex">
                {
                    balance?(
                        <p><small>My Balance</small>{Number(balance).toFixed(4)} </p>
                    ):(
                        <p><small>My Balance</small></p>
                    )
                }

                {
                    account?(
                        <a 
                        href={config[chainId]? `${config[chainId].explorerUrl}/address/${account}`:`#`}
                        target="_blank"
                        rel="noreferrer"
                        >
                            {account.slice(0,5)+"..."+account.slice(38,42)}
                            <Blockies 
                            seed={account}
                            size={10}
                            scale ={3}
                            color="#2187D0"
                            bgColor="#F1F2F9"
                            spotColor="#767F92"
                            className="identicon"
                            />
                        </a>
                    ):(
                        <button onClick={connectHandler}>Connect</button>
                    )
                }
            </div>

        </div>
    );
}

export default Navbar;