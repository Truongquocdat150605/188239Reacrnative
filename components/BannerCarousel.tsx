// components/BannerCarousel.tsx

import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    Image, 
    TouchableOpacity, 
    Dimensions 
} from 'react-native';
import { MOCK_BANNERS } from '../constants/mockBanners';
import { COLORS } from '../theme/colors'; // Import colors từ theme của bạn
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Định nghĩa type cho Banner
type Banner = {
    id: string;
    title: string;
    subtitle: string;
    imageUri: string;
    link: any;
};

type BannerItemProps = {
    banner: Banner;
};

const BANNER_WIDTH = width * 0.9; 
const BANNER_HEIGHT = 180;

// Component render từng Banner - ĐÃ UPDATE COLORS
const BannerItem: React.FC<BannerItemProps> = ({ banner }) => {
    const router = useRouter();

    const handlePress = () => {
        console.log('Banner pressed:', banner.title);
        // Tạm thời comment router để tránh lỗi
        // router.push(banner.link as any);
    };

    return (
        <TouchableOpacity 
            style={styles.bannerContainer} 
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <Image 
                source={{ uri: banner.imageUri }} 
                style={styles.image}
            />
            <View style={styles.overlay}>
                <Text style={styles.title}>{banner.title}</Text>
                <Text style={styles.subtitle}>{banner.subtitle}</Text>
            </View>
        </TouchableOpacity>
    );
};

export const BannerCarousel: React.FC = () => {
    return (
        <View style={styles.carouselWrapper}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                snapToInterval={BANNER_WIDTH + 15}
                decelerationRate="fast"
            >
                {MOCK_BANNERS.map((banner) => (
                    <BannerItem key={banner.id} banner={banner} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    carouselWrapper: {
        height: BANNER_HEIGHT + 20,
        backgroundColor: COLORS.background, // Sử dụng background từ theme
        marginVertical: 10,
    },
    scrollViewContent: {
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    bannerContainer: {
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 15,
        position: 'relative',
        // Shadow sử dụng màu text từ theme
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)', // Giữ lớp phủ tối
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF', // Giữ trắng để nổi bật trên overlay
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#EEEEEE', // Giữ trắng nhạt
        marginTop: 5,
    }
});