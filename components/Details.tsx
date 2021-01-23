import React, {useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BankAccount} from '../Interfaces/BankAccount';
import {getAccount, getMoney, getTypeOfTransaction, simplifyMessage} from "../utils/MessageParser";
import {getBankNames} from "../BankFormats";

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
    const accountNo = getAccount(message).no
    const typeOfTrn = getTypeOfTransaction(message);
    

    return (
      <View style={styles.item}>
        <Text style={[typeOfTrn === "credited" ? styles.credited : styles.debited]}>&#8377; {getMoney(message)}</Text>
        <View>
          {/* <Image source={{ uri: getBankNames(x.item.address) }} style={{ width: 30 }}/> */}
          <Text>{new Date(x.item.dateSent).toDateString()}</Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <SafeAreaView>
        {/* <HighlightTransaction /> */}
        <Text style={{ padding: 20, fontSize: 20 }}>{accountInfo.acNo}</Text>
        <FlatList
          data={accountInfo.allMessages}
          // renderItem={Message}
          renderItem={Transaction}
          keyExtractor={(item) => String(item.id)}
        />
      </SafeAreaView>
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
    fontWeight: "700",
    color: "green"
  },
  debited: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ed6663"
  }
});
