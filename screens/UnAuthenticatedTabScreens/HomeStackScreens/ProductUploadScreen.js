import React, { useState } from 'react';
import { ScrollView, View, Image, Alert } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';

export default function ProductUploadScreen() {
  const { control, handleSubmit } = useForm();
  const [mainImage, setMainImage] = useState(null);
  const [carouselImages, setCarouselImages] = useState([]);

  const pickSingleImage = async (callback) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      callback(result.assets[0].uri);
    }
  };

  const pickMultipleImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setCarouselImages(result.assets.map((asset) => asset.uri));
    }
  };

  const onSubmit = (data) => {
    if (!mainImage) {
      Alert.alert("Main Image Required", "Please select a main image.");
      return;
    }

    const payload = {
      ...data,
      mainImage,
      carouselImages,
    };
    console.log('Submitting payload:', payload);
    // Upload to Firebase or your backend here
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Title>Upload New Toy</Title>

      {/* Main Image */}
      <Button mode="outlined" onPress={() => pickSingleImage(setMainImage)} style={{ marginVertical: 8 }}>
        Select Main Image
      </Button>
      {mainImage && <Image source={{ uri: mainImage }} style={{ width: 100, height: 100, marginBottom: 8 }} />}

      {/* Carousel Images */}
      <Button mode="outlined" onPress={pickMultipleImages} style={{ marginVertical: 8 }}>
        Select Carousel Images
      </Button>
      <ScrollView horizontal style={{ marginVertical: 8 }}>
        {carouselImages.map((uri, index) => (
          <Image key={index} source={{ uri }} style={{ width: 80, height: 80, marginRight: 6, borderRadius: 8 }} />
        ))}
      </ScrollView>

      {/* Description */}
      <Controller
        control={control}
        name="description"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Description"
            value={value}
            onChangeText={onChange}
            multiline
            style={{ marginBottom: 12 }}
          />
        )}
      />

      {/* Battery Info */}
      <Controller
        control={control}
        name="battery"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Battery Requirement"
            value={value}
            onChangeText={onChange}
            style={{ marginBottom: 12 }}
          />
        )}
      />

      {/* Brand */}
      <Controller
        control={control}
        name="brand"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <TextInput label="Brand" value={value} onChangeText={onChange} style={{ marginBottom: 12 }} />
        )}
      />

      {/* Price */}
      <Controller
        control={control}
        name="price"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Price (USD)"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={{ marginBottom: 12 }}
          />
        )}
      />

      {/* Discount */}
      <Controller
        control={control}
        name="discount"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Discount (%)"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            style={{ marginBottom: 16 }}
          />
        )}
      />

      <Button mode="contained" onPress={handleSubmit(onSubmit)}>
        Upload Product
      </Button>
    </ScrollView>
  );
}
