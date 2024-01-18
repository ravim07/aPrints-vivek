const { writeFile } = require('fs');
require('dotenv').config();
const cryptoLib = require('crypto');

const targetPath = `./src/environments/environment.ts`;
const targetPathJs = `./src/environments/environment.js`;
const envConfigFile = `
export const environment = {
  frontBaseUrl: '${process.env.FRONTEND_URL}',
  production: ${process.env.PRODUCTION},
  loginFacebookUrl: '${process.env.API_URL}/auth/facebook',
  loginGoogleUrl: '${process.env.API_URL}/auth/google',
  apiBaseUrl: '${process.env.API_URL}/api/',
  blogApiUrl: '${process.env.BLOG_API_URL}',
  pdfViewerAssetsUrl: '${process.env.AWS_ASSETS_URL}/pdfs/',
  heroAssetsUrl: '${process.env.AWS_ASSETS_URL}/covers/',
  assetsUrl: '${process.env.AWS_ASSETS_MAIN}',
  stripePublicKey: '${process.env.STRIPE_PUBLIC_KEY}',
  sentryDSN: '${process.env.SENTRY_DSN}',
  nonce: '${cryptoLib.randomBytes(32).toString('base64')}',
  intercomId: '${process.env.INTERCOM_ID}',
  gmtId: '${process.env.GTM_ID}'
};
`;
const envConfigFileJs = `
module.exports = {
  frontBaseUrl: '${process.env.FRONTEND_URL}',
  production: ${process.env.PRODUCTION},
  loginFacebookUrl: '${process.env.API_URL}/auth/facebook',
  loginGoogleUrl: '${process.env.API_URL}/auth/google',
  apiBaseUrl: '${process.env.API_URL}/api/',
  blogApiUrl: '${process.env.BLOG_API_URL}',
  pdfViewerAssetsUrl: '${process.env.AWS_ASSETS_URL}/pdfs/',
  heroAssetsUrl: '${process.env.AWS_ASSETS_URL}/covers/',
  assetsUrl: '${process.env.AWS_ASSETS_MAIN}',
  stripePublicKey: '${process.env.STRIPE_PUBLIC_KEY}',
  sentryDSN: '${process.env.SENTRY_DSN}',
  nonce: '${cryptoLib.randomBytes(32).toString('base64')}',
  intercomId: '${process.env.INTERCOM_ID}',
  gmtId: '${process.env.GTM_ID}'
};
`;
writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  }
  console.log(`Output generated at ${targetPath}`);
  writeFile(targetPathJs, envConfigFileJs, function (err2) {
    if (err2) {
      console.log(err2);
    }
    console.log(`Output generated at ${targetPathJs}`);
    return;
  });
  return;
});
