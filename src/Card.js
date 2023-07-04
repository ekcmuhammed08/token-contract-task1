import React, { useState } from 'react'
import { ethers } from 'ethers';
const provider = window.ethereum && new ethers.providers.Web3Provider(window.ethereum)
const Card = () => {
    const [errorMessage,setErrorMessage] = useState(null)
    const [userAddress, setUserAddress] = useState(null)
    const [userBalance, setUserBalance] = useState(null)
    const walletConnectHandler= ()=>{
        if(window.ethereum){
            provider.send("eth_requestAccounts",[]).then(async()=>{
               await accountChangeHandler(provider.getSigner())
            })
        }
        else{
            setErrorMessage('Please install Metamask')
        }
    }

    const accountChangeHandler =async(newSigner)=> {
        const address = await newSigner.getAddress()
        console.log(address)
        setUserAddress(address)
        const balance = await newSigner.getBalance()
        console.log(ethers.utils.formatEther(balance))
        setUserBalance(ethers.utils.formatEther(balance))
    } 
  return (
    <div>
      sdfsf
      <div>
      <button onClick={walletConnectHandler}>
        connect wallet
      </button>
      {errorMessage}
        <br />
      {userAddress}
      <br />
      {userBalance}
      </div>
    </div>
  )
}

export default Card
