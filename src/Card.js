import React, { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers';
import ERC20abi from './erc-20-abi.json'

const provider = window.ethereum && new ethers.providers.Web3Provider(window.ethereum,"any")
const Card = () => {
  provider.on("network", (newNetwork, oldNetwork) => {
    // When a Provider makes its initial connection, it emits a "network"
    // event with a null oldNetwork along with the newNetwork. So, if the
    // oldNetwork exists, it represents a changing network
    if (oldNetwork) {
        window.location.reload();
    }
});
    const inputRef = useRef(null)
    const selectRef = useRef(null)
    
    const [currentNetwork, setCurrentNetwork] = useState(null)
    const [errorMessage,setErrorMessage] = useState(null)
    const [userAddress, setUserAddress] = useState(null)
    const [contractAddress, setContractAddress] = useState([{address:null,name:null,symbol:null,balance:null,network:null}])
    const contractAbi = ERC20abi 
    console.log(contractAddress)

    useEffect(() => {
      setContractAddress(JSON.parse(localStorage.getItem('contractAddress')))
      walletConnectHandler()
      contractHandler()
    }, [])

    useEffect(() => {
      setCurrentNetwork(JSON.parse(localStorage.getItem('currentNetwork')))
      document.getElementById('select').value = JSON.parse(localStorage.getItem('currentNetwork'))
      contractHandler()
    }, [])
    
    useEffect(() => {
      if(localStorage.getItem('contractAddress')===null){
      localStorage.setItem('contractAddress',JSON.stringify(contractAddress))
    }
      contractHandler()
    }, [contractAddress,userAddress])

    useEffect(() => {
      if(localStorage.getItem('currentNetwork')===null){
      localStorage.setItem('currentNetwork',JSON.stringify(currentNetwork))
    }
      contractHandler()
    }, [currentNetwork])

    const handleSubmit = (evt) => {
      evt.preventDefault()
      if(contractAddress[0].address===null){
        setContractAddress([{
          address:inputRef.current.value,
          name:null,
          symbol:null,
          balance:null,
          network:currentNetwork,
        }])
      }else{
        setContractAddress([...contractAddress, {
          address:inputRef.current.value,
          name:null,
          symbol:null,
          balance:null,
          network:currentNetwork,  
        }])
      }
      inputRef.current.value = ''
  }

    const walletConnectHandler= ()=>{
        if(window.ethereum){
            provider.send("eth_requestAccounts",[]).then(async()=>{
               await accountChangeHandler(provider.getSigner())
               setErrorMessage('')
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

    const   contractHandler = async()=>{
     try {
      if(contractAddress&&userAddress){
        setErrorMessage('') 
        contractAddress.map(async(item,i)=>{
          try {
          console.log('inn')
          console.log(item.address)
          const contract = new ethers.Contract(item.address,contractAbi,provider)  
          console.log(contract)
          const name = await contract.name()
          item.name = await name
          const symbol = await contract.symbol()
          item.symbol = await symbol
          const balance = await contract.balanceOf(userAddress)
          item.balance = await ethers.utils.formatEther(balance)
            
          } catch (error) {
            console.log(error)
          }
        })
        localStorage.setItem('contractAddress',JSON.stringify(contractAddress))
        console.log(contractAddress)
      }
      else{
        setErrorMessage("please connect with your wallet first")
      }
      
     } catch (error) {
      // alert("you have to switch to correct network")
      console.log(error)
     }
    }

    const handleRemoveItem = (e) => {
      const name = e.target.getAttribute("name")
       if(contractAddress.length===1){
        setContractAddress([{address:null,name:null,symbol:null,balance:null,network:null}])
        localStorage.setItem('contractAddress',JSON.stringify([{address:null,name:null,symbol:null,balance:null,network:null}]))
       }else{
        setContractAddress(contractAddress.filter(item => item.name !== name))
       }
     }

     const handleSelectNetwork =()=>{
      setCurrentNetwork(selectRef.current.value)
      localStorage.setItem('currentNetwork', JSON.stringify(selectRef.current.value))
     }

     useEffect(() => {
        switchNetwork()
     }, [currentNetwork])
     

     const switchNetwork = async() =>{
      console.log(currentNetwork)
      const key = currentNetwork
      switch (key) {
        case "Mumbai":
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x13881' }],
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0xf00',
                      chainName: '...',
                      rpcUrls: ['https://...'] /* ... */,
                    },
                  ],
                });
              } catch (addError) {
                // handle "add" error
              }
            }
            // handle other "switch" errors
          }
          break;
        case "Matic":
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x89' }],
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0xf00',
                      chainName: '...',
                      rpcUrls: ['https://...'] /* ... */,
                    },
                  ],
                });
              } catch (addError) {
                // handle "add" error
              }
            }
            // handle other "switch" errors
          }
          break;
        case "Ethereum":
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x1' }],
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0xf00',
                      chainName: '...',
                      rpcUrls: ['https://...'] /* ... */,
                    },
                  ],
                });
              } catch (addError) {
                // handle "add" error
              }
            }
            // handle other "switch" errors
          }
          break;
      }
     }
  return (
    <div className='card'>
      <div className="">
      <select name="" id="select" ref={selectRef} onClick={handleSelectNetwork}>
        <option value="Mumbai">Mumbai</option>
        <option value="Matic">Matic</option>
        <option value="Ethereum">Ethereum</option>
      </select>
      </div>
      <div className='button'>
        <br /><br />
      <button onClick={walletConnectHandler}>
        {userAddress? "connected" : "connect wallet"}
      </button>
      </div>
      <br />
      {errorMessage}
      <br />
      {userAddress && 'Connected Wallet: '+ userAddress}
      <br />
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
                  <input type='submit'value='add'
                  onClick={contractHandler}
                  />
              </label>
            </form>
        </div>
        }
        {userAddress && contractAddress.map((item,i)=>{
        console.log(item)
        if(item.network===currentNetwork){
          return(
            item.name!=null&&<div key={i}>
              <br />
              <h2>{i+1}</h2>
              <p>{'Contract Address: '+item.address}</p>
              <p>{'Name: '+item.name}</p>
              <p>{'Symbol: '+item.symbol}</p>
              <p>{'Your Balance: '+item.balance}</p>
              <button name={item.name} onClick={handleRemoveItem}>remove</button>
            </div>
          )
        }
      })}
      </div>
      {currentNetwork}
    </div>
  )
}

export default Card
