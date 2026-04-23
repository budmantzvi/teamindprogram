import React, { useState, useEffect } from 'react';
import { MakePaymentButton } from '../components/MakePaymentButton';
import { motion } from 'motion/react';
import { ShoppingBag, User, Mail, Phone, DollarSign } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useSite } from '../lib/SiteContext';
import { useTranslation } from 'react-i18next';

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const { siteConfig } = useSite();
  const { t, i18n } = useTranslation();
  const isHe = i18n.language === 'he';
  
  const rawProgram = searchParams.get('program');
  const getLocalizedProgramName = (name: string | null) => {
    if (!name) return 'TEAMIND Kit';
    if (name === 'Early Childhood' || name === 'הגיל הרך') return t('programs.early');
    if (name === 'Elementary' || name === 'בית ספר יסודי') return t('programs.elementary');
    if (name === 'Parents' || name === 'תוכנית להורים') return t('programs.parents');
    return name;
  };
  
  const productName = getLocalizedProgramName(rawProgram);
  const kitPrice = siteConfig?.kitPrice || 799;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    street: '',
    houseNumber: '',
    apartment: '',
    zipCode: '',
    amount: kitPrice,
    productName: productName
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, productName }));
  }, [productName]);

  useEffect(() => {
    if (siteConfig?.kitPrice) {
      setFormData(prev => ({ ...prev, amount: siteConfig.kitPrice }));
    }
  }, [siteConfig]);

  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (formData.phone) {
      setIsPhoneValid(isValidPhoneNumber(formData.phone));
    } else {
      setIsPhoneValid(false);
    }
  }, [formData.phone]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('checkout.nameRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('checkout.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('checkout.invalidEmail');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout.phoneRequired');
    } else if (formData.phone.length < 9) {
      newErrors.phone = t('checkout.invalidPhone');
    }
    if (!formData.city.trim()) newErrors.city = t('checkout.cityRequired');
    if (!formData.street.trim()) newErrors.street = t('checkout.streetRequired');
    if (!formData.houseNumber.trim()) newErrors.houseNumber = t('checkout.houseRequired');
    if (!formData.zipCode.trim()) newErrors.zipCode = t('checkout.zipRequired');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validate();
  }, [formData, t]);

  const isFormValid = Object.keys(errors).length === 0;

  const getInputClass = (field: string) => {
    const baseClass = "w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-medium text-start";
    if (touched[field] && errors[field]) {
      return `${baseClass} border-rose-500 bg-rose-50/30 focus:border-rose-500`;
    }
    return `${baseClass} border-transparent focus:border-brand-green`;
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] shadow-xl overflow-hidden"
          >
            <div className="bg-brand-green p-8 text-white text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h1 className="text-3xl font-serif font-bold">{t('checkout.title')}</h1>
              <p className="text-white/80 mt-2">{formData.productName}</p>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="space-y-6">
                <div className="text-start">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-green" /> {t('checkout.fullName')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => handleBlur('name')}
                    placeholder={t('common.name')}
                    className={getInputClass('name')}
                    dir={isHe ? 'rtl' : 'ltr'}
                  />
                  {touched.name && errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.name}</p>}
                </div>
                
                <div className="text-start">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-green" /> {t('checkout.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={() => handleBlur('email')}
                    placeholder={t('common.email')}
                    className={getInputClass('email')}
                    dir={isHe ? 'rtl' : 'ltr'}
                  />
                  {touched.email && errors.email && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.email}</p>}
                </div>

                <div className="text-start">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-green" /> {t('checkout.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    onBlur={() => handleBlur('phone')}
                    placeholder={t('common.phone')}
                    className={getInputClass('phone')}
                    dir={isHe ? 'rtl' : 'ltr'}
                  />
                  <p className="text-[10px] text-slate-500 mt-2 font-bold leading-tight">
                    {t('checkout.israelOnly')}
                  </p>
                  {touched.phone && errors.phone && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.phone}</p>}
                </div>

                <div className="pt-4 border-t border-slate-100 text-start">
                  <h3 className="text-lg font-serif font-bold text-slate-900 mb-4">{t('checkout.shippingAddress')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{t('checkout.city')}</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        onBlur={() => handleBlur('city')}
                        placeholder={t('checkout.egTelAviv')}
                        className={getInputClass('city').replace('px-6 py-4', 'px-4 py-3').replace('rounded-2xl', 'rounded-xl')}
                        dir={isHe ? 'rtl' : 'ltr'}
                      />
                      {touched.city && errors.city && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{t('checkout.street')}</label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        onBlur={() => handleBlur('street')}
                        placeholder={t('checkout.egHerzl')}
                        className={getInputClass('street').replace('px-6 py-4', 'px-4 py-3').replace('rounded-2xl', 'rounded-xl')}
                        dir={isHe ? 'rtl' : 'ltr'}
                      />
                      {touched.street && errors.street && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.street}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{t('checkout.houseNo')}</label>
                        <input
                          type="text"
                          value={formData.houseNumber}
                          onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                          onBlur={() => handleBlur('houseNumber')}
                          className={getInputClass('houseNumber').replace('px-6 py-4', 'px-4 py-3').replace('rounded-2xl', 'rounded-xl')}
                          dir={isHe ? 'rtl' : 'ltr'}
                        />
                        {touched.houseNumber && errors.houseNumber && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.houseNumber}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{t('checkout.apartment')}</label>
                        <input
                          type="text"
                          value={formData.apartment}
                          onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-green rounded-xl outline-none transition-all font-medium text-sm text-start"
                          dir={isHe ? 'rtl' : 'ltr'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{t('checkout.zipCode')}</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        onBlur={() => handleBlur('zipCode')}
                        className={getInputClass('zipCode').replace('px-6 py-4', 'px-4 py-3').replace('rounded-2xl', 'rounded-xl')}
                        dir={isHe ? 'rtl' : 'ltr'}
                      />
                      {touched.zipCode && errors.zipCode && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-600 font-medium">{t('checkout.product')}</span>
                    <span className="font-bold text-slate-900">{formData.productName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-lg font-bold text-slate-900">{t('checkout.total')}</span>
                    <span className="text-2xl font-serif font-bold text-brand-green">₪{formData.amount}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <MakePaymentButton 
                    amount={formData.amount}
                    customerName={formData.name}
                    email={formData.email}
                    phone={formData.phone}
                    productName={formData.productName}
                    shippingAddress={{
                      city: formData.city,
                      street: formData.street,
                      houseNumber: formData.houseNumber,
                      apartment: formData.apartment,
                      zipCode: formData.zipCode
                    }}
                    buttonText={t('checkout.proceed')}
                    className={`w-full py-5 text-lg ${!isFormValid ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    disabled={!isFormValid}
                  />
                </div>
                
                <p className="text-center text-xs text-slate-400 mt-6">
                  {t('checkout.securePayment')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
