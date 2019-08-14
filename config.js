const baseUrl = 'https://www.dkb.de';
module.exports = {
  urls: {
    base: baseUrl,
    login: `${baseUrl}/banking`,
    balance: `${baseUrl}/banking/finanzstatus`,
  },
  scraper: {
    formAction: '/banking',
    formFieldsUsername: 'j_username',
    formFieldsPassword: 'j_password',
    loginCheck: 'h1:contains("Finanzstatus")',
    logoutHref: 'a#logout',
  },
};
