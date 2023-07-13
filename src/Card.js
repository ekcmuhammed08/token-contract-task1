import React, { useEffect, useState, useRef } from 'react'
import { FixedNumber, ethers } from 'ethers';
import ERC20abi from './erc-20-abi.json'
import './App.css';
import {MdCancel} from 'react-icons/md'

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
    const recipientRef = useRef(null)
    const sendAmountRef = useRef(null)
    const approvedRef = useRef(null) 
    const approveAmountRef = useRef(null)
    const ownerRef = useRef(null)
    const spenderRef = useRef(null)
    
    const [currentNetwork, setCurrentNetwork] = useState(null)
    const [errorMessage,setErrorMessage] = useState(null)
    const [userAddress, setUserAddress] = useState(null)
    const [currentContract,setCurrentContract] = useState(null)
    const [contractAddress, setContractAddress] = useState([{address:null,name:null,symbol:null,balance:null,network:null}])
    const [display,setDisplay] = useState('none')
    const [allowanceAmount,setAllowanceAmount] = useState(null)
    const [ctrl,setCtrl]=useState(0);
    const contractAbi = ERC20abi 

    useEffect(() => {
      if(localStorage.getItem('contractAddress')===null){
        setContractAddress([{address:null,name:null,symbol:null,balance:null,network:null}])
      }else{
        setContractAddress(JSON.parse(localStorage.getItem('contractAddress')))
      }
      walletConnectHandler()
      contractHandler()
    }, [])

    useEffect(() => {
      if(localStorage.getItem('currentNetwork')===null){
          setCurrentNetwork('Mumbai')
          console.log('aaad')
          document.getElementById('select').value = 'Mumbai'
          
          localStorage.setItem('currentNetwork',JSON.stringify('Mumbai'))
          
      }else{
        setCurrentNetwork(JSON.parse(localStorage.getItem('currentNetwork')))
      }
    }, [])

    useEffect(() => {
      if(localStorage.getItem('contractAddress')===null){
      localStorage.setItem('contractAddress',JSON.stringify(contractAddress))
    }
    contractHandler()
    }, [contractAddress,userAddress])

    useEffect(() => {
      switchNetwork().then(document.getElementById('select').value = currentNetwork)
      contractHandler()
   }, [currentNetwork])
    
    const handleSubmit = (evt) => {
      evt.preventDefault()
      if(contractAddress[0].name===null){
        setContractAddress([{
          address:inputRef.current.value,
          network:currentNetwork,
         
        }])
      }else{
        setContractAddress([...contractAddress, {
          address:inputRef.current.value,
          network:currentNetwork,
        }])
      }
      inputRef.current.value = ''
  }

    const walletConnectHandler= ()=>{
        try {
          if(window.ethereum){
            provider.send("eth_requestAccounts",[]).then(async()=>{
               await accountChangeHandler(provider.getSigner())
               setErrorMessage('')
            })
        }
        else{
            setErrorMessage('Please install Metamask')
        }
          
        } catch (error) {
          console.log(error)
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
      if(userAddress){
        setErrorMessage('') 
        contractAddress.map(async(item,i)=>{
          try {
          console.log('inn')
          console.log(item.address)
          item.id = i
          const contract = new ethers.Contract(item.address,contractAbi,provider)  
          console.log(contract)
          const name = await contract.name()
          item.name = await name
          const symbol = await contract.symbol()
          item.symbol = await symbol
          const balance = await contract.balanceOf(userAddress)
          item.balance = await ethers.utils.formatEther(balance)
          localStorage.setItem('contractAddress',JSON.stringify(contractAddress))
          
          } catch (error) {
            console.log(error)
          }
        })
        console.log(contractAddress)
      }
      else{
        setErrorMessage("please connect with your wallet first")
      }
      
     } catch (error) {
      console.log(error)
     }
    }

    const sendTokens= async(contractAddress,recipient,amount) =>{
      const contract = new ethers.Contract(contractAddress,contractAbi,provider) 
      const signer = await provider.getSigner()
      const contractWSigner =contract.connect(signer) 
      contractWSigner.transfer(recipient,ethers.utils.parseEther(amount));
      return true
     }
    const approveTokens= async(contractAddress,recipient,amount) =>{
      const contract = new ethers.Contract(contractAddress,contractAbi,provider) 
      const signer = await provider.getSigner()
      const contractWSigner =contract.connect(signer) 
      contractWSigner.approve(recipient,ethers.utils.parseEther(amount));
      return true
     }
    const getAllowance= async(contractAddress,owner,spender) =>{
      const contract = new ethers.Contract(contractAddress,contractAbi,provider) 
      const signer = await provider.getSigner()
      const contractWSigner =contract.connect(signer) 
      const allowance = await contractWSigner.allowance(owner,spender);
      setAllowanceAmount(ethers.utils.formatEther(allowance)) 
      return allowance
     }

    const handleRemoveItem = (e) => {
      console.log(contractAddress.length)
      const id = e.target.getAttribute("id")
       if(contractAddress.length===1){
        setContractAddress([{address:null,name:null,symbol:null,balance:null,network:null}])
        localStorage.setItem('contractAddress',JSON.stringify([{address:null,name:null,symbol:null,balance:null,network:null}]))
       }else{
        setContractAddress(contractAddress.filter(item => item.id != id))
       }
     }

     const handleSelectNetwork =()=>{
      setCurrentNetwork(selectRef.current.value)
      localStorage.setItem('currentNetwork', JSON.stringify(selectRef.current.value))
     }

     const handleSend=(address)=>{
      setCtrl(ctrl+1)
      if(ctrl%2===0){
        setDisplay('flex')
      }else{
        setDisplay('none')
      }
      setCurrentContract(address)
      console.log(currentContract)
     }

     
     const handleTransfer = (evt)=>{
      evt.preventDefault()
      sendTokens(currentContract,recipientRef.current.value,sendAmountRef.current.value)
     }

     const handleApprove = (evt)=>{
      evt.preventDefault()
      approveTokens(currentContract,approvedRef.current.value,approveAmountRef.current.value)
     }

     const handleGetAllowance = async(evt)=>{
      evt.preventDefault()
      getAllowance(currentContract,ownerRef.current.value,spenderRef.current.value)
     }

     const switchNetwork = async() =>{
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
                      chainId: '0x13881',
                      chainName: 'Mumbai',
                      rpcUrls: ['https://rpc-mumbai.maticvigil.com'] /* ... */,
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
                      chainId: '0x89',
                      chainName: 'Polygon Mainnet',
                      rpcUrls: ['https://polygon-rpc.com'] /* ... */,
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
                      chainId: '0x1',
                      chainName: 'Ethereum Mainnet',
                      rpcUrls: ['https://ethereum.publicnode.com'] /* ... */,
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
      <div id='tx-modal' className='modal' style={{display:`${display}`}}>
          <div className="send-form">
            <h3 style={{color:'white'}}>Send Tokens:</h3>
            <form onSubmit={(evt)=>{handleTransfer(evt)}}>
              <label>
                <input type="text" placeholder='recipient address' ref={recipientRef} />                    
                <input type="number" placeholder='amount' ref={sendAmountRef} step='.000000000000000001'/>
                <br />                 
                <input type="submit"/>
              </label>
            </form>
          </div>
          <div className="approve-form">
            <h3 style={{color:'white'}}>Approve Tokens:</h3>
            <form onSubmit={(evt)=>{handleApprove(evt)}}>
              <label>
                <input type="text" placeholder='approved address' ref={approvedRef} />                    
                <input type="number" placeholder='amount' ref={approveAmountRef} step='.000000000000000001'/>
                <br />                   
                <input type="submit"/>
              </label>
            </form>
          </div>
          <div className="approve-form">
            <h3 style={{color:'white'}}>Get Allowance:</h3>
            <form onSubmit={(evt)=>{handleGetAllowance(evt)}}>
              <label>
                <input type="text" placeholder='owner address' ref={ownerRef} />                    
                <input type="text" placeholder='spender address' ref={spenderRef} />
                <br />                   
                <input type="submit"/>
              </label>
            </form>
            {allowanceAmount&&<h4 style={{color:'white'}}>Allowance left : {allowanceAmount} Tokens </h4> }
          </div>
        </div> 

      <div className="">
        <select id="select" ref={selectRef} onClick={handleSelectNetwork}>
          <option value="Mumbai" id='Mumbai'>Mumbai</option>
          <option value="Matic" id='Matic'>Matic</option>
          <option value="Ethereum" id='Ethereum'>Ethereum</option>
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
        <div className='flex'>
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
            <button onClick={()=>setContractAddress(JSON.parse(localStorage.getItem('contractAddress')))}>refresh</button>
        </div>
        }
        {userAddress && contractAddress.map((item,i)=>{
        if(item.network===currentNetwork){
          return(
            item.name!=null&&
            <div className='token-card' key={i}>
              {/* <button id={item.id} onClick={handleRemoveItem} className='remove-button'>
                remove
              </button> */}
              <MdCancel id={item.id} size={'30px'} color='red' onClick={handleRemoveItem} cursor={'pointer'} /> 
              {/* <h2>{i+1}</h2> */}
              <div className="contract-info">
                <p>{'Contract Address: '+item.address}</p>
                <p>{'Name: '+item.name}</p>
                <p>{'Symbol: '+item.symbol}</p>
                <p>{'Your Balance: '+item.balance}</p>
              </div>
              <div >
                <button id={item.address} className='send-button' onClick={()=>{handleSend(item.address)}}>Manage Tokens</button>
              </div>
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
