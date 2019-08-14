const { get } = require('./dkb-request');
const { urls } = require('./config');

const getter = $ => selector => {
  const texts = [];
  $(selector).each(function() {
    const text = $(this)
      .text()
      .trim();
    texts.push(text.replace(/[\n ]+/g, ' '));
  });
  return texts;
};

const getBalances = async () => {
  console.log('Fetching balances');
  const $ = await get(urls.balance);
  const getTextArray = getter($);

  const mainRow = '.mainRow';

  const names = getTextArray(`${mainRow} td:nth-child(2) div:nth-child(1)`);
  const ids = getTextArray(`${mainRow} td:nth-child(3) div:nth-child(1)`);
  const timestamps = getTextArray(`${mainRow} td:nth-child(4)`);
  const balances = getTextArray(`${mainRow} td:nth-child(5)`);

  const arraysAreEqualLength = [names.length, ids.length, timestamps.length, balances.length].every(length => length === names.length);

  if (!arraysAreEqualLength) throw 'Error fetching balances - check if html markup changed';

  return names.map((name, i) => {
    const id = ids[i];
    const timestamp = timestamps[i];
    const balance = balances[i];
    return { id, timestamp, balance, name };
  });
};

module.exports = { getBalances };
