const bankInfo = [
  {
    name: 'axis',
    image:
      'https://yt3.ggpht.com/a-/AN66SAzKt9K8WzUnEWZWoJm0uqjB0zlDNbUPwRiBJg=s900-mo-c-c0xffffffff-rj-k-no',
  },
  {
    name: 'sbi',
    image: 'https://1000logos.net/wp-content/uploads/2018/01/SBI-Logo.png',
  },
  {
    name: 'kotak',
    image:
      'https://www.searchpng.com/wp-content/uploads/2019/11/Kotak-Mahindra-Bank-icon.jpg',
  },
];

export function getBankNames(bankName: string) {
  for (let {image, name} of bankInfo) {
    if (bankName.includes(name)) {
      return image;
    }
  }

  return '';
}
