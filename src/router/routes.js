import MainLayout from 'layouts/MainLayout'
// import DashboardLayout from 'layouts/DashboardLayout'

import Works from 'pages/Works'
import Work from 'pages/Work'
// import List from 'pages/List'
import Login from 'pages/Login'
// import Favourites from 'pages/Favourites'
// import About from 'pages/About'

// import Folders from 'pages/Dashboard/Folders'
// import Scanner from 'pages/Dashboard/Scanner'
// import Advanced from 'pages/Dashboard/Advanced'
// import UserManage from 'pages/Dashboard/UserManage'

function prefixRoutes(prefix, routes) {
  return routes.map((route) => {
    route.path = prefix + '' + route.path;
    return route;
  });
}

const routes = [
  {
    path: '/admin',
    component: () => import('layouts/DashboardLayout'),
    children: [
      {
        path: '',
        component: () => import('pages/Dashboard/Folders')
      },
      {
        path: 'scanner',
        component: () => import('pages/Dashboard/Scanner')
      },
      {
        path: 'advanced',
        component: () => import('pages/Dashboard/Advanced')
      },
      {
        path: 'usermanage',
        component: () => import('pages/Dashboard/UserManage')
      }
    ]
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: {
          name: 'works'
        }
      },
      {
        path: 'works',
        name: 'works',
        component: Works
      },
      {
        path: 'work/:id',
        component: Work
      },
      {
        path: 'circles',
        props: { restrict: "circles" },
        component: () => import('pages/List')
      },
      {
        path: 'tags',
        props: { restrict: "tags" },
        component: () => import('pages/List')
      },
      {
        path: 'vas',
        props: { restrict: "vas" },
        component: () => import('pages/List')
      },
      {
        path: "about",
        props: { restrict: "about" },
        component: () => import('pages/About')
      },
      ...prefixRoutes('favourites', [
        {
          path: '',
          props: { route: 'review'},
          component: () => import('pages/Favourites'),
        },
        {
          path: '/review',
          props: { route: 'review'},
          component: () => import('pages/Favourites'),
        },
        ...prefixRoutes('/progress', [
          {
            path: '',
            props: { route: 'progress', progress: 'marked'},
            component: () => import('pages/Favourites'),
          },
          {
            path: '/marked',
            props: { route: 'progress', progress: 'marked'},
            component: () => import('pages/Favourites'),
          },
          {
            path: '/listening',
            props: { route: 'progress', progress: 'listening'},
            component: () => import('pages/Favourites'),
          },
          {
            path: '/listened',
            props: { route: 'progress', progress: 'listened'},
            component: () => import('pages/Favourites'),
          },
          {
            path: '/replay',
            props: { route: 'progress', progress: 'replay'},
            component: () => import('pages/Favourites'),
          },
          {
            path: '/postponed',
            props: { route: 'progress', progress: 'postponed'},
            component: () => import('pages/Favourites'),
          },
        ]),
        {
          path: '/folder',
          props: { route: 'folder'},
          component: () => import('pages/Favourites'),
        },
      ]),
    ],
    meta: {
      auth: true
    }
  },
  {
    path: '/login',
    component: Login
  }
]

// Always leave this as last one
// eslint-disable-next-line
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
