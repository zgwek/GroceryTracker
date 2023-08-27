import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getProductInfoByUPC } from '../api/openFoodFacts';
import { FIRESTORE_DB } from '../config/FirebaseConfig';
import { collection, addDoc } from 'firebase/firestore';


const List = () => {
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);



  // Barcode premission
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  /*
  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    setScanned(true);
    const productData = await getProductInfoByUPC(data); // Fetch product info
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    if (productData) {
      alert(`Product info: ${JSON.stringify(productData)}`);
    } else {
      alert('Failed to fetch product information.');
    }
    console.log(productData)
  };*/
  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    setScanned(true);
    const productData = await getProductInfoByUPC(data); // Fetch product info
  
    if (productData) {
      try {
        const productsCollectionRef = collection(FIRESTORE_DB, 'products');

      // Create a new document in the 'products' collection
      const docRef = await addDoc(productsCollectionRef, {
        barcode: data,
        name: productData.product_name,
        keywords: productData._keywords,
        brands: productData.brands,
        image: productData.image_front_small_url,
        // Add other properties you want to store
      });
  
        alert('Product information added to Firebase!');
      } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product information to Firebase.');
      }
    } else {
      alert('Failed to fetch product information.');
    }
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
        onPress={() => {  if (scanned) {
          setShowScanner(false); // Hide scanner after successful scan
        } else {
          setShowScanner(true); // Show scanner
        }
      }}
    >
      <Text style={styles.fabText}>{scanned ? 'Scan Again' : 'Scan Barcode'}</Text>
    </TouchableOpacity>/*setShowScanner(true) }
      >
        <Text style={styles.fabText}>Scan</Text>
      </TouchableOpacity>*/ )}
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