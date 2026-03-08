<template>
	<view class="container">
		<view class="post-detail" v-if="post">
			<view class="header">
				<image :src="post.avatar_url || '/static/default-avatar.png'" class="avatar"></image>
				<view class="info">
					<text class="nickname">{{ post.is_anonymous ? '匿名用户' : post.nickname }}</text>
					<text class="time">{{ formatDate(post.created_at) }}</text>
				</view>
			</view>
			
			<view class="content">
				<text>{{ post.content }}</text>
			</view>
			
			<view class="price-tag" v-if="post.price">
				<text>¥ {{ post.price }}</text>
			</view>

			<view class="images" v-if="post.images && post.images.length">
				<image v-for="(img, idx) in post.images" :key="idx" :src="img" mode="widthFix" class="post-img" @click="previewImage(idx)"></image>
			</view>
			
			<view class="stats">
				<text>浏览 {{ post.views }}</text>
				<view class="right">
					<view class="action-btn" @click="like">
						<text :class="{active: isLiked}">👍 {{ post.likes }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<view class="comment-section">
			<view class="section-title">评论 ({{ comments.length }})</view>
			<view class="comment-list">
				<view class="comment-item" v-for="(item, index) in comments" :key="index">
					<image :src="item.avatar_url || '/static/default-avatar.png'" class="c-avatar"></image>
					<view class="c-content">
						<view class="c-header">
							<text class="c-name">{{ item.is_anonymous ? '匿名用户' : item.nickname }}</text>
							<text class="c-time">{{ formatDate(item.created_at) }}</text>
						</view>
						<text class="c-text">{{ item.content }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<view class="footer-input">
			<input class="input" v-model="commentContent" placeholder="写下你的评论..." confirm-type="send" @confirm="submitComment" />
			<button class="send-btn" @click="submitComment" :disabled="!commentContent">发送</button>
		</view>
	</view>
</template>

<script>
	import request from '@/common/request';
	
	export default {
		data() {
			return {
				post: null,
				comments: [],
				commentContent: '',
				isLiked: false
			}
		},
		onLoad(options) {
			if (options.id) {
				this.getDetail(options.id);
			}
		},
		methods: {
			async getDetail(id) {
				try {
					const res = await request({ url: '/posts/' + id });
					this.post = res;
					this.comments = res.comments || [];
				} catch (e) {
					console.error(e);
				}
			},
			async like() {
				if (!this.post) return;
				try {
					const res = await request({
						url: '/posts/like',
						method: 'POST',
						data: { post_id: this.post.id }
					});
					if (res.liked) {
						this.post.likes++;
						this.isLiked = true;
					} else {
						this.post.likes--;
						this.isLiked = false;
					}
				} catch (e) {
					console.error(e);
				}
			},
			async submitComment() {
				if (!this.commentContent.trim()) return;
				try {
					await request({
						url: '/posts/comment',
						method: 'POST',
						data: { 
							post_id: this.post.id, 
							content: this.commentContent,
							is_anonymous: false
						}
					});
					this.commentContent = '';
					this.getDetail(this.post.id); // Reload
					uni.showToast({ title: '评论成功' });
				} catch (e) {
					console.error(e);
				}
			},
			previewImage(index) {
				uni.previewImage({
					urls: this.post.images,
					current: index
				});
			},
			formatDate(dateStr) {
				if (!dateStr) return '';
				const date = new Date(dateStr);
				return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
			}
		}
	}
</script>

<style>
	.container {
		padding-bottom: 60px;
		background-color: #f8f8f8;
		min-height: 100vh;
	}
	.post-detail {
		background: #fff;
		padding: 20px;
		margin-bottom: 20px;
	}
	.price-tag {
		color: #ff4d4f;
		font-size: 20px;
		font-weight: bold;
		margin: 10px 0;
	}
	.header {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
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
		font-size: 16px;
		line-height: 1.6;
		margin-bottom: 15px;
	}
	.post-img {
		width: 100%;
		border-radius: 4px;
		margin-bottom: 10px;
	}
	.stats {
		display: flex;
		justify-content: space-between;
		color: #999;
		font-size: 12px;
		border-top: 1px solid #eee;
		padding-top: 10px;
	}
	.action-btn {
		padding: 0 10px;
	}
	.active {
		color: #3cc51f;
	}
	.comment-section {
		background: #fff;
		padding: 15px;
	}
	.section-title {
		font-weight: bold;
		margin-bottom: 10px;
		border-left: 3px solid #3cc51f;
		padding-left: 10px;
	}
	.comment-item {
		display: flex;
		margin-bottom: 15px;
		border-bottom: 1px solid #eee;
		padding-bottom: 10px;
	}
	.c-avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		margin-right: 10px;
	}
	.c-content {
		flex: 1;
	}
	.c-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 5px;
	}
	.c-name {
		font-size: 13px;
		color: #666;
	}
	.c-time {
		font-size: 11px;
		color: #ccc;
	}
	.c-text {
		font-size: 14px;
	}
	.footer-input {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 10px;
		display: flex;
		border-top: 1px solid #eee;
	}
	.input {
		flex: 1;
		background: #f0f0f0;
		height: 36px;
		border-radius: 18px;
		padding: 0 15px;
		margin-right: 10px;
	}
	.send-btn {
		width: 70px;
		height: 36px;
		line-height: 36px;
		background: #3cc51f;
		color: #fff;
		font-size: 14px;
		padding: 0;
		border-radius: 18px;
	}
</style>
