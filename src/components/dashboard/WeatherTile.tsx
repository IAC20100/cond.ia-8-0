import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun as SunIcon, CloudSun } from 'lucide-react';

export function WeatherTile() {
  const [data, setData] = useState<{ temp: number; city: string; condition: string; high: number; low: number } | null>(null);

  useEffect(() => {
    async function fetchLiveWeather(retryCount = 0) {
      if (!navigator.onLine) return;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-22.9064&longitude=-43.1822&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        const json = await res.json();
        
        const getWeatherCondition = (code: number) => {
          if (code === 0) return 'Céu Limpo';
          if (code >= 1 && code <= 3) return 'Parcialmente Nublado';
          if (code >= 45 && code <= 48) return 'Nevoeiro';
          if (code >= 51 && code <= 55) return 'Chuvisco';
          if (code >= 61 && code <= 65) return 'Chuva';
          if (code >= 80 && code <= 82) return 'Pancadas de Chuva';
          if (code >= 95) return 'Tempestade';
          return 'Nublado';
        };

        setData({
          temp: Math.round(json.current.temperature_2m),
          city: 'Rio de Janeiro',
          condition: getWeatherCondition(json.current.weather_code),
          high: Math.round(json.daily.temperature_2m_max[0]),
          low: Math.round(json.daily.temperature_2m_min[0])
        });
      } catch (e: any) {
        console.error('Weather fetch error', e);
        
        if (retryCount < 2 && (e.name === 'AbortError' || e.message === 'Failed to fetch')) {
          setTimeout(() => fetchLiveWeather(retryCount + 1), 3000);
          return;
        }

        setData({
          temp: 26,
          city: 'Rio de Janeiro',
          condition: 'Parcialmente Nublado',
          high: 30,
          low: 22
        });
      }
    }
    fetchLiveWeather();
  }, []);

  return (
    <Link to="/weather" className="w-full h-full bg-gradient-to-br from-[#0078d7] to-[#005a9e] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="absolute top-2 right-2 z-20">
        <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[0.4375rem] font-black text-emerald-400 uppercase tracking-widest">Live</span>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-6 h-full relative z-10">
        <div className="relative group-hover:scale-110 transition-transform duration-500 shrink-0">
          <SunIcon className="w-10 h-10 md:w-16 md:h-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
          <CloudSun className="w-6 h-6 md:w-10 md:h-10 text-white absolute -bottom-1 -right-1 drop-shadow-lg" />
        </div>
        <div className="min-w-0">
          <span className="text-3xl md:text-5xl font-display font-light drop-shadow-lg">{data ? `${data.temp}°` : '--°'}</span>
          <div className="mt-0.5 md:mt-1 min-w-0">
            <p className="text-[0.625rem] md:text-sm font-display font-bold uppercase tracking-wider drop-shadow-md truncate">{data?.city || 'Carregando...'}</p>
            <p className="text-[0.5rem] md:text-xs font-display opacity-80 drop-shadow-sm truncate">{data?.condition || '...'}</p>
            {data && <p className="text-[0.5rem] md:text-[0.625rem] font-display opacity-60">{data.high}° / {data.low}°</p>}
          </div>
        </div>
      </div>
      <span className="text-[0.6875rem] font-display font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Clima</span>
    </Link>
  );
}
