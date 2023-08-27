import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';//
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getProductInfoByUPC } from '../api/openFoodFacts';
import { FIRESTORE_DB } from '../config/FirebaseConfig';
import { collection, addDoc,getDocs ,updateDoc,doc,increment, DocumentReference} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';//

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
  const [productsData, setProductsData] = useState<Product[]>([]); // Added state for products

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

      // Check if the product with the same barcode already exists in the database
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        if (product.barcode === data) {
          productExists = true;
          docRefToUpdate = doc.ref as DocumentReference<unknown, Product>;
        }
      });

      if (productExists && docRefToUpdate) {
        // Update the quantity by incrementing it
        await updateDoc(docRefToUpdate, {
          quantity: increment(1), // Increment the quantity by 1
        });
      } else {
        // Add a new document with quantity 1
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

    {/* Display products */}
    <FlatList
      data={productsData}
      keyExtractor={(item) => item.barcode}
      renderItem={({ item }) => (
        <View style={styles.productItem}>
          <Text>{item.name}</Text>
        </View>
      )}
    />

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
        onPress={() => {
          if (scanned) {
            setShowScanner(false); // Hide scanner after successful scan
          } else {
            setShowScanner(true); // Show scanner
          }
        }}
      >
        <Text style={styles.fabText}>{scanned ? 'Scan Again' : 'Scan Barcode'}</Text>
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
  },productItem: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
    color: 'white',  // Adjust this value as needed
  },
});

export default List;