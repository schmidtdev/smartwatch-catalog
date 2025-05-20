import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Providers from './providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartWatch Catalog",
  description: "Catálogo de Smartwatches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-72">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  SmartWatch Catalog
                </Link>
                <nav className="flex items-center space-x-4">
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Catálogo
                  </Link>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900">
                    Admin
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          <main className="min-h-screen bg-gray-50">
            {children}
          </main>

          <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-72 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                    Sobre
                  </h3>
                  <p className="mt-4 text-base text-gray-500">
                    Catálogo de smartwatches com as melhores opções do mercado.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                    Contato
                  </h3>
                  <p className="mt-4 text-base text-gray-500">
                    Email: contato@smartwatchcatalog.com
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                    Links Úteis
                  </h3>
                  <ul className="mt-4 space-y-2">
                    <li>
                      <Link href="/" className="text-base text-gray-500 hover:text-gray-900">
                        Catálogo
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin" className="text-base text-gray-500 hover:text-gray-900">
                        Painel Admin
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-8">
                <p className="text-base text-gray-400 text-center">
                  © 2024 SmartWatch Catalog. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </footer>
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
