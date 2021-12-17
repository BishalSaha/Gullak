import React, {useEffect, useState} from 'react';
import {
  Button,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

const App = () => {
  const [counter, setCounter] = useState();
  const [list, setList] = useState();

  const [food, setFood] = useState();
  const [travel, setTravel] = useState();
  const [shopping, setShopping] = useState();
  const [online, setOnline] = useState();
  const [misc, setMisc] = useState();

  useEffect(() => {
    requestReadSmsPermission(); //Permission for SMS Read
    // sms();
  }, []);

  //Permission for SMS Read
  async function requestReadSmsPermission() {
    try {
      let granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'Receive SMS',
          message: 'Need access to read sms',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // alert('READ_SMS permissions granted');
        console.log('READ_SMS permissions granted');
        sms();
      } else {
        alert('READ_SMS permissions denied');
        console.log('READ_SMS permissions denied');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const sms = () => {
    const filter = {
      box: 'inbox',
      bodyRegex:
        '(.*)Debit(.*)\n(.*)INR [0-9]+.[0-9]+(.*)\n(.*)A/c no. XX[0-9]+(.*)\n(.*)[0-9]+-[0-9]+-[0-9]+ [0-9]+:[0-9]+:[0-9]+(.*)\n(.*)[a-zA-Z0-9]+/[a-zA-Z0-9]+/[0-9]+/[a-zA-Z0-9\\s\\.]+/[a-zA-Z0-9\\s]+(.*)\n(.*)Bal INR [0-9]+.[0-9]+(.*)\n(.*)SMS BLOCKUPI Cust ID to [0-9]+, if not you-Axis Bank(.*)',
      indexFrom: 0,
    };
    SmsAndroid.list(
      JSON.stringify(filter),
      fail => {
        console.log('fail', fail);
      },
      (count, smsList) => {
        setCounter(count);
        console.log('count', count);

        let arr = JSON.parse(smsList);
        const values = arr.map(object => {
          const text = object.body.split(' ' && '\n');
          //Spent
          const spent = text[1].split(' ')[1];
          //Merchant
          const merchant = text[4].split('/')[3];

          return {spent, merchant};
        });

        let foodTotal = 0.0;
        let travelTotal = 0.0;
        let shoppingTotal = 0.0;
        let onlineTotal = 0.0;
        let miscTotal = 0.0;
        values.forEach(element => {
          if (element.merchant === 'Swiggy' || element.merchant === 'Zomato') {
            foodTotal += parseFloat(element.spent);
          } else if (
            element.merchant === 'OYO' ||
            element.merchant === 'Makemytrip' ||
            element.merchant === 'Easemytrip'
          ) {
            travelTotal += parseFloat(element.spent);
          } else if (
            element.merchant === 'Amazon' ||
            element.merchant === 'Flipkart' ||
            element.merchant === 'Myntra'
          ) {
            shoppingTotal += parseFloat(element.spent);
          } else if (
            element.merchant === 'Netflix' ||
            element.merchant === 'Spotify' ||
            element.merchant === 'Prime'
          ) {
            onlineTotal += parseFloat(element.spent);
          } else {
            miscTotal += parseFloat(element.spent);
          }
        });
        // console.log(food);
        // console.log(travel);
        // console.log(shopping);
        // console.log(online);
        // console.log(misc);

        let total =
          foodTotal + travelTotal + shoppingTotal + onlineTotal + miscTotal;
        setFood((100 * foodTotal) / total);
        setTravel((100 * travelTotal) / total);
        setShopping((100 * shoppingTotal) / total);
        setOnline((100 * onlineTotal) / total);
        setMisc((100 * miscTotal) / total);

        const lists = arr.map(object => {
          const text = object.body.split(' ' && '\n');
          //Spent
          const spent = text[1].split(' ')[1];
          //A/c number
          const accountNo = text[2].split(' ')[2];
          //Paid
          const merchant = text[4].split('/')[3];
          //Date & Time
          const date = text[3].split(' ')[0];
          const time = text[3].split(' ')[1];

          return (
            <View style={styles.spendContainer} key={object._id}>
              <Text style={styles.text}>Spent: {spent}</Text>
              <Text style={styles.text}>A/c number: {accountNo}</Text>
              <Text style={styles.text}>Date: {date}</Text>
              <Text style={styles.text}>Time: {time}</Text>
              <Text style={styles.text}>Merchant: {merchant}</Text>
              <Text style={styles.text}>Balance: {text[5]}</Text>
            </View>
          );
        });
        setList(lists);
      },
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        style={styles.scollContainer}>
        <Text style={[styles.text, {paddingTop: 20}]}>
          AXISBK SMS: {counter}
        </Text>
        <TouchableOpacity onPress={sms} style={styles.button}>
          <Text style={styles.buttonText}>History</Text>
        </TouchableOpacity>
        <View style={styles.spendContainer}>
          <Text style={styles.text}>Food- {food}%</Text>
          <Text style={styles.text}>Travel-{travel}%</Text>
          <Text style={styles.text}>Shopping-{shopping}%</Text>
          <Text style={styles.text}>Online-{online}%</Text>
          <Text style={styles.text}>Misc-{misc}%</Text>
        </View>
        <>{list}</>
      </ScrollView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'blue',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  button: {
    backgroundColor: 'red',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  spendContainer: {
    width: '100%',
    justifyContent: 'flex-start',
    padding: 20,
  },
  scollContainer: {
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
