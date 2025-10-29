// Ethereum Wallet (MetaMask) utilities
export const connectMetaMask = async (): Promise<{ address: string; signature: string; nonce: string }> => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });

        const address = accounts[0];

        // Get nonce from backend (this will be handled by the component)
        return { address, signature: '', nonce: '' };
    } catch (error: any) {
        if (error.code === 4001) {
            throw new Error('Please connect your MetaMask wallet to continue.');
        }
        throw new Error(`MetaMask connection failed: ${error.message}`);
    }
};

export const signMessage = async (address: string, message: string): Promise<string> => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed.');
    }

    try {
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, address],
        });

        return signature;
    } catch (error: any) {
        if (error.code === 4001) {
            throw new Error('Signature request was rejected.');
        }
        throw new Error(`Signing failed: ${error.message}`);
    }
};

// Declare ethereum on window for TypeScript
declare global {
    interface Window {
        ethereum?: any;
        cardano?: any;
    }
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
    return typeof window.ethereum !== 'undefined';
};

// Get current account
export const getCurrentAccount = async (): Promise<string | null> => {
    if (!isMetaMaskInstalled()) return null;

    try {
        const accounts = await window.ethereum.request({
            method: 'eth_accounts',
        });
        return accounts[0] || null;
    } catch (error) {
        console.error('Error getting current account:', error);
        return null;
    }
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void) => {
    if (isMetaMaskInstalled()) {
        window.ethereum.on('accountsChanged', callback);
    }
};

// Listen for chain changes
export const onChainChanged = (callback: (chainId: string) => void) => {
    if (isMetaMaskInstalled()) {
        window.ethereum.on('chainChanged', callback);
    }
};

