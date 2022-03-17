import React,{ useEffect,useState } from "react";
import { ethers } from "ethers";
import { contractABI,constantAddress } from "../utils/constants";


export const TransactionContext = React.createContext<unknown>("");

const { ethereum }:any=window;

const getEthereumContract =()=>{
    const provider =new ethers.providers.Web3Provider(ethereum)
    const signer=provider.getSigner();
    const transactionContract=new ethers.Contract(
        constantAddress,contractABI
        ,signer);
    // console.log({provider,signer,transactionContract})
    return transactionContract;

}
interface fromdata{
    addressTo:string,
    amount:string,
    keyword:string,
    message:string
}

export const TransactionProvider=({children}:any)=>{
    const [connectedAccount,setConnectedAccount]=useState('')
    const [FormData,setFormData]= useState<fromdata>({addressTo:"",
        amount:"",
        keyword:"",
        message:""})
    const [isLoading,setIsLoading]=useState<Boolean>(false)
    const[transactioncounts,settransactioncounts]=useState<string| null >(localStorage.getItem("transactioncount"))
    const [transactions, setTransactions] = useState([]);

    const handleChange=(e: any,name: any)=>{
      setFormData((prevState)=>({...prevState,[name]:e.target.value})) 
    }


const getAllTransactions= async ()=>{
    try {
        if (ethereum) {
          const transactionsContract = getEthereumContract();
  
          const availableTransactions = await transactionsContract.getAllTransactions();
        
          console.log(availableTransactions)
          const structuredTransactions = availableTransactions.map((transaction:any) => ({
            addressTo: transaction.receiver,
            addressFrom: transaction[0],
            timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
            message: transaction.message,
            keyword: transaction.keyword,
            amount: parseInt(transaction.amount._hex) / (10 ** 18)
          }));
  
          console.log(structuredTransactions);
  
          setTransactions(structuredTransactions);
        } else {
          console.log("Ethereum is not present");
        }
      } catch (error) {
        console.log(error);
      }

}

    const checkIfWalletIsConnected = async ()=>{
        try {
            if(!ethereum) return alert("Please install metamask")
            const account =await ethereum.request({method:'eth_accounts'})
    
            if(account.length!==0){
                setConnectedAccount(account[0])
                getAllTransactions()
            }
            else{
                console.log("No account found....! ")
            }  
        } catch (error) {
            console.log(error)
            throw new Error("No etherum object")
        }
        
    }

    const checkIfTransactionsExist = async () => {
        try{
            const transactionContract=getEthereumContract();
            const transactioncount= await transactionContract.getTransactionsCount();
            window.localStorage.setItem("transactioncount", transactioncount);
        }catch (err) {
            console.error(err)
            throw new Error("No etherum object")
        }
    }

    const connectWallet=async ()=>{
        try{
            if(!ethereum) return alert("Please install metamask")
        const account =await ethereum.request({method:'eth_requestAccounts'})
        console.log(account)
        setConnectedAccount(account[0])  
        }catch(err){
            console.error(err)
            throw new Error("No etherum object")
        }
    }


const sendTransaction= async() => {
    try{
        if(!ethereum) return alert("Please install metamask")

        const { addressTo, amount, keyword, message } = FormData;
        const transactionContract=getEthereumContract();
        const parseAmount=ethers.utils.parseEther(amount)

        await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: connectedAccount,
                to:addressTo,
                gas:'0x5208', //21000 GWEI
                value:parseAmount._hex //0.00001
            }]
        })
        const transactionHash= await transactionContract.addToBlockchain(addressTo, parseAmount, keyword, message)
        setIsLoading(true)
        console.log(`Loading - ${transactionHash.hash}`)
        await transactionHash.wait()

        setIsLoading(false)
        console.log(`Done - ${transactionHash.hash}`)

        const transactioncount= await transactionContract.getTransactionsCount();
        console.log(`transactioncount - ${transactioncount}`)

        settransactioncounts(transactioncount.toString())
    }catch(err){
        console.error(err)
        throw new Error("No etherum object")
    }
}

    useEffect(()=>{
        checkIfWalletIsConnected()
        checkIfTransactionsExist()
    },[])

    // const isLoading=false

    return (
        <TransactionContext.Provider value={{connectWallet, handleChange, sendTransaction,FormData,connectedAccount,isLoading,transactions}}>
            {children}
        </TransactionContext.Provider>
    )
}


function prevState(prevState: any) {
    throw new Error("Function not implemented.");
}

