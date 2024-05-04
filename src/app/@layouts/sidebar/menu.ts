import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'Menú Principal', // 'MENUITEMS.MENU.TEXT',
    isTitle: true
  },
  {
    id: 2,
    label: 'Tablero',
    icon: 'bx-home-circle',
    // badge: {
    //   variant: 'info',
    //   text: 'MENUITEMS.DASHBOARDS.BADGE',
    // },
    subItems: [
      {
        id: 1,
        label: 'Tablero',
        link: '/',
        parentId: 2
      },
    ]
  },
  {
    id: 3,
    label: 'Ventas',
    icon: 'bx-dollar-circle',
    subItems: [
      {
        id: 1,
        label: 'Ventas',
        link: '/sales/list',
        parentId: 3
      }
    ]
  },
  {
    id: 4,
    label: 'Ordenes',
    icon: 'bx-note',
    subItems: [
      {
        id: 1,
        label: 'CVA',
        link: '/orders/cva/list',
        parentId: 4
      },{
        id: 2,
        label: 'CT',
        link: '/orders/ct/list',
        parentId: 4
      },{
        id: 2,
        label: 'Syscom',
        link: '/orders/syscom/list',
        parentId: 4
      },
    ]
  },
  {
    id: 5,
    label: 'Cobros',
    icon: 'bx-credit-card',
    subItems: [
      {
        id: 1,
        label: 'Openpay',
        link: '/charges/openpay/list',
        parentId: 5
      },{
        id: 2,
        label: 'Stripe',
        link: '/charges/stripe/list',
        parentId: 5
      },
    ]
  },
  {
    id: 6,
    label: 'Catálogos',
    icon: 'bx-collection',
    subItems: [
      {
        id: 1,
        label: 'Marcas',
        link: '/brands',
        parentId: 6
      },
      {
        id: 2,
        label: 'Grupos',
        link: '/groups',
        parentId: 6
      },
      {
        id: 3,
        label: 'Categorías',
        link: '/categories',
        parentId: 6
      },
      {
        id: 4,
        label: 'Productos',
        link: '/products',
        parentId: 6
      },
      {
        id: 5,
        label: 'Usuarios',
        link: '/users',
        parentId: 6
      },
      {
        id: 6,
        label: 'Cupones',
        link: '/cupons',
        parentId: 6
      },
      {
        id: 7,
        label: 'Configuraciones',
        link: '/config',
        parentId: 6
      },
      {
        id: 8,
        label: 'Clientes',
        link: '/clients',
        parentId: 6
      },
      {
        id: 9,
        label: 'Cupones Bienvenida',
        link: '/welcomes',
        parentId: 6
      },
    ]
  },
  {
    id: 7,
    isLayout: true
  },

];

