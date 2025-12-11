
// components/BannerCarousel.tsx

import React, { useEffect, useRef, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    Image, 
    TouchableOpacity, 
    useWindowDimensions,
    Platform,
    NativeSyntheticEvent,
    NativeScrollEvent
} from 'react-native';
import { MOCK_BANNERS } from '../constants/mockBanners';
import { COLORS } from '../theme/colors'; 
import { useRouter } from 'expo-router';

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
    width: number;
    height: number;
};

// Component render từng Banner
const BannerItem: React.FC<BannerItemProps> = ({ banner, width, height }) => {
    const router = useRouter();

    const handlePress = () => {
        console.log('Banner pressed:', banner.title);
        // router.push(banner.link as any);
    };

    return (
        <TouchableOpacity 
            style={[styles.bannerContainer, { width: width, height: height }]} 
            onPress={handlePress}
            activeOpacity={0.9}
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
    const { width } = useWindowDimensions();
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    
    // 🟢 RESPONSIVE CONFIG
    const MAX_WEB_WIDTH = 1200;
    const bannerWidth = Math.min(width * 0.92, MAX_WEB_WIDTH);
    const gap = 15; // Khoảng cách giữa các banner
    
    // Chiều cao tỉ lệ theo chiều rộng nhưng có giới hạn
    const bannerHeight = Platform.OS === 'web' 
        ? Math.min(bannerWidth * 0.4, 450) 
        : 180; 

    // 🟢 AUTO PLAY LOGIC
    useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= MOCK_BANNERS.length) {
                nextIndex = 0; // Quay về đầu
            }
            
            // Cuộn tới vị trí tiếp theo
            if (scrollRef.current) {
                scrollRef.current.scrollTo({
                    x: nextIndex * (bannerWidth + gap), // Tính toán tọa độ x
                    animated: true,
                });
            }
            setActiveIndex(nextIndex);
        }, 4000); // 4 giây chuyển 1 lần

        return () => clearInterval(interval);
    }, [activeIndex, bannerWidth]);

    // Cập nhật index khi người dùng tự vuốt tay
    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / (bannerWidth + gap));
        setActiveIndex(index);
    };

    return (
        <View style={styles.carouselWrapper}>
            <View style={styles.centerContainer}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled={Platform.OS !== 'web'} // Web paging behavior is different
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                    snapToInterval={bannerWidth + gap}
                    decelerationRate="fast"
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    // Trên web cần style này để mượt hơn
                    scrollEventThrottle={16}
                >
                    {MOCK_BANNERS.map((banner) => (
                        <BannerItem 
                            key={banner.id} 
                            banner={banner} 
                            width={bannerWidth} 
                            height={bannerHeight}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    carouselWrapper: {
        width: '100%',
        marginVertical: 15,
        alignItems: 'center', 
    },
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    scrollViewContent: {
        paddingHorizontal: 15, 
        alignItems: 'center',
        gap: 15, // Gap prop for web/new arch
    },
    bannerContainer: {
        borderRadius: 16, 
        overflow: 'hidden',
        marginRight: Platform.OS === 'web' ? 15 : 0, // Dùng margin right trên web thay vì gap nếu cần
        position: 'relative',
        backgroundColor: COLORS.lightBackground, 
        
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
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
        backgroundColor: 'rgba(0, 0, 0, 0.3)', 
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: Platform.OS === 'web' ? 32 : 20, 
        fontWeight: '800',
        color: '#FFFFFF', 
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: Platform.OS === 'web' ? 18 : 14,
        color: '#F0F0F0', 
        fontWeight: '500',
    }
});
