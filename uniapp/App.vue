<script>
	export default {
		onLaunch: function() {
			console.log('App Launch');
			// Check login status or auto login
			const token = uni.getStorageSync('token');
			if (!token) {
				// Optional: auto login logic
			}
		},
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide');
		}
	}
</script>

<style>
	/* 每个页面公共css */
	@import url("https://at.alicdn.com/t/font_1234567.css"); /* Example iconfont */
	
	page {
		background-color: #f8f8f8;
		font-size: 14px;
		color: #333;
		font-family: -apple-system, Helvetica, sans-serif;
	}
	
	.container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	
	image {
		will-change: transform;
	}
</style>
