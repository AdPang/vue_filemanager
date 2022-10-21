<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>云盘管理</el-breadcrumb-item>
      <el-breadcrumb-item>分享管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="card">
      <div class="content">
        <div id="dataset-label-visual-container" class="mytree">
          <el-tree
            :data="dataList"
            :indent="0"
            node-key="id"
            :props="defaultProps"
            :default-expand-all="true"
            :expand-on-click-node="false"
            class="filter-tree"
            @node-click="fileListChange"
          >
          </el-tree>
        </div>

        <div class="fileList">
          <el-table>
            
          </el-table>
        </div>
      </div>
      
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataList: [],
      defaultProps: {
        label: 'dirName',
        children: 'childrenDirInfo'
      },
      fileList: []
    }
  },
  created() {
    // 获取所有的权限
    this.getCloudDirInfo();
  },
  methods: {
    async getCloudDirInfo(){
      const {data: result} = await this.$http.get('DirInfo/Get?PageIndex=0&PageSize=999999');
      if (!result.status) {
        return this.$message.error(result.message);
      }
      this.dataList = [];
      this.dataList.push(result.result);
      this.fileListChange(result.result,null,null)
      console.log(this.dataList);
    },
    async fileListChange(info,node,component){
      this.fileList = [];
      const {data: result} = info.parentDirInfoId===null ? await this.$http.get('dirinfo/GetDir/') : await this.$http.get('dirinfo/GetDir?dirId=' + info.id);
      
      for(var item of result.result.childrenFileInfo){
        this.fileList.push(item)
      }
      for(var item of result.result.childrenDirInfo){
        this.fileList.push(item)
      }
      console.log(this.fileList);
    }
  },
};
</script>

<style lang="less" scoped>
.card{
  position: relative;
  height: auto;
  min-height: 750px;
}
.fileList{
  float: left;
  width:80%;
  margin-left: 15%;
  height: 90%;
  position: absolute;
}
.mytree /deep/ {
  width: 15%;
  float: left;
  overflow: hidden;
  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  .el-tree-node {
    position: relative;
    padding-left: 16px;
  }

  .el-tree-node__expand-icon.is-leaf {
    display: none;
  }

  .el-tree-node__children {
    padding-left: 25px;
  }

  .el-tree-node :last-child:before {
    height: 38px;
  }

  .el-tree > .el-tree-node:before {
    border-left: none;
  }

  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  .el-tree-node:before {
    content: "";
    left: -4px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .el-tree-node:after {
    content: "";
    left: -4px;
    position: absolute;
    right: auto;
    border-width: 5px;
  }

  .el-tree-node:before {
    border-left: 2px dashed #b8b9bb;
    bottom: 0px;
    height: 100%;
    top: -26px;
    width: 1px;
  }

  .el-tree-node:after {
    border-top: 2px dashed #b8b9bb;
    height: 30px;
    top: 12px;
    width: 28px;
  }

  .el-tree-node__label {
    font-size: 20px;
  }

  .el-tree-node__content {
    margin-left: 10px;
    margin-top: 5px;
  }
}
</style>
    