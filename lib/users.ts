// users.ts

// Kiểu dữ liệu cho người dùng
export interface MockUser {
    email: string;
    password: string;
    name: string;
}

// Danh sách người dùng khởi tạo (Dùng chung cho cả Login và Signup)
export const MOCK_USERS: MockUser[] = [
    { email: 'user@example.com', password: 'password', name: 'Khách Hàng' },
    { email: 'test@gmail.com', password: 'password', name: 'Tester' },
    { email: 'admin@admin.com', password: 'admin123', name: 'Admin' },
];

// Hàm thêm người dùng mới
export const addUser = (newUser: MockUser) => {
    MOCK_USERS.push(newUser);
    console.log('[MOCK_DB] Người dùng mới đã được thêm:', newUser.email);
    console.log('[MOCK_DB] Tổng số người dùng hiện tại:', MOCK_USERS.length);
};