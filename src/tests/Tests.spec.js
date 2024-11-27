import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts_duration', true);
export const getContactsStatusOK = new Rate('get_contacts_status_OK');
export const getContactsStatusError = new Rate('get_contacts_status_error');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],

    get_contacts_duration: ['p(95)<5700'],

    get_contacts_status_OK: ['rate>0.95']
  },
  stages: [
    { duration: '1m', target: 10 },
    { duration: '2m', target: 150 },
    { duration: '2m', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://api.sampleapis.com/coffee/hot';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getContactsDuration.add(res.timings.duration);

  getContactsStatusOK.add(res.status === OK);

  getContactsStatusError.add(res.status !== OK);

  check(res, {
    'GET Contacts - Status 200': () => res.status === OK
  });
}
