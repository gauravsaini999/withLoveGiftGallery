import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from './colors';

const ElevatedBox = ({image, text, boxStyle, onLayout}) => {
    return (
        <View style={styles.container}>
            <View style={[styles.elevatedBox, boxStyle]} onLayout={onLayout}>
                <Image source={image} style={styles.img} />
                <Text style={styles.text}>{text}</Text>
            </View>
        </View>
    );
};
  
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    elevatedBox: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.elevatedBox,
        borderRadius: 6,
        justifyContent: 'center',
        textAlign: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,

        // Android
        elevation: 5,

        // iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 3,
        },
        shadowOpacity: 0.6,
        shadowRadius: 2,
    },
    img: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    text: {
        fontSize: 18,
        textAlign: 'center'
    },
});

export default ElevatedBox;