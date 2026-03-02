<template>
	<view class="container">
		<view class="post-list">
			<view v-for="post in list" :key="post.id" class="post-item">
				<view class="header">
					<text class="time">{{ formatDate(post.created_at) }}</text>
					<text class="status" :class="post.status">{{ formatStatus(post.status) }}</text>
				</view>
				<view class="content">
					<text>{{ post.content }}</text>
				</view>
				<view class="reason" v-if="post.status === 'rejected'">
					<text>驳回原因: {{ post.reject_reason }}</text>
				</view>
			</view>
			<view v-if="list.length === 0" class="empty">
				<text>暂无投稿</text>
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
				page: 1
			}
		},
		onLoad() {
			this.getList();
		},
		methods: {
			async getList() {
				try {
					const res = await request({ url: '/my/posts?page=' + this.page });
					if (res && res.length > 0) {
						this.list = res;
					}
				} catch (e) {
					console.error(e);
				}
			},
			formatStatus(status) {
				const map = {
					'pending': '审核中',
					'approved': '已通过',
					'rejected': '已驳回'
				};
				return map[status] || status;
			},
			formatDate(dateStr) {
				const date = new Date(dateStr);
				return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
			}
		}
	}
</script>

<style>
	.container {
		background-color: #f8f8f8;
		min-height: 100vh;
		padding: 10px;
	}
	.post-item {
		background: #fff;
		padding: 15px;
		margin-bottom: 10px;
		border-radius: 8px;
	}
	.header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
		font-size: 12px;
		color: #999;
	}
	.status.pending { color: orange; }
	.status.approved { color: green; }
	.status.rejected { color: red; }
	.content {
		font-size: 15px;
		line-height: 1.5;
	}
	.reason {
		margin-top: 10px;
		padding: 5px;
		background: #ffebeb;
		color: red;
		font-size: 12px;
		border-radius: 4px;
	}
	.empty {
		text-align: center;
		margin-top: 50px;
		color: #999;
	}
</style>
