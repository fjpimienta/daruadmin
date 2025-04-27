export const environment = {
  production: false,
  ignoreSSL: true, // Ignorar errores de SSL en desarrollo
  sslLogInterval: 300000, // 5 minutos en milisegundos
  backend: 'https://apidaru.hosting3m.com:3002/graphql',
  backendWs: 'wss://apidaru.hosting3m.com:3002/graphql',
  stripePublicKey: 'pk_test_51JIL74J3AWJEzlXbrPLgiyb1RdjtNR4Raz49wGw3CsU8YMes5ZhSw6Z7Qx2TCabBD5gYcVyV4cJSwVJUXWTleF1O00XRREKbZk',
  upload: 'https://apidaru.hosting3m.com:3002/upload',
  uploadsUrl: 'https://apidaru.hosting3m.com:3002/uploads',

  defaultauth: 'fackbackend',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
};
