export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	// {
	// 	path: '/dashboard',
	// 	name: 'Dashboard',
	// 	component: './TrangChu',
	// 	icon: 'HomeOutlined',
	// },
	
	// {
	// 	path: '/gioi-thieu',
	// 	name: 'About',
	// 	component: './TienIch/GioiThieu',
	// },
	{
		name: 'Quản lý khách sạn',
		path: '/quan-ly-khach-san',
		icon: 'HomeOutlined',
		routes: [
			{
				path: '/quan-ly-khach-san/danh-sach-phong',
				name: 'Danh sách phòng khách sạn',
				component: './rooms/index',
				icon: 'HomeOutlined',
			},
			{
				path: '/quan-ly-khach-san/quan-ly-phong',
				name: 'Quản lý phòng khách sạn',
				component: './rooms/ManageRoom',
				icon: 'HomeOutlined',
			},
			{
				path: '/quan-ly-khach-san/quan-ly-tai-khoan',
				name: 'Quản lý tài khoản',
				component: './ManageUsers/index',
				icon: 'HomeOutlined',
			},
			{
				path: '/quan-ly-khach-san/dich-vu-phong',
				name: 'Dịch vụ phòng',
				component: './RoomService/index',
				icon: 'HomeOutlined',
			},
			{
				path: '/quan-ly-khach-san/danh-sach-dich-vu',
				name: 'Danh sách dịch vụ',
				component: './Service/index',
				icon: 'HomeOutlined',
			},
		],
	},

	{
		path: '/danh-sach-phong',
		name: 'Danh sách phòng',
		component: './rooms/index',
		icon: 'HomeOutlined',
		hideInMenu: true,
	},
	
	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
