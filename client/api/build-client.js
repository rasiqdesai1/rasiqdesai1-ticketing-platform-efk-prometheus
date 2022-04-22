import axios from 'axios';

export default ({ req }) => {
  console.log('BASE_URL:', process.env.BASE_URL);
  if (typeof window === 'undefined') {
    // We are on the server
    return axios.create({
      // baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      // baseURL: 'http://wwww.174.138.123.10.sslip.io/',
      baseURL: process.env.BASE_URL || 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    // We must be on the browser
    return axios.create({
      baseURL: '/',
    });
  }
};
