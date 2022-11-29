<template>
  <div>
    <h1>客户端下载页面</h1>
    <el-button type="primary" @click="clientDownload">下载客户端</el-button>

  </div>
</template>

<script>
import axios from 'axios'
export default {
  data(){
    return {

    }
  },
  methods: {
    async clientDownload(){

      
      axios({
        method: "GET",
        url: this.$http.defaults.baseURL + "client/downloadClient",
        headers: {
          'Authorization': "Bearer " + window.sessionStorage.getItem('token')
        },
        responseType: 'blob',
      }).then(res => {
        console.log(res)
        if(res.status === 200) {
          console.log(res)
          const blob = new Blob([res.data])
          const downloadElement = document.createElement('a');
          const href = window.URL.createObjectURL(blob); //创建下载的链接
          downloadElement.href = href;
          downloadElement.download = '客户端.zip'; //下载后文件名
          document.body.appendChild(downloadElement);
          downloadElement.click(); //点击下载
          document.body.removeChild(downloadElement); //下载完成移除元素
          window.URL.revokeObjectURL(href); //释放掉blob对象
        }
      });

    }
  }
}
</script>

<style>

</style>