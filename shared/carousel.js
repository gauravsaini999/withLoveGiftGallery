import * as React from 'react';
import { View, Text, Dimensions, StyleSheet, Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { colors } from './colors';

const { width } = Dimensions.get('window');

const data = ['Slide 1', 'Slide 2', 'Slide 3', 'slide 4', 'slide 5', 'slide 6'];
const images = [
  require('../assets/carousel/img1.jpg'),
  require('../assets/carousel/img2.jpg'),
  require('../assets/carousel/img3.jpg'),
  require('../assets/carousel/img4.jpg'),
  require('../assets/carousel/img5.jpg'),
  require('../assets/carousel/img6.jpg'),
];

export default function MyCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={width}
        height={200}
        autoPlay={true}
        data={data}
        scrollAnimationDuration={500}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ index }) => (
          <View style={styles.slide}>
            <Image source={images[index]} style={styles.img} />
          </View>
        )}
      />
      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  slide: {
    alignItems: 'center',
    borderRadius: 10,
  },
  img: {
    width: width-40,
    borderRadius: 10,
    height: 180
  },
  text: {
    fontSize: 24,
    color: '#fff',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#999',
  },
});
