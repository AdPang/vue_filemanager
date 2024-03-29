import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Roles from '../components/power/Roles.vue'
import Welcome from '../components/Welcome.vue'
import Menus from '../components/power/Menus.vue'
import Users from '../components/user/Users.vue'
import File from '../components/cloud/file.vue'
import Share from '../components/cloud/share.vue'
import Client from '../components/client/ClientDownload.vue'
import LocalFile from '../components/local/LocalFile.vue'
import Disk from '../components/local/Disk.vue'
import AccountManage from '../components/personcenter/AccountManage.vue';
import PersonInfoManage from '../components/personcenter/PersonInfoManage.vue';

Vue.use(Router)

const routes = [{
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/menus',
        component: Menus
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/file',
        component: File
      },
      {
        path: '/share',
        component: Share
      },
      { 
        path: '/clientDownload',
        component: Client
      },
      {
        path: '/localFile',
        component: LocalFile
      },
      {
        path: '/disk',
        component: Disk
      },
      {
        path: '/infoManage',
        component: PersonInfoManage
      },
      {
        path: '/account',
        component: AccountManage
      }
    ]
  },
]



const router = new Router({
  routes
})

const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}


// 路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径来
  // next 是一个函数，表示放行
  // next()放行 next('/login) 强制跳转
  // if (to.path === '/login') return next()
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  if (to.path === '/login' || to.path === '/') {
    if (!tokenStr) return next()
    else return next('/home')
  }
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router