<template>
  <!-- Home -->
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/headerLogo.png" alt="" />
        <span>文件管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">
          <i :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'">{{
            isCollapse ? "打开" : "收起"
          }}</i>
        </div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu
            :index="String(item.id)"
            v-for="item in menulist"
            
            :key="item.id"
          >
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="'iconfont ' + item.iconStr"></i>
              <!-- 文本 -->
              <span>{{ item.menuName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.uri"
              v-for="subItem in item.childrenMenu"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.uri)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i :class="'iconfont ' + subItem.iconStr"></i>
                <!-- 文本 -->
                <span>{{ subItem.menuName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
  

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 是否折叠
      isCollapse: false,
      // 激活路径
      activePath: "",
    };
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const {data:res} = await this.$http.get('menu/get')
      if (res.status !== true) return this.$message.error(res.meta.data.msg)
      this.menulist = res.result
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
};
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }
  
  .el-main {
    background-color: #eaedf1;
  }
  
  .iconfont {
    margin-right: 10px;
  }
  
  .toggle-button {
    background-color: #4a5064;
    //font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    //letter-spacing: 0.2em;
    cursor: pointer;
  }
  </style>
  