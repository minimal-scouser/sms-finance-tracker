import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {
  PermissionsAndroid,
  View,
  Image,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {getBankNames} from './BankFormats';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Details from './components/Details';
import {BankAccount} from './Interfaces/BankAccount';
// import {simplifyMessage, getTypeOfTransaction} from "./utils/MessageParser";

import SmsAndroid from 'react-native-get-sms-android';

declare const global: {HermesInternal: null | {}};

const Stack = createStackNavigator();

// const filter = {
// box: 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all

/**
 *  the next 3 filters can work together, they are AND-ed
 *
 *  minDate, maxDate filters work like this:
 *    - If and only if you set a maxDate, it's like executing this SQL query:
 *    "SELECT * from messages WHERE (other filters) AND date <= maxDate"
 *    - Same for minDate but with "date >= minDate"
 */
// minDate: 1554636310165, // timestamp (in milliseconds since UNIX epoch)
// maxDate: 1556277910456, // timestamp (in milliseconds since UNIX epoch)
// bodyRegex: '(.*)How are you(.*)', // content regex to match

/** the next 5 filters should NOT be used together, they are OR-ed so pick one **/
// read: 0, // 0 for unread SMS, 1 for SMS already read
// _id: 1234, // specify the msg id
// thread_id: 12, // specify the conversation thread_id
// address: '+1888------', // sender's phone number
// body: 'How are you', // content to match
/** the next 2 filters can be used for pagination **/
// indexFrom: 0, // start from index 0
// maxCount: 10, // count of SMS to return each time
// };

const App = () => {
  const [messages, setMessageCount] = useState(0);
  const trnMessages = useState(0);
  const [bankAccountInfo, setBankAccountInfo] = useState([] as BankAccount[]);
  const [isGranted, setGrantStatus] = useState('');
  let bankAccountArr: Array<any> = [];

  const requestMessagePermission = async () => {
    try {
      let permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'Permission to only read Messages',
          message:
            'We need access to your messages ' +
            'so we can analyse and show you your spending patterns.',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Message permission granted');
        setGrantStatus(permission);

        getSms({box: 'inbox', indexFrom: 0}, (msg: Array<any>) => {
          setMessageCount(msg.length);
          accountIdentifier(msg);
        });
      } else {
        console.log('Message permission denied');
        setGrantStatus('denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestMessagePermission();
  }, []);

  // executes callback after it fetches the messages
  async function getSms(filter: any, callback: (msg: Array<any>) => void) {
    await SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.log('Failed with this error: ' + fail);
      },
      (count: number, smsList: any) => {
        console.log('Count: ', count);
        callback(JSON.parse(smsList));
      },
    );
  }

  function accountIdentifier(messages: Array<any>) {
    let trnMessagesCount = 0;
    let localBankAccountInfo: Array<BankAccount> = [];

    messages.forEach((message: any, index) => {
      if (message.hasOwnProperty('body')) {
        const messageToSearch = message.body.toLowerCase();
        // eg: Ad-axisBk
        const addressRegex = /^[a-z]{2}-[a-z]+$/gi;

        if (addressRegex.test(message.address)) {
          // search for avbl bal
          if (messageToSearch.match(/avbl bal|avl bal/) !== null) {
            const words: Array<string> = messageToSearch.split(' ');

            if (words.includes('a/c')) {
              const bankName: string = message.address.toLowerCase();
              const image = getBankNames(bankName);
              // case: a/c 2123
              let acNo: string = words[words.indexOf('a/c') + 1];

              //  case: a/c no. 2123
              if (acNo.includes('no')) {
                acNo = words[words.indexOf('a/c') + 2];
              }

              // remove xx from acNo
              acNo = acNo.replace(/x/gi, '');
              // limit acNo to four digits
              acNo = acNo.slice(acNo.length - 4, acNo.length);

              if (bankAccountArr.includes(acNo) === false) {
                const balance = getAccountBalance(message);

                bankAccountArr.push(acNo);
                localBankAccountInfo.push({
                  acNo: acNo,
                  names: [bankName],
                  balance: balance,
                  image,
                  allMessages: [
                    {message: message.body, dateSent: message.date_sent, id: message._id,},
                  ],
                });
              } else {
                const indexOfAcNo = bankAccountArr.indexOf(acNo);
                let bankInfo = localBankAccountInfo[indexOfAcNo];

                if (bankInfo.names.includes(bankName) === false) {
                  bankInfo.names.push(bankName);
                }
                localBankAccountInfo[indexOfAcNo] = bankInfo;
                localBankAccountInfo[indexOfAcNo].allMessages.push({
                  message: message.body,
                  dateSent: message.date_sent,
                  id: message._id
                });
              }
            }
            trnMessagesCount += 1;
          }
        }
      }
    });

    setBankAccountInfo(localBankAccountInfo);
    trnMessages[1](trnMessagesCount);
  }

  // determines the kind of transaction.
  // eg: debit, credit, balanceInfo
  // function findTrnType({body}) {

  // }

  function getAccountBalance(message: any) {
    let modifiedMsg: string = message.body.toLowerCase();
    let balance = '';
    // remove ':'
    modifiedMsg = modifiedMsg.replace(/:/g, '');
    // replace all 'rs. ' with 'rs.'
    modifiedMsg = modifiedMsg.replace(/rs. /g, 'rs.');
    // replace all 'rs.' with 'rs. '
    modifiedMsg = modifiedMsg.replace(/rs./g, 'rs. ');
    // split string by " "
    const words = modifiedMsg.split(' ');
    if (modifiedMsg.includes('inr')) {
      // search for last index of inr
      balance = words[words.lastIndexOf('inr') + 1];
    } else {
      // search for last index of rs
      balance = words[words.lastIndexOf('rs.') + 1];
    }

    return balance;
  }

  function checkSender(sender: string) {
    const pattern = /^[A-Z]{2}-/g; // eg: TM-....
    return sender.match(pattern);
  }

  function Home({navigation}) {
    return (
      <>
        {isGranted === 'granted' ? (
          <View style={styles.home}>
            {/* <Text style={{marginTop: 10, fontSize: 20}}>Welcome!</Text> */}
            <ScrollView style={{marginTop: 10}}>
              {bankAccountInfo.length !== 0
                ? bankAccountInfo.map((k) => {
                    return (
                      <TouchableOpacity
                        key={k.acNo}
                        onPress={() =>
                          navigation.navigate('Details', {accountInfo: k})
                        }>
                        <View
                          style={{
                            marginTop: 10,
                            padding: 15,
                            borderRadius: 6,
                            backgroundColor: 'white',
                            // borderColor: "#e7e3d4",
                            // borderWidth: 1
                          }}>
                          <View style={{display: 'flex', flexDirection: 'row'}}>
                            {k.image === '' ? (
                              <Image
                                style={{
                                  width: 30,
                                  backgroundColor: '#eee',
                                  marginRight: 20,
                                }}
                                source={{}}
                              />
                            ) : (
                              <Image
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 40,
                                  marginRight: 30,
                                  alignSelf: 'center',
                                  backgroundColor: '#eee',
                                }}
                                source={{uri: k.image}}
                              />
                            )}
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                              }}>
                              <Text style={{marginBottom: 5}}>{k.acNo}</Text>
                              <Text style={{marginBottom: 5}}>
                                {k.names[0]}
                              </Text>
                              {/* <Text style={{fontSize: 12}}> */}
                              <Text style={{fontWeight: '700', fontSize: 16}}>
                                {'\u20B9'} {k.balance}
                              </Text>
                              {/* </Text> */}
                            </View>
                          </View>
                          <TouchableOpacity
                            // style={{marginTop: 20}}
                            onPress={() => {}}>
                            {/* <Text
                            style={{
                              color: '#1976D2',
                              fontSize: 14,
                              textTransform: "uppercase",
                              alignSelf: "flex-end"
                            }}>
                            View Transactions
                          </Text> */}
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                : null}
            </ScrollView>
          </View>
        ) : isGranted !== 'denied' ? (
          <View />
        ) : (
          <View style={styles.permissionBanner}>
            <Text style={styles.textCenter}>
              Please let us analyse your financial messages so we can show you
              usage stats daily, weekly, monthly etc.
            </Text>
            <Button
              onPress={requestMessagePermission}
              title="Grant Permission"
            />
          </View>
        )}
      </>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Details" component={Details} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  permissionBanner: {
    // display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    padding: 10,
  },
  textCenter: {
    textAlign: 'center',
    marginBottom: 10,
  },
  home: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
    backgroundColor: '#eeeded',
  },
});

export default App;
