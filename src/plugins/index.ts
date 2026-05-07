import { newsRegistry } from './news/registry';
import { marketRegistry } from './market/registry';
import { openseaRegistry } from './opensea/registry';

import NewsCard from './news/ui';
import MarketCard from './market/ui';
import OpenSeaCard from './opensea/ui';

export const RemotePluginRegistry = [
  newsRegistry,
  marketRegistry,
  openseaRegistry
];

export const PluginUIComponents: Record<string, React.FC<any>> = {
  'FETCH_NEWS': NewsCard,
  'ANALYZE_TOKEN': MarketCard,
  'OPENSEA_COLLECTION': OpenSeaCard
};