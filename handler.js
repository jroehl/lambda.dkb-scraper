'use strict';
const { login, logout } = require('./dkb-request');
const { getBalances } = require('./scraper');

const response = statusCode => ({
  statusCode,
  body: JSON.stringify(body, null, 2),
});

module.exports.balances = async () => {
  try {
    await login();
    const balances = await getBalances();
    await logout();
    console.log(balances);
    return response(200, {
      timestamp: Date.now(),
      balances,
    });
  } catch (error) {
    console.error(error);
    return response(400, {
      error,
    });
  }
};
