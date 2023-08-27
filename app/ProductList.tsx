import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { FIRESTORE_DB } from '../config/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

interface Product {
  barcode: string;
  name: string;
  keywords: string[];
  brands: string[];
  image: string;
  // Add other properties here if needed
}

const ProductList = () => {
  const [productsData, setProductsData] = useState<Product[]>([]);

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
          // Add other properties if needed
        };
        products.push(product);
      });

      setProductsData(products);
    };

    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Product List</Text>
      <FlatList
        data={productsData}
        keyExtractor={(item) => item.barcode}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text>{item.name}</Text>
            {/* Display other product information here */}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productItem: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
});

export default ProductList;