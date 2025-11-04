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

    // Common Cardano wallets - check both lowercase and original case
    const walletNames = [
        'nami', 'eternl', 'flint', 'typhon', 'gerowallet', 'yoroi',
        'begin', 'lace', 'vespr', 'GeroWallet', 'nufi'
    ];

    // First, check known wallet names
    walletNames.forEach((name) => {
        const lowerName = name.toLowerCase();
        if (window.cardano?.[lowerName] || window.cardano?.[name]) {
            const wallet = window.cardano[lowerName] || window.cardano[name];
            // Avoid duplicates
            if (!wallets.some(w => w.name.toLowerCase() === lowerName)) {
                wallets.push({
                    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1').trim(),
                    icon: wallet.icon || '',
                    version: wallet.apiVersion || wallet.version || '1.0.0',
                });
            }
        }
    });

    // Also check for any other wallets in cardano object
    if (window.cardano) {
        Object.keys(window.cardano).forEach((key) => {
            const wallet = window.cardano[key];
            // Skip if already added or if it's not a wallet object
            if (typeof wallet === 'object' && wallet !== null && wallet.enable &&
                !wallets.some(w => w.name.toLowerCase() === key.toLowerCase())) {
                wallets.push({
                    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
                    icon: wallet.icon || '',
                    version: wallet.apiVersion || wallet.version || '1.0.0',
                });
            }
        });
    }

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

        // Try multiple methods to get an address
        // Some wallets (like Lace) may not have used addresses yet
        let address: string | null = null;

        try {
            // Method 1: Try used addresses first
            const usedAddresses = await api.getUsedAddresses();
            if (usedAddresses && usedAddresses.length > 0) {
                address = usedAddresses[0];
            }
        } catch (e) {
            console.warn('getUsedAddresses failed:', e);
        }

        // Method 2: Try unused addresses if no used addresses found
        if (!address) {
            try {
                if (api.getUnusedAddresses) {
                    const unusedAddresses = await api.getUnusedAddresses();
                    if (unusedAddresses && unusedAddresses.length > 0) {
                        address = unusedAddresses[0];
                    }
                }
            } catch (e) {
                console.warn('getUnusedAddresses failed:', e);
            }
        }

        // Method 3: Try change address
        if (!address) {
            try {
                if (api.getChangeAddress) {
                    address = await api.getChangeAddress();
                }
            } catch (e) {
                console.warn('getChangeAddress failed:', e);
            }
        }

        // Method 4: Try getAddresses (some wallets provide this)
        if (!address) {
            try {
                if (api.getAddresses) {
                    const addresses = await api.getAddresses();
                    if (addresses && addresses.length > 0) {
                        address = addresses[0];
                    }
                }
            } catch (e) {
                console.warn('getAddresses failed:', e);
            }
        }

        // Method 5: For Lace wallet specifically, try getBalance first to ensure wallet is accessible
        // Then use getUsedAddresses with proper error handling
        if (!address && walletName.toLowerCase() === 'lace') {
            try {
                // Check if wallet is accessible by trying to get balance
                await api.getBalance();
                // Retry getUsedAddresses after balance check
                const usedAddresses = await api.getUsedAddresses();
                if (usedAddresses && usedAddresses.length > 0) {
                    address = usedAddresses[0];
                } else {
                    // If still no addresses, try getUnusedAddresses
                    if (api.getUnusedAddresses) {
                        const unusedAddresses = await api.getUnusedAddresses();
                        if (unusedAddresses && unusedAddresses.length > 0) {
                            address = unusedAddresses[0];
                        }
                    }
                }
            } catch (e) {
                console.warn('Lace-specific address retrieval failed:', e);
            }
        }

        if (!address) {
            throw new Error('No addresses found in wallet. Please ensure your wallet has been initialized and contains at least one address.');
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
            address,
            stakeAddress,
            networkId,
        };
    } catch (error: any) {
        if (error.code === -1) {
            throw new Error('User rejected wallet connection');
        }
        if (error.message && error.message.includes('No addresses found')) {
            throw error; // Re-throw our custom error message
        }
        throw new Error(`Failed to connect to ${walletName}: ${error.message || error.toString()}`);
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

