# PWA Studio Pagebuilder `*.targetables.js` plugins

Allows to use `.targetables.js` for `@magento/pagebuilder` components.

## Usage Example

Yours `local-intercept.js`
```javascript
const { ExtendPagebuilderComponentIntercept } = require('@collab/pwa-studio-pagebuilder-component-targetables');
const { Targetables } = require('@magento/pwa-buildpack');

module.exports = targets => {
  const targetables = Targetables.using(targets);
  // Use of @collab/pwa-studio-pagebuilder-component-targetables to allow easier overwrites of pagebuilder component targetables
  const extendPagebuilderComponentIntercept = new ExtendPagebuilderComponentIntercept(targetables);
  extendPagebuilderComponentIntercept.allowCustomTargetables().then(() => console.log('Pagebuilder targetables added'));
}
```

*Big shoutout to [Lars Roettig](https://github.com/larsroettig) for [@larsroettig/component-targetables](https://github.com/larsroettig/component-targetables) - he basically did all the work, this package just references other than `venia-ui`, pagebuilder related package during build process.*

## Api Documentation
### allowCustomTargetables

**allowCustomTargetables**(`targetablesSearchPaths?`, `fileExtension?`, `magentoPath?`): `void`

Allows to place a custom targetable with given matching filepattern.

#### Parameters

| Name | Type | Default value                               |
| :------ | :------ |:--------------------------------------------|
| `fileExtendsion` | `string` | `'*.targetables.js'`                        |
| `targetablesSearchPaths` | `string[]`| `['src/pagebuilder']` |
| `magentoPath` | `string` | `'node_modules/@magento'`                   |

#### Returns

`void`
