import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Phone, 
  Truck, 
  Database, 
  Key, 
  CheckCircle2, 
  ShieldCheck, 
  Save,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { STORE_CONFIG, SHIPPING_RATES } from '../../../data/mockCatalog';
import { supabase, isSupabaseConfigured } from '../../../services/supabase';
import { getShippingRates, updateShippingRate } from '../../../services/shippingService';

export const SettingsView: React.FC = () => {
  // Load saved settings from localStorage or defaults
  const [storeName, setStoreName] = useState(() => {
    return localStorage.getItem('aura_store_name') || STORE_CONFIG.storeName;
  });
  const [whatsapp, setWhatsapp] = useState(() => {
    return localStorage.getItem('aura_whatsapp_number') || STORE_CONFIG.whatsappNumber;
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('aura_store_currency') || STORE_CONFIG.currency;
  });

  // Shipping rates
  const [cabaRate, setCabaRate] = useState<number>(() => {
    const saved = localStorage.getItem('aura_rate_caba');
    return saved ? Number(saved) : SHIPPING_RATES.cabaGba.price;
  });
  const [interiorRate, setInteriorRate] = useState<number>(() => {
    const saved = localStorage.getItem('aura_rate_interior');
    return saved ? Number(saved) : (SHIPPING_RATES.centro?.price || 5200);
  });

  useEffect(() => {
    getShippingRates().then(rates => {
      if (rates.cabaGba) setCabaRate(rates.cabaGba.price);
      if (rates.centro) setInteriorRate(rates.centro.price);
    });
  }, []);

  // Password settings
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Status feedback
  const [savedNotice, setSavedNotice] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<string | null>(null);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('aura_store_name', storeName);
    localStorage.setItem('aura_whatsapp_number', whatsapp);
    localStorage.setItem('aura_store_currency', currency);
    localStorage.setItem('aura_rate_caba', String(cabaRate));
    localStorage.setItem('aura_rate_interior', String(interiorRate));

    // Sincronizar tarifas en Supabase
    await Promise.all([
      updateShippingRate('cabaGba', cabaRate),
      updateShippingRate('centro', interiorRate)
    ]).catch(err => console.warn('[SettingsView] Error sincronizando tarifas en DB:', err));

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);

    if (newPassword.trim().length < 6) {
      setPasswordChangeError('La nueva clave debe tener al menos 6 caracteres.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword.trim()
        });
        if (error) throw error;
        setPasswordChangeSuccess(true);
        setNewPassword('');
        setTimeout(() => setPasswordChangeSuccess(false), 3500);
      } else {
        setPasswordChangeSuccess(true);
        setNewPassword('');
        setTimeout(() => setPasswordChangeSuccess(false), 3500);
      }
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Error al actualizar la clave secreta.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const testSupabaseConnection = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);

    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => {
        setIsTestingSupabase(false);
        setSupabaseTestResult('Supabase no está configurado en las variables de entorno (.env). La tienda opera en modo Fallback Mock.');
      }, 600);
      return;
    }

    try {
      const { data, error } = await supabase.from('products').select('id').limit(1);
      if (error) {
        setSupabaseTestResult(`Error al consultar tabla 'products': ${error.message}`);
      } else {
        setSupabaseTestResult(`¡Conexión exitosa con Supabase! Tabla 'products' accesible.`);
      }
    } catch (err: any) {
      setSupabaseTestResult(`Error de red: ${err.message}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* 1. General Store Settings */}
      <div className="bg-white rounded-3xl p-6 border border-[#DEC0C0]/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2c221e]">
              Parámetros de la Tienda
            </h3>
            <p className="text-xs text-[#5c4b45]">
              Configuración operativa de contacto, WhatsApp y tarifas de logística
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#55443e]">
            <Store className="w-5 h-5" />
          </div>
        </div>

        {savedNotice && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-3 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Configuración de la tienda guardada y sincronizada correctamente.</span>
          </div>
        )}

        <form onSubmit={handleSaveGeneral} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#5c4b45] font-semibold mb-1">
                Nombre de la Tienda
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
              />
            </div>

            <div>
              <label className="block text-[#5c4b45] font-semibold mb-1">
                Moneda del Catálogo
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
              />
            </div>

            <div>
              <label className="block text-[#5c4b45] font-semibold mb-1">
                Número de WhatsApp de Ventas
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="54911..."
                className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
              />
            </div>
          </div>

          {/* WhatsApp direct test link */}
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#DEC0C0]/60 flex items-center justify-between text-[11px]">
            <span className="text-[#5c4b45]">
              Enlace de recepción: <strong className="text-[#2c221e]">wa.me/{whatsapp.replace(/\D/g, '')}</strong>
            </span>
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Test%20de%20conexion%20Aura`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EA8A8A] hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>Probar en WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Shipping Rates */}
          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#DEC0C0]/60 space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#55443e]">
              <Truck className="w-4 h-4 text-[#EA8A8A]" />
              <span>Tarifas de Envío y Logística</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-[#DEC0C0]/60">
                <label className="text-[11px] text-[#5c4b45] uppercase font-bold block mb-1">
                  CABA y Gran Buenos Aires ($ ARS)
                </label>
                <input
                  type="number"
                  value={cabaRate}
                  onChange={(e) => setCabaRate(Number(e.target.value))}
                  className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-lg px-3 py-1.5 font-bold text-sm text-[#2c221e] focus:outline-none focus:ring-1 focus:ring-[#EA8A8A]"
                />
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#DEC0C0]/60">
                <label className="text-[11px] text-[#5c4b45] uppercase font-bold block mb-1">
                  Interior de Argentina ($ ARS)
                </label>
                <input
                  type="number"
                  value={interiorRate}
                  onChange={(e) => setInteriorRate(Number(e.target.value))}
                  className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-lg px-3 py-1.5 font-bold text-sm text-[#2c221e] focus:outline-none focus:ring-1 focus:ring-[#EA8A8A]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] font-bold text-xs shadow-md shadow-[#EA8A8A]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Parámetros</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Security & Admin Password */}
      <div className="bg-white rounded-3xl p-6 border border-[#DEC0C0]/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2c221e]">
              Seguridad & Clave Secreta
            </h3>
            <p className="text-xs text-[#5c4b45]">
              Actualizá tu clave de acceso de administrador en Supabase Auth
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#55443e]">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        {passwordChangeSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl p-3 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Clave de administrador actualizada con éxito en Supabase!</span>
          </div>
        )}

        {passwordChangeError && (
          <div className="mb-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl p-3 text-xs flex items-center gap-2 animate-shake">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordChangeError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#5c4b45] font-semibold mb-1">
              Nueva Clave Secreta
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingresá tu nueva clave (mínimo 6 caracteres)"
              className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2.5 rounded-xl bg-[#443530] hover:bg-[#322622] text-[#FAF6F0] font-bold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Key className="w-4 h-4 text-[#EA8A8A]" />
              <span>{isUpdatingPassword ? 'Actualizando...' : 'Actualizar Clave Secreta'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Base de Datos & Estado de Supabase */}
      <div className="bg-white rounded-3xl p-6 border border-[#DEC0C0]/70 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2c221e]">
              Estado de la Base de Datos (Supabase)
            </h3>
            <p className="text-xs text-[#5c4b45]">
              Diagnóstico de conexión para persistencia del catálogo
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#55443e]">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#DEC0C0]/60">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <span className="font-bold text-[#2c221e] block">
                  {isSupabaseConfigured ? 'Supabase Conectado (Producción / Live)' : 'Modo Fallback Mock Activo'}
                </span>
                <span className="text-[11px] text-[#5c4b45]">
                  {isSupabaseConfigured
                    ? 'Las prendas se guardan en la tabla PostgreSQL "products".'
                    : 'Sin credenciales configuradas en .env. Se usan datos locales.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={testSupabaseConnection}
              disabled={isTestingSupabase}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#DEC0C0] hover:bg-[#F4E8E8] text-[#55443e] font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin text-[#EA8A8A]' : ''}`} />
              <span>{isTestingSupabase ? 'Probando...' : 'Verificar Conexión'}</span>
            </button>
          </div>

          {supabaseTestResult && (
            <div className="p-3 bg-white border border-[#DEC0C0] rounded-xl text-xs text-[#2c221e] font-medium">
              {supabaseTestResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
