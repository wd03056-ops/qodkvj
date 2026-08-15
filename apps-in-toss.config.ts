import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'qodkvk',
  brand: {
    displayName: '과민성대장타파',
    primaryColor: '#3182F6',
  },
  navigationBar: {
    withTitle: true,
  },
  permissions: [],
  webBundleDir: 'dist',
});
