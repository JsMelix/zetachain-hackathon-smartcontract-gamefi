
export interface Player {
  address: string;
  zetaBalance: number;
  gameTokenBalance: number;
  level: number;
  characterNFT: {
    name: string;
    class: string;
    imageUrl: string;
  } | null;
  items: string[];
}

export interface ActivityLog {
  id: number;
  message: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
