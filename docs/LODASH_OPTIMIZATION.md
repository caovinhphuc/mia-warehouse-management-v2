/\*\*

- Lodash Import Optimization Guide
-
- Lodash is ~70KB when imported fully, but can be <10KB with proper imports
  \*/

// ============================================================================
// ❌ BAD: Full lodash import (70KB)
// ============================================================================

// import _ from 'lodash';
// _.debounce(func, 300);
// _.throttle(func, 1000);
// _.get(obj, 'path.to.value');

// ============================================================================
// ✅ GOOD: Import specific functions (2-5KB per function)
// ============================================================================

// Method 1: Direct function imports (Best for tree-shaking)
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import omit from 'lodash/omit';

// Usage - same as before!
export const debouncedSearch = debounce((query) => {
console.log('Searching for:', query);
}, 300);

export const throttledScroll = throttle(() => {
console.log('Scroll handler');
}, 1000);

// ============================================================================
// Method 2: Create utility module for commonly used functions
// ============================================================================

// File: src/utils/lodashUtils.js
export { default as debounce } from 'lodash/debounce';
export { default as throttle } from 'lodash/throttle';
export { default as get } from 'lodash/get';
export { default as set } from 'lodash/set';
export { default as cloneDeep } from 'lodash/cloneDeep';
export { default as isEmpty } from 'lodash/isEmpty';
export { default as isEqual } from 'lodash/isEqual';
export { default as uniq } from 'lodash/uniq';
export { default as groupBy } from 'lodash/groupBy';
export { default as sortBy } from 'lodash/sortBy';

// Then in your components:
// import { debounce, throttle, get } from '@utils/lodashUtils';

// ============================================================================
// Method 3: babel-plugin-lodash (Automatic optimization)
// ============================================================================

/\*
With babel-plugin-lodash configured in craco.config.js, you can still use:

import { debounce, throttle, get } from 'lodash';

And it will automatically be transformed to:

import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import get from 'lodash/get';

This gives you convenience without the bundle size penalty!
\*/

// ============================================================================
// Common Lodash Functions and Their Sizes
// ============================================================================

/\*
Function Size Use Case

---

debounce ~2KB Delay function execution
throttle ~2KB Limit function call rate
get ~1KB Safe nested object access
set ~2KB Safe nested object setting
cloneDeep ~4KB Deep clone objects/arrays
isEmpty ~1KB Check if value is empty
isEqual ~5KB Deep equality comparison
uniq ~1KB Remove array duplicates
groupBy ~2KB Group array items
sortBy ~2KB Sort arrays
merge ~3KB Deep merge objects
pick ~2KB Pick object properties
omit ~2KB Omit object properties
flatten ~1KB Flatten nested arrays
find ~1KB Find array item
filter ~1KB Filter array
map ~1KB Map array
reduce ~1KB Reduce array
\*/

// ============================================================================
// Migration Examples
// ============================================================================

// Example 1: Debounce search
// BEFORE
// import _ from 'lodash';
// const search = _.debounce(handleSearch, 300);

// AFTER
import { debounce } from '@utils/lodashUtils';
const search = debounce(handleSearch, 300);

// Example 2: Safe object access
// BEFORE
// import _ from 'lodash';
// const name = _.get(user, 'profile.name', 'Unknown');

// AFTER
import { get } from '@utils/lodashUtils';
const name = get(user, 'profile.name', 'Unknown');

// Example 3: Deep clone
// BEFORE
// import _ from 'lodash';
// const copy = _.cloneDeep(originalObject);

// AFTER
import { cloneDeep } from '@utils/lodashUtils';
const copy = cloneDeep(originalObject);

// ============================================================================
// Alternative: Native JavaScript (Zero bundle cost!)
// ============================================================================

// Some lodash functions have native equivalents:

// lodash _.map → Array.prototype.map
// lodash _.filter → Array.prototype.filter
// lodash _.find → Array.prototype.find
// lodash _.includes → Array.prototype.includes
// lodash _.some → Array.prototype.some
// lodash _.every → Array.prototype.every

// Consider using native functions when possible:
const items = [1, 2, 3, 4, 5];

// Instead of: \_.map(items, x => x _ 2)
const doubled = items.map(x => x _ 2);

// Instead of: \_.filter(items, x => x > 2)
const filtered = items.filter(x => x > 2);

// ============================================================================
// Bundle Size Impact
// ============================================================================

/\*
BEFORE (Full lodash import):

- Lodash: ~70KB
- Total impact: +70KB to bundle

AFTER (Specific imports with 5 functions):

- debounce: ~2KB
- throttle: ~2KB
- get: ~1KB
- cloneDeep: ~4KB
- isEmpty: ~1KB
- Total impact: ~10KB to bundle

SAVINGS: 60KB (85% reduction!)
\*/

// ============================================================================
// Setup Instructions
// ============================================================================

/\*

1. Install babel-plugin-lodash:
   npm install --save-dev babel-plugin-lodash

2. Already configured in craco.config.js:
   babel: {
   plugins: ["lodash"]
   }

3. Update all imports in your codebase:
   - Find: import \_ from 'lodash'
   - Replace with specific imports

4. Test your application to ensure everything works

5. Run bundle analyzer to verify size reduction:
   npm run analyze
   \*/
