<template>
	<view class="container">
		<view class="form-item">
			<textarea v-model="content" placeholder="分享你的新鲜事..." class="textarea" maxlength="500"></textarea>
			<view class="word-count">{{ content.length }}/500</view>
		</view>
		
		<view class="form-item">
			<view class="upload-grid">
				<view class="upload-item" v-for="(img, index) in images" :key="index">
					<image :src="img" mode="aspectFill" class="upload-img" @click="previewImage(index)"></image>
					<view class="delete-btn" @click="deleteImage(index)">x</view>
				</view>
				<view class="upload-btn" @click="chooseImage" v-if="images.length < 9">
					<text class="plus">+</text>
				</view>
			</view>
		</view>
		
		<view class="form-item">
			<picker mode="selector" :range="categories" range-key="name" @change="onCategoryChange">
				<view class="picker-row">
					<text>选择板块</text>
					<text class="picker-val">{{ categories[categoryIndex] ? categories[categoryIndex].name : '请选择 >' }}</text>
				</view>
			</picker>
		</view>
		
		<view class="form-item switch-row">
			<text>匿名发布</text>
			<switch :checked="isAnonymous" @change="onAnonymousChange" color="#3cc51f" />
		</view>
		
		<button class="submit-btn" type="primary" @click="submit">立即发布</button>
	</view>
</template>

<script>
	import request from '@/common/request';
	
	export default {
		data() {
			return {
				content: '',
				images: [],
				categories: [],
				categoryIndex: -1,
				isAnonymous: false
			}
		},
		onLoad() {
			this.getCategories();
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
			onCategoryChange(e) {
				this.categoryIndex = e.detail.value;
			},
			onAnonymousChange(e) {
				this.isAnonymous = e.detail.value;
			},
			chooseImage() {
				uni.chooseImage({
					count: 9 - this.images.length,
					success: (res) => {
						const tempFilePaths = res.tempFilePaths;
						tempFilePaths.forEach((path) => {
							uni.uploadFile({
								url: 'http://localhost:3000/api/upload',
								filePath: path,
								name: 'file',
								header: {
									'Authorization': 'Bearer ' + uni.getStorageSync('token')
								},
								success: (uploadRes) => {
									const data = JSON.parse(uploadRes.data);
									if (data.url) {
										this.images.push(data.url);
									}
								}
							});
						});
					}
				});
			},
			deleteImage(index) {
				this.images.splice(index, 1);
			},
			previewImage(index) {
				uni.previewImage({
					urls: this.images,
					current: index
				});
			},
			async submit() {
				if (!this.content.trim()) return uni.showToast({ title: '请输入内容', icon: 'none' });
				if (this.categoryIndex < 0) return uni.showToast({ title: '请选择板块', icon: 'none' });
				
				try {
					await request({
						url: '/posts',
						method: 'POST',
						data: {
							category_id: this.categories[this.categoryIndex].id,
							content: this.content,
							images: this.images,
							is_anonymous: this.isAnonymous
						}
					});
					
					uni.showToast({ title: '发布成功，等待审核' });
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} catch (e) {
					console.error(e);
				}
			}
		}
	}
</script>

<style>
	.container {
		padding: 20px;
		background-color: #f8f8f8;
		min-height: 100vh;
	}
	.form-item {
		background: #fff;
		padding: 15px;
		margin-bottom: 15px;
		border-radius: 8px;
	}
	.textarea {
		width: 100%;
		height: 120px;
		font-size: 16px;
	}
	.word-count {
		text-align: right;
		color: #999;
		font-size: 12px;
	}
	.upload-grid {
		display: flex;
		flex-wrap: wrap;
	}
	.upload-item {
		position: relative;
		width: 80px;
		height: 80px;
		margin-right: 10px;
		margin-bottom: 10px;
	}
	.upload-img {
		width: 100%;
		height: 100%;
		border-radius: 4px;
	}
	.delete-btn {
		position: absolute;
		top: -5px;
		right: -5px;
		background: red;
		color: #fff;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		text-align: center;
		line-height: 16px;
		font-size: 12px;
	}
	.upload-btn {
		width: 80px;
		height: 80px;
		background: #f0f0f0;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 4px;
	}
	.plus {
		font-size: 30px;
		color: #999;
	}
	.picker-row, .switch-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 16px;
	}
	.picker-val {
		color: #666;
	}
	.submit-btn {
		margin-top: 30px;
		background-color: #3cc51f;
	}
</style>
