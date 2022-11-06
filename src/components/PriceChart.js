import { useSelector } from "react-redux";
import Banner from "./Banner";
import Chart from "react-apexcharts";
import arrowUp from "../assets/up-arrow.svg";
import arrowDown from "../assets/down-arrow.svg";
import { PriceChartSelector } from "../store/selectors";

import {options, defaultSeries} from "./PriceChart.config";

const PriceChart = ()=>{
    const account = useSelector(state => state.provider.account);
    const symbols = useSelector(state => state.tokens.symbols);
    const priceChart = useSelector(PriceChartSelector);

    return(
        <div className="component exchange__chart">
            <div className="component__header flex-between">
                <div className="flex">
                    <h2>{symbols && `${symbols[0]} / ${symbols[1]}`} </h2>

                    {
                        priceChart && (
                            <div className="flex">
                                {
                                    priceChart.lastPriceChange == '+'?(
                                        <img src={arrowUp} alt="Arrow up" />
                                    ):(
                                        <img src={arrowDown} alt="Arrow down" />
                                    )
                                }
                                <span className="up">{priceChart.lastPrice} </span>
                            </div>
                        )
                    }
                    

                </div>
            </div>

            {/* Price chart goes here */}

            {
                account ?(
                    <Chart 
                    type ="candlestick"
                    series= {priceChart?priceChart.series:defaultSeries}
                    options={options}
                    width ="100%"
                    height="100%"

                    />
                ):(
                    <Banner text={'Please connect with Metamask'} /> 
                )
            }
        </div>
    );
}

export default PriceChart;