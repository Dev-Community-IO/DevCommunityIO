export const SAFROCHAIN_CHAIN_NAME = 'safrochain';

export function getSafrochainChainId(): string {
  return import.meta.env.VITE_SAFROCHAIN_CHAIN_ID || 'safro-testnet-1';
}

export function getSafrochainRpc(): string {
  return import.meta.env.VITE_SAFROCHAIN_RPC || 'https://rpc.testnet.safrochain.com';
}

export function getSafrochainRest(): string {
  return import.meta.env.VITE_SAFROCHAIN_REST || 'https://rest.testnet.safrochain.com';
}

export function createSafrochainChain() {
  const chainId = getSafrochainChainId();
  const isTestnet = chainId.includes('testnet');

  return {
    chain_name: SAFROCHAIN_CHAIN_NAME,
    chain_type: 'cosmos' as const,
    chain_id: chainId,
    pretty_name: isTestnet ? 'Safrochain Testnet' : 'Safrochain',
    network_type: isTestnet ? ('testnet' as const) : ('mainnet' as const),
    bech32_prefix: 'addr_safro',
    bech32_config: {
      bech32PrefixAccAddr: 'addr_safro',
      bech32PrefixAccPub: 'addr_safropub',
      bech32PrefixValAddr: 'addr_safrovaloper',
      bech32PrefixValPub: 'addr_safrovaloperpub',
      bech32PrefixConsAddr: 'addr_safrovalcons',
      bech32PrefixConsPub: 'addr_safrovalconspub',
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: 'usaf',
          fixed_min_gas_price: 0.025,
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [{ denom: 'usaf' }],
    },
    apis: {
      rpc: [{ address: getSafrochainRpc(), provider: 'Safrochain' }],
      rest: [{ address: getSafrochainRest(), provider: 'Safrochain' }],
    },
    logo_URIs: {
      svg: '/safrochain-favicon.svg',
    },
    images: [
      {
        svg: '/safrochain-favicon.svg',
      },
    ],
  };
}

export function createSafrochainAssetList() {
  return {
    chain_name: SAFROCHAIN_CHAIN_NAME,
    assets: [
      {
        description: 'The native staking token of Safrochain',
        denom_units: [
          { denom: 'usaf', exponent: 0 },
          { denom: 'saf', exponent: 6 },
        ],
        type_asset: 'sdk.coin' as const,
        base: 'usaf',
        name: 'Safrochain',
        display: 'saf',
        symbol: 'SAF',
        logo_URIs: {
          svg: '/safrochain-favicon.svg',
        },
      },
    ],
  };
}
