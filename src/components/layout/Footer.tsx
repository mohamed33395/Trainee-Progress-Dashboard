"use client"
import { useLanguage } from '@/context/LanguageContext'
import { Mail, MapPin, Globe } from 'lucide-react'

export function Footer() {
  const { t, language } = useLanguage()

  return (
    <footer className="border-t bg-gradient-to-b md:from-indigo-950 md:to-purple-950 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Company Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-white" />
              <span className="font-semibold text-lg text-white">www.nv2030.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white">
              <Mail className="h-4 w-4" />
              <a href="mailto:info@nv2030.com" className="hover:text-white transition-colors">
                info@nv2030.com
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 text-sm text-white text-center md:text-right">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-center md:text-right">
              {language === 'ar' 
                ? 'المملكة العربية السعودية جدة - حي النهضة - شارع الصفا'
                : 'Kingdom of Saudi Arabia, Jeddah - Al Nahda District - Al Safa Street'
              }
            </span>
          </div>

          {/* App Name */}
          <div className="text-center md:text-right">
            <p className="font-semibold text-sm text-white">{t.common.appName}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-slate-700" />

        {/* Copyright */}
        <div className="text-center text-xs text-white">
          © {new Date().getFullYear()} New Vision. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
