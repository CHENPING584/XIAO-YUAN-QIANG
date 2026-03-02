<template>
	<view class="container">
		<view class="header-box">
			<block v-if="user">
				<image :src="user.avatar_url || '/static/default-avatar.png'" class="avatar"></image>
				<view class="info">
					<text class="nickname">{{ user.nickname }}</text>
					<text class="uid">ID: {{ user.id }}</text>
				</view>
			</block>
			<block v-else>
				<button class="login-btn" @click="login">点击登录</button>
			</block>
		</view>
		
		<view class="menu-list">
			<navigator url="/pages/my/posts" class="menu-item">
				<view class="left">
					<text class="icon">📝</text>
					<text>我的投稿</text>
				</view>
				<text class="arrow">></text>
			</navigator>
			<view class="menu-item">
				<view class="left">
					<text class="icon">💬</text>
					<text>我的评论</text>
				</view>
				<text class="arrow">></text>
			</view>
			<view class="menu-item">
				<view class="left">
					<text class="icon">⭐</text>
					<text>我的收藏</text>
				</view>
				<text class="arrow">></text>
			</view>
			<view class="menu-item" @click="contactAdmin">
				<view class="left">
					<text class="icon">📞</text>
					<text>联系管理员</text>
				</view>
				<text class="arrow">></text>
			</view>
		</view>
		
		<button v-if="user" class="logout-btn" @click="logout">退出登录</button>
	</view>
</template>

<script>
	import request from '@/common/request';
	
	export default {
		data() {
			return {
				user: null
			}
		},
		onShow() {
			const user = uni.getStorageSync('user');
			if (user) {
				this.user = user;
			}
		},
		methods: {
			login() {
				// #ifdef MP-WEIXIN
				uni.login({
					provider: 'weixin',
					success: (loginRes) => {
						request({
							url: '/login',
							method: 'POST',
							data: { code: loginRes.code }
						}).then((res) => {
							uni.setStorageSync('token', res.token);
							uni.setStorageSync('user', res.user);
							this.user = res.user;
							uni.showToast({ title: '登录成功' });
						});
					}
				});
				// #endif
				// #ifdef H5
				// Mock login for H5 dev
				request({
					url: '/login',
					method: 'POST',
					data: { code: 'mock_code' }
				}).then((res) => {
					uni.setStorageSync('token', res.token);
					uni.setStorageSync('user', res.user);
					this.user = res.user;
					uni.showToast({ title: '登录成功' });
				});
				// #endif
			},
			logout() {
				uni.removeStorageSync('token');
				uni.removeStorageSync('user');
				this.user = null;
			},
			contactAdmin() {
				uni.showModal({
					title: '联系我们',
					content: '请发送邮件至 admin@campus.com',
					showCancel: false
				});
			}
		}
	}
</script>

<style>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
	}
	.header-box {
		background-color: #3cc51f;
		padding: 30px 20px;
		display: flex;
		align-items: center;
		color: #fff;
	}
	.avatar {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		margin-right: 15px;
		background: #fff;
	}
	.info {
		display: flex;
		flex-direction: column;
	}
	.nickname {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
	}
	.uid {
		font-size: 12px;
		opacity: 0.8;
	}
	.login-btn {
		background: #fff;
		color: #3cc51f;
		font-size: 14px;
		padding: 5px 20px;
		border-radius: 20px;
	}
	.menu-list {
		margin-top: 10px;
		background: #fff;
	}
	.menu-item {
		display: flex;
		justify-content: space-between;
		padding: 15px 20px;
		border-bottom: 1px solid #eee;
		font-size: 16px;
	}
	.left {
		display: flex;
		align-items: center;
	}
	.icon {
		margin-right: 10px;
	}
	.arrow {
		color: #ccc;
	}
	.logout-btn {
		margin-top: 30px;
		background: #fff;
		color: red;
		width: 90%;
	}
</style>
