import { useEffect } from 'react';
import { useConnect } from 'wagmi';

const AUTOCONNECTED_CONNECTOR_IDS = ['walletConnect', 'safe'];

export const useAutoConnect = () => {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    AUTOCONNECTED_CONNECTOR_IDS.forEach((connector) => {
      const connectorInstance = connectors.find((c) => c.id === connector);
      if (connectorInstance) {
        connect({ connector: connectorInstance });
      }
    });
  }, [connect, connectors]);
};