/**
 * Lodash Utility Module
 *
 * Central place for all lodash imports used in the project
 * This ensures consistent usage and optimal tree-shaking
 */

// Array utilities
export { default as uniq } from "lodash/uniq";
export { default as uniqBy } from "lodash/uniqBy";
export { default as groupBy } from "lodash/groupBy";
export { default as sortBy } from "lodash/sortBy";
export { default as orderBy } from "lodash/orderBy";
export { default as flatten } from "lodash/flatten";
export { default as flattenDeep } from "lodash/flattenDeep";
export { default as chunk } from "lodash/chunk";
export { default as compact } from "lodash/compact";
export { default as difference } from "lodash/difference";
export { default as intersection } from "lodash/intersection";
export { default as union } from "lodash/union";

// Object utilities
export { default as get } from "lodash/get";
export { default as set } from "lodash/set";
export { default as has } from "lodash/has";
export { default as pick } from "lodash/pick";
export { default as omit } from "lodash/omit";
export { default as merge } from "lodash/merge";
export { default as mergeWith } from "lodash/mergeWith";
export { default as cloneDeep } from "lodash/cloneDeep";
export { default as mapValues } from "lodash/mapValues";
export { default as mapKeys } from "lodash/mapKeys";

// Function utilities
export { default as debounce } from "lodash/debounce";
export { default as throttle } from "lodash/throttle";
export { default as memoize } from "lodash/memoize";
export { default as once } from "lodash/once";

// Validation utilities
export { default as isEmpty } from "lodash/isEmpty";
export { default as isEqual } from "lodash/isEqual";
export { default as isNil } from "lodash/isNil";
export { default as isNull } from "lodash/isNull";
export { default as isUndefined } from "lodash/isUndefined";
export { default as isArray } from "lodash/isArray";
export { default as isObject } from "lodash/isObject";
export { default as isString } from "lodash/isString";
export { default as isNumber } from "lodash/isNumber";
export { default as isFunction } from "lodash/isFunction";

// String utilities
export { default as camelCase } from "lodash/camelCase";
export { default as snakeCase } from "lodash/snakeCase";
export { default as kebabCase } from "lodash/kebabCase";
export { default as startCase } from "lodash/startCase";
export { default as capitalize } from "lodash/capitalize";
export { default as upperFirst } from "lodash/upperFirst";
export { default as lowerFirst } from "lodash/lowerFirst";
export { default as trim } from "lodash/trim";
export { default as truncate } from "lodash/truncate";

// Number utilities
export { default as sum } from "lodash/sum";
export { default as sumBy } from "lodash/sumBy";
export { default as mean } from "lodash/mean";
export { default as max } from "lodash/max";
export { default as min } from "lodash/min";
export { default as round } from "lodash/round";
export { default as ceil } from "lodash/ceil";
export { default as floor } from "lodash/floor";

// Usage example:
// import { debounce, throttle, get, isEmpty } from '@utils/lodashUtils';
