// src/pages/index.tsx
import type { NextPage } from 'next'
import Head from 'next/head'
import NextLink from "next/link"
import { VStack, Heading, Box, LinkOverlay, LinkBox} from "@chakra-ui/layout"
import { Text, Button } from '@chakra-ui/react'
import { useState, useEffect} from 'react'
import {ethers} from "ethers"
import { ChainId, FeeQuote, GasLimit } from "@biconomy/core-types"
import SocialLogin from "@biconomy/web3-auth"
import SmartAccount from "@biconomy/smart-account"
import ReadERC20 from "../components/ReadERC20"
import TransferERC20 from "../components/TransferERC20"
import ERC20ABI from "../abi/ERC20.abi.json"
import fundMeABI from "../abi/fundMe.abi.json"
import { activeChainId } from '../utils/chainConfig';
import { TransactionDescription } from 'ethers/lib/utils'

declare let window:any
const addressERC20 = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const Home: NextPage = () => {
  const [isLogin, setIsLogin] = useState(false)
  const [socialLogin, setSocialLogin] = useState<SocialLogin | null>()
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>()
  const tokenAddress = 0x66F12a471F32307E3BEdb95Dc70C0D04001D9Ac9
  // const dappContractAddress =  0x6212b22cF90d08a77258Ab16BeD6B007B2659e29

  const amount = "2000000000000000000";

  // old code 
  const [balance, setBalance] = useState<string | undefined>()
  const [currentAccount, setCurrentAccount] = useState<string | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const [chainname, setChainName] = useState<string | undefined>()


  async function initWallet(){

    const socialLogin = new SocialLogin();
    await socialLogin.init(ethers.utils.hexValue(80001))
    socialLogin.showConnectModal();

    setSocialLogin(socialLogin)
    return socialLogin
  }


  async function login() {
    try{
      let socialLogin = await initWallet();

      if(!socialLogin.provider){ // first time login
          socialLogin.showWallet();
      } else { // if provider is present
        setIsLogin(true);
        const provider = new ethers.providers.Web3Provider(
            socialLogin.provider,
          );
        const accounts = await provider.listAccounts();
        console.log("EOA address", accounts);


        let options = {
            activeNetworkId: activeChainId,
            supportedNetworksIds: [ activeChainId
            ],
            networkConfig: [
                      {
                      chainId: ChainId.POLYGON_MUMBAI,
                      // Optional dappAPIKey (only required if you're using Gasless)
                      dappAPIKey: '59fRCMXvk.8a1652f0-b522-4ea7-b296-98628499aee3',
                      // if need to override Rpc you can add providerUrl: 
                    },
                  ]
            }
              
            const walletProvider = new ethers.providers.Web3Provider(socialLogin.provider);

            let smartAccount = new SmartAccount(walletProvider, options);
            smartAccount = await smartAccount.init();


          let smartAccountInfo = await smartAccount.getSmartAccountState();

          setSmartAccountAddress(smartAccountInfo?.address);


          smartAccount.on('txHashGenerated', (response: any) => {
            console.log('txHashGenerated event received via emitter', response);
            // showSuccessMessage(`Transaction sent: ${response.hash}`);
          }); 
    
          smartAccount.on('txMined', (response: any) => {
            console.log('txMined event received via emitter', response);
            // showSuccessMessage(`Transaction mined: ${response.hash}`);
          });
    
          smartAccount.on('error', (response: any) => {
            console.log('error event received via emitter', response);
          });

          const erc20Interface = new ethers.utils.Interface(ERC20ABI)
          const dappInterface = new ethers.utils.Interface(fundMeABI);
          // const stateChangeInterface = new ethers.utils.Interface(stateChangeABI);

          const txs = []

          // batch transactions 

          const data1 = erc20Interface.encodeFunctionData(
            'approve', [dappContractAddress, amount]
          )

          const tx1 = {
            to: tokenAddress,
            data: data1 
          }

          txs.push(tx1)

          const data2 = dappInterface.encodeFunctionData(
            'pullTokens', [tokenAddress, amount]
          )

          const tx2 = {
            to: dappContractAddress, 
            data: data2
          }

          txs.push(tx2)

          // should receive the recipientAddress somehow 
          // const tx3 = {
          //   to: recipientAddress, 
          //   value: ethers.utils.parseEther(amount)
          // }

          const response = await smartAccount.sendGaslessTransactionBatch({ transactions: txs })
                const feeQuotes: FeeQuote[]=  await smartAccount.prepareRefundTransactionBatch(
                  {transactions:txs}
                  );

                console.log(feeQuotes)


                const transaction = await smartAccount.createRefundTransactionBatch({
                  transactions: txs,
                  feeQuote: feeQuotes[2], // say user chooses USDC from above
                });


                const gasLimit: GasLimit = {
                  hex: "0x1E8480",
                  type: "hex",
                };    
    
          // Dispatches the transaction on chain using relayer. 
          // Below method will also make prompt for signing the transaction with connected EOA signer then communicate with REST Relayer 
          const txId = await smartAccount.sendTransaction({
            tx: transaction, 
            gasLimit,
          });

          console.log(txId);
        }
      } catch (error) {
        console.log(error)
      }
  }

  async function logout (){

  }

  
  useEffect(() => {
    //get ETH balance and network info only when having currentAccount 
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return

    //client side code
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.getBalance(currentAccount).then((result)=>{
      setBalance(ethers.utils.formatEther(result))
    }).catch((e)=>console.log(e))

    provider.getNetwork().then((result)=>{
      setChainId(result.chainId)
      setChainName(result.name)
    }).catch((e)=>console.log(e))

  },[currentAccount])

  //click connect
  const onClickConnect = () => {
    //client side code
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }
    /*
    //change from window.ethereum.enable() which is deprecated
    //call window.ethereum.request() directly
    window.ethereum.request({ method: 'eth_requestAccounts' })
    .then((accounts:any)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    })
    .catch('error',console.error)
    */

    //we can do it using ethers.js
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.send("eth_requestAccounts", [])
    .then((accounts)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    }).catch((e)=>console.log(e))

  }

  //click disconnect
  const onClickDisconnect = () => {
    console.log("onClickDisConnect")
    setBalance(undefined)
    setCurrentAccount(undefined)
  }

  return (
    <>
      <Head>
        <title>Payment Dapp</title>
      </Head>

      <Heading as="h3"  my={4}>Account Abstraction</Heading>          
      <VStack>
        <Box w='100%' my={4}>
        {currentAccount  
          ? <Button type="button" w='100%' onClick={onClickDisconnect}>
                Account:{currentAccount}
            </Button>
          : <Button type="button" w='100%' onClick={onClickConnect}>
                  Login to your account
              </Button>
        }
        </Box>
        {currentAccount  
          ?<Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Account info</Heading>
          <Text>ETH Balance of current account: {balance}</Text>
          <Text>Chain Info: ChainId {chainId} name {chainname}</Text>
        </Box>
        :<></>
        }

        <Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Read ClassToken Info</Heading>
          <ReadERC20 
            addressContract={addressERC20}
            currentAccount={currentAccount}
          />
        </Box>

        <Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Transfer Classtoken</Heading>
          <TransferERC20 
            addressContract={addressERC20}
            currentAccount={currentAccount}
          />
        </Box>

      </VStack>
    </>
  )
}

export default Home