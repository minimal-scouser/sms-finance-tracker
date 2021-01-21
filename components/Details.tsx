import React, {useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BankAccount} from '../Interfaces/BankAccount';

export default function Details({route, navigation}) {
  const accountInfo: BankAccount = route.params.accountInfo;
  const [showMessage, setSMStatus] = useState(Array(accountInfo.allMessages.length).fill(false));

  function Message(x) {
    return (
      <View style={styles.item}>
        <TouchableOpacity
          onPress={() => {
            const localCopy = [...showMessage];
            localCopy[x.index] = !localCopy[x.index]
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

  return (
    <View>
      <SafeAreaView>
        <FlatList
          data={accountInfo.allMessages}
          renderItem={Message}
          keyExtractor={(item) => item.id}
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
});
