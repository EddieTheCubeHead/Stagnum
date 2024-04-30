# Contributing

## Feature requests and bugs

If you are looking to contribute ideas or bug reports, please make an issue in the application's
[issue tracker](https://github.com/EddieTheCubeHead/Stagnum/issues/new/choose).

## Contributing code

If you would like to contribute code to the project feel free to make a pull request. Both pull requests about 
issues in the issue tracker and brand-new features are considered. If the pull request is not about an issue marked 
with the "ready for development"-label, the main maintainer of the project, 
[Eetu Asikainen](https://github.com/EddieTheCubeHead), will decide whether the feature or bugfix is relevant to the 
library development. Please note that completely novel features with no issue attached will most likely be flat our
rejected, so it's advisable to create an issue with a feature request before attempting to contribute code.

If your pull request is about an open issue, please start the pull request name with the issue number. (#1 Add 
contribution guidelines)

### Code style - backend

Please make sure your code adheres to the [pep-8 standard](https://peps.python.org/pep-0008/) and is generally 
readable and neat, but don't stress too much. The worst that can happen is a change request.

The backend adheres to Behaviour Driven Development principles. That means all functionality created should be
covered by acceptance tests. See the existing tests for a general idea about how they function. The only interfaces
between the tests and application code should be the API interface, spotify API interface mocks, and database. No
internal state should be directly manipulated or queried for testing purposes.

### Code style - frontend

The frontend has eslint configured. Run `npm run format:fix` to ensure your code adheres to our eslint standards.
