const BASE_URL = 'http://localhost:3001/api';

const request = (options) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: {
				'Authorization': 'Bearer ' + uni.getStorageSync('token'),
				...options.header
			},
			success: (res) => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(res.data);
				} else if (res.statusCode === 401 || res.statusCode === 403) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					// Optionally redirect to login or trigger login modal
					reject(res.data);
				} else {
					uni.showToast({
						title: res.data.error || '请求失败',
						icon: 'none'
					});
					reject(res.data);
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
				reject(err);
			}
		});
	});
};

export default request;
