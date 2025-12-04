import React, { useState } from 'react';
import { MdShoppingCart, MdInventory2, MdBarChart, MdAccountBalance, MdPeople } from 'react-icons/md';

interface SidebarProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onScreenChange, isOpen, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: MdBarChart },
    { id: 'pos', label: 'Punto de Venta', icon: MdShoppingCart },
    { id: 'productos', label: 'Productos', icon: MdInventory2 },
    { id: 'clientes', label: 'Clientes', icon: MdPeople },
    { id: 'caja', label: 'Caja', icon: MdAccountBalance },
  ];

  const isExpanded = isOpen || isHovered;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-[#0a0a0a] border-r border-neutral-800/50 transition-all duration-200 ease-out pt-14 ${
          isOpen ? 'block' : 'hidden md:block'
        }`}
        style={{ width: isExpanded ? '200px' : '56px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full py-3">
          <div className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onScreenChange(item.id);
                    onClose();
                  }}
                  className={`
                    flex items-center w-full h-10 px-3 rounded-lg
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-neutral-800/80 text-white' 
                      : 'text-neutral-500 hover:text-white hover:bg-neutral-800/40'
                    }
                  `}
                >
                  <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <span
                    className={`
                      ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200
                      ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}
                    `}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;