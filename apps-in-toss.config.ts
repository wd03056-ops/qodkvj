import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'qodkvj',
  brand: {
    displayName: '장 편한 가이드',
    primaryColor: '#3182F6',
  },
  navigationBar: {
    withTitle: true,
  },
  permissions: [],
  webBundleDir: 'dist',
});
