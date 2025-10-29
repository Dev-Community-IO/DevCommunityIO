// Cardano Wallet utilities using Mesh.js
// Note: This is a placeholder structure. Actual implementation requires @meshsdk/core @meshsdk/react

export interface CardanoWallet {
    name: string;
    icon: string;
    version: string;
    apiVersion?: string;
}

export interface CardanoConnection {
    address: string;
    stakeAddress?: string;
    networkId: number;
}

// Get available Cardano wallets
export const getAvailableWallets = (): CardanoWallet[] => {
    const wallets: CardanoWallet[] = [];

    if (typeof window === 'undefined' || !window.cardano) {
        return wallets;
    }

    // Common Cardano wallets
    const walletNames = ['nami', 'eternl', 'flint', 'typhon', 'gerowallet', 'yoroi'];

    walletNames.forEach((name) => {
        if (window.cardano?.[name]) {
            wallets.push({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                icon: window.cardano[name].icon || '',
                version: window.cardano[name].apiVersion || '1.0.0',
            });
        }
    });

    return wallets;
};

// Check if any Cardano wallet is installed
export const isCardanoWalletInstalled = (): boolean => {
    return typeof window !== 'undefined' && !!window.cardano && getAvailableWallets().length > 0;
};

// Connect to a specific Cardano wallet
export const connectCardanoWallet = async (walletName: string): Promise<CardanoConnection> => {
    if (typeof window === 'undefined' || !window.cardano) {
        throw new Error('No Cardano wallet found. Please install a Cardano wallet extension.');
    }

    const wallet = window.cardano[walletName.toLowerCase()];
    if (!wallet) {
        throw new Error(`${walletName} wallet not found. Please install it first.`);
    }

    try {
        // Enable wallet
        const api = await wallet.enable();

        // Get used addresses
        const usedAddresses = await api.getUsedAddresses();
        if (!usedAddresses || usedAddresses.length === 0) {
            throw new Error('No addresses found in wallet');
        }

        // Get reward addresses (stake address)
        let stakeAddress;
        try {
            const rewardAddresses = await api.getRewardAddresses();
            if (rewardAddresses && rewardAddresses.length > 0) {
                stakeAddress = rewardAddresses[0];
            }
        } catch (e) {
            console.warn('Could not get stake address:', e);
        }

        // Get network ID
        const networkId = await api.getNetworkId();

        return {
            address: usedAddresses[0],
            stakeAddress,
            networkId,
        };
    } catch (error: any) {
        if (error.code === -1) {
            throw new Error('User rejected wallet connection');
        }
        throw new Error(`Failed to connect to ${walletName}: ${error.message}`);
    }
};

// Sign message with Cardano wallet
export const signCardanoMessage = async (
    walletName: string,
    address: string,
    message: string
): Promise<{ signature: string; key: string }> => {
    if (typeof window === 'undefined' || !window.cardano) {
        throw new Error('No Cardano wallet found');
    }

    const wallet = window.cardano[walletName.toLowerCase()];
    if (!wallet) {
        throw new Error(`${walletName} wallet not found`);
    }

    try {
        const api = await wallet.enable();

        // Sign the message
        const signedMessage = await api.signData(address, message);

        return {
            signature: signedMessage.signature,
            key: signedMessage.key,
        };
    } catch (error: any) {
        if (error.code === -1 || error.code === 2) {
            throw new Error('User rejected signature request');
        }
        throw new Error(`Failed to sign message: ${error.message}`);
    }
};

// Utility to convert hex to string (for reading signed messages)
export const hexToString = (hex: string): string => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
};

// Utility to convert string to hex (for message signing)
export const stringToHex = (str: string): string => {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex;
};

