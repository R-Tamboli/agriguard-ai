const english = (text) => text;

export const getSdgGoals = (t) => [
  {
    id: 1,
    name: t('No Poverty', 'गरीबी मिटाना'),
    color: '#E5243B',
    icon: '💰',
    description:
      t('End poverty in all its forms everywhere by empowering smallholder farmers with AI-driven insights to increase income and productivity.', 'खेती की सही जानकारी से छोटे किसानों की उपज और आमदनी बढ़ाना और गरीबी मिटाना।'),
    impact:
      t("AgriGuard AI helps farmers optimize crop selection and reduce losses, directly increasing household income for the world's poorest communities.", 'सही फसल चुनने और नुकसान घटाने से कम आमदनी वाले किसान परिवारों की कमाई बढ़ सकती है।'),
    target: '1.4',
    targetText: t('Equal rights to economic resources and basic services', 'संसाधनों और बुनियादी सेवाओं पर सबका बराबर हक'),
    stats: { value: t('700M+', '70 करोड़ से ज़्यादा'), label: t('People in extreme poverty', 'लोग बेहद गरीबी में जी रहे हैं') },
  },
  {
    id: 2,
    name: t('Zero Hunger', 'भुखमरी मिटाना'),
    color: '#DDA63A',
    icon: '🍽️',
    description:
      t('End hunger, achieve food security and improved nutrition, and promote sustainable agriculture through AI-powered precision farming.', 'खेती के बेहतर तरीकों से सबके लिए भरपेट और पौष्टिक भोजन जुटाना।'),
    impact:
      t('By detecting crop diseases early and recommending optimal crops, AgriGuard AI prevents massive food losses and increases global food production.', 'बीमारी की जल्दी पहचान और सही फसल के चुनाव से अनाज की बर्बादी घटती है और पैदावार बढ़ती है।'),
    target: '2.3',
    targetText:
      t('Double the agricultural productivity and incomes of small-scale food producers', 'छोटे किसानों की पैदावार और आमदनी दोगुनी करना'),
    stats: { value: t('828M', '82.8 करोड़'), label: t('People facing hunger globally', 'लोग दुनिया भर में भूख से जूझ रहे हैं') },
  },
  {
    id: 13,
    name: t('Climate Action', 'बदलते मौसम से निपटना'),
    color: '#3F7E44',
    icon: '🌍',
    description:
      t('Take urgent action to combat climate change and its impacts on agriculture through data-driven, climate-resilient farming.', 'मौसम की जानकारी से खेती को सूखे, बाढ़ और बदलती जलवायु के लिए तैयार करना।'),
    impact:
      t('AgriGuard AI recommends climate-resilient crops and sustainable farming practices, helping agriculture adapt to changing weather patterns.', 'बदलते मौसम को सहने वाली फसलों और खेती के तरीकों पर सलाह मिलती है।'),
    target: '13.1',
    targetText:
      t('Strengthen resilience and adaptive capacity to climate-related hazards', 'मौसम से जुड़े खतरों से निपटने की क्षमता बढ़ाना'),
    stats: { value: '23%', label: t('Of global GHG emissions from agriculture', 'दुनिया में ग्रीनहाउस गैसों के उत्सर्जन में खेती की हिस्सेदारी') },
  },
  {
    id: 15,
    name: t('Life on Land', 'धरती पर जीवन की रक्षा'),
    color: '#56C02B',
    icon: '🌿',
    description:
      t('Protect, restore, and promote sustainable use of terrestrial ecosystems and halt land degradation.', 'मिट्टी को खराब होने से बचाना और पेड़-पौधों व जीव-जंतुओं की रक्षा करना।'),
    impact:
      t('By promoting precision agriculture, AgriGuard AI reduces overuse of pesticides and fertilizers, protecting biodiversity and soil health.', 'दवा और खाद का सही मात्रा में इस्तेमाल करने से मिट्टी, पौधों और जीव-जंतुओं की रक्षा होती है।'),
    target: '15.3',
    targetText:
      t('Combat desertification, restore degraded land, and strive for a land degradation-neutral world', 'ज़मीन को बंजर होने से बचाना और खराब ज़मीन को फिर से उपजाऊ बनाना'),
    stats: { value: '40%', label: t('Of land is degraded globally', 'ज़मीन की हालत दुनिया भर में खराब हो चुकी है') },
  },
];

export const sdgGoals = getSdgGoals(english);

// Real statistics from UN FAO & World Bank — the global crisis we're solving
export function getImpactStats(t) {
  return [
    { label: t('People Facing Hunger (UN 2024)', 'भूख से जूझ रहे लोग (संयुक्त राष्ट्र, 2024)'), value: t(828, 82.8), suffix: t('M', ' करोड़'), icon: '🍽️' },
    { label: t('Smallholder Farmers Worldwide', 'दुनिया भर में छोटे किसान'), value: t(500, 50), suffix: t('M', ' करोड़'), icon: '👨‍🌾' },
    { label: t('Crop Losses to Disease Yearly', 'हर साल रोगों से फसल का नुकसान'), value: 40, suffix: '%', icon: '🦠' },
    { label: t('Countries Affected by Food Crisis', 'भोजन की कमी से प्रभावित देश'), value: 48, suffix: '+', icon: '🌏' },
  ];
}

export const impactStats = getImpactStats(english);

export function getCropDiseases(t) {
  return [
    { name: t('Leaf Blight', 'पत्ती का झुलसा रोग'), severity: 'High', severityLabel: t('High', 'गंभीर'), crop: t('Rice', 'धान'), icon: '🍂' },
    { name: t('Powdery Mildew', 'सफेद चूर्णी फफूंदी'), severity: 'Medium', severityLabel: t('Medium', 'मध्यम'), crop: t('Wheat', 'गेहूँ'), icon: '🌫️' },
    { name: t('Root Rot', 'जड़ सड़न'), severity: 'High', severityLabel: t('High', 'गंभीर'), crop: t('Tomato', 'टमाटर'), icon: '🍅' },
    { name: t('Rust Disease', 'रतुआ रोग'), severity: 'Medium', severityLabel: t('Medium', 'मध्यम'), crop: t('Corn', 'मक्का'), icon: '🌽' },
    { name: t('Bacterial Wilt', 'जीवाणु से मुरझाने का रोग'), severity: 'Critical', severityLabel: t('Critical', 'बहुत गंभीर'), crop: t('Potato', 'आलू'), icon: '🥔' },
    { name: t('Anthracnose', 'एन्थ्रेक्नोज़ (धब्बा रोग)'), severity: 'Low', severityLabel: t('Low', 'हल्का'), crop: t('Mango', 'आम'), icon: '🥭' },
  ];
}

export const cropDiseases = getCropDiseases(english);

export const regions = [
  'South Asia',
  'Southeast Asia',
  'Sub-Saharan Africa',
  'East Africa',
  'Latin America',
  'Middle East & North Africa',
  'Central Asia',
  'East Asia',
  'Pacific Islands',
  'Caribbean',
];

export const soilTypes = [
  'Clay',
  'Sandy',
  'Loamy',
  'Silt',
  'Peat',
  'Chalky',
  'Saline',
  'Red Soil',
  'Black Soil',
  'Laterite',
];

export const seasons = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)', 'Year-round'];

export const waterAvailability = ['Rain-fed only', 'Limited irrigation', 'Full irrigation', 'Drought-prone'];

export function getQuickPrompts(t) {
  return [
    { label: t('🩺 Treat leaf blight', '🩺 झुलसा रोग का इलाज'), prompt: t('How do I treat leaf blight disease in my rice crops? Give me organic and chemical treatment options.', 'मेरी धान की फसल में पत्तियों का झुलसा रोग है। इसके जैविक और रासायनिक इलाज क्या हैं?') },
    { label: t('🌱 Best dry season crops', '🌱 कम पानी वाली फसलें'), prompt: t('What are the best crops to grow during the dry season with limited water availability?', 'सूखे मौसम में पानी कम हो तो मैं कौन सी फसलें उगा सकता हूँ?') },
    { label: t('🐛 Natural pest control', '🐛 कीटों से प्राकृतिक बचाव'), prompt: t('What are effective natural pest control methods for small-scale vegetable farming?', 'छोटे खेत में सब्ज़ियों को कीटों से बचाने के प्राकृतिक तरीके क्या हैं?') },
    { label: t('🌤️ Climate-resilient farming', '🌤️ बदलते मौसम में खेती'), prompt: t('How can I make my farm more resilient to climate change? What practices should I adopt?', 'बदलते मौसम में अपनी फसल को बचाने के लिए मैं कौन से तरीके अपनाऊँ?') },
    { label: t('💧 Water conservation', '💧 पानी की बचत'), prompt: t('What are the best water conservation techniques for farming in arid regions?', 'सूखे इलाके में खेती के लिए पानी कैसे बचाऊँ?') },
    { label: t('🧪 Improve soil health', '🧪 मिट्टी की सेहत सुधारें'), prompt: t('How can I improve my soil health naturally without expensive fertilizers?', 'महँगी खाद खरीदे बिना मैं अपनी मिट्टी की सेहत कैसे सुधारूँ?') },
  ];
}

export const quickPrompts = getQuickPrompts(english);
