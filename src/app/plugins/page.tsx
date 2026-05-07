'use client';

import { useState, useEffect } from 'react';
import { Blocks, Download, Trash2 } from 'lucide-react';

export default function PluginStorePage() {
  const [registry, setRegistry] = useState<any[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('nexus_installed_plugins') || '[]');
    setInstalled(saved);

    fetch('/api/plugins')
      .then(res => res.json())
      .then(data => {
        setRegistry(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleInstall = (pluginName: string) => {
    const updated = [...installed, pluginName];
    setInstalled(updated);
    localStorage.setItem('nexus_installed_plugins', JSON.stringify(updated));
    
    const active = JSON.parse(localStorage.getItem('nexus_active_plugins') || '[]');
    if (!active.includes(pluginName)) {
      localStorage.setItem('nexus_active_plugins', JSON.stringify([...active, pluginName]));
    }
  };

  const handleUninstall = (pluginName: string) => {
    const updated = installed.filter(name => name !== pluginName);
    setInstalled(updated);
    localStorage.setItem('nexus_installed_plugins', JSON.stringify(updated));
    
    const active = JSON.parse(localStorage.getItem('nexus_active_plugins') || '[]');
    localStorage.setItem('nexus_active_plugins', JSON.stringify(active.filter((n: string) => n !== pluginName)));
  };

  return (
    <main className="flex-1 bg-gray-950 p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto relative z-10 pt-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <Blocks className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Plugin Store</h1>
            <p className="text-gray-400 text-lg mt-1">Expand the intelligence of your Nexus.ai Terminal.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registry.map((plugin) => {
              const isInstalled = installed.includes(plugin.name);

              return (
                <div key={plugin.name} className="flex flex-col bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl hover:border-gray-700 transition-all hover:shadow-2xl">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">{plugin.name}</h3>
                    <p className="text-base text-gray-400 leading-relaxed mb-8">
                      {plugin.desc || plugin.description}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                      v1.0.0
                    </span>
                    
                    {isInstalled ? (
                      <button 
                        onClick={() => handleUninstall(plugin.name)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-colors border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" /> Uninstall
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleInstall(plugin.name)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-200 text-black text-sm font-bold rounded-xl transition-colors shadow-lg"
                      >
                        <Download className="w-4 h-4" /> Install
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}