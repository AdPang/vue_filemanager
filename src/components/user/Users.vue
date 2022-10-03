<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" @clear="getUserList" class="input-with-select"
                        v-model="queryInfo.search" clearable>
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="userList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="姓名" prop="userName"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="phoneNumber"></el-table-column>
                <el-table-column label="角色" prop="rolesStr"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model.number="scope.row.lockoutEnabled" @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    // eslint-disable-next-line vue/no-unused-vars
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip effect="dark" :aa="scope" content="编辑用户" placement="top" :enterable="false">
                            <el-button type="primary" size="mini" icon="el-icon-edit"
                                @click="showEditDialog(scope.row.id)"></el-button>
                        </el-tooltip>
                        <!-- 删除按钮 -->
                        <el-tooltip effect="dark" content="封停用户" placement="top" :enterable="false">
                            <el-button type="danger" size="mini" icon="el-icon-delete"
                                @click="removeUserById(scope.row.id)"></el-button>
                        </el-tooltip>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" size="mini" icon="el-icon-setting" @click="setRole(scope.row)">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pageIndex" :page-sizes="[2, 5, 7, 10]" :page-size="queryInfo.pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>

        <!-- 添加用户的对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="userName">
                    <el-input v-model="addForm.userName"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="phoneNumber">
                    <el-input v-model="addForm.phoneNumber"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户的对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名" prop="userName">
                    <el-input v-model="editForm.userName" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phoneNumber">
                    <el-input v-model="editForm.phoneNumber"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色的对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="40%" @close="setRoleDialogClosed" >
            <div>
                <p>当前的用户：{{userInfo.userName}}</p>
                <p>当前的角色：{{userInfo.rolesStr}}</p>
                <p>分配新角色：
                    <!-- 树形控件 -->
                    <el-tree :data="rolesList" :props="treeProps" show-checkbox node-key="id" default-expand-all
                        :default-checked-keys="defKeys" ref="treeRef">
                    </el-tree>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRoles">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {

    data() {
        // 验证邮箱的规则
        var checkEmail = (rule, value, callback) => {
            // 验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-0_-])+(\.[a-zA-Z0-9_-])+/
            if (regEmail.test(value)) {
                return callback()
            }
            callback(new Error('请输入合法的邮箱'))
        }
        // 验证手机号的规则
        var checkMobile = (rule, value, callback) => {
            // 验证手机号的正则表达式
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if (regMobile.test(value)) {
                return callback()
            }
            callback(new Error('请输入合法的手机号'))
        }
        return {
            // 获取用户列表的参数
            queryInfo: {
                search: '',
                // 当前的页数
                pageIndex: 1,
                pageSize: 5
            },
            userList: [],
            total: 0,
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm: {
                userName: '',
                password: '',
                email: '',
                phoneNumber: ''
            },
            // 添加用户表单的验证规则对象
            addFormRules: {
                userName: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 5, max: 10, message: '用户名的长度在 5~10 个字符之间', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '密码的长度在 6~15 个字符之间', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'change' }
                    // { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                ],
                phoneNumber: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'change' }
                    // { pattern: /^1[3|5|7|8|9]\d{9}$/, message: '请输入正确的号码格式', trigger: 'change' }
                ]
            },
            // 控制修改用户对话框的显示与隐藏
            editDialogVisible: false,
            // 查询到的用户的信息对象
            editForm: {},
            // 修改表单的验证规则对象
            editFormRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'change' },
                    { validator: checkEmail, trigger: 'blur' }
                    // { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                ],
                phoneNumber: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'change' },
                    { validator: checkMobile, trigger: 'blur' }
                    // { pattern: /^1[3|5|7|8|9]\d{9}$/, message: '请输入正确的号码格式', trigger: 'change' }
                ]
            },
            // 控制分配角色对话框的显示与隐藏
            setRoleDialogVisible: false,
            // 需要被分配角色的用户信息
            userInfo: {},
            // 所有角色的数据列表
            rolesList: [],
            // 已选中的角色Id值
            selectedRoleId: '',
            treeProps: {
                label: 'name'
            },
            defKeys : []
        }
    },

    created() {
        this.getUserList()
    },

    methods: {
        async getUserList() {
            //userManage/getAll/admin?pageIndex='+this.queryInfo.pageIndex+'&PageSize='+this.queryInfo.pageSize+'&Search='+this.queryInfo.search
            const { data: result } = await this.$http.get('userManage/getAll/admin', { params: this.queryInfo })
            if (!result.status) {
                return this.$message.error('数据获取失败')
            }
            this.userList = result.result.items
            this.total = result.result.totalCount
        },
        // 监听pagesize改变事件
        handleSizeChange(newSize) {
            // console.log(newSize)
            this.queryInfo.pageSize = newSize
            this.getUserList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            // console.log(newPage)
            this.queryInfo.pageIndex = newPage
            this.getUserList()
        },
        // 监听 switch 开关状态的改变
        async userStateChanged(userInfo) {
            // console.log(userInfo)
            const { data: result } = await this.$http.put(`/userManage/editStatus/${userInfo.id}/${!userInfo.lockoutEnabled}/admin`)
            if (!result.status) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error('更新用户状态失败！')
            }
            this.$message.success('更新用户状态成功！')
        },
        // 监听添加用户对话关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 点击按钮添加新用户
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                // 可以添加用户的网络请求
                const { data: result } = await this.$http.post('UserManage/add/admin', this.addForm)
                if (!result.status) {
                    this.$message.error('添加用户失败！')
                }
                this.$message.success('添加用户成功！')
                // 隐藏添加用户的对话框
                this.addDialogVisible = false
                // 重新获取用户列表数据
                this.getUserList()
            })
        },
        // 展示编辑用户的对话框
        async showEditDialog(id) {
            const { data: result } = await this.$http.get('userManage/get/' + id + '/admin')
            if (!result.status) {
                return this.$message.error('查询用户失败！')
            }
            this.editForm = result.result
            // console.log(this.editForm)
            this.editDialogVisible = true
        },
        // 监听修改用户对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 修改用户信息并提交
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                // 发起修改用户信息的数据请求
                const { data: result } = await this.$http.put('userManage/edit/' + this.editForm.id + '/admin', this.editForm)
                if (!result.status) {
                    return this.$message.error('更新用户信息失败')
                }
                // 关闭修改用户信息对话框
                this.editDialogVisible = false
                // 更新User列表
                this.getUserList()
                // 提示修改成功
                this.$message.success('更新用户信息成功！')
            })
        },
        // 根据id删除对应的用户
        async removeUserById(id) {
            // 弹框用户是否删除用户
            const confirmResult = await this.$confirm('此操作将封停该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 如果用户确定删除，则返回值为字符串 confirm
            // 如果用户取消删除，则返回值为字符串 cancel
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }

            const { data: result } = await this.$http.put(`/userManage/editStatus/${id}/${true}/admin`)
            if (!result.status) {
                return this.$message.error(result.message)
            }
            this.$message.success(result.message)
            this.getUserList()
        },
        // 展示分配角色的对话框
        async setRole(userInfo) {
            const promise = await this.$http.get('userManage/get/' + userInfo.id + '/admin')
            if(!promise.data.status) return this.$message.error(promise.data.result.message)
            this.userInfo = promise.data.result
            console.log(this.userInfo);
            for(let i=0;i<this.userInfo.roles.length;i++){
                this.defKeys.push(this.userInfo.roles[i].id)
            }
            // 在展示对话框之前获取所有角色的列表
            const { data: result } = await this.$http.get('/roleManage/getAll/admin')
            if (!result.status) return this.$message.error(result.message)
            this.rolesList = result.result
            console.log(this.rolesList);
            this.setRoleDialogVisible = true
        },
        // 点击按钮分配角色
        async allotRoles() {
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys()
            ]
            
            console.log(this.userInfo)
            const { data: result } = await this.$http.put(`userManage/adds/${this.userInfo.id}/admin`, keys)
            if (!result.status) return this.$message.error(result.message)
            this.$message.success('分配角色成功！')
            this.getUserList()
            this.setRoleDialogVisible = false
        },
        // 监听分配角色对话框的关闭事件
        setRoleDialogClosed() {
            this.defKeys = []
            this.selectedRoleId = ''
            this.userInfo = []
        }
    }
}
</script>

<style lang="less" scoped>

</style>
