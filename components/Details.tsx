import React, {useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {BankAccount} from '../Interfaces/BankAccount';
import {
  getBalance,
  getMoney,
  getTypeOfTransaction,
  simplifyMessage,
} from '../utils/MessageParser';
// import {getBankNames} from '../BankFormats';

export default function Details({route, navigation}) {
  const accountInfo: BankAccount = route.params.accountInfo;
  const [showMessage, setSMStatus] = useState(
    Array(accountInfo.allMessages.length).fill(false),
  );

  function Message(x) {
    return (
      <View style={styles.item}>
        <TouchableOpacity
          onPress={() => {
            const localCopy = [...showMessage];
            localCopy[x.index] = !localCopy[x.index];
            setSMStatus(localCopy);
          }}>
          <Text>show more</Text>
        </TouchableOpacity>
        <Text style={styles.child}>
          Date: {new Date(x.item.dateSent).toDateString()}
        </Text>

        {showMessage[x.index] && (
          <View>
            <Text>{x.item.message}</Text>
          </View>
        )}
      </View>
    );
  }

  function HighlightTransaction(x) {
    const [selectedSort, setSort] = useState(0);

    return (
      <View style={{padding: 20}}>
        <View style={styles.dFlex}>
          <TouchableOpacity
            style={selectedSort === 0 ? styles.selectedSortBtn : styles.sortBtn}
            onPress={() => setSort(0)}>
            <Text style={{textAlign: 'center'}}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={selectedSort === 1 ? styles.selectedSortBtn : styles.sortBtn}
            onPress={() => setSort(1)}>
            <Text style={{textAlign: 'center'}}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={selectedSort === 2 ? styles.selectedSortBtn : styles.sortBtn}
            onPress={() => setSort(2)}>
            <Text style={{textAlign: 'center'}}>Month</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function Transaction(x) {
    const message = simplifyMessage(x.item.message);
    const typeOfTrn = getTypeOfTransaction(message);
    const amount = getMoney(message);

    // Invalid trns will not be shown as they dont have any credited or debited info.
    // They are most likely balance alerts
    return amount.includes('could not') === false ? (
      <View style={styles.item}>
        <Text
          style={[typeOfTrn === 'credited' ? styles.credited : styles.debited]}>
          &#8377; {amount}
        </Text>
        <View>
          {/* <Image source={{ uri: getBankNames(x.item.address) }} style={{ width: 30 }}/> */}
          <Text>{new Date(x.item.dateSent).toDateString()}</Text>
        </View>
      </View>
    ) : null;
  }

  // An invalid trn is something that does not have an amount that is either credited or debited
  // A balance alert cannot be determined as a valid transaction. It is an aler.
  // The validity of a trn is on the basis of "amount" field that we gather from the message body
  function checkForInvalidTransactions(x: Array<any>) {
    const areInvalid = x.every((item) => {
      // console.log("message", item.message);
      
      const formattedMessage = simplifyMessage(item.message);
      const amount = getMoney(formattedMessage);

      // when no trn is
      if (amount.includes('could not')) {
        return true;
      } else {
        return false;
      }
    });

    return areInvalid;
  }

  return (
    <View style={{ flex: 1, flexDirection: "column"}}>
      <Text style={{marginLeft: 20, marginTop: 10}}>
        Account No: {accountInfo.acNo}
      </Text>
      <Text style={{marginLeft: 20, marginTop: 5}}>
        Balance: {accountInfo.balance}
      </Text>
      {checkForInvalidTransactions(accountInfo.allMessages) ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", height: 100, opacity: .5 }}><Text>No Valid Transactions</Text></View>
      ) : (
        <FlatList
          data={accountInfo.allMessages}
          renderItem={Transaction}
          keyExtractor={(item) => String(item.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 4,
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    // marginVertical: 8,
    // marginHorizontal: 16,
  },
  child: {
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
  },
  sortBtn: {
    padding: 10,
    marginRight: 5,
    width: 70,
    textAlign: 'center',
    borderRadius: 20,
  },
  selectedSortBtn: {
    padding: 10,
    backgroundColor: '#d9ecf2',
    marginRight: 5,
    borderRadius: 20,
    width: 70,
    textAlign: 'center',
  },
  dFlex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  credited: {
    fontSize: 16,
    fontWeight: '700',
    color: 'green',
    marginBottom: 10,
  },
  debited: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ee6f57',
    marginBottom: 10,
  },
});
