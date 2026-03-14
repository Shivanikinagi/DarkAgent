import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { DARKAGENT_PROTOCOL_ABI, PERMISSIONS_ABI } from '../contracts/abis'

let deploymentConfig = null
async function loadDeploymentConfig() {
    if (deploymentConfig !== null) return deploymentConfig
    try {
        const mod = await import('../contracts/deployment.json')
        deploymentConfig = mod.default || mod
        return deploymentConfig
    } catch {
        return null
    }
}

const BASE_SEPOLIA_CHAIN_ID = 84532
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'

function getUsableAddress(address) {
    if (!address || !ethers.isAddress(address)) return null
    if (address === ethers.ZeroAddress) return null
    return address
}

async function switchToBaseSepolia() {
    if (!window.ethereum) return
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16) }],
        })
    } catch (switchError) {
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x' + BASE_SEPOLIA_CHAIN_ID.toString(16),
                    chainName: 'Base Sepolia',
                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                    rpcUrls: [BASE_SEPOLIA_RPC],
                    blockExplorerUrls: ['https://sepolia.basescan.org'],
                }],
            })
        }
    }
}

export function useContracts() {
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [contracts, setContracts] = useState(null)
    const [account, setAccount] = useState(null)
    const [chainId, setChainId] = useState(null)
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState(null)
    const [isLive, setIsLive] = useState(false)

    const connectMetaMask = useCallback(async () => {
        if (!window.ethereum) {
            setError("MetaMask is not installed.")
            return
        }
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' })
            await switchToBaseSepolia()
            setupProvider()
        } catch (err) {
            console.error(err)
            setError(err.message)
        }
    }, [])

    const setupProvider = useCallback(async () => {
        if (!window.ethereum) return
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum)
            const network = await browserProvider.getNetwork()
            const accs = await browserProvider.listAccounts()

            setProvider(browserProvider)
            setChainId(Number(network.chainId))

            if (accs.length > 0) {
                const s = await browserProvider.getSigner()
                setSigner(s)
                setAccount(accs[0].address)
                setConnected(true)

                const config = await loadDeploymentConfig()
                const darkAgentAddress = getUsableAddress(config?.contracts?.DarkAgent)
                const permissionsAddress = getUsableAddress(config?.contracts?.Permissions)

                if (darkAgentAddress) {
                    const darkAgent = new ethers.Contract(
                        darkAgentAddress,
                        DARKAGENT_PROTOCOL_ABI,
                        s
                    )

                    const permissionsContract = permissionsAddress
                        ? new ethers.Contract(
                            permissionsAddress,
                            PERMISSIONS_ABI,
                            s
                        )
                        : null
                    
                    setContracts({ darkAgent, permissionsContract })
                    setIsLive(true)
                    setError(
                        permissionsAddress
                            ? null
                            : 'Permissions contract is not deployed in deployment.json; permissions features are disabled.'
                    )
                } else {
                    setContracts(null)
                    setIsLive(false)
                    setError('DarkAgent contract is missing or invalid in deployment.json.')
                }
            } else {
                setConnected(false)
                setIsLive(false)
                setContracts(null)
            }
        } catch (err) {
            console.error("Setup error:", err)
            setError(err.message)
        }
    }, [])

    useEffect(() => {
        setupProvider()
        
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', setupProvider)
            window.ethereum.on('chainChanged', setupProvider)
            return () => {
                window.ethereum.removeListener('accountsChanged', setupProvider)
                window.ethereum.removeListener('chainChanged', setupProvider)
            }
        }
    }, [setupProvider])

    return {
        provider,
        signer,
        contracts,
        account,
        chainId,
        connected,
        error,
        isLive,
        connectMetaMask,
        deploymentConfig,
    }
}
