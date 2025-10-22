import { useNavigation } from "@react-navigation/native";
import eventBus from "./eventBus";

const useSendToHome = () => {
    const navigation = useNavigation();
    const onTabChanged = ({ completed }) => {
        console.log('inside onTabChanged function of SendToHome component, completed = ', completed)
        if (completed) {
            console.log('now changing screen')
            navigation.navigate('Home', { screen: 'Home Screen' });
            eventBus.off('tabChangedComplete', onTabChanged);
        }
    }
    eventBus.on('tabChangedComplete', onTabChanged);
    return { onTabChanged };
}

export default useSendToHome;