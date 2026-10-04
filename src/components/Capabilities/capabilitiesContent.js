// Every example is a real public repo under github.com/Khairul122. Descriptions only
// claim what the repo names, languages and counts support.
export const REPO_BASE = 'https://github.com/Khairul122/'

export const GROUP_ACCENT = {
  web: '#e8342a',
  mobile: '#14803f',
  backend: '#2563eb',
  iot: '#15181d',
  ai: '#15181d',
}

export const capabilitiesContent = {
  eyebrow: 'WHAT I CAN DO',
  title: ['WHAT', 'I CAN DO'],
  intro: 'Each item below links to real repositories, so the work can be checked instead of taken on trust.',
  filters: [
    { id: 'all', label: 'ALL' },
    { id: 'web', label: 'WEB' },
    { id: 'mobile', label: 'MOBILE' },
    { id: 'backend', label: 'BACKEND' },
    { id: 'iot', label: 'IOT' },
    { id: 'ai', label: 'AI' },
  ],
  items: [
    {
      title: 'BUSINESS WEB SYSTEMS',
      groups: ['web'],
      desc: 'Management systems for day-to-day records, built on PHP and Laravel.',
      stack: ['PHP', 'LARAVEL', 'BLADE'],
      examples: ['koperasi-syariah', 'siakad', 'AST-WebPenggajian', 'AST-WebPerpus'],
    },
    {
      title: 'ONLINE STORES',
      groups: ['web', 'mobile'],
      desc: 'Storefronts on the web and as mobile apps.',
      stack: ['PHP', 'FLUTTER', 'KOTLIN'],
      examples: ['e-commerce-rendang', 'ecommerce-flutter', 'MarketPlaceAndroid'],
    },
    {
      title: 'MOBILE APPS',
      groups: ['mobile'],
      desc: 'Flutter apps and native Kotlin apps for Android.',
      stack: ['DART', 'FLUTTER', 'KOTLIN'],
      examples: ['AplikasiPenyewaKosan-Flutter', 'FLUTTER-PenjualanSkinCare', 'android-KuisMTK', 'TokoOnline'],
    },
    {
      title: 'BACKEND SERVICES',
      groups: ['backend'],
      desc: 'APIs that sit behind web and mobile front ends.',
      stack: ['PHP', 'TYPESCRIPT', 'PYTHON'],
      examples: ['backend-pelayanan-publik', 'BACKEND-REKAM-MEDIS', 'backend_scm', 'backend-simontana'],
    },
    {
      title: 'IOT AND DEVICES',
      groups: ['iot'],
      desc: 'Arduino projects that connect hardware to software.',
      stack: ['ARDUINO', 'IOT'],
      examples: ['arduino-parking', 'iot-gate', 'Iot-Wuluh'],
    },
    {
      title: 'MACHINE LEARNING AND VISION',
      groups: ['ai'],
      desc: 'Classical models and object detection, some with a web front end.',
      stack: ['PYTHON', 'YOLO'],
      examples: ['knn_web', 'web_naive_bayes', 'YoloV8-DetectPlate', 'lstm'],
    },
  ],
}
