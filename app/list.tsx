import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';//
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getProductInfoByUPC } from '../api/openFoodFacts';
import { FIRESTORE_DB } from '../config/FirebaseConfig';
import { collection, addDoc,getDocs ,updateDoc,doc,increment, DocumentReference,deleteDoc} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';//
import { Image } from 'react-native';

interface Product {
  barcode: string;
  name: string;
  keywords: string[];
  brands: string[];
  image: string;
  quantity: number;
  // Add other properties here if needed
}

const List = () => {
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [productsData, setProductsData] = useState<Product[]>([]); 
  const [isAdding, setIsAdding] = useState(false); // State for tracking whether "Add" or "Shop" action
  const handleAddButtonPress = () => {
    setIsAdding(true); // Set the state to indicate "Add" action
    setShowScanner(!showScanner); // Toggle the scanner
  };

  const handleShopButtonPress = () => {
    setIsAdding(false); // Set the state to indicate "Shop" action
    setShowScanner(!showScanner); // Toggle the scanner 
  };
  
  // Barcode premission
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

useEffect(() => {
  const fetchProducts = async () => {
    const productsCollectionRef = collection(FIRESTORE_DB, 'products');
    const querySnapshot = await getDocs(productsCollectionRef);
      // products to array
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      const product: Product = {
        barcode: productData.barcode,
        name: productData.name,
        keywords: productData.keywords,
        brands: productData.brands,
        image: productData.image,
        quantity: productData.quantity,
      };
      products.push(product);
    });

    setProductsData(products); // Update products state
  };

  fetchProducts();
}, [scanned]); // Trigger fetchProducts whenever 'scanned' state changes





const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
  setScanned(true);
  const productData = await getProductInfoByUPC(data); // Fetch product info

  if (productData) {
    try {
      const productsCollectionRef = collection(FIRESTORE_DB, 'products');
      const querySnapshot = await getDocs(productsCollectionRef);
      let productExists = false;
      let docRefToUpdate: DocumentReference<unknown, Product> | undefined;

      // Check barcode already exists in the database
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        if (product.barcode === data) {
          productExists = true;
          docRefToUpdate = doc.ref as DocumentReference<unknown, Product>;
        }
      });

      if (isAdding) {console.log("is.adding")
        if (productExists && docRefToUpdate) {
          
          // Update the quantity add
          await updateDoc(docRefToUpdate, {
            quantity: increment(1),
          });

        } else {
          // Add a new doc w/ qauntity 1
          await addDoc(productsCollectionRef, {
            barcode: data,
            name: productData.product_name,
            keywords: productData._keywords,
            brands: productData.brands,
            image: productData.image_front_small_url,
            quantity: 1,
          });
        }

        alert('Product information added to Firebase!');
      } else {
        if (productExists && docRefToUpdate) {
          // Update the quantity shop
          const updatedQuantity = productData.quantity - 1;

          if (updatedQuantity > 0) {
            await updateDoc(docRefToUpdate, {
              quantity: updatedQuantity,
            });
            alert('qauntity updated');
          } else {
            // Remove if quantity is 0
            await deleteDoc(docRefToUpdate);
          }
        } else {
          alert('Product not found in the list.');
        }
      }
    } catch (error) {
      console.error('Error handling barcode:', error);
      alert('Failed to handle barcode.');
    } finally {
      setScanned(false); // Reset scanned state
      setShowScanner(false); // Hide scanner after successful scan
      setIsAdding(false); // Reset isAdding state
    }
  } else {
    alert('Failed to fetch product information.');
  }
};

return (
  <View style={styles.container}>
    

    {/* Display products or Scanner */}
    {showScanner ? (
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
    ) : (
      <FlatList
      data={productsData}
      keyExtractor={(item) => item.barcode}
      renderItem={({ item }) => (
        <View style={styles.productItem}>
          <Image
            source={{ uri: item.image }} // Use the image URL from the API
            style={styles.productImage} // Add a style for the image
          />
          <Text>{item.brands + " | " + item.name}</Text>
        </View>
      )}
    />
    )}
    

    {/* Scan Barcode Button */}
    {hasPermission && (
      <TouchableOpacity
      style={styles.scanButton}
      onPress={() => {
        setIsAdding(false);
        handleShopButtonPress();
      }}
    >
        <Text style={styles.scanText}>{showScanner ? 'Show List' : 'Shop'}</Text>
      </TouchableOpacity>
    )}

     {/* add Button */}
     {hasPermission && (
      <TouchableOpacity
      style={styles.shopButton}
      onPress={() => {
        setIsAdding(true);
        handleAddButtonPress();
      }}
    >
        <Text style={styles.scanText}>{showScanner ? 'Show List' : 'Add'}</Text>
      </TouchableOpacity>
    )}

    
  </View>
);
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFCA7A', 
  },
  shopButton: {
    position: 'absolute',
    width: 100,
    height: 56,
    bottom: 5,
    left: 5,
    backgroundColor: '#12492F'
    , // Updated button color
    borderRadius: 4,
    padding: 5,
    margin: 10,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopButtonText: {
    color: 'white',
    fontSize: 18,
  },
  scanButton: {
    position: 'absolute',
    width: 100,
    height: 56,
    backgroundColor: '#F56038', 
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    right: 16,
    bottom: 16,
    elevation: 8,
  },
  scanText: {
    fontSize: 18,
    color: 'white',
  },
  productItem: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 25,
    width: 350,
  }, productImage: {
    width: 100, // Set the width as needed
    height: 100, // Set the height as needed
    resizeMode: 'contain', // Adjust the resizeMode as needed
    marginBottom: 10, // Add some margin to separate the image from the text
  },
});

export default List;