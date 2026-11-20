import marketRecap from './starters/market-recap.json' with {type:'json'};
import companyDeepDive from './starters/company-deep-dive.json' with {type:'json'};
import marketExplainer from './starters/market-explainer.json' with {type:'json'};

export const starters = {
  'market-recap': {label:'Market recap', storyboard:marketRecap},
  'company-deep-dive': {label:'Company deep dive', storyboard:companyDeepDive},
  'market-explainer': {label:'Market explainer', storyboard:marketExplainer}
};
