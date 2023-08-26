import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const List = () => {
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: {type: string, data: string}) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    const code = data;
  };

  return (
    <View style={styles.container}>
      <Text>list</Text>
      {showScanner && (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Custom FAB */}
      {hasPermission && (
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowScanner(true)}
      >
        <Text style={styles.fabText}>Scan</Text>
      </TouchableOpacity>)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    backgroundColor: '#2196F3',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    right: 16,
    bottom: 16,
    elevation: 8,
  },
  fabText: {
    fontSize: 18,
    color: 'white',
  },
});

export default List;