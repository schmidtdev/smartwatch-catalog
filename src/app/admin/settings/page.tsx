'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { toast } from 'react-toastify';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface Settings {
  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  maintenanceMode: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    maintenanceMode: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data: Settings = await response.json();
        setSettings(data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (setting: keyof Settings) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting],
    };
    setSettings(newSettings); // Optimistic update

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        // Revert optimistic update if API call fails
        setSettings(settings);
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save setting');
      }

      toast.success('Configuração salva com sucesso!');
    } catch (err: any) {
      console.error('Error saving setting:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar configuração');
      toast.error(`Erro ao salvar configuração: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        {/* Adicionar um spinner de carregamento aqui */}
        <p>Carregando configurações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <p>Erro ao carregar configurações: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie as configurações do sistema e preferências.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Notificações
            </h3>
            <div className="mt-5 space-y-4">
              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex flex-grow flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900">
                    Notificações por Email
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Receba atualizações importantes por email.
                  </Switch.Description>
                </span>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className={classNames(
                    settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      settings.emailNotifications ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </Switch.Group>

              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex flex-grow flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900">
                    Notificações de Pedidos
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Receba notificações quando novos pedidos forem realizados.
                  </Switch.Description>
                </span>
                <Switch
                  checked={settings.orderNotifications}
                  onChange={() => handleToggle('orderNotifications')}
                  className={classNames(
                    settings.orderNotifications ? 'bg-blue-600' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      settings.orderNotifications ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </Switch.Group>

              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex flex-grow flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900">
                    Alertas de Estoque Baixo
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Receba notificações quando produtos estiverem com estoque baixo.
                  </Switch.Description>
                </span>
                <Switch
                  checked={settings.lowStockAlerts}
                  onChange={() => handleToggle('lowStockAlerts')}
                  className={classNames(
                    settings.lowStockAlerts ? 'bg-blue-600' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      settings.lowStockAlerts ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </Switch.Group>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Sistema
            </h3>
            <div className="mt-5">
              <Switch.Group as="div" className="flex items-center justify-between">
                <span className="flex flex-grow flex-col">
                  <Switch.Label as="span" className="text-sm font-medium text-gray-900">
                    Modo de Manutenção
                  </Switch.Label>
                  <Switch.Description as="span" className="text-sm text-gray-500">
                    Ative o modo de manutenção para realizar atualizações no sistema.
                  </Switch.Description>
                </span>
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={() => handleToggle('maintenanceMode')}
                  className={classNames(
                    settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </Switch.Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 