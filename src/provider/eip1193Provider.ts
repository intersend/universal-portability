//@ts-nocheck
interface EIP1193Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (payload: any) => void) => void;
  removeListener: (eventName: string, handler: (payload: any) => void) => void;
}

export class PortabilityEIP1193Provider implements EIP1193Provider {
  private address: string | null = null;
  private chainId: number | null = null;
  private isConnected: boolean = false;
  private eventHandlers: Map<string, Set<(payload: any) => void>> = new Map();
  
  // Standard provider properties
  public readonly isPortability = true;
  public readonly isSafe = true;
  public readonly isMetaMask = false;
  public readonly isIntersend = true;
  public readonly version = '1.0.0';
  
  // Required state object
  public _state = {
    accounts: [] as string[],
    isConnected: false,
    chainId: null as number | null,
  };

  // Static method for provider detection
  static detectEthereumProvider = async ({ timeout = 3000 } = {}) => {
    if (window.ethereum) {
      return window.ethereum;
    }

    return new Promise((resolve) => {
      const handleProvider = () => {
        window.removeEventListener('ethereum#initialized', handleProvider);
        resolve(window.ethereum);
      };

      window.addEventListener('ethereum#initialized', handleProvider, { once: true });
      setTimeout(() => {
        window.removeEventListener('ethereum#initialized', handleProvider);
        resolve(null);
      }, timeout);
    });
  };

  constructor(private sendToHost: (message: any) => void) {
    this.setupEventHandlers();
    this.initialize();

    // Immediately inject self into window.ethereum
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'ethereum', {
        value: this,
        writable: true,
        configurable: true,
        enumerable: true
      });

      // Dispatch initialization event
      window.dispatchEvent(new Event('ethereum#initialized'));
    }
  }


  private initialize() {
    // Add detectEthereumProvider to the provider instance
    Object.defineProperty(this, 'detectEthereumProvider', {
      value: PortabilityEIP1193Provider.detectEthereumProvider,
      writable: false,
      configurable: true,
      enumerable: true
    });

    // Initialize with empty state
    this._state = {
      accounts: [],
      isConnected: false,
      chainId: null
    };

    // Add required EIP-1193 properties
    Object.defineProperties(this, {
      selectedAddress: {
        get: () => this.address,
        enumerable: true
      },
      networkVersion: {
        get: () => this.chainId?.toString(),
        enumerable: true
      },
      chainId: {
        get: () => this.chainId ? `0x${this.chainId.toString(16)}` : null,
        enumerable: true
      },
      isConnected: {
        get: () => this.isConnected,
        enumerable: true
      }
    });
  }

  private setupEventHandlers() {
    this.eventHandlers.set('accountsChanged', new Set());
    this.eventHandlers.set('chainChanged', new Set());
    this.eventHandlers.set('connect', new Set());
    this.eventHandlers.set('disconnect', new Set());
  }

  async request({ method, params }: { method: string; params?: any[] }): Promise<any> {
    console.debug('Provider request:', method, params);

    // For account and chain requests, ensure we have the data
    if ((method === 'eth_accounts' || method === 'eth_requestAccounts') && !this.address) {
      // Request wallet info and wait for it
      await new Promise<void>((resolve) => {
        const checkWallet = () => {
          if (this.address) {
            resolve();
          } else {
            this.sendToHost({
              type: 'REQUEST_WALLET_INFO',
              id: `init-${Date.now()}`
            });
            setTimeout(checkWallet, 100);
          }
        };
        checkWallet();
      });
    }

    switch (method) {
      case 'eth_accounts':
      case 'eth_requestAccounts':
        return this.address ? [this.address] : [];

      case 'eth_chainId':
        return '0x89'

      case 'net_version':
        return this.chainId?.toString();

      default:
        return this.sendRequest(method, params);
    }
  }



  private async requestWalletInfo(): Promise<void> {
    if (!this.address || !this.chainId) {
      await this.sendRequest('REQUEST_WALLET_INFO');
    }
  }

  private async sendRequest(method: string, params?: any[]): Promise<any> {
    const id = `${Date.now()}-${Math.random()}`;

    return new Promise((resolve, reject) => {
      const handleResponse = (event: MessageEvent) => {
        const response = event.data;
        if (response.id === id) {
          window.removeEventListener('message', handleResponse);
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.payload);
          }
        }
      };

      window.addEventListener('message', handleResponse);

      this.sendToHost({
        type: 'RPC_REQUEST',
        payload: { method, params },
        id
      });

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  setWalletInfo(address: string, chainId: number, metadata?: any) {
    this.address = address;
    this.chainId = chainId;
    this.isConnected = true;
    
    // Update _state
    this._state = {
      accounts: [address],
      isConnected: true,
      chainId: chainId
    };

    // Update provider metadata
    if (metadata) {
      Object.assign(this, {
        ...metadata,
        isPortability: true,
        isSafe: true,
        isIntersend: true,
      });
    }

    // Emit events
    this.emit('accountsChanged', [address]);
    this.emit('chainChanged', `0x${chainId.toString(16)}`);
    this.emit('connect', { chainId: `0x${chainId.toString(16)}` });
  }

  on(eventName: string, handler: (payload: any) => void) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.add(handler);
    }
  }

  removeListener(eventName: string, handler: (payload: any) => void) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(eventName: string, payload: any) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  // Legacy support methods
  async enable(): Promise<string[]> {
    return this.request({ method: 'eth_requestAccounts' });
  }

  async send(method: string, params?: any[]): Promise<any> {
    return this.request({ method, params });
  }

  async sendAsync(payload: any, callback: (error: any, response: any) => void): Promise<void> {
    try {
      const result = await this.request(payload);
      callback(null, { id: payload.id, jsonrpc: '2.0', result });
    } catch (error) {
      callback(error, null);
    }
  }
}