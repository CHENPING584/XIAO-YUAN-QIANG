<template>
	<view class="container">
		<!-- 轮播图 -->
		<swiper class="swiper" indicator-dots autoplay circular>
			<swiper-item>
				<image src="https://via.placeholder.com/800x400" mode="aspectFill"></image>
			</swiper-item>
		</swiper>

		<!-- 分类入口 -->
		<view class="grid-box">
			<view class="grid-item" v-for="(item, index) in categories" :key="index" @click="filterCategory(item.id)">
				<text>{{ item.name }}</text>
			</view>
		</view>

		<!-- 帖子列表 -->
		<view class="post-list">
			<view class="post-item" v-for="(item, index) in list" :key="index" @click="goDetail(item.id)">
				<view class="header">
					<image :src="item.avatar_url || '/static/default-avatar.png'" class="avatar"></image>
					<view class="info">
						<text class="nickname">{{ item.is_anonymous ? '匿名用户' : item.nickname }}</text>
						<text class="time">{{ formatDate(item.created_at) }}</text>
					</view>
				</view>
				<view class="content">
					<text>{{ item.content }}</text>
				</view>
				<view class="price-tag" v-if="item.price">
					<text>¥ {{ item.price }}</text>
				</view>
				<view class="images" v-if="item.images && item.images.length">
					<image v-for="(img, idx) in item.images" :key="idx" :src="img" mode="aspectFill" class="post-img"></image>
				</view>
				<view class="footer">
					<view class="action">
						<text>浏览 {{ item.views }}</text>
					</view>
					<view class="action">
						<text>点赞 {{ item.likes }}</text>
					</view>
					<view class="action">
						<text>评论 {{ item.comments_count }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '@/common/request';
	
	export default {
		data() {
			return {
				list: [],
				categories: [],
				page: 1,
				loading: false,
				currentCategory: null
			}
		},
		onLoad() {
			this.getCategories();
			this.getList();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.list = [];
			this.getList().then(() => {
				uni.stopPullDownRefresh();
			});
		},
		onReachBottom() {
			this.page++;
			this.getList();
		},
		methods: {
			async getCategories() {
				try {
					const res = await request({ url: '/categories' });
					this.categories = res;
				} catch (e) {
					console.error(e);
				}
			},
			async getList() {
				if (this.loading) return;
				this.loading = true;
				try {
					let url = `/posts?page=${this.page}`;
					if (this.currentCategory) {
						url += `&category_id=${this.currentCategory}`;
					}
					const res = await request({ url });
					if (res && res.length > 0) {
						this.list = this.list.concat(res);
					}
				} finally {
					this.loading = false;
				}
			},
			filterCategory(id) {
				this.currentCategory = id;
				this.page = 1;
				this.list = [];
				this.getList();
			},
			goDetail(id) {
				uni.navigateTo({
					url: `/pages/post/detail?id=${id}`
				});
			},
			formatDate(dateStr) {
				const date = new Date(dateStr);
				return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
			}
		}
	}
</script>

<style>
	.container {
		padding-bottom: 20px;
		background-color: #f8f8f8;
		min-height: 100vh;
	}
	.swiper {
		height: 150px;
		width: 100%;
	}
	.swiper image {
		width: 100%;
		height: 100%;
	}
	.grid-box {
		display: flex;
		background: #fff;
		padding: 10px;
		margin-bottom: 10px;
		justify-content: space-around;
	}
	.grid-item {
		padding: 10px;
		text-align: center;
	}
	.post-item {
		background: #fff;
		margin-bottom: 10px;
		padding: 15px;
	}
	.price-tag {
		color: #ff4d4f;
		font-size: 18px;
		font-weight: bold;
		margin: 5px 0;
	}
	.header {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
	}
	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin-right: 10px;
	}
	.info {
		display: flex;
		flex-direction: column;
	}
	.nickname {
		font-weight: bold;
		font-size: 14px;
	}
	.time {
		font-size: 12px;
		color: #999;
	}
	.content {
		font-size: 15px;
		line-height: 1.5;
		margin-bottom: 10px;
	}
	.images {
		display: flex;
		flex-wrap: wrap;
	}
	.post-img {
		width: 100px;
		height: 100px;
		margin-right: 5px;
		margin-bottom: 5px;
		border-radius: 4px;
	}
	.footer {
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
		border-top: 1px solid #eee;
		padding-top: 10px;
	}
	.action {
		font-size: 12px;
		color: #666;
	}
</style>
