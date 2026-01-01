import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from './colors';
import { useState, useLayoutEffect, useRef } from 'react';

const ElevatedBox = ({ image, text }) => {
    const containerRef = useRef(null);
    const [boxSize, setBoxSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        // measure() determines the view's size synchronously in the New Architecture
        containerRef.current?.measure((x, y, width, height) => {
            // Update state only if values change to avoid render loops
            if (width !== boxSize.width || height !== boxSize.height) {
                setBoxSize({ width, height });
            }
        });
    }, []); // Empty dependency array measures on mount

    console.log("Box Size: ", boxSize);

    return (
        <View style={styles.box}>
            <View ref={containerRef} style={styles.elevatedBox}>
                <Image
                    source={image}
                    style={{
                        // Use measured dimensions minus your offset
                        width: boxSize.width ? boxSize.width - 50 : 100,
                        height: boxSize.height ? boxSize.height - 50 : 100,
                        resizeMode: 'contain'
                    }}
                />
                <Text style={styles.text}>{text}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    box: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    elevatedBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.screenContent[0],
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
    text: {
        fontSize: 12,
        textAlign: 'center'
    },
});

export default ElevatedBox;