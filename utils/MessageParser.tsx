const trnKeywords = ['debited', 'credited', 'payment', 'spent'];
const balanceKeywords = [
  'avbl bal',
  'available balance',
  'a/c bal',
  'available bal',
  'avl bal',
];

export function simplifyMessage(message: string): string[] {
  // convert to lower case
  message = message.toLowerCase();
  // remove '-'
  message = message.replace(/-/g, '');
  // remove ':'
  message = message.replace(/:/g, '');
  // remove '/'
  message = message.replace(/\//g, '');
  // remove 'ending'
  message = message.replace(/ending /g, '');
  // replace 'x'
  message = message.replace(/x|[*]/g, '');
  // // remove 'is' 'with'
  // message = message.replace(/\bis\b|\bwith\b/g, '');
  // replace 'is'
  message = message.replace(/is /g, '');
  // replace 'with'
  message = message.replace(/with /g, '');
  // remove 'no.'
  message = message.replace(/no. /g, '');
  // replace all ac, acct, account with ac
  message = message.replace(/\bac\b|\bacct\b|\baccount\b/g, 'ac');
  // replace all 'rs ' with 'rs. '
  message = message.replace(/rs /g, 'rs. ');
  // replace all inr with rs.
  message = message.replace(/inr/g, 'rs. ');
  // replace all 'rs. ' with 'rs.'
  message = message.replace(/rs. /g, 'rs.');
  // replace all 'rs.' with 'rs. '
  message = message.replace(/rs./g, 'rs. ');
  // split message into words
  message = message.split(' ');
  // remove '' from array
  message = removeItemAll(message, '');

  return message;
}

export function getTypeOfTransaction(message: string[]) {
  for (let keyword of trnKeywords) {
    if (message.includes(keyword)) {
      return keyword;
    }
  }
}

export function getAccount(message: string[]) {
  // find index of ac
  let account = {
    type: 'account',
    no: message[message.indexOf('ac') + 1],
  };

  if (!Number(account.no)) {
    // check for card
    account.no = message[message.indexOf('card') + 1];

    if (!Number(account.no)) {
      return 'could not find account no';
    } else {
      account.type = 'card';
    }
  }

  return account;
}

function removeItemAll(arr: Array, value: string) {
  let i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

function getBalance(message) {
  for (const word of balanceKeywords) {
    if (message.includes(word)) {
      const words = message.split(" ");
      const keyWordWords = word.split(" ");
      const index = words.indexOf(keyWordWords[0]);
      let balance = words[index + keyWordWords.length];

      if (balance === "rs.") {
        balance = words[index + keyWordWords.length + 1];
        return balance;
      } else {
        // loop until you find rs.
        for (const [index, word] of words.entries()) {
          if (word === "rs.") {
            console.log(words, words[index+1]);
            return words[index+1]
          }
        }
      }
    }
  }
}

export function getMoney(message: string[]) {
  const index = message.indexOf('rs.');
  let money = message[index + 1];
  money = money.replace(/,/g, '');

  if (!Number(money)) {
    money = message[index + 2];
    money = money.replace(/,/g, '');

    if (!Number(money)) {
      return 'could not extract money';
    } else {
      return money;
    }
  }
  return money;
}
