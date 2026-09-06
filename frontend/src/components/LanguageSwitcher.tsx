import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center gap-2 text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
      <Globe className="h-4 w-4" />
      <select
        value={i18n.resolvedLanguage || 'en'}
        onChange={changeLanguage}
        className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:text-green-950 transition-colors"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
