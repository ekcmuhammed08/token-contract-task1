import React, { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers';
import ERC20abi from './erc-20-abi.json'

const provider = window.ethereum && new ethers.providers.Web3Provider(window.ethereum)
const Card = () => {
    const inputRef = useRef(null)
    const [errorMessage,setErrorMessage] = useState(null)
    const [userAddress, setUserAddress] = useState(null)
    const [userBalance, setUserBalance] = useState(null) 
    const storedContractAddress = JSON.parse(localStorage.getItem('contractAddress'))
    const [contractAddress, setContractAddress] = useState(null)
    const [contractName, setContractName] = useState(null)
    const [contractSymbol, setContractSymbol] = useState(null)
    const contractAbi = ERC20abi

    useEffect(() => {
      if(localStorage.getItem('contractAddress')==='null'){ 
        // const address = localStorage.getItem('contractAddress')
        // setContractAddress(address)
        // console.log(localStorage.getItem('contractAddress'))
        console.log('a')
      }else{
        console.log('x')
        setContractAddress(JSON.parse(localStorage.getItem('contractAddress')))
      }
      contractHandler()
    }, [])
    
    useEffect(() => {
      localStorage.setItem('contractAddress',JSON.stringify(contractAddress))
      contractHandler()
    }, [contractAddress,userAddress])

    const handleSubmit = (evt) => {
      evt.preventDefault()
      setContractAddress(inputRef.current.value)
      inputRef.current.value = ''
  }

    const walletConnectHandler= ()=>{
        if(window.ethereum){
            provider.send("eth_requestAccounts",[]).then(async()=>{
               await accountChangeHandler(provider.getSigner())
            })
        }
        else{
            setErrorMessage('Please install Metamask')
        }
        console.log(contractAddress)
    }

    const accountChangeHandler =async(newSigner)=> {
        const address = await newSigner.getAddress()
        console.log(address)
        setUserAddress(address)
        const balance = await newSigner.getBalance()
        console.log(ethers.utils.formatEther(balance))
        
    } 

    const contractHandler = async()=>{
     try {

      if(contractAddress&&userAddress){
        setErrorMessage('')
        const contract = new ethers.Contract(contractAddress,contractAbi,provider) 
        console.log(contract)
        const name = await contract.name()
        setContractName(name)
        const symbol = await contract.symbol()
        setContractSymbol(symbol)
        const balance = await contract.balanceOf(userAddress)
        setUserBalance(ethers.utils.formatEther(balance))

      }
      else{
        setErrorMessage("please connect with your wallet first")
      }
      
     } catch (error) {
      alert("you have to have erc-20 tokens of contract which you submitted")
      console.log(error)
     }
    }
  return (
    <div className='card'>
      <div className='button'>
      <p>{storedContractAddress && 'Stored Contract Address: ' + storedContractAddress}</p>
      <button onClick={walletConnectHandler}>
        {userAddress? "connected" : "connect wallet"}
      </button>
      </div>
      {errorMessage}
      <br />
      {userAddress && 'Connected Wallet: '+ userAddress}
      <br />
      <br />
      {contractName}
      <br />
      {contractSymbol}
      <br />
      {userBalance}
      <br />
      <div className='address-form'>
        {userAddress &&
        <div>
            <form onSubmit={(evt)=>{handleSubmit(evt)}}>
              <label>
                  Contract Address: 
                  <input type="text"
                  ref={inputRef}
                  />
                  <input type='submit'value='submit'
                  onClick={contractHandler}
                  />
              </label>
            </form>
        </div>
        }
      </div>
    </div>
  )
}

export default Card
