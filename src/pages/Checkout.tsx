import React, { useState, useEffect } from 'react';
import { MakePaymentButton } from '../components/MakePaymentButton';
import { motion } from 'motion/react';
import { ShoppingBag, User, Mail, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useSite } from '../lib/SiteContext';
import { useTranslation } from 'react-i18next';

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const kitPrice = siteConfig?.kitPrice || 2300;
  
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
    
    // Full Name Validation
    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      newErrors.name = t('checkout.nameRequired');
    } else {
      const nameParts = nameTrimmed.split(/\s+/).filter(part => part.length > 0);
      if (nameParts.length < 2) {
        newErrors.name = isHe ? "אנא הזן שם מלא (שם פרטי ושם משפחה)" : "Please enter full name (First and Last name)";
      }
    }
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t('checkout.emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('checkout.invalidEmail');
    }

    // Phone Validation (Israeli standard)
    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout.phoneRequired');
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10 || !phoneDigits.startsWith('05')) {
        newErrors.phone = isHe ? "מספר נייד לא תקין (חייב להתחיל ב-05 ולהכיל 10 ספרות)" : "Invalid mobile number (must start with 05 and be 10 digits)";
      }
    }

    if (!formData.city.trim()) newErrors.city = t('checkout.cityRequired');
    if (!formData.street.trim()) newErrors.street = t('checkout.streetRequired');
    
    // House Number Validation
    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = t('checkout.houseRequired');
    } else if (!/^\d+$/.test(formData.houseNumber)) {
      newErrors.houseNumber = isHe ? "מספר בית חייב להכיל ספרות בלבד" : "House number must be numeric";
    }

    // Zip Code Validation (Israeli 7 digits)
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = t('checkout.zipRequired');
    } else if (!/^\d{7}$/.test(formData.zipCode)) {
      newErrors.zipCode = isHe ? "מיקוד לא תקין (חייב להכיל 7 ספרות)" : "Invalid zip code (must be 7 digits)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    validate();
  }, [formData, t]);

  const isFormValid = Object.keys(errors).length === 0 && 
                      formData.name.trim().split(/\s+/).length >= 2 && 
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
                      formData.phone.replace(/\D/g, '').length === 10 &&
                      /^\d{7}$/.test(formData.zipCode) &&
                      /^\d+$/.test(formData.houseNumber);

  const getInputClass = (field: string) => {
    const baseClass = "w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-medium text-start";
    const hasError = touched[field] && errors[field];
    if (hasError) {
      return `${baseClass} border-rose-500 bg-rose-50/30 focus:border-rose-500`;
    }
    // Only show valid state if touched
    if (touched[field] && !errors[field]) {
      return `${baseClass} border-brand-green/30 bg-green-50/10 focus:border-brand-green`;
    }
    return `${baseClass} border-transparent focus:border-brand-green`;
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleNumericInput = (field: string, value: string, maxLength?: number) => {
    const cleaned = value.replace(/\D/g, '');
    const finalValue = maxLength ? cleaned.slice(0, maxLength) : cleaned;
    setFormData({ ...formData, [field]: finalValue });
  };

  const handleTextOnlyInput = (field: string, value: string) => {
    const cleaned = value.replace(/\d/g, '');
    setFormData({ ...formData, [field]: cleaned });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 pt-12 pb-20 px-6">
        <div className="max-w-xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-green transition-colors font-bold group"
          >
            {isHe ? <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /> : <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />}
            {isHe ? 'חזרה לאתר' : 'Back to site'}
          </button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] shadow-xl overflow-hidden"
          >
            <div className="bg-brand-green p-8 text-white text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h1 className="text-3xl font-sans font-bold">{t('checkout.title')}</h1>
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
                    placeholder={isHe ? "שם פרטי ושם משפחה" : "First and Last Name"}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase().trim() })}
                    onBlur={() => handleBlur('email')}
                    placeholder="example@email.com"
                    className={getInputClass('email')}
                    dir="ltr"
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
                    onChange={(e) => handleNumericInput('phone', e.target.value, 10)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="050-0000000"
                    className={getInputClass('phone')}
                    dir="ltr"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 font-bold leading-tight">
                    {t('checkout.israelOnly')}
                  </p>
                  {touched.phone && errors.phone && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.phone}</p>}
                </div>

                <div className="pt-4 border-t border-slate-100 text-start">
                  <h3 className="text-lg font-sans font-bold text-slate-900 mb-4">{t('checkout.shippingAddress')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{t('checkout.city')}</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleTextOnlyInput('city', e.target.value)}
                        onBlur={() => handleBlur('city')}
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
                        onChange={(e) => handleTextOnlyInput('street', e.target.value)}
                        onBlur={() => handleBlur('street')}
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
                          inputMode="numeric"
                          value={formData.houseNumber}
                          onChange={(e) => handleNumericInput('houseNumber', e.target.value, 5)}
                          onBlur={() => handleBlur('houseNumber')}
                          className={getInputClass('houseNumber').replace('px-6 py-4', 'px-4 py-3').replace('rounded-2xl', 'rounded-xl')}
                          dir="ltr"
                        />
                        {touched.houseNumber && errors.houseNumber && <p className="text-[10px] text-rose-500 mt-1 font-bold">{errors.houseNumber}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{t('checkout.apartment')}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formData.apartment}
                          onChange={(e) => handleNumericInput('apartment', e.target.value, 4)}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-brand-green rounded-xl outline-none transition-all font-medium text-sm text-start"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">{t('checkout.zipCode')}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.zipCode}
                        onChange={(e) => handleNumericInput('zipCode', e.target.value, 7)}
                        onBlur={() => handleBlur('zipCode')}
                        className={getInputClass('zipCode').replace('px-6 py-4', 'px-4 py-3').replace('rounded-2xl', 'rounded-xl')}
                        dir="ltr"
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
                    <span className="text-2xl font-sans font-bold text-brand-green">₪{formData.amount}</span>
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
