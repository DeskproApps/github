import React from 'react';

/**
 * Calls React.Children.map() recursively on the given children
 *
 * @param {*} children The children to map
 * @param {function} cb Called for each child
 * @returns {*}
 */
export function childrenRecursiveMap(children, cb) {
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.props.children) {
      child = React.cloneElement(child, { // eslint-disable-line no-param-reassign
        children: childrenRecursiveMap(child.props.children, cb)
      });
    }

    return cb(child);
  });
}
