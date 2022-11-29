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
          <el-button icon="el-icon-top" circle @click="gotoPartentDir"></el-button>
          <el-button type="primary" @click="newDirDialogVisible = true">新建文件夹</el-button>
          <!-- <el-button type="primary">上传<i class="el-icon-upload el-icon--right"></i></el-button> -->
          <!-- <el-button type="danger" icon="el-icon-delete">删除选中项</el-button> -->
          <el-table :data="fileList" ref="multipleTable"
            @row-dblclick="tableDoubleClick"
            tooltip-effect="dark"
            height="700"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            >
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column label="文件名">
              <template slot-scope="scope">
                <span v-if="scope.row.dirName === undefined">
                  {{ scope.row.fileName }}
                </span>
                <span v-else>
                  {{ scope.row.dirName }}
                </span>
                <!-- <i class="el-icon-edit-outline el-icon--right" style="cursor:pointer ;" @click="reName(scope.row)" data-toggle="tooltip" title="重命名"></i> -->
              </template>
            </el-table-column>
            <el-table-column label="文件类型">
              <template slot-scope="scope">
                <span v-if="scope.row.realFileInfo !== undefined">
                  {{scope.row.realFileInfo.fileType}}
                </span>
                <span v-else>
                  文件夹
                </span>
              </template>
            </el-table-column>
            <el-table-column label="文件大小">
              <template slot-scope="scope">
                <span v-if="scope.row.realFileInfo !== undefined">
                  {{scope.row.realFileInfo.fileLength}}
                </span>
              </template>
            </el-table-column>
            
            
          </el-table>
        </div>
      </div>
      
    </el-card>


    <el-dialog :title="'新建文件夹'" width="40%" @close="newDirDialogClosed" :visible.sync="newDirDialogVisible">
      <el-form :model="newDirForm" :rules="dirFormRules" ref="newDirFormRef" label-width="100px">
        <el-form-item label="文件夹名" prop="dirName">
          <el-input v-model="newDirForm.dirName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newDirDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="newDirSave">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var validateDirname = (rule, value, callback) => {
        let re = /[\\\/\"\|\<\>\:\?\*]/
        if (re.test(value)) {
          callback(new Error('文件名不允许出现"\\、\/、\"、<、>、|、?、*"这些字符'));
        } else {
          callback();
        }
      };
    return {
      dataList: [],
      defaultProps: {
        label: 'dirName',
        children: 'childrenDirInfo'
      },
      fileList: [],
      multipleFileSelection: [],
      currentShowDirInfo: {},
      newDirDialogVisible: false,
      newDirForm: {
        dirName: ''
      },
      reNameDirDialogVisible: false,
      reNameDirForm: {},
      dirFormRules: {
        dirName: [
          { required: true, message: "请输入文件夹名", trigger: "blur" },
          { validator: validateDirname, trigger: 'blur' }
        ],
      },
      
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
      const {data: result} = !info||info.parentDirInfoId===null||!info.parentDirInfoId ? await this.$http.get('dirinfo/GetDir/') : await this.$http.get('dirinfo/GetDir?dirId=' + info.id);

      for(var item of result.result.childrenDirInfo){
        this.fileList.push(item)
      }
      for(var item of result.result.childrenFileInfo){
        this.fileList.push(item)
      }
      
      this.currentShowDirInfo = info;
    },
    handleSelectionChange(val) {
      this.multipleFileSelection = val;
    },
    reName(row){
      console.log(row);
    },
    tableDoubleClick(row){
      if(row.realFileInfo === undefined)
        this.fileListChange(row,null,null);
    },
    gotoPartentDir(){
      if(this.currentShowDirInfo.parentDirInfoId!==undefined && this.currentShowDirInfo.parentDirInfoId!== null){
        // console.log(this.currentShowDirInfo.id);
        // console.log(this.dataList);
        let node = this.findNode(this.dataList[0],this.currentShowDirInfo.parentDirInfoId);
        console.log(node);
        this.fileListChange(node,null,null);
      }
    },
    findNode(root,nodeId){
      if(root === null) return null;
      if(root.id == nodeId) return root;
      else if(root.childrenDirInfo !== null && root.childrenDirInfo.length>0){
        let result = null;
        
        for(var item of root.childrenDirInfo){
          if(result !== null) break;
          result = this.findNode(item,nodeId);
        }
        return result;
      }
      return null;
    },
    newDirSave(){
      this.$refs.newDirFormRef.validate(async valid => {
        if (!valid) return;
        if(this.currentShowDirInfo.parentDirInfoId===null){
          const {data: result} = await this.$http.post('dirInfo/add',{dirName:this.newDirForm.dirName})
          if(!result.status){
            return this.$message.error(result.message)
          }
          this.$message.success("创建文件夹成功！")
          this.getCloudDirInfo();
        }else{
          const {data: result} =this.$http.post('dirInfo/add',{dirName:this.newDirForm.dirName,parentDirInfoId:this.currentShowDirInfo.id})
          if(!result.status){
            return this.$message.error("创建文件夹成功！")
          }
          this.$message.success(result.message)
          this.getCloudDirInfo();
        }
        this.newDirDialogVisible = false;
      })
      
    },
    newDirDialogClosed(){
      this.$refs.newDirFormRef.resetFields();
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
  padding: 10px;
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
    