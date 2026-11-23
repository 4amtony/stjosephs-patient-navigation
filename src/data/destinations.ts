import directions from './official/directions.json';
import type { Provenance, ZoneId, Level } from './types';

/**
 * Destination index built from the official directory + detailed-directions pages (retrieved
 * 2026-11-19). `name` and `room` are kept exactly as signed/published (English). `aliases` come
 * from the directory's "see …" cross-references plus common lay terms; `xAliases` are
 * non-English search terms (unreviewed; they only help search — they are never displayed as
 * official names).
 */
export type Category = 'clinic' | 'imaging' | 'registration' | 'service' | 'food' | 'faith' | 'admin' | 'help' | 'meeting' | 'training';

export interface Destination {
  id: string;
  node: string;
  name: string;
  room: string;
  zone: ZoneId;
  level: Level;
  category: Category;
  phones?: string[];
  hours?: string;
  /** official check-in / arrival note (verbatim where available) */
  checkIn?: string;
  notes?: string[];
  aliases: string[];
  xAliases?: string[];
  /** title in src/data/official/directions.json (verbatim step lists) */
  officialTitle?: string;
  sourceUrl: string;
  status: Provenance;
  conflicts?: string[];
  popular?: boolean;
  /** requires staff verification (fictional training demo only) */
  restricted?: boolean;
}

const DIR = 'https://www.sjhc.london.on.ca/how-to-get-there/st-josephs-hospital-directions-to-all-program-and-services';
const page = (l: string) => `https://www.sjhc.london.on.ca/st-josephs-hospital-program-and-service-detailed-directions-${l}`;

export const DESTINATIONS: Destination[] = [
  {
    id: 'breast-care', node: 'BREAST', name: 'Breast Care Centre', room: 'D1-112', zone: 'D', level: 1, category: 'imaging',
    phones: ['Breast Care Centre: 519 646-6100 ext. 65008', 'Breast Imaging: 519 646-6100 ext. 64060'],
    notes: ['Includes mammography and breast ultrasound (directory).', 'Landmark: beside the pink column.'],
    aliases: ['breast care', 'breast imaging', 'mammography', 'mammogram', 'breast ultrasound', 'breast clinic', 'breast care program'],
    xAliases: ['乳腺', '乳房', '乳腺护理', '乳腺護理', '乳房攝影', '钼靶', 'الثدي', 'تصوير الثدي', 'sein', 'mammographie', 'mama', 'mamografía', 'mamografia', 'स्तन', 'ਛਾਤੀ', 'چھاتی', 'پستان', 'மார்பக', 'vú', 'suso', '유방', 'грудь', 'маммография', 'груди', 'piersi', 'brust', 'স্তন'],
    officialTitle: 'Breast Care', sourceUrl: page('b'), status: 'OFFICIAL', popular: true,
  },
  {
    id: 'mri-b5', node: 'MI_B5', name: 'Medical Imaging – B5 (MRI, Molecular Imaging and Theranostics)', room: 'B5-204', zone: 'B', level: 5, category: 'imaging',
    phones: ['519 646-6100 ext. 64183 / 64328'],
    notes: ['For appointments after 6 pm Monday to Friday, use Grosvenor Entrance 2 and press the buzzer to the right of the door. Security will let you in.'],
    aliases: ['mri', 'magnetic resonance', 'nuclear medicine', 'pet', 'pet/ct', 'pet ct', 'molecular imaging', 'theranostics', 'medical imaging b5', 'b5 imaging'],
    xAliases: ['核磁共振', '磁共振', '核磁', '磁力共振', '核醫學', '核医学', 'الرنين المغناطيسي', 'رنين', 'irm', 'médecine nucléaire', 'resonancia', 'resonancia magnética', 'ressonância', 'एमआरआई', 'ਐਮਆਰਆਈ', 'ایم آر آئی', 'ام آر آی', 'எம்ஆர்ஐ', 'cộng hưởng từ', 'mri scan', '자기공명', 'мрт', 'рм', 'rezonans', 'mrt', 'এমআরআই'],
    officialTitle: 'MRI, Molecular Imaging and Theranostics (Nuclear Medicine, PET/CT)', sourceUrl: page('m-B5'), status: 'OFFICIAL', popular: true,
  },
  {
    id: 'b3-outpatient', node: 'B3030', name: 'B3 Outpatient Clinics – Central Registration', room: 'B3-030', zone: 'B', level: 3, category: 'registration',
    phones: ['519 646-6100 ext. 66019'],
    notes: ['Registration point for: Allergy and Immunology, Asthma, Cardiac Rehabilitation, Cardiovascular Investigation (CVIU), Cellulitis, COPD, ECG/ECHO, Infectious Diseases, Pain Management, Post-Acute COVID-19, Pulmonary Function, Respirology, Stress Test (directory).'],
    aliases: ['b3', 'outpatient', 'outpatient clinics', 'central registration', 'allergy', 'immunology', 'asthma', 'cardiac rehabilitation', 'cardiac rehab', 'cviu', 'cardiovascular investigation', 'cellulitis', 'copd', 'ecg', 'echo', 'echocardiogram', 'infectious diseases', 'pain management', 'pain clinic', 'post-acute covid', 'covid', 'pulmonary function', 'respirology', 'stress test', 'lung'],
    xAliases: ['门诊', '門診', '过敏', '哮喘', '心电图', '心電圖', '呼吸科', 'العيادات الخارجية', 'عيادات', 'cliniques externes', 'consultas externas', 'ambulatório', 'बाह्य रोगी', 'ਓਪੀਡੀ', 'بیرونی مریض', 'درمانگاه', 'வெளிநோயாளர்', 'ngoại trú', 'outpatient clinic', '외래', 'поликлиника', 'амбулатор', 'ambulatorium', 'ambulanz', 'বহির্বিভাগ'],
    officialTitle: 'B3 Outpatient Clinics', sourceUrl: page('b'), status: 'OFFICIAL', popular: true,
  },
  {
    id: 'medical-imaging-c0', node: 'MI_C0', name: 'Medical Imaging – C0', room: 'C0-200', zone: 'C', level: 0, category: 'imaging',
    phones: ['519 646-6100 ext. 66044 / 65035'],
    notes: ['Bone Mineral Density, CT Scan, Ultrasound, X-Ray, Ontario Breast Screening, Interventional Radiology (detailed directions page).'],
    aliases: ['x-ray', 'xray', 'x ray', 'ct', 'ct scan', 'cat scan', 'ultrasound', 'bone mineral density', 'bone density', 'interventional radiology', 'ontario breast screening', 'obsp', 'medical imaging', 'imaging', 'radiology', 'francis and madeleine saul medical imaging centre'],
    xAliases: ['X光', 'X光片', '拍片', 'CT', '超声', '超聲波', 'B超', '骨密度', 'أشعة', 'أشعة سينية', 'الأشعة المقطعية', 'radiographie', 'radiografía', 'ecografía', 'raio-x', 'एक्स-रे', 'ਐਕਸ-ਰੇ', 'ایکسرے', 'رادیولوژی', 'எக்ஸ்-ரே', 'chụp x-quang', 'siêu âm', '엑스레이', '초음파', 'рентген', 'узи', 'rentgen', 'röntgen', 'এক্স-রে'],
    officialTitle: 'Medical Imaging - C0', sourceUrl: page('m'), status: 'OFFICIAL', popular: true,
  },
  {
    id: 'urgent-care', node: 'URGENT', name: 'Urgent Care', room: 'B0-504', zone: 'B', level: 0, category: 'clinic', phones: ['519 646-6100 ext. 67020'],
    notes: ['If this is an emergency, tell any staff member immediately. This app does not give medical advice.'],
    aliases: ['urgent care', 'urgent care centre', 'walk-in', 'emergency', 'er'],
    xAliases: ['急诊', '急診', '紧急', 'طوارئ', 'رعاية عاجلة', 'urgences', 'urgencias', 'urgência', 'आपातकालीन', 'ਐਮਰਜੈਂਸੀ', 'ایمرجنسی', 'اورژانس', 'அவசர', 'cấp cứu', '응급', 'неотложн', 'pilne', 'notfall', 'জরুরি'],
    officialTitle: 'Urgent Care', sourceUrl: page('u'), status: 'OFFICIAL', popular: true,
  },
  {
    id: 'lab-test', node: 'LAB', name: 'Lab Test', room: 'B0-634', zone: 'B', level: 0, category: 'service', phones: ['519 646-6100 ext. 64498'], hours: 'Monday to Friday, 8 am – 4:15 pm',
    aliases: ['lab', 'laboratory', 'blood test', 'bloodwork', 'blood work', 'specimen collection'],
    xAliases: ['化验', '化驗', '抽血', '验血', '驗血', 'مختبر', 'تحليل دم', 'laboratoire', 'prise de sang', 'laboratorio', 'análisis de sangre', 'exame de sangue', 'लैब', 'खून जांच', 'ਲੈਬ', 'لیب', 'آزمایشگاه', 'ஆய்வகம்', 'xét nghiệm', '채혈', 'анализ крови', 'лаборатор', 'badanie krwi', 'blutabnahme', 'labor', 'ল্যাব'],
    officialTitle: 'Lab Test', sourceUrl: page('l'), status: 'OFFICIAL', popular: true,
  },
  {
    id: 'ivey-eye', node: 'IVEY', name: 'Ivey Eye Institute', room: 'B1-050', zone: 'B', level: 1, category: 'clinic', phones: ['519 646-6100 ext. 66018'],
    checkIn: 'Please wait in line to be called by the next available receptionist and have your health card ready.',
    aliases: ['eye', 'eye clinic', 'ophthalmology', 'ivey eye', 'vision'],
    xAliases: ['眼科', 'عيون', 'طب العيون', 'ophtalmologie', 'yeux', 'oftalmología', 'ojos', 'oftalmologia', 'नेत्र', 'आंख', 'ਅੱਖਾਂ', 'آنکھ', 'چشم', 'கண்', 'mắt', 'mata', '안과', 'глаз', 'окуліст', 'okulista', 'augen', 'চোখ'],
    officialTitle: 'Ivey Eye Institute', sourceUrl: page('i'), status: 'OFFICIAL', popular: true,
  },
  {
    id: 'cataract', node: 'CATARACT', name: 'Cataract', room: 'B2-602', zone: 'B', level: 2, category: 'clinic', phones: ['519 646-6100 ext. 65332'],
    aliases: ['cataract', 'cataract surgery', 'eye surgery'], xAliases: ['白内障', '白內障', 'إعتام عدسة العين', 'cataracte', 'catarata', 'मोतियाबिंद', 'ਮੋਤੀਆ', 'موتیا', 'آب مروارید', 'கண்புரை', 'đục thủy tinh thể', '백내장', 'катаракт', 'zaćma', 'grauer star', 'ছানি'],
    officialTitle: 'Cataract', sourceUrl: page('c'), status: 'OFFICIAL',
  },
  {
    id: 'head-neck', node: 'HEADNECK', name: 'Head and Neck', room: 'B2-501', zone: 'B', level: 2, category: 'clinic', phones: ['519 646-6100 ext. 66009'],
    notes: ['Includes Otolaryngology, Otology, Facial Plastic Surgery, Snoring and Sleep Apnea, HearCanada (directory).'],
    aliases: ['head and neck', 'ent', 'ear nose throat', 'otolaryngology', 'otology', 'facial plastic surgery', 'snoring', 'sleep apnea', 'hearcanada', 'hearing'],
    xAliases: ['耳鼻喉', 'أنف وأذن وحنجرة', 'orl', 'otorrino', 'कान नाक गला', 'ਕੰਨ ਨੱਕ ਗਲਾ', 'کان ناک گلا', 'گوش و حلق و بینی', 'காது மூக்கு தொண்டை', 'tai mũi họng', '이비인후과', 'лор', 'laryngolog', 'hno', 'নাক কান গলা'],
    officialTitle: 'Head and Neck', sourceUrl: page('h'), status: 'OFFICIAL',
  },
  {
    id: 'diabetes-endo', node: 'DIABETES', name: 'Diabetes and Endocrinology', room: 'B5-502', zone: 'B', level: 5, category: 'clinic',
    phones: ['Diabetes and Endocrinology: 519 646-6100 ext. 66349', 'Diabetes Education: 519 661-1600 ext. 68600'],
    checkIn: 'Check in at the Diabetes and Endocrinology reception desk on your right. A registration staff member will then direct you.',
    notes: ['Also: Diabetes Education Centre (B5-602), Clinical Investigation, One-Stop Pituitary Clinic, Accord Study (B5-662) per directory.'],
    aliases: ['diabetes', 'endocrinology', 'metabolism', 'diabetes education', 'pituitary', 'clinical investigation', 'accord study'],
    xAliases: ['糖尿病', '内分泌', '內分泌', 'سكري', 'السكري', 'diabète', 'diabetes', 'मधुमेह', 'ਸ਼ੂਗਰ', 'ذیابیطس', 'شوگر', 'دیابت', 'நீரிழிவு', 'tiểu đường', '당뇨', 'диабет', 'cukrzyca', 'ডায়াবেটিস'],
    officialTitle: 'Diabetes and Endocrinology', sourceUrl: page('d'), status: 'OFFICIAL',
  },
  {
    id: 'thyroid-osteo', node: 'THYROID', name: 'Thyroid Cancer, Osteoporosis and Endocrinology', room: 'B4-077', zone: 'B', level: 4, category: 'clinic',
    phones: ['Osteoporosis: 519 646-6100 ext. 64434', 'Thyroid Cancer: 519 646-6100 ext. 61294'],
    aliases: ['thyroid', 'osteoporosis', 'bone disease', 'thyroid cancer', 'endocrinology'],
    xAliases: ['甲状腺', '甲狀腺', '骨质疏松', '骨質疏鬆', 'الغدة الدرقية', 'هشاشة العظام', 'thyroïde', 'ostéoporose', 'tiroides', 'osteoporosis', 'थायराइड', 'ਥਾਇਰਾਇਡ', 'تھائیرائیڈ', 'تیروئید', 'தைராய்டு', 'tuyến giáp', '갑상선', 'щитовид', 'tarczyca', 'schilddrüse', 'থাইরয়েড'],
    officialTitle: 'Thyroid Cancer, Osteoporosis and Endocrinology', sourceUrl: page('t'), status: 'OFFICIAL',
  },
  {
    id: 'urology', node: 'UROLOGY', name: 'Urology', room: 'B4-602', zone: 'B', level: 4, category: 'clinic',
    phones: ['Urology: 519 646-6100 ext. 66053', 'Prostate Diagnostic Assessment: 519-646-6100 ext. 65622'],
    aliases: ['urology', 'prostate', 'prostate diagnostic assessment', 'kidney', 'bladder'], xAliases: ['泌尿', '前列腺', 'المسالك البولية', 'urologie', 'urología', 'urologia', 'मूत्र', 'ਯੂਰੋਲੋਜੀ', 'یورولوجی', 'اورولوژی', 'சிறுநீரக', 'tiết niệu', '비뇨', 'уролог', 'urolog', 'ইউরোলজি'],
    officialTitle: 'Urology', sourceUrl: page('u'), status: 'OFFICIAL',
  },
  {
    id: 'colposcopy', node: 'COLPO', name: 'Colposcopy', room: 'B4-507', zone: 'B', level: 4, category: 'clinic', phones: ['519 646-6100 ext. 64130'],
    checkIn: 'Please check-in with the receptionist at the desk.',
    aliases: ['colposcopy', 'gynecology', 'cervical'], xAliases: ['阴道镜', '陰道鏡', 'تنظير المهبل', 'colposcopie', 'colposcopia', 'कोल्पोस्कोपी', 'ਕੋਲਪੋਸਕੋਪੀ', 'کولپوسکوپی', 'கோல்போஸ்கோபி', 'soi cổ tử cung', '질확대경', 'кольпоскоп', 'kolposkop', 'কলপোস্কপি'],
    officialTitle: 'Colposcopy', sourceUrl: page('c'), status: 'OFFICIAL',
  },
  {
    id: 'gastro', node: 'GASTRO', name: 'Gastroenterology / Endoscopy', room: 'B0-323', zone: 'B', level: 0, category: 'clinic',
    phones: ['519 646-6100 ext. 64355 (unit)', '519 646-6100 ext. 66125 (physician offices)'],
    aliases: ['gastroenterology', 'endoscopy', 'colonoscopy', 'gi', 'stomach'], xAliases: ['肠胃', '腸胃', '消化', '肠镜', '腸鏡', '胃镜', 'الجهاز الهضمي', 'منظار', 'gastro', 'coloscopie', 'endoscopie', 'colonoscopia', 'endoscopia', 'पेट', 'ਪੇਟ', 'معدہ', 'گوارش', 'இரைப்பை', 'tiêu hóa', 'nội soi', '위장', '내시경', 'гастро', 'колоноскоп', 'gastrolog', 'magen', 'পেট'],
    officialTitle: 'Gastroenterology', sourceUrl: page('g'), status: 'OFFICIAL',
  },
  {
    id: 'hulc', node: 'HULC', name: 'Roth McFarlane Hand and Upper Limb Centre (HULC)', room: 'D0-101', zone: 'D', level: 0, category: 'clinic', phones: ['519 646-6100 ext. 64944'],
    notes: ['For HULC Physiotherapy see Physiotherapy (B4-053).'],
    aliases: ['hulc', 'hand', 'hand and upper limb', 'upper limb', 'hand clinic', 'hand therapy', 'roth mcfarlane'],
    xAliases: ['手外科', '手部', 'اليد', 'main', 'mano', 'mão', 'हाथ', 'ਹੱਥ', 'ہاتھ', 'دست', 'கை', 'tay', '손', 'кисть', 'ręka', 'hand', 'হাত'],
    officialTitle: 'Hand and Upper Limb Clinic (HULC)', sourceUrl: page('h'), status: 'OFFICIAL',
  },
  {
    id: 'physio-b4', node: 'PHYSIO', name: 'Physiotherapy (Roth McFarlane Hand and Upper Limb Centre)', room: 'B4-053', zone: 'B', level: 4, category: 'clinic', phones: ['519-646-6100 ext. 66001'],
    notes: ['“Physiotherapy for the Roth McFarlane Hand and Upper Limb Centre (HULC) has MOVED to Zone B Level 4.”'],
    aliases: ['physiotherapy', 'physio', 'hulc physiotherapy', 'hand physiotherapy', 'pt'], xAliases: ['物理治疗', '物理治療', '理疗', 'علاج طبيعي', 'physiothérapie', 'fisioterapia', 'फिजियोथेरेपी', 'ਫਿਜ਼ੀਓਥੈਰੇਪੀ', 'فزیوتھراپی', 'فیزیوتراپی', 'பிசியோதெரபி', 'vật lý trị liệu', '물리치료', 'физиотерап', 'fizjoterapia', 'physiotherapie', 'ফিজিওথেরাপি'],
    officialTitle: 'Physiotherapy', sourceUrl: page('p'), status: 'OFFICIAL',
  },
  {
    id: 'ot-pt', node: 'OTPT', name: 'Occupational Therapy / Physiotherapy', room: 'D3-101', zone: 'D', level: 3, category: 'clinic', phones: ['519 646-6100 ext. 66001'],
    aliases: ['occupational therapy', 'ot', 'physiotherapy', 'physio', 'rehab'], xAliases: ['职业治疗', '職業治療', '物理治疗', 'علاج وظيفي', 'ergothérapie', 'terapia ocupacional', 'व्यावसायिक चिकित्सा', 'ਆਕੂਪੇਸ਼ਨਲ', 'کاردرمانی', 'தொழில்சார்', 'hoạt động trị liệu', '작업치료', 'эрготерап', 'terapia zajęciowa', 'ergotherapie', 'অকুপেশনাল'],
    officialTitle: 'Occupational Therapy/ Physiotherapy', sourceUrl: page('o'), status: 'OFFICIAL',
  },
  {
    id: 'rheumatology', node: 'RHEUM', name: 'Rheumatology Centre', room: 'D2-101', zone: 'D', level: 2, category: 'clinic', phones: ['519 646-6100 ext. 66333'],
    checkIn: 'This is the waiting room, please register at the front desk.',
    aliases: ['rheumatology', 'arthritis', 'joints'], xAliases: ['风湿', '風濕', '关节炎', '關節炎', 'الروماتيزم', 'التهاب المفاصل', 'rhumatologie', 'arthrite', 'reumatología', 'artritis', 'reumatologia', 'गठिया', 'ਗਠੀਆ', 'جوڑوں', 'روماتولوژی', 'மூட்டு', 'thấp khớp', '류마티스', 'ревмат', 'reumatolog', 'rheuma', 'বাত'],
    officialTitle: 'Rheumatology', sourceUrl: page('r'), status: 'OFFICIAL',
  },
  {
    id: 'surgical-centre', node: 'SURG', name: 'Surgical Centre (Registration)', room: 'C1-300', zone: 'C', level: 1, category: 'registration', phones: ['519 646 6100 ext. 64553'],
    notes: ['Also used for Admitting and Pre Surgical Screening (directory). G. A. Huot Surgical Centre.', 'Landmark: entrance highlighted with a blue wall.'],
    aliases: ['surgical centre', 'surgery', 'day surgery', 'admitting', 'pre surgical screening', 'pre-op', 'surgery registration', 'huot'],
    xAliases: ['手术', '手術', '外科', 'جراحة', 'العمليات', 'chirurgie', 'cirugía', 'cirurgia', 'सर्जरी', 'ਸਰਜਰੀ', 'سرجری', 'جراحی', 'அறுவை', 'phẫu thuật', 'operasyon', '수술', 'хирург', 'chirurgia', 'operation', 'অস্ত্রোপচার'],
    officialTitle: 'Surgical Centre (Registration)', sourceUrl: page('s'), status: 'OFFICIAL', popular: true,
  },
  {
    id: 'family-waiting', node: 'FAMILY', name: 'Family Waiting Room (Surgery)', room: 'C1-102', zone: 'C', level: 1, category: 'service', phones: ['519 646-6100 ext. 64802'],
    checkIn: 'Please check-in at the desk.',
    aliases: ['family waiting room', 'surgery waiting', 'waiting room'], xAliases: ['家属等候', '家屬等候', 'غرفة انتظار العائلة', "salle d'attente", 'sala de espera', 'प्रतीक्षा कक्ष', 'ਉਡੀਕ', 'انتظار گاہ', 'اتاق انتظار', 'காத்திருப்பு', 'phòng chờ', '대기실', 'зал ожидания', 'poczekalnia', 'wartezimmer', 'অপেক্ষা'],
    officialTitle: 'Family Waiting Room (Surgery)', sourceUrl: page('f'), status: 'OFFICIAL',
  },
  {
    id: 'inpatient-surgical', node: 'INPATIENT', name: 'Inpatient Surgical', room: 'B6-024', zone: 'B', level: 6, category: 'registration', phones: ['519 646 6100 ext. 64597'],
    notes: ['After hours: use the Urgent Care entrance (Entrance 2) buzzer; you must be escorted by security or a staff member to the sixth floor (visiting page).'],
    aliases: ['inpatient surgical', 'inpatient surgery', 'surgical unit', 'b6'], xAliases: ['住院', 'المرضى الداخليين', 'hospitalisation', 'hospitalización', 'internação', 'भर्ती', 'ਦਾਖ਼ਲ', 'داخل مریض', 'بستری', 'உள்நோயாளி', 'nội trú', '입원', 'стационар', 'oddział', 'station', 'ভর্তি'],
    officialTitle: 'Inpatient Surgical', sourceUrl: page('i'), status: 'OFFICIAL',
  },
  {
    id: 'anesthesia', node: 'ANESTH', name: 'Anesthesia', room: 'B6-665', zone: 'B', level: 6, category: 'admin', phones: ['519-646-6100 ext. 64219'],
    aliases: ['anesthesia', 'anaesthesia', 'anesthesiology'], xAliases: ['麻醉', 'تخدير', 'anesthésie', 'anestesia', 'एनेस्थीसिया', 'ਬੇਹੋਸ਼ੀ', 'بے ہوشی', 'بیهوشی', 'மயக்க', 'gây mê', '마취', 'анестез', 'anestezjolog', 'anästhesie', 'অ্যানেস্থেসিয়া'],
    officialTitle: 'Anesthesia', sourceUrl: page('a'), status: 'OFFICIAL',
  },
  {
    id: 'him', node: 'HIM', name: 'Health Information Management', room: 'B2-659', zone: 'B', level: 2, category: 'admin', phones: ['519 646-6100 ext. 65580'], hours: 'Monday to Friday, 8 am – 4 pm',
    aliases: ['health information management', 'health records', 'medical records', 'him'], xAliases: ['病历', '病歷', 'السجلات الطبية', 'dossiers médicaux', 'historial médico', 'prontuário', 'मेडिकल रिकॉर्ड', 'ਮੈਡੀਕਲ ਰਿਕਾਰਡ', 'طبی ریکارڈ', 'پرونده پزشکی', 'மருத்துவ பதிவு', 'hồ sơ bệnh án', '의무기록', 'медицинские записи', 'dokumentacja medyczna', 'krankenakte', 'মেডিকেল রেকর্ড'],
    officialTitle: 'Health Information Management', sourceUrl: page('h'), status: 'OFFICIAL',
  },
  {
    id: 'cafe-268', node: 'CAFE', name: 'Café 268', room: 'B0-101', zone: 'B', level: 0, category: 'food', hours: 'Monday to Friday 6:30 am – 4 pm; weekends and holidays closed (fireside lounge open 24/7)',
    aliases: ['cafe', 'café 268', 'cafeteria', 'food', 'restaurant', 'coffee', 'fireside lounge'], xAliases: ['餐厅', '餐廳', '食堂', '咖啡', 'كافتيريا', 'مقهى', 'cafétéria', 'cafetería', 'cafeteria', 'कैफेटेरिया', 'ਕੈਫੇਟੇਰੀਆ', 'کیفے', 'کافه', 'சிற்றுண்டி', 'căng tin', '카페', 'кафе', 'stołówka', 'cafeteria', 'ক্যাফেটেরিয়া'],
    officialTitle: 'Café 268', sourceUrl: page('c'), status: 'OFFICIAL',
  },
  {
    id: 'tim-hortons', node: 'TIMS', name: 'On the Go / Tim Hortons', room: 'C0-107', zone: 'C', level: 0, category: 'food', phones: ['519-646-6100 ext. 66146'],
    hours: 'Monday to Friday; weekends and holidays closed', conflicts: ['Hours differ between pages: directory "6:30 am – 6:30 pm" vs T page "8:00 am – 5:30 pm".'],
    aliases: ['tim hortons', 'tims', 'timmies', 'on the go', 'coffee', 'donut'], xAliases: ['咖啡', 'تيم هورتنز', 'café', 'कॉफी', 'ਕੌਫੀ', 'کافی', 'قهوه', 'காபி', 'cà phê', '커피', 'кофе', 'kawa', 'kaffee', 'কফি'],
    officialTitle: 'On the Go / Tim Hortons', sourceUrl: page('o'), status: 'CONFLICTING',
  },
  {
    id: 'gift-shop', node: 'GIFT', name: 'Gift Shop', room: 'C0-102', zone: 'C', level: 0, category: 'service', hours: 'Mon 10–3; Tue, Thu, Fri 9:30–5; Wed 9:30–4; weekends closed',
    aliases: ['gift shop', 'gifts', 'flowers', 'shop'], xAliases: ['礼品店', '禮品店', 'متجر الهدايا', 'boutique', 'tienda de regalos', 'loja de presentes', 'उपहार', 'ਤੋਹਫ਼ੇ', 'تحفے', 'فروشگاه هدیه', 'பரிசு', 'quà tặng', '선물', 'подарки', 'upominki', 'geschenk', 'উপহার'],
    officialTitle: 'Gift Shop', sourceUrl: page('g'), status: 'OFFICIAL',
  },
  {
    id: 'prescription-shop', node: 'RX', name: 'Prescription Shop', room: 'A1-013', zone: 'A', level: 1, category: 'service', phones: ['519 646-6100 ext. 66194'], hours: 'Monday to Friday 9 am – 5:30 pm',
    aliases: ['pharmacy', 'prescription shop', 'drug store', 'drugstore', 'medication'], conflicts: ['Directory lists "Drug Store" as A1-103 and the Prescription Shop as A1-013.'],
    xAliases: ['药房', '藥房', '药店', 'صيدلية', 'pharmacie', 'farmacia', 'farmácia', 'फार्मेसी', 'दवा', 'ਦਵਾਈ', 'فارمیسی', 'داروخانه', 'மருந்தகம்', 'nhà thuốc', '약국', 'аптека', 'apteka', 'apotheke', 'ফার্মেসি'],
    officialTitle: 'Prescription Shop', sourceUrl: page('p'), status: 'OFFICIAL',
  },
  {
    id: 'chapel', node: 'CHAPEL', name: 'Chapel', room: 'A2-202', zone: 'A', level: 2, category: 'faith', phones: ['519 646-6100 ext. 64552'],
    aliases: ['chapel', 'church', 'mass'], xAliases: ['礼拜堂', '禮拜堂', 'كنيسة', 'chapelle', 'capilla', 'capela', 'चैपल', 'ਚੈਪਲ', 'چیپل', 'نمازخانه', 'தேவாலயம்', 'nhà nguyện', '예배당', 'часовня', 'kaplica', 'kapelle', 'চ্যাপেল'],
    officialTitle: 'Chapel', sourceUrl: page('c'), status: 'OFFICIAL',
  },
  {
    id: 'multifaith', node: 'MULTI', name: 'Multifaith Prayer Room', room: 'B1-039', zone: 'B', level: 1, category: 'faith', phones: ['519 646-6100 ext. 66029'],
    aliases: ['multifaith', 'prayer room', 'prayer', 'quiet room', 'meditation'], xAliases: ['祈祷室', '祈禱室', 'مصلى', 'غرفة الصلاة', 'salle de prière', 'sala de oración', 'sala de oração', 'प्रार्थना', 'ਅਰਦਾਸ', 'نماز', 'نمازخانه', 'பிரார்த்தனை', 'phòng cầu nguyện', '기도실', 'молитв', 'modlitw', 'gebetsraum', 'নামাজ', 'প্রার্থনা'],
    officialTitle: 'Multifaith Prayer Room', sourceUrl: page('m'), status: 'OFFICIAL',
  },
  {
    id: 'spiritual-care', node: 'SPIRIT', name: 'Spiritual Care', room: 'B1-041', zone: 'B', level: 1, category: 'faith', phones: ['519‐646‐6100 ext. 66029'],
    aliases: ['spiritual care', 'chaplain', 'pastoral care'], xAliases: ['灵性关怀', '靈性關懷', 'الرعاية الروحية', 'soins spirituels', 'atención espiritual', 'आध्यात्मिक', 'ਰੂਹਾਨੀ', 'روحانی', 'معنوی', 'ஆன்மீக', 'chăm sóc tâm linh', '영적', 'духовн', 'duszpaster', 'seelsorge', 'আধ্যাত্মিক'],
    officialTitle: 'Spiritual Care', sourceUrl: page('s'), status: 'OFFICIAL',
  },
  {
    id: 'guest-house', node: 'GUEST', name: 'Guest House Accommodations', room: 'A0-012', zone: 'A', level: 0, category: 'service', phones: ['519 646-6100 ext. 66021'], hours: 'Monday to Friday, 8 am – 4 pm',
    aliases: ['guest house', 'accommodations', 'accommodation', 'lodging', 'hotel'], xAliases: ['住宿', '宾馆', 'سكن', 'hébergement', 'alojamiento', 'hospedagem', 'आवास', 'ਰਿਹਾਇਸ਼', 'رہائش', 'اقامت', 'தங்குமிடம்', 'chỗ ở', '숙소', 'жильё', 'nocleg', 'unterkunft', 'থাকার'],
    officialTitle: 'Guest House Accommodations', sourceUrl: page('g'), status: 'OFFICIAL',
  },
  {
    id: 'business-office', node: 'BUSINESS', name: 'Business Office', room: 'B0-068', zone: 'B', level: 0, category: 'admin', phones: ['519 646-6100 ext. 64239'], hours: 'Monday to Friday, 9 am – 12 pm & 1 pm – 3 pm',
    aliases: ['business office', 'accounts', 'billing', 'payment', 'accounts receivable'], xAliases: ['收费', '收費', 'الحسابات', 'facturation', 'facturación', 'cobrança', 'बिलिंग', 'ਬਿਲਿੰਗ', 'بلنگ', 'صورتحساب', 'கணக்கு', 'thanh toán', '수납', 'касса', 'rozliczenia', 'abrechnung', 'বিলিং'],
    officialTitle: 'Business Office', sourceUrl: page('b'), status: 'OFFICIAL',
  },
  {
    id: 'security', node: 'SECURITY', name: 'Security Services', room: 'B0-401', zone: 'B', level: 0, category: 'help', phones: ['519‐646‐6100 ext. 44555 (dial 44555 from any hospital phone)'],
    aliases: ['security', 'lost and found', 'safety'], xAliases: ['保安', '安保', 'الأمن', 'sécurité', 'seguridad', 'segurança', 'सुरक्षा', 'ਸੁਰੱਖਿਆ', 'سیکیورٹی', 'حراست', 'பாதுகாப்பு', 'an ninh', '보안', 'охрана', 'ochrona', 'sicherheit', 'নিরাপত্তা'],
    officialTitle: 'Security Services', sourceUrl: page('s'), status: 'OFFICIAL',
  },
  {
    id: 'sadv', node: 'SADV', name: 'Sexual Assault and Domestic Violence Treatment', room: 'B0-644', zone: 'B', level: 0, category: 'clinic',
    phones: ['Program administration (Mon–Fri 8 am–4 pm): 519 646-6100 ext. 64224', 'After hours: 519 646-6100, press "0" and ask switchboard to page the nurse-on-call'],
    notes: ['Shortest official route is from Wellington Entrance 3 (at the ramp).'],
    aliases: ['sexual assault', 'domestic violence', 'sadv'], xAliases: ['性侵', '家暴', 'الاعتداء الجنسي', 'العنف الأسري', 'agression sexuelle', 'violence conjugale', 'agresión sexual', 'violencia doméstica', 'violência doméstica', 'यौन हिंसा', 'ਘਰੇਲੂ ਹਿੰਸਾ', 'گھریلو تشدد', 'خشونت خانگی', 'வன்முறை', 'bạo lực gia đình', '가정폭력', 'насилие', 'przemoc', 'gewalt', 'সহিংসতা'],
    officialTitle: 'Sexual Assault and Domestic Violence', sourceUrl: page('s'), status: 'OFFICIAL',
  },
  {
    id: 'volunteer-services', node: 'VOLUNTEER', name: 'Volunteer Services (office)', room: 'B4-048', zone: 'B', level: 4, category: 'admin', phones: ['519 646-6100 ext. 66055'],
    notes: ['This is the volunteer administration office. For wayfinding help, go to an Information Desk at an entrance.'],
    conflicts: ['Official route from Entrance 4 says "Level 5 (B5)" for this Level 4 room.'],
    aliases: ['volunteer services', 'volunteer office', 'volunteering'], xAliases: ['志愿者办公室', '志工', 'خدمات المتطوعين', 'bénévoles', 'voluntariado', 'voluntários', 'स्वयंसेवक', 'ਵਲੰਟੀਅਰ', 'رضاکار', 'داوطلب', 'தன்னார்வ', 'tình nguyện', '자원봉사', 'волонтёр', 'wolontariusz', 'ehrenamt', 'স্বেচ্ছাসেবক'],
    officialTitle: 'Volunteer Services', sourceUrl: page('v'), status: 'CONFLICTING',
  },
  {
    id: 'clinical-trials', node: 'CLINTRIALS', name: 'Clinical Trials', room: 'A4-003', zone: 'A', level: 4, category: 'admin', phones: ['519-646-6100 ext. 76649'],
    aliases: ['clinical trials', 'research', 'study'], xAliases: ['临床试验', '臨床試驗', 'التجارب السريرية', 'essais cliniques', 'ensayos clínicos', 'ensaios clínicos', 'क्लिनिकल ट्रायल', 'ਕਲੀਨਿਕਲ', 'کلینیکل', 'کارآزمایی', 'மருத்துவ சோதனை', 'thử nghiệm lâm sàng', '임상시험', 'клинические испытания', 'badania kliniczne', 'klinische studien', 'ক্লিনিক্যাল'],
    officialTitle: 'Clinical Trials', sourceUrl: page('c'), status: 'OFFICIAL',
  },
  {
    id: 'medical-affairs', node: 'MEDAFF', name: 'Medical Affairs', room: 'A2-014', zone: 'A', level: 2, category: 'admin', phones: ['519 646-6100 ext. 75125'],
    aliases: ['medical affairs'], officialTitle: 'Medical Affairs', sourceUrl: page('m'), status: 'OFFICIAL',
  },
  {
    id: 'human-resources', node: 'HR', name: 'Human Resources', room: 'A3-003', zone: 'A', level: 3, category: 'admin', phones: ['519 646-6100 ext. 64373'], hours: 'Monday to Friday, 8:30 am – 4:30 pm',
    aliases: ['human resources', 'hr', 'careers', 'jobs'], officialTitle: 'Human Resources', sourceUrl: page('h'), status: 'OFFICIAL',
  },
  {
    id: 'foundation', node: 'FOUND', name: 'Foundation', room: 'A1-015', zone: 'A', level: 1, category: 'admin', phones: ['519 646-6085'],
    aliases: ['foundation', 'donations', 'donate'], officialTitle: 'Foundation', sourceUrl: page('f'), status: 'OFFICIAL',
  },
  {
    id: 'thompson', node: 'THOMPSON', name: 'Thompson Amphitheatre', room: 'B2-075', zone: 'B', level: 2, category: 'meeting',
    aliases: ['thompson amphitheatre', 'amphitheatre'], officialTitle: 'Thompson Amphitheatre (B2-075)', sourceUrl: page('conference-rooms'), status: 'OFFICIAL',
  },
  {
    id: 'adams-boardroom', node: 'ADAMS', name: 'Adams Executive Boardroom', room: 'A2-041', zone: 'A', level: 2, category: 'meeting',
    aliases: ['adams boardroom', 'board room', 'boardroom'], officialTitle: 'Adams Executive Boardroom (A2-041)', sourceUrl: page('conference-rooms'), status: 'OFFICIAL',
  },
  {
    id: 'meeting-a2039', node: 'A2039', name: 'Meeting Room A2-039', room: 'A2-039', zone: 'A', level: 2, category: 'meeting',
    aliases: ['meeting room a2-039'], officialTitle: 'Meeting Room A2-039', sourceUrl: page('conference-rooms'), status: 'OFFICIAL',
  },
  {
    id: 'e1-meeting-rooms', node: 'E1_ROOMS', name: 'Meeting Rooms 1–3 and Lawson Board Room', room: 'E1-122/126/128/134', zone: 'E', level: 1, category: 'meeting',
    aliases: ['meeting rooms', 'lawson board room', 'livingston lounge', 'zone e'], officialTitle: 'Meeting Rooms 1 (E1-126), 2 (E1-128) and 3 (E1-134), and the Lawson Board Room (E1-122)', sourceUrl: page('conference-rooms'), status: 'DERIVED',
    notes: ['Zone E geometry is schematic; the corridor from Zone A to Zone E is DERIVED from official text (“pass the museum display cases”).'],
  },
  {
    id: 'shuttleworth', node: 'SHUTTLE', name: 'Shuttleworth Auditorium', room: 'D0-104', zone: 'D', level: 0, category: 'meeting',
    aliases: ['shuttleworth', 'auditorium'], officialTitle: 'Shuttleworth Auditorium (D0-104)', sourceUrl: page('conference-rooms'), status: 'CONFLICTING',
    conflicts: ['From Entrance 1 the official text reaches this Level 0 room without a level change; from Entrance 4 it is on Level 0. Location shown is approximate.'],
  },
  {
    id: 'wsib', node: 'WSIB', name: 'WSIB Specialty Clinic', room: 'D1-173', zone: 'D', level: 1, category: 'clinic', phones: ['519-646-6100 ext. 61083'],
    aliases: ['wsib', 'workplace safety', 'specialty clinic'], officialTitle: 'WSIB Specialty Clinic', sourceUrl: page('w'), status: 'CONFLICTING',
    conflicts: ['Directory lists room E1-116; detailed directions say D1-173 (past the Breast Care Clinic). Route uses D1-173.', 'Cheapside-garage route on the W page says “up to Level 1 (C1)” while all other garage routes say Level 0 (C0).'],
  },
  /* ---- Public human-help points ---- */
  {
    id: 'info-desk-e1', node: 'INFO_E1', name: 'Information Desk – Zone A lobby (Grosvenor Entrance 1)', room: 'Zone A lobby, Level 1', zone: 'A', level: 1, category: 'help',
    notes: ['Volunteers help with general information and wayfinding only. Staffing hours are not published — if the desk is unstaffed, ask any staff member or call Security (44555 from a hospital phone).'],
    aliases: ['information desk', 'information', 'info desk', 'help desk', 'volunteer desk', 'reception', 'main entrance desk', 'interpreter ipad'],
    xAliases: ['问讯处', '問訊處', '服务台', '服務台', '咨询台', 'مكتب الاستعلامات', 'استعلامات', 'accueil', 'information', 'información', 'informação', 'पूछताछ', 'ਪੁੱਛਗਿੱਛ', 'معلومات', 'اطلاعات', 'தகவல்', 'quầy thông tin', 'impormasyon', '안내', 'справочн', 'информац', 'informacja', 'information', 'তথ্য'],
    sourceUrl: 'https://www.sjhc.london.on.ca/news-and-media/our-stories/speaking-their-language-0', status: 'OFFICIAL', popular: true,
  },
  {
    id: 'info-desk-e2', node: 'INFO_E2', name: 'Information Desk – Grosvenor Entrance 2 (Urgent Care entrance)', room: 'Zone B, Level 0', zone: 'B', level: 0, category: 'help',
    notes: ['Volunteers help with general information and wayfinding only. Staffing hours are not published.'],
    aliases: ['information desk', 'entrance 2 desk', 'info desk', 'reception'], xAliases: ['问讯处', 'مكتب الاستعلامات', 'accueil', 'información'],
    sourceUrl: page('g'), status: 'OFFICIAL',
  },
  {
    id: 'info-desk-e4', node: 'INFO_E4', name: 'Information / Volunteer Desk – Cheapside Entrance 4 (Zone C lobby)', room: 'Zone C lobby, Level 0', zone: 'C', level: 0, category: 'help',
    notes: ['Mentioned as “information desk” and “volunteer desk” in official directions. Staffing hours are not published.'],
    aliases: ['information desk', 'volunteer desk', 'entrance 4 desk', 'info desk', 'reception'], xAliases: ['问讯处', 'مكتب الاستعلامات', 'accueil', 'información'],
    sourceUrl: page('s'), status: 'OFFICIAL',
  },
  /* ---- FICTIONAL restricted destination (security demo) ---- */
  {
    id: 'training-lab', node: 'X_LAB', name: 'Simulation Training Lab X-101 (FICTIONAL – training only)', room: 'X-101', zone: 'X', level: 0, category: 'training',
    notes: ['Invented for the access-control demo. Not a real hospital space. No real door, badge or system is involved.'],
    aliases: ['training lab', 'simulation lab', 'x-101', 'restricted', 'staff only', 'training'],
    sourceUrl: 'docs/PRODUCT_DECISIONS.md', status: 'FICTIONAL', restricted: true,
  },
];

export const DEST_BY_ID: Record<string, Destination> = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));
export const DEST_BY_NODE: Record<string, Destination> = Object.fromEntries(DESTINATIONS.map((d) => [d.node, d]));

/* ---- Official verbatim directions ---- */
export interface OfficialRoute {
  originLabel: string;
  origin: string;
  qualifier: string | null;
  shortest: boolean;
  longWay: boolean;
  steps: { text: string; note?: boolean }[];
}
export interface OfficialEntry {
  title: string;
  sourceUrl: string;
  room: string | null;
  details: string[];
  notes: string[];
  routes: OfficialRoute[];
}
export const OFFICIAL: { retrievedAt: string; source: string; entries: OfficialEntry[] } = directions as never;

export function officialEntry(d: Destination): OfficialEntry | undefined {
  if (!d.officialTitle) return undefined;
  return OFFICIAL.entries.find((e) => e.title === d.officialTitle) ?? OFFICIAL.entries.find((e) => e.room === d.room);
}

/** Origin ids used by the official pages → graph node ids */
export const OFFICIAL_ORIGIN_NODE: Record<string, string> = {
  ENTRANCE_1: 'E1', ENTRANCE_2: 'E2', ENTRANCE_3: 'E3', ENTRANCE_4: 'E4', GROSVENOR_GARAGE: 'GG_EL_P', CHEAPSIDE_GARAGE: 'CS_PARK',
};

export function officialRouteFrom(d: Destination, originNode: string): OfficialRoute | undefined {
  const e = officialEntry(d);
  if (!e) return undefined;
  return e.routes.find((r) => OFFICIAL_ORIGIN_NODE[r.origin] === originNode);
}

export function officialShortestOrigin(d: Destination): string | undefined {
  const e = officialEntry(d);
  const r = e?.routes.find((x) => x.shortest);
  return r ? OFFICIAL_ORIGIN_NODE[r.origin] : undefined;
}

export const DIRECTORY_URL = DIR;

export function sourceLinkFor(d: Destination): string {
  return officialEntry(d)?.sourceUrl ?? d.sourceUrl;
}
