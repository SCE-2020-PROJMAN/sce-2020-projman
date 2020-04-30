import db from '../db';

/**
 * Returns an object with the dependencies requested in `requestedDependencies`. If `dependencies` doesn't contain it, will inject a default.
 * This is useful for de-coupling an implementation from its dependencies, and is used extensively for testing procedures in isolation.
 * https://en.wikipedia.org/wiki/Dependency_injection
 * @param {Array} requestedDependencies One of: `db`
 * @param {Object} dependencies 
 */
function injectDependencies(requestedDependencies, dependencies = null) {
    const defaultDependencies = {
        db: db,
    };

    if (!dependencies) {
        dependencies = {};
    }
    requestedDependencies.forEach(dependency => {
        if (!dependencies[dependency]) {
            dependencies[dependency] = defaultDependencies[dependency];
        }
    });
    return dependencies;
}

export default injectDependencies;
