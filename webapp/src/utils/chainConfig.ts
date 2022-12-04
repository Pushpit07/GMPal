export const ChainId = {
    POLYGON_MUMBAI: 80001
  };
  
  export let activeChainId = ChainId.POLYGON_MUMBAI;
  export const supportedChains = [
    ChainId.POLYGON_MUMBAI
  ];
  
  export const getRPCProvider = (chainId: number) => {
    switch (chainId) {
      case 80001:
        return "https://polygon-mumbai.g.alchemy.com/v2/uk-JtxXjQ_uu1okGUfwkg-gHRcUG9GKW";
      default:
        return "https://polygon-mumbai.g.alchemy.com/v2/uk-JtxXjQ_uu1okGUfwkg-gHRcUG9GKW";
    }
  };
  
  export const getExplorer = (chainId: number) => {
    switch (chainId) {
      case 80001:
        return "https://mumbai.polygonscan.com";
      default:
        return "https://mumbai.polygonscan.com";
    }
  };
  
  export const getSupportedChains = () => {};