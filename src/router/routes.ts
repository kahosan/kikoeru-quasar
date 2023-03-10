import MainLayout from 'layouts/MainLayout.vue'
import DashboardLayout from 'layouts/DashboardLayout.vue'

import Works from 'pages/Works.vue'
import Work from 'pages/Work.vue'
import Login from 'pages/Login.vue'

// import List from 'pages/List'
// import Favourites from 'pages/Favourites'
// import About from 'pages/About'

import Folders from 'pages/Dashboard/Folders.vue'
import Scanner from 'pages/Dashboard/Scanner.vue'
import Advanced from 'pages/Dashboard/Advanced.vue'
import UserManage from 'pages/Dashboard/UserManage.vue'

import type { RouteRecordRaw } from 'vue-router'

function prefixRoutes(prefix: string, routes: RouteRecordRaw[]) {
  return routes.map((route) => {
    route.path = `${prefix}${route.path}`
    return route
  })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: DashboardLayout,
    children: [
      {
        path: '',
        component: Folders,
      },
      {
        path: 'scanner',
        component: Scanner,
      },
      {
        path: 'advanced',
        component: Advanced,
      },
      {
        path: 'usermanage',
        component: UserManage,
      },
    ],
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/Settings.vue'),
      },
      {
        path: '',
        redirect: {
          name: 'works',
        },
      },
      {
        path: 'works',
        name: 'works',
        component: Works,
      },
      {
        name: 'work',
        path: 'work/RJ:id',
        component: Work,
      },
      {
        path: 'work/:id',
        component: Work,
      },
      {
        path: 'circles',
        props: { restrict: 'circles' },
        component: () => import('pages/List.vue'),
      },
      {
        path: 'tags',
        props: { restrict: 'tags' },
        component: () => import('pages/List.vue'),
      },
      {
        path: 'vas',
        props: { restrict: 'vas' },
        component: () => import('pages/List.vue'),
      },
      {
        path: 'about',
        props: { restrict: 'about' },
        component: () => import('pages/About.vue'),
      },
      ...prefixRoutes('favourites', [
        {
          path: '',
          props: { route: 'review' },
          component: () => import('pages/Favourites.vue'),
        },
        {
          path: '/review',
          props: { route: 'review' },
          component: () => import('pages/Favourites.vue'),
        },
        ...prefixRoutes('/progress', [
          {
            path: '',
            props: { route: 'progress', progress: 'marked' },
            component: () => import('pages/Favourites.vue'),
          },
          {
            path: '/marked',
            props: { route: 'progress', progress: 'marked' },
            component: () => import('pages/Favourites.vue'),
          },
          {
            path: '/listening',
            props: { route: 'progress', progress: 'listening' },
            component: () => import('pages/Favourites.vue'),
          },
          {
            path: '/listened',
            props: { route: 'progress', progress: 'listened' },
            component: () => import('pages/Favourites.vue'),
          },
          {
            path: '/replay',
            props: { route: 'progress', progress: 'replay' },
            component: () => import('pages/Favourites.vue'),
          },
          {
            path: '/postponed',
            props: { route: 'progress', progress: 'postponed' },
            component: () => import('pages/Favourites.vue'),
          },
        ]),
        {
          path: '/folder',
          props: { route: 'folder' },
          component: () => import('pages/Favourites.vue'),
        },
      ]),
    ],
    meta: {
      auth: true,
    },
  },
  {
    path: '/login',
    component: Login,
  },
]

// Always leave this as last one

if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '/:catchAll(.*)',
    component: () => import('pages/Error404.vue'),
  })
}

export default routes
