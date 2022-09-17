<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="roleList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '','vcenter']" v-for="(item1,i1) in scope.row.menus" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.menuName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环嵌套渲染二级权限 -->
                                <el-row :class="[i2 === 0 ? '' : 'bdtop','vcenter']" v-for="(item2,i2) in item1.childrenMenu" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.menuName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3) in item2.childrenMenu " :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                                            {{item3.menuName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="name"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
                        <el-button type="warning" size="mini" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="40%" @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="40%" @close="addRoleDialogClosed">
            <el-form :model="addRoleForm" :rules="RoleFormRules" ref="addRoleFormRef" label-width="100px">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="addRoleForm.name"></el-input>
            </el-form-item>
          </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="40%" @close="editRoleDialogClosed">
          <el-form :model="editRoleForm" :rules="RoleFormRules" ref="editRoleFormRef" label-width="100px">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="editRoleForm.name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
              <el-button @click="editRoleDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editRole">确 定</el-button>
          </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限列表
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'menuName',
        children: 'childrenMenu'
      },
      // 默认选中的节点Id值
      defKeys: [],
      // 当前即将分配权限的id
      roleId: '',
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 添加角色表单数据
      addRoleForm: {
        name: ''
      },
      // 角色表单规则
      RoleFormRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 控制修改角色对话框的显示与隐藏标志位
      editRoleDialogVisible: false,
      // 修改角色表单数据
      editRoleForm: {}
    }
  },

  created () {
    this.getRolesList()
  },

  methods: {
    // 获取所有角色列表
    async getRolesList () {
      const { data: result } = await this.$http.get('RoleManage/Gets/admin?PageIndex=0&PageSize=100000')
      
      if (result.status !== true) return this.$message.error('获取角色列表失败')
      this.roleList = result.result.items
    },
    // 根据Id删除对应的权限
    async removeRightById (role, rightId) {
      // 弹框提示用户是否删除用户
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除！')

      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: result } = await this.$http.get('menu/tree/admin')
      if (result.status !== true) return this.$message.error('获取权限数据失败')
      // 把获取到的权限数据保存到data中
      this.rightslist = result.result
      // 递归获取三级节点的Id
      console.log(role.menus);
      this.getLeafKeys(role.menus, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有的三级权限的id，保存到defKeys数组中
    getLeafKeys (nodes, arr) {
      for(let i = 0; i < nodes.length; i++) {
        if(nodes[i].menuLevel === 2){
          console.log(nodes[i].menuName);
            
          arr.push(nodes[i].id)
        }
        if(nodes[i].childrenMenu.length > 0){
          this.getLeafKeys(nodes[i].childrenMenu,arr)
        }
        
      }
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        //...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const { data: result } = await this.$http.put(`menu/edit/${this.roleId}/admin`, keys)
      if (!result.status) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 添加角色对话框关闭事件
    addRoleDialogClosed () {
      this.addRoleForm = {}
    },
    // 添加角色对话框的确定按钮添加角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        // 可以添加角色的网络请求
        const { data: result } = await this.$http.post('roleManage/add/admin', this.addRoleForm)
        if (!result.status) return this.$message.error(result.message)
        this.$message.success('添加成功！')
        this.addRoleDialogVisible = false
        this.getRolesList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      const { data: result } = await this.$http.get('RoleManage/' + id + '/admin')
      if (result.status !== true) return this.$message.error(result.message)
      this.editRoleForm = result.result
      this.editRoleForm.id = id
      this.editRoleDialogVisible = true
    },
    // 修改角色对话框的确定按钮修改角色
    editRole () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.put(
          'RoleManage/Edit/admin',
          { 'Name': this.editRoleForm.name, 'Id': this.editRoleForm.id }
        )
        if (result.status !== true) return this.$message.error('修改失败！')
        this.getRolesList()
        this.editRoleDialogVisible = false
        this.$message.success(result.message)
      })
    },
    // 监听修改角色对话框关闭事件
    editRoleDialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 根据角色id删除角色
    async removeRoleById (roleId) {
      // 弹框提示是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('取消了删除！')

      const { data: result } = await this.$http.delete(`RoleManage/Delete/`+roleId+`/admin`)
      if (!result.status) return this.$message.error(result.message)
      this.$message.success('删除成功')
      this.getRolesList()
    }

  }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

.vcenter {
    display: flex;
    align-items: center;
}
</style>
