import type { StrapiApp } from '@strapi/strapi/admin';
import Logo from './extensions/congo-builders-logo.png';

export default {
  config: {
    locales: ['fr'],
    auth: {
      logo: Logo,
    },
    menu: {
      logo: Logo,
    },
    tutorials: false,
    notifications: {
      releases: false,
    },
    theme: {
      light: {
        colors: {
          primary100: '#fbf7e5',
          primary200: '#f3e7a8',
          primary500: '#c4aa1d',
          primary600: '#b29700',
          primary700: '#8e7900',
          buttonPrimary500: '#c4aa1d',
          buttonPrimary600: '#b29700',
          buttonNeutral0: '#082d48',
          secondary100: '#fbf7e5',
          secondary200: '#f3e7a8',
          secondary500: '#b29700',
          secondary600: '#8e7900',
          secondary700: '#6d5e00',
        },
      },
      dark: {
        colors: {
          primary100: '#fbf2c2',
          primary200: '#e8d771',
          primary500: '#c4aa1d',
          primary600: '#b29700',
          primary700: '#8e7900',
          buttonPrimary500: '#c4aa1d',
          buttonPrimary600: '#b29700',
          buttonNeutral0: '#082d48',
          secondary100: '#fbf2c2',
          secondary200: '#e8d771',
          secondary500: '#c4aa1d',
          secondary600: '#aa9010',
          secondary700: '#d6c35b',
        },
      },
    },
    translations: {
      en: {
        'Auth.form.welcome.title': 'Welcome to Congo Builders',
        'Auth.form.welcome.subtitle': 'Sign in to manage the Congo Builders admin panel',
        'HomePage.head.title': 'Congo Builders Admin',
        'HomePage.header.subtitle': 'Welcome to the Congo Builders administration panel',
      },
      fr: {
        'Auth.form.welcome.title': 'Bienvenue chez Congo Builders',
        'Auth.form.welcome.subtitle': 'Connectez-vous pour gérer l’administration de Congo Builders',
        'HomePage.head.title': 'Administration Congo Builders',
        'HomePage.header.subtitle': 'Bienvenue dans l’administration de Congo Builders',
      },
    },
  },
  bootstrap(_app: StrapiApp) {},
};
