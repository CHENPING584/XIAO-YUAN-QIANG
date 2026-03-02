<template>
  <div class="audit-container">
    <div class="header">
      <h2>投稿审核</h2>
      <el-button type="primary" @click="loadData">刷新</el-button>
    </div>
    
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="nickname" label="发布者" width="120">
        <template #default="scope">
          {{ scope.row.nickname }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
      <el-table-column label="图片" width="200">
        <template #default="scope">
          <div class="images" v-if="scope.row.images">
            <el-image 
              v-for="(img, idx) in scope.row.images" 
              :key="idx" 
              :src="img" 
              :preview-src-list="scope.row.images"
              style="width: 50px; height: 50px; margin-right: 5px; border-radius: 4px;" 
              fit="cover"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="提交时间" width="180">
        <template #default="scope">
          {{ new Date(scope.row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="success" @click="handleApprove(scope.row)">通过</el-button>
          <el-button size="small" type="danger" @click="handleReject(scope.row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 驳回弹窗 -->
    <el-dialog v-model="rejectDialogVisible" title="驳回原因">
      <el-input v-model="rejectReason" type="textarea" placeholder="请输入驳回原因" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject">确认驳回</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentRow = ref(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/admin/posts?status=pending', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    tableData.value = res.data.list
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleApprove = async (row) => {
  try {
    await axios.post('/api/admin/posts/audit', { id: row.id, status: 'approved' }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    ElMessage.success('已通过')
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleReject = (row) => {
  currentRow.value = row
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value) return ElMessage.warning('请输入原因')
  
  try {
    await axios.post('/api/admin/posts/audit', { 
      id: currentRow.value.id, 
      status: 'rejected',
      reject_reason: rejectReason.value
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.audit-container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
