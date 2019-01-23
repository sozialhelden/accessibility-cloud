import { FlowRouterSEO } from 'meteor/tomwasd:flow-router-seo';

export const SEO = new FlowRouterSEO({});

SEO.setDefaults({
  title: 'accessibility.cloud',
  description: 'Let’s collect more accessible places together.',
  meta: {
    'property="og:type"': 'website',
    'property="og:site_name"': 'accessibility.cloud',
    'name="twitter:card"': '@a11ycloud',
    'name="twitter:site"': '@a11ycloud',
  },
});
