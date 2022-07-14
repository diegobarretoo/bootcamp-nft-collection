import React, { useEffect, useState } from "react"
import "./styles/App.css"
import githubLogo from "./assets/github-logo.svg"
import { ethers } from "ethers"
import myEpicNft from "./utils/MyEpicNFT.json"

import {Popup} from './Popup';

// Constants
const GITHUB_HANDLE = "diegobarretoo"
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}`
const OPENSEA_LINK = "https://testnets.opensea.io/collection/tothemoon-ttutiftfhc"
const CONTRACT_ADDRESS = "0xFCFdc0F82c23dc41B8BDD9Cb1143198f0a4D17B9"
const TOTAL_MINT_COUNT = 50

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("")
  const [openseaLink, setOpenseaLink] = useState("")
  const [popupIsVisible, setPopupIsVisible] = useState(false)
  const [totalNftsMinted, setTotalNftsMinted] = useState(0)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkWalletNetwork = async () => {
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Conectado à rede " + chainId);
    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
    	alert("Você não está conectado a rede Rinkeby de teste!");
    }
  }

  const checkIfWalletIsConnected = async () => {

    // Primeiro tenha certeza que temos acesso a window.ethereum    
    const { ethereum } = window
    if (!ethereum) {
      console.log("Certifique-se que você tem metamask instalado!")
      return
    } else {
      console.log("Temos o objeto ethereum!", ethereum)
    }

    // Checa se estamos autorizados a carteira do usuário.    
    const accounts = await ethereum.request({ method: "eth_accounts" })

    // Usuário pode ter múltiplas carteiras autorizadas, nós podemos pegar a primeira que está lá!
    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Encontrou uma conta autorizada:", account)
      setCurrentAccount(account)

      // Setup listener! Isso é para quando o usuário vem no site
      // e já tem a carteira conectada e autorizada
      setupEventListener()
    } else {
      console.log("Nenhuma conta autorizada foi encontrada")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert("Baixe a Metamask!")
        return
      }

      // Método chique para pedir acesso a conta.
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      })

      // Boom! Isso deve escrever o endereço público uma vez que autorizar o Metamask.      
      console.log("Conectado", accounts[0])
      setCurrentAccount(accounts[0])

      // Setup listener! Para quando o usuário vem para o site
      // e conecta a carteira pela primeira vez
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup do listener.
  const setupEventListener = async () => {
    // é bem parecido com a função
    try {
      const { ethereum } = window

      if (ethereum) {
        // mesma coisa de novo
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        // Aqui está o tempero mágico.
        // Isso essencialmente captura nosso evento quando o contrato lança
        // Se você está familiar com webhooks, é bem parecido!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          
          setOpenseaLink(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`) 
          setPopupIsVisible(true)
          console.log(tokenId.toNumber())
        })

        getTotalNFTsMintedSoFar()        
        console.log("Setup event listener!")
      } else {
        console.log("Objeto ethereum não existe!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        console.log("Vai abrir a carteira agora para pagar o gás...")
        setIsLoading(true)
        let nftTxn = await connectedContract.makeAnEpicNFT()
        console.log("Cunhando...espere por favor.")
        await nftTxn.wait()
        setIsLoading(false)
        getTotalNFTsMintedSoFar()
        
        console.log(`Cunhado, veja a transação: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
      } else {
        console.log("Objeto ethereum não existe!")
      }
    } catch (error) {
      setIsLoading(false)
      setError(error.error.message)
    }
  }

  const getTotalNFTsMintedSoFar = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        const totalNFTsMintedSoFar = await connectedContract.getTotalNFTsMintedSoFar();

        if (totalNFTsMintedSoFar >= TOTAL_MINT_COUNT ) {
          setError('Finalizado')    
          console.log("FINALIZADO")
        }

        // Armazenando os dados
        console.log(totalNFTsMintedSoFar.toNumber());
        setTotalNftsMinted(totalNFTsMintedSoFar.toNumber())

      } else {
        console.log("Objeto Ethereum não existe!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Métodos para Renderizar
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Conectar Carteira
    </button>
  )
  const renderFinishedNfts = () => (
    <button className="cta-button connect-wallet-button">
      Finalizado
    </button>
  )
 
  useEffect(() => {
    checkIfWalletIsConnected()
    checkWalletNetwork()
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Minha Coleção de NFT</p>
          <p className="sub-text">Exclusivos! Maravilhosos! Únicos! Descubra seu NFT hoje.</p>
          <a
            className="link-opensea-collection gradient-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >🌊 Exibir coleção no OpenSea</a>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <>
              {!error && !isLoading && <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Cunhar NFT
              </button>}
              {error && renderFinishedNfts()}
              
              {isLoading && <button type="button" className="button-loading connect-wallet-button cta-button">
                <span className="button-text">Cunhar NFT</span>         
              </button>}
              
              <span>{totalNftsMinted} de {TOTAL_MINT_COUNT} NFTs Cunhados</span>
            </>
          )}
        </div>
        <div className="footer-container">
          <img alt="Github Logo" className="github-logo" src={githubLogo} />
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"
            rel="noreferrer"
          >{`feito com ❤️ por @${GITHUB_HANDLE}`}</a>
        </div>
      </div>
      {popupIsVisible && <Popup openseaLink={openseaLink} setPopupIsVisible={setPopupIsVisible}/>}
    </div>
  )
}

export default App
