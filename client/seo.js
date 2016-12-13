import { FlowRouterSEO } from 'meteor/tomwasd:flow-router-seo';

export const SEO = new FlowRouterSEO({});

SEO.setDefaults({
  title: 'Accessibility Cloud',
  description: 'Let’s collect more accessible places together.',
  meta: {
    'property="og:type"': 'website',
    'property="og:site_name"': 'Accessibility Cloud',
    'name="twitter:card"': '@a11ycloud',
    'name="twitter:site"': '@a11ycloud',
  },
});
