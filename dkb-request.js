const rp = require('request-promise-native');
const cheerio = require('cheerio');
const { stringify } = require('querystring');
const { urls, scraper } = require('./config');

const headers = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
};

let logoutHref;

const request = rp.defaults({ jar: true });

const login = async () => {
  console.log('Logging in to DKB online banking');

  const { DKB_USER, DKB_PASSWORD } = process.env;

  if (!DKB_USER || !DKB_PASSWORD) throw 'Environment variables missing';

  const loginPage = await request.get(urls.login, { headers, simple: false });
  const $login = cheerio.load(loginPage);

  const fields = {
    [scraper.formFieldsUsername]: DKB_USER,
    [scraper.formFieldsPassword]: DKB_PASSWORD,
  };
  $login(`form[action="${scraper.formAction}"]`).each(function() {
    $login(this)
      .find(':input')
      .each((_, { attribs: { value, name } }) => {
        if (name && !fields[name]) {
          fields[name] = value;
        }
      });
  });

  await request.post(urls.login, {
    body: stringify(fields),
    headers: { ...headers, 'content-type': 'application/x-www-form-urlencoded' },
    params: { $javascript: 'disabled' },
    followRedirect: true,
    simple: false,
  });
  const balancePage = await request.get(urls.balance, { headers });
  const $balance = cheerio.load(balancePage);

  const found = !!$balance(scraper.loginCheck).length;
  if (!found) throw 'Login to DKB online banking failed';

  logoutHref = $balance(scraper.logoutHref)[0].attribs.href;
  console.log('Login to DKB online banking succeeded');
  return request;
};

const logout = async () => {
  if (!logoutHref) throw 'Not logged in to DKB online banking';

  try {
    await request.get(`${urls.base}${logoutHref}`);
    logoutHref = null;
    console.log('Logged out from DKB online banking');
  } catch (e) {
    console.error('Could not safely log out from DKB online banking');
  }
};

const get = async uri => cheerio.load(await request.get(uri));

module.exports = {
  login,
  logout,
  get,
};
