<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="header">
          <h2>校园墙管理后台</h2>
        </div>
      </template>
      <el-form :model="form" label-width="60px">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入管理员账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password @keyup.enter="login" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login" :loading="loading" style="width: 100%">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import SHA256 from 'crypto-js/sha256'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const login = async () => {
  if (!form.username || !form.password) return ElMessage.warning('请输入账号密码')
  
  loading.value = true
  try {
    // Encrypt username and password before sending
    const encryptedData = {
      username: SHA256(form.username).toString(),
      password: SHA256(form.password).toString()
    }
    
    const res = await axios.post('/api/admin/login', encryptedData)
    localStorage.setItem('token', res.data.token)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.login-card {
  width: 400px;
}
.header {
  text-align: center;
}
</style>
