<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary" @click="addRootMenu">添加根菜单</el-button>
      <el-table :data="rigthsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="权限名称" prop="menuName"></el-table-column>
        <el-table-column label="路径" prop="uri"></el-table-column>
        <el-table-column label="权限等级" prop="menuLevel">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.menuLevel === 0">一级权限</el-tag>
            <el-tag type="success" v-else-if="scope.row.menuLevel === 1">二级权限</el-tag>
            <el-tag type="warning" v-else>三级权限</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="权限等级" prop="menuLevel">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editMenuInfo(scope.row.id)">编辑</el-button>
            <el-button type="success" v-if="scope.row.menuLevel === 0 || scope.row.menuLevel === 1" size="mini"
              icon="el-icon-circle-plus" @click="addChildMenu(scope.row.id)">添加子菜单</el-button>
            <el-button type="danger" v-if="!scope.row.hasChildrenMenu" size="mini" icon="el-icon-delete"
              @click="deleteMenu(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="编辑菜单" :visible.sync="editMenuDialogVisible" width="40%" @close="editMenuDialogClosed">
      <el-form :model="editMenuForm" :rules="menuFormRules" ref="editMenuFormRef" label-width="100px">
        <el-form-item label="菜单名" prop="menuName">
          <el-input v-model="editMenuForm.menuName"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="uri">
          <el-input v-model="editMenuForm.uri"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="iconStr">
          <el-input v-model="editMenuForm.iconStr"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editMenuDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMenuSave">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="
      addMenuForm.parentMenuId === undefined ||
      addMenuForm.parentMenuId === null
        ? '添加菜单'
        : '添加子菜单'
    " :visible.sync="addMenuDialogVisible" width="40%" @close="addMenuDialogClosed">
      <el-form :model="addMenuForm" :rules="menuFormRules" ref="addMenuFormRef" label-width="100px">
        <el-form-item label="菜单名" prop="menuName">
          <el-input v-model="addMenuForm.menuName"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="uri">
          <el-input v-model="addMenuForm.uri"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="iconStr">
          <el-input v-model="addMenuForm.iconStr"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editMenuDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMenuSave">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 权限列表
      rigthsList: [],
      editMenuDialogVisible: false,
      menuFormRules: {
        menuName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
      editMenuForm: {},
      addMenuDialogVisible: false,
      addMenuForm: {
        iconStr: "",
        uri: "",
        menuName: "",
      },
    };
  },

  created() {
    // 获取所有的权限
    this.getRightsList();
  },

  methods: {
    // 获取权限列表
    async getRightsList() {
      const { data: result } = await this.$http.get("menu/gets/admin");
      if (!result.status) {
        return this.$message.error("获取权限列表失败");
      }
      this.rigthsList = result.result;
      console.log(this.rigthsList);
    },
    async editMenuInfo(menuId) {
      this.editMenuDialogVisible = true;
      const { data: result } = await this.$http.get(
        "menu/get/" + menuId + "/admin"
      );
      if (!result.status) {
        return this.$message.error(result.message);
      }
      this.editMenuForm = result.result;
      console.log(this.editMenuForm);
    },
    async addChildMenu(parentMenuId) {
      this.addMenuDialogVisible = true;
      this.addMenuForm.parentMenuId = parentMenuId;
    },
    async deleteMenu(menuId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该菜单, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm")
        return this.$message.info("取消了删除！");
      const { data: result } = await this.$http.delete(
        "menu/delete/" + menuId + "/admin"
      );
      if (!result.status) return this.$message.error(result.message);
      this.getRightsList();
      return this.$message.success("删除成功");
    },
    editMenuDialogClosed() {
      this.$refs.editMenuFormRef.resetFields();
    },
    addMenuDialogClosed() {
      this.$refs.addMenuFormRef.resetFields();
    },
    async editMenuSave() {
      const { data: result } = await this.$http.put(
        "menu/edit/admin",
        this.editMenuForm
      );
      if (!result.status) return this.$message.error(result.message);
      this.getRightsList();
      this.editMenuDialogVisible = false;
      return this.$message.success("修改成功");
    },
    async addMenuSave() {
      const { data: result } = await this.$http.post(
        "menu/add/admin",
        this.addMenuForm
      );
      if (!result.status) return this.$message.error(result.message);
      this.getRightsList();
      this.addMenuDialogVisible = false;
      return this.$message.success("添加成功");
    },
    async addRootMenu() {
      this.addMenuDialogVisible = true;
    },
  },
};
</script>

<style>

</style>