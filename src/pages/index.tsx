import Head from 'next/head';
import axios from 'axios';
import {SetStateAction, useState} from 'react';
//import Image from 'next/image'

const SPREAD_PERCENT = 1.02
const ASSET_AMOUNT = "1000"
const ASSET_SYMBOL = "usdt"
const TO_CURRENCY = "thb"
const PERIOD_DAY = "6"  // The response count from 0 to 6 = 7 days
const REQUEST_PREFIX = "https://min-api.cryptocompare.com/data/v2/histoday?fsym="
const REQUEST_FROM_USDT_TO_THB = "https://min-api.cryptocompare.com/data/price?fsym=USDT&tsyms=THB"

const formatTH = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
});

const formatterUS = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function Home() {
  /* General */
  const [openTab, setOpenTab] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const roundingDecimal = (inputValue: number) => {
    return Math.round(inputValue * 100) / 100
  }

  const roundingAveragePrice = (averagePrice: any) => {
    return roundingDecimal(averagePrice)
  }

  const calculateSpreading = (averagePrice: any) => {
    return roundingDecimal(averagePrice * SPREAD_PERCENT)
  }
  /* General */

  /* Tab Transfer Amount in USDT */
  const [usdtToThb, setUsdtToThb] = useState(0);
  const [inputAmountThaibaht, setInputAmountThaiBaht] = useState('');
  const [transferAmountInUsdt, setTransferAmountInUsdt] = useState('');

  const handleClearTabTransferAmountThb = () => {
    setInputAmountThaiBaht('')
    setTransferAmountInUsdt('')
  }

  const getUsdtToThb = async () => {
    const response = await axios.get(REQUEST_PREFIX.concat(ASSET_SYMBOL, "&tsym=", TO_CURRENCY, "&limit=", PERIOD_DAY));
    const resp = calculateAveragePrice(response.data)    
    setUsdtToThb(calculateSpreading(roundingAveragePrice(resp)))
    return response.data;
  };
  getUsdtToThb();

  const handleChangeInputAmountInThaiBaht = (event: { target: { value: string; }; }) => {
    const val = event.target.value;
    if (/^[\d]*\.?[\d]{0,2}$/.test(val)) {
      setInputAmountThaiBaht(val);
    }
  };

  const handleGetTransferAmountInUsdt = () => {
    const resp = roundingAveragePrice(parseFloat(inputAmountThaibaht)/usdtToThb);    
    if(isNaN(resp) || usdtToThb == 0) {
      setErrorMessage('Please input Amount in Thai baht or Refresh (CMD + R or Ctrl + R) to get THB rate per 1 USDT.')
      setShowModal(true)
      return false;
    }
    setTransferAmountInUsdt(formatterUS.format(resp))
  }
  /* Tab Transfer Amount in USDT */

  /* Tab 7D Average asset price */
  const [inputAssetAmount, setInputAssetAmount] = useState('');
  const [inputAssetSymbol, setInputAssetSymbol] = useState('');
  const [inputToCurrency, setInputToCurrency] = useState('');
  const [inputPeriod, setInputPeriod] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const handleClearTab7DAverage = () => {
    setInputAssetAmount('');
    setInputAssetSymbol('');
    setAveragePrice('');
    setCalculatedPrice('');
    setTransferAmount('');
  }

  const handleChangeAssetAmount = (event: { target: { value: string; }; }) => {
    //const result = event.target.value.replace(/\D/g, '');
    //setInputAssetAmount(result);
    const val = event.target.value;
    if (/^[\d]*\.?[\d]{0,2}$/.test(val)) {
      setInputAssetAmount(val);
    }
  };

  const handleChangeAssetSymbol = (event: { target: { value: SetStateAction<string>; }; }) => {
    setInputAssetSymbol(event.target.value);
  };

  const calculateAveragePrice = (responseJson: any) => {
    var total = 0
    var responsePeriod = 0
    try {
      responseJson["Data"]["Data"].forEach((element: { [x: string]: number; }) => {
        total += element["close"]
        responsePeriod++
      });
      return total / responsePeriod
    } catch (e) {
      setErrorMessage('Please input the right Asset Symbol eg. BTC, ETH')
      setShowModal(true)
      return false
    }
  }

  const handleGetAveragePrice = async () => {
    // var theUrl = "https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=6"
    if(inputAssetAmount == '' || inputAssetSymbol == '') {
      setErrorMessage('Please input NFT price and Asset Symbol')
      setShowModal(true)
      return false;
    }
    
    const assetAmount = (inputAssetAmount == '') ? ASSET_AMOUNT : inputAssetAmount;
    const assetSymbol = (inputAssetSymbol == '') ? ASSET_SYMBOL : inputAssetSymbol;
    const toCurrency = (inputToCurrency == '') ? TO_CURRENCY : inputToCurrency;
    const period = (inputPeriod == '') ? PERIOD_DAY : inputPeriod;

    const response = await axios.get(REQUEST_PREFIX.concat(assetSymbol, "&tsym=", toCurrency, "&limit=", period));

    // Calculate all value
    const averagePrice = calculateAveragePrice(response.data)
    const roundAveragePrice = roundingAveragePrice(averagePrice)
    const calculateSpreadPrice = calculateSpreading(averagePrice)
    const calculateTransferAmount = roundingDecimal(Number(assetAmount) * calculateSpreadPrice)
    
    // Update the result
    setAveragePrice(formatTH.format(roundAveragePrice));
    setCalculatedPrice(formatTH.format(calculateSpreadPrice));
    setTransferAmount(formatTH.format(calculateTransferAmount));

    return response;
  }
  /* Tab 7D Average asset price */

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Oceanft - 7D Average asset price" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Oceanft - 7D Average asset price</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <div className="ocean-main-container min-h-screen flex h-full justify-center">
        <div className="ocean-main-bg flex flex-col w-full items-center" style={{ backgroundImage: `url(/bg_home.svg)`}} >
            <div className="flex fixed bg-white w-full justify-center z-10">
                <div className="nav-bar max-w-7xl w-full nav-content flex items-center h-17 bg-white justify-between">
                <div className="nav-logo">
                    <button>
                        <img className="logo" src="/logo.svg" />
                    </button>
                </div>
                </div>
            </div>
            <div className="max-w-5xl rounded overflow-hidden shadow-xl m-20">
                {/* TABS */}
                <ul className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row" role="tablist">
                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                    <a className={
                        "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-tight " +
                        (openTab === 1? "text-black": "bg-white")
                      }
                      onClick={e => { e.preventDefault(); setOpenTab(1); }}
                      data-toggle="tab"
                      href="#link1"
                      role="tablist"
                    >
                      7D Average asset price
                    </a>
                  </li>
                  <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                    <a className={
                        "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-tight " +
                        (openTab === 2 ? "text-black ": "bg-white")
                      }
                      onClick={e => { e.preventDefault(); setOpenTab(2); }}
                      data-toggle="tab"
                      href="#link2"
                      role="tablist"
                    >
                      Transfer Amount in USDT
                    </a>
                  </li>
                </ul>
                {/* TABS */}

                {/* TABS 1 */}
                <div className={openTab === 1 ? "block" : "hidden"} id="link1">
                  <div className="main-content flex w-full h-3/4 max-w-7xl mb-10 ml-12 mr-36">
                      <form className="w-full max-w-lg">
                          <h1 className="text-2xl headline-header-title">7D Average asset price</h1>
                          <div className="flex flex-wrap -mx-3 mb-6 m-4">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="inputAssetAmount">
                                  NFT Price
                                </label>
                                <input 
                                  id="inputAssetAmount" 
                                  className="appearance-none block w-full bg-gray-10 text-gray-700 border border-blue-400 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" 
                                  type="integer" 
                                  placeholder="NFT Price" 
                                  onChange={handleChangeAssetAmount}
                                  required
                                  value={inputAssetAmount}
                                  />
                            </div>
                            <div className="w-full md:w-1/2 px-3">
                                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="inputAssetSymbol">
                                Asset Symbol
                                </label>
                                <input 
                                  id="inputAssetSymbol" 
                                  className="appearance-none block w-full bg-gray-10 text-gray-700 border border-blue-400 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" 
                                  type="text" 
                                  placeholder="Asset Symbol"
                                  onChange={handleChangeAssetSymbol}
                                  value={inputAssetSymbol}
                                />
                            </div>
                          </div>
                          <div className="flex flex-wrap -mx-3 mb-6 m-4">
                              {/*
                              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="averagePrice">
                                      Asset 7D average price
                                  </label>
                                  <input 
                                    id="averagePrice" 
                                    className="appearance-none block w-full bg-gray-200 text-green-700 border border-gray-400 rounded py-3 px-4 leading-tight focus:outline-none focus:border-gray-500" 
                                    type="text" 
                                    placeholder="Asset 7D average price" 
                                    value={averagePrice}
                                    readOnly={true}
                                  />
                              </div>
                              */}
                              <div className="w-full md:w-2/2 px-3 mb-6 md:mb-0">
                                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="calculatedPrice">
                                      Asset 7D average price {/*+ 2%*/}
                                  </label>
                                  <input 
                                    id="calculatedPrice" 
                                    className="appearance-none block w-full bg-gray-200 text-green-700 border border-gray-400 rounded py-3 px-4 leading-tight focus:outline-none focus:border-gray-500" 
                                    type="text" 
                                    placeholder="Asset 7D average price" 
                                    value={calculatedPrice}
                                    readOnly={true}
                                  />
                              </div>
                          </div>
                          <div className="flex flex-wrap -mx-3 mb-6 m-4">
                              <div className="w-full md:w-2/2 px-3 mb-6 md:mb-0">
                                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="transferAmount">
                                      Transfer Amount
                                  </label>
                                  <input 
                                    id="transferAmount" 
                                    className="appearance-none block w-full bg-gray-200 text-green-700 border border-gray-400 rounded py-3 px-4 leading-tight focus:outline-none focus:border-gray-500" 
                                    type="text" 
                                    placeholder="Transfer Amount" 
                                    value={transferAmount}
                                    readOnly={true}
                                  />
                              </div>
                          </div>
                          <div className="flex flex-wrap -mx-3 mb-6 m-4">
                              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <button className="wallet-button" type="button" onClick={event => handleGetAveragePrice()}>
                                  Get Quote
                                </button>
                              </div>
                              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <button className="clear-button" type="button" onClick={event => handleClearTab7DAverage()}>
                                  Clear
                                </button>
                              </div>
                          </div>
                      </form>
                  </div>
                </div>
                {/* TABS 1 */}
                {/* TABS 2 */}
                <div className={openTab === 2 ? "block" : "hidden"} id="link2">
                  <div className="main-content flex w-full h-3/4 max-w-7xl mb-10 ml-12 mr-36">
                      <form className="w-full max-w-lg">
                          <h1 className="text-2xl headline-header-title">Transfer Amount in USDT</h1>
                          <br/>
                          <h1 className="text-2xl text-center">Today rate <b>{usdtToThb}</b> THB = <b>1</b> USDT</h1>


                          <div className="flex flex-wrap mx-3 mb-6 m-4" >
                              <div className="w-full md:w-2/2 px-3 mb-6 md:mb-0">
                                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="thb">
                                    Amount in Thai baht (THB)
                                  </label>
                                  <input 
                                    id="thb" 
                                    className="appearance-none block w-full bg-gray-10 text-gray-700 border border-blue-400 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" 
                                    type="integer" 
                                    placeholder="Amount in Thai baht"
                                    onChange={handleChangeInputAmountInThaiBaht}
                                    value={inputAmountThaibaht}
                                  />
                              </div>
                          </div>
                          <div className="flex flex-wrap mx-3 mb-6 m-4" >
                              <div className="w-full md:w-2/2 px-3 mb-6 md:mb-0">
                                  <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="transferAmountInUsdt">
                                    Transfer Amount in USDT
                                  </label>
                                  <input 
                                    id="transferAmountInUsdt" 
                                    className="appearance-none block w-full bg-gray-200 text-green-700 border border-gray-400 rounded py-3 px-4 leading-tight focus:outline-none focus:border-gray-500" 
                                    type="text" 
                                    placeholder="Transfer Amount in USDT" 
                                    value={transferAmountInUsdt}
                                    readOnly={true}
                                  />
                              </div>
                          </div>
                          <div className="flex flex-wrap mx-3 mb-6 m-4">
                              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <button className="wallet-button" type="button" onClick={event => handleGetTransferAmountInUsdt()}>
                                  Get Quote
                                </button>
                              </div>
                              <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <button className="clear-button" type="button" onClick={event => handleClearTabTransferAmountThb()}>
                                  Clear
                                </button>
                              </div>
                          </div>
                      </form>
                  </div>
                </div>
                {/* TABS 2 */}


            </div>
        </div>    
      </div>


      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                  <p className="text-2xl font-semibold">Error Massage</p>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                  <span className="bg-transparent text-2xl block outline-none focus:outline-none text-red-500">×</span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative p-6 flex-auto">
                  <p className="my-4 text-slate-500 text-lg leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  )
}
