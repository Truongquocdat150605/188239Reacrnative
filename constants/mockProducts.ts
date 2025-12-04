export const MOCK_PRODUCTS = [
    {
        id: '1',
        name: 'Nhẫn Kim Cương Vàng 18K',
        price: 18500000,
        originalPrice: 22000000,
        imageUri: require('../assets/products/ring1.png'),
        category: 'rings',
        isNew: true,
        isSale: true,
        rating: 4.8,
        reviewCount: 24,
        specifications: {
            material: 'Vàng 18K',
            weight: '1ct',
            size: '15'
        }
    },
    {
        id: '2',
        name: 'Vòng Tay Ngọc Trai Cao Cấp',
        price: 3200000,
        originalPrice: 4000000,
        imageUri: require('../assets/products/bracelet1.png'),
        category: 'bracelets',
        isNew: false,
        isSale: true,
        rating: 4.5,
        reviewCount: 18,
        specifications: {
            material: 'Ngọc trai tự nhiên',
            length: '18cm'
        }
    },
    {
        id: '3',
        name: 'Dây Chuyền Vàng 24K',
        price: 7500000,
        imageUri: require('../assets/products/necklace1.png'),
        category: 'necklaces',
        isNew: true,
        isSale: false,
        rating: 4.9,
        reviewCount: 32,
        specifications: {
            material: 'Vàng 24K',
            weight: '8g'
        }
    },
    {
        id: '4',
        name: 'Bông Tai Kim Cương',
        price: 12500000,
        originalPrice: 15000000,
        imageUri: require('../assets/products/earrings1.png'),
        category: 'earrings',
        isNew: false,
        isSale: true,
        rating: 4.7,
        reviewCount: 15,
        specifications: {
            material: 'Bạch kim + Kim cương',
            weight: '0.5ct'
        }
    },
    {
        id: '5',
        name: 'Nhẫn Cưới Kim Cương',
        price: 28500000,
        imageUri: require('../assets/products/wedding-ring.png'),
        category: 'wedding',
        isNew: true,
        isSale: false,
        rating: 5.0,
        reviewCount: 8,
        specifications: {
            material: 'Vàng trắng 18K',
            weight: '1.5ct'
        }
    },

    // GOLD
    {
        id: '6',
        name: 'Lắc Tay Vàng 24K Đặc',
        price: 9600000,
        imageUri: require('../assets/products/gold-bracelet.png'),
        category: 'gold',
        isNew: false,
        isSale: false,
        rating: 4.6,
        reviewCount: 14,
        specifications: {
            material: 'Vàng 24K',
            weight: '10g'
        }
    },

    // PEARLS
    {
        id: '7',
        name: 'Dây Chuyền Ngọc Trai Nhật',
        price: 4500000,
        imageUri: require('../assets/products/pearl-necklace.png'),
        category: 'pearls',
        isNew: true,
        isSale: true,
        rating: 4.9,
        reviewCount: 42,
        specifications: {
            material: 'Ngọc Trai Nhật Bản',
            size: '8mm'
        }
    },

    // SILVER
    {
        id: '8',
        name: 'Nhẫn Bạc 925 Basic',
        price: 750000,
        imageUri: require('../assets/products/silver-ring.png'),
        category: 'silver',
        isNew: false,
        isSale: false,
        rating: 4.2,
        reviewCount: 19,
        specifications: {
            material: 'Bạc 925',
            size: '16'
        }
    },

    // LUXURY
    {
        id: '9',
        name: 'Vương Miện Trang Sức Luxury',
        price: 55000000,
        imageUri: require('../assets/products/crown.png'),
        category: 'luxury',
        isNew: true,
        isSale: false,
        rating: 5.0,
        reviewCount: 12,
        specifications: {
            material: 'Bạch Kim + Kim Cương',
            weight: '3.2ct'
        }
    },

    // KIDS
    {
        id: '10',
        name: 'Lắc Tay Bạc Trẻ Em Hình Gấu',
        price: 480000,
        imageUri: require('../assets/products/kids-bracelet.png'),
        category: 'kids',
        isNew: true,
        isSale: true,
        rating: 4.8,
        reviewCount: 55,
        specifications: {
            material: 'Bạc 925',
            length: '12cm'
        }
    }
];
