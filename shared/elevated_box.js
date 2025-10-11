import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from './colors';

const ElevatedBox = ({ image, text, boxStyle, onLayout }) => {
    console.log(boxStyle, 'boxStyle in elevated box');
    return (
        <View style={styles.container}>
            <View style={[styles.elevatedBox, boxStyle]} onLayout={onLayout}>
                <Image
                    source={image}
                    style={{
                        width: boxStyle?.width ? boxStyle.width - 50 : 100,
                        height: boxStyle?.height ? boxStyle.height - 50 : 100,
                        resizeMode: 'contain'
                    }}
                />
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
        backgroundColor: colors.elevatedBox[2],
        borderRadius: 6,
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
        fontSize: 12,
        textAlign: 'center'
    },
});

export default ElevatedBox;